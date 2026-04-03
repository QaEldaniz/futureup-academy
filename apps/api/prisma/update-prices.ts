/**
 * Update all course prices to 3000-5000 AZN range
 * Usage: cd apps/api && npx tsx prisma/update-prices.ts
 *
 * For production:
 *   BASE_URL=https://futureup.az npx tsx prisma/update-prices.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// slug → new price mapping
const PRICE_MAP: Record<string, number> = {
  // Traditional IT
  'help-desk': 3200,
  'computer-systems-networks': 3800,
  // Business-IT
  'qa-engineering': 3500,
  'product-owner': 3800,
  // Marketing & BD
  'digital-marketing': 3200,
  'ui-ux-design': 3500,
  // Data Science
  'ai-machine-learning': 5000,
  'data-engineering': 4500,
  'data-analytics': 3800,
  // Software Engineering
  'mobile-development': 4000,
  'backend-java': 4200,
  'backend-csharp': 4200,
  'frontend-development': 4000,
  // DevOps & DevSecOps
  'devops': 4500,
  'devsecops': 5000,
  // Cyber Security
  'red-team': 5000,
  'blue-team': 4500,
  'purple-team': 4200,
  'white-team': 4000,
  'cyber-ops': 5000,
  // Kids
  'kids-ai': 3200,
  'kids-cybersecurity': 3000,
  'kids-programming': 3200,
};

async function main() {
  console.log(`\n🔗 Target: ${BASE_URL}\n`);

  // 1. Login as admin
  console.log('🔑 Logging in as admin...');
  const loginRes = await fetch(`${BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@futureup.az', password: 'admin123' }),
  });

  if (!loginRes.ok) {
    console.error('❌ Login failed:', loginRes.status, await loginRes.text());
    process.exit(1);
  }

  const loginData = await loginRes.json();
  const token = loginData.data?.token;
  if (!token) {
    console.error('❌ No token in response:', JSON.stringify(loginData));
    process.exit(1);
  }
  console.log('✅ Logged in successfully\n');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Get all courses
  console.log('📚 Fetching existing courses...');
  const coursesRes = await fetch(`${BASE_URL}/api/admin/courses?limit=200`, { headers });
  const coursesData = await coursesRes.json();
  const courses: Array<{ id: string; slug: string; titleEn: string; price: number }> =
    coursesData.data || [];
  console.log(`   Found ${courses.length} courses\n`);

  // 3. Update prices
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const course of courses) {
    const newPrice = PRICE_MAP[course.slug];
    if (!newPrice) {
      console.log(`   ⏭  Skip "${course.titleEn}" (no price mapping)`);
      skipped++;
      continue;
    }

    if (course.price === newPrice) {
      console.log(`   ✓ "${course.titleEn}" already ${newPrice} AZN`);
      skipped++;
      continue;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ price: newPrice }),
      });

      if (res.ok) {
        console.log(`   ✅ "${course.titleEn}" ${course.price} → ${newPrice} AZN`);
        updated++;
      } else {
        const text = await res.text();
        console.error(`   ❌ "${course.titleEn}" (${res.status}): ${text}`);
        failed++;
      }
    } catch (err) {
      console.error(`   ❌ Error "${course.titleEn}":`, err);
      failed++;
    }
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`✅ Updated: ${updated}`);
  console.log(`⏭  Skipped: ${skipped}`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  console.log(`═══════════════════════════════════════════════\n`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});

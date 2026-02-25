/**
 * Fill all courses with syllabus and features via Admin API
 * Usage: cd apps/api && npx tsx prisma/fill-courses.ts
 *
 * For production:
 *   BASE_URL=https://futureupacademy.az npx tsx prisma/fill-courses.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

interface SyllabusModule {
  module: string;
  topics: string[];
  hours: number;
}

interface CourseData {
  syllabus: SyllabusModule[];
  features: string[];
}

// ─── Course Data by slug ─────────────────────────────────────────────────────

const COURSE_DATA: Record<string, CourseData> = {
  'help-desk': {
    syllabus: [
      { module: 'IT Service Desk Fundamentals', topics: ['ITIL Framework Basics', 'Service Level Agreements', 'Incident Management', 'Ticket Lifecycle'], hours: 20 },
      { module: 'Hardware & Software Diagnostics', topics: ['PC Components & Assembly', 'OS Installation (Windows/Linux)', 'Driver Management', 'Peripheral Setup'], hours: 24 },
      { module: 'Networking Essentials', topics: ['TCP/IP Basics', 'DNS & DHCP', 'VPN Configuration', 'Wi-Fi Troubleshooting'], hours: 20 },
      { module: 'Ticketing & Communication', topics: ['Jira Service Desk', 'Zendesk', 'Customer Communication', 'SLA Compliance & Reporting'], hours: 16 },
    ],
    features: ['ITIL Foundation Preparation', 'Hands-on Lab Environment', 'Real Ticketing System Practice', 'Customer Communication Training', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'computer-systems-networks': {
    syllabus: [
      { module: 'Computer Architecture', topics: ['CPU, RAM, Storage Architecture', 'Motherboard & BIOS/UEFI', 'Server Hardware', 'Virtualization (VMware, Hyper-V)'], hours: 28 },
      { module: 'Operating Systems', topics: ['Windows Server Administration', 'Linux (Ubuntu, CentOS)', 'Active Directory & Group Policy', 'Shell Scripting'], hours: 32 },
      { module: 'Network Protocols & Configuration', topics: ['TCP/IP Stack Deep Dive', 'Routing & Switching', 'Cisco IOS Basics', 'MikroTik RouterOS'], hours: 36 },
      { module: 'Network Security & Monitoring', topics: ['Firewall Configuration', 'VPN Setup', 'Network Monitoring (Zabbix, PRTG)', 'Backup & Disaster Recovery'], hours: 24 },
    ],
    features: ['Cisco/MikroTik Lab Access', 'Server Room Practice', 'Network Simulation Tools', 'CCNA Preparation', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'qa-engineering': {
    syllabus: [
      { module: 'Testing Fundamentals', topics: ['QA Methodology', 'Test Plan & Test Cases', 'Bug Reporting (Jira)', 'Agile Testing'], hours: 20 },
      { module: 'Manual Testing', topics: ['Functional Testing', 'Regression Testing', 'UI/UX Testing', 'API Testing (Postman)'], hours: 24 },
      { module: 'Automation Testing', topics: ['Selenium WebDriver', 'Cypress Framework', 'Page Object Model', 'Test Data Management'], hours: 28 },
      { module: 'CI/CD & Performance', topics: ['Jenkins Integration', 'GitHub Actions', 'JMeter Load Testing', 'Test Reporting & Metrics'], hours: 20 },
    ],
    features: ['Real Project Testing', 'Automation Framework Building', 'ISTQB Preparation', 'API Testing Mastery', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'product-owner': {
    syllabus: [
      { module: 'Product Management Basics', topics: ['Product Lifecycle', 'Market Research', 'Competitive Analysis', 'Value Proposition'], hours: 18 },
      { module: 'Agile & Scrum', topics: ['Scrum Framework', 'Sprint Planning & Review', 'Backlog Management', 'User Story Writing'], hours: 22 },
      { module: 'UX & Analytics', topics: ['User Research Methods', 'Wireframing & Prototyping', 'A/B Testing', 'Product Analytics (Mixpanel, Amplitude)'], hours: 20 },
      { module: 'Stakeholder & Delivery', topics: ['Roadmap Creation', 'Stakeholder Communication', 'MVP Strategy', 'Release Planning'], hours: 16 },
    ],
    features: ['Real Product Case Studies', 'Agile Simulation Exercises', 'Portfolio Project', 'CSPO Preparation', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'digital-marketing': {
    syllabus: [
      { module: 'Digital Marketing Strategy', topics: ['Marketing Funnel', 'Target Audience Analysis', 'Brand Positioning', 'Content Strategy'], hours: 18 },
      { module: 'SEO & SEM', topics: ['On-page & Off-page SEO', 'Google Search Console', 'Google Ads Campaigns', 'Keyword Research'], hours: 22 },
      { module: 'Social Media Marketing', topics: ['Meta Ads Manager', 'Instagram & Facebook Strategy', 'TikTok Marketing', 'Community Management'], hours: 20 },
      { module: 'Analytics & Email', topics: ['Google Analytics 4', 'Meta Pixel', 'Email Marketing (Mailchimp)', 'Campaign ROI Analysis'], hours: 16 },
    ],
    features: ['Google Ads Certification Prep', 'Real Campaign Management', 'Portfolio of Ad Campaigns', 'Analytics Dashboard Building', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'ui-ux-design': {
    syllabus: [
      { module: 'Design Fundamentals', topics: ['Typography & Color Theory', 'Layout & Composition', 'Design Systems', 'Accessibility Standards'], hours: 22 },
      { module: 'User Research & UX', topics: ['User Personas', 'User Journey Mapping', 'Information Architecture', 'Usability Testing'], hours: 20 },
      { module: 'Figma Mastery', topics: ['Components & Variants', 'Auto Layout', 'Prototyping & Interactions', 'Design Tokens'], hours: 28 },
      { module: 'Portfolio & Handoff', topics: ['Case Study Writing', 'Developer Handoff', 'Design Presentation', 'Portfolio Review'], hours: 14 },
    ],
    features: ['Figma Professional License', 'Real Client Projects', 'Portfolio Development', 'Design Community Access', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'ai-machine-learning': {
    syllabus: [
      { module: 'Python for AI', topics: ['Python Advanced', 'NumPy & Pandas', 'Data Visualization (Matplotlib, Seaborn)', 'Jupyter Notebooks'], hours: 32 },
      { module: 'Machine Learning', topics: ['Supervised Learning', 'Unsupervised Learning', 'Scikit-learn', 'Model Evaluation & Tuning'], hours: 36 },
      { module: 'Deep Learning', topics: ['Neural Networks', 'TensorFlow & Keras', 'CNN for Computer Vision', 'RNN & LSTM'], hours: 40 },
      { module: 'NLP & Deployment', topics: ['Natural Language Processing', 'Transformers & BERT', 'Model Deployment (Flask, FastAPI)', 'MLOps Basics'], hours: 32 },
    ],
    features: ['GPU Cloud Access', 'Kaggle Competition Practice', 'Real AI Project Portfolio', 'Research Paper Reading', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'data-engineering': {
    syllabus: [
      { module: 'SQL & Databases', topics: ['Advanced SQL', 'PostgreSQL & MySQL', 'NoSQL (MongoDB, Redis)', 'Database Design'], hours: 28 },
      { module: 'ETL & Pipelines', topics: ['ETL vs ELT', 'Apache Airflow', 'Data Warehouse Architecture', 'dbt (Data Build Tool)'], hours: 32 },
      { module: 'Big Data Technologies', topics: ['Apache Spark', 'Kafka Streaming', 'Hadoop Ecosystem', 'Delta Lake'], hours: 36 },
      { module: 'Cloud & Orchestration', topics: ['AWS (S3, Redshift, Glue)', 'GCP BigQuery', 'Docker for Data', 'Monitoring & Alerting'], hours: 24 },
    ],
    features: ['Cloud Platform Credits', 'Real Data Pipeline Projects', 'Big Data Cluster Access', 'Industry Dataset Practice', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'data-analytics': {
    syllabus: [
      { module: 'SQL & Data Querying', topics: ['SQL Fundamentals', 'Joins & Subqueries', 'Window Functions', 'Query Optimization'], hours: 24 },
      { module: 'Python for Analytics', topics: ['Pandas & NumPy', 'Data Cleaning', 'Statistical Analysis', 'Hypothesis Testing'], hours: 24 },
      { module: 'Visualization & BI', topics: ['Power BI Dashboards', 'Tableau', 'Storytelling with Data', 'Report Automation'], hours: 22 },
      { module: 'Business Analytics', topics: ['A/B Testing', 'Cohort Analysis', 'Predictive Analytics', 'Presentation Skills'], hours: 14 },
    ],
    features: ['Power BI & Tableau Licenses', 'Real Business Datasets', 'Dashboard Portfolio', 'Analytics Case Studies', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'mobile-development': {
    syllabus: [
      { module: 'Mobile Fundamentals', topics: ['Mobile UI Principles', 'React Native Setup', 'Flutter Setup', 'Platform Differences'], hours: 22 },
      { module: 'React Native / Flutter', topics: ['Components & Navigation', 'State Management', 'Animations & Gestures', 'Platform-specific Code'], hours: 36 },
      { module: 'Backend Integration', topics: ['REST API Integration', 'Authentication (JWT, OAuth)', 'Push Notifications', 'Offline Storage'], hours: 28 },
      { module: 'Publishing & Testing', topics: ['App Store Guidelines', 'Google Play Console', 'Testing (Jest, Detox)', 'CI/CD for Mobile'], hours: 18 },
    ],
    features: ['iOS & Android Devices for Testing', 'App Store Publishing Guide', 'Real Mobile App Project', 'Cross-platform Mastery', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'backend-java': {
    syllabus: [
      { module: 'Java Core', topics: ['OOP Principles', 'Collections & Generics', 'Streams & Lambda', 'Exception Handling'], hours: 32 },
      { module: 'Spring Boot', topics: ['Spring Core & DI', 'REST API Development', 'Spring Security', 'JPA & Hibernate'], hours: 36 },
      { module: 'Microservices', topics: ['Microservice Architecture', 'Service Discovery', 'API Gateway', 'Message Queues (RabbitMQ)'], hours: 28 },
      { module: 'DevOps & Deployment', topics: ['Docker & Docker Compose', 'PostgreSQL & MySQL', 'Maven/Gradle', 'CI/CD (Jenkins)'], hours: 20 },
    ],
    features: ['Enterprise Project Experience', 'Microservice Architecture Practice', 'Database Design Skills', 'Spring Certification Prep', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'backend-csharp': {
    syllabus: [
      { module: 'C# Fundamentals', topics: ['OOP in C#', 'LINQ', 'Async/Await', 'Collections & Generics'], hours: 32 },
      { module: '.NET Core & ASP.NET', topics: ['ASP.NET Core MVC', 'Web API Development', 'Entity Framework Core', 'Identity & Authentication'], hours: 36 },
      { module: 'Architecture & Patterns', topics: ['Clean Architecture', 'Repository Pattern', 'CQRS & MediatR', 'Unit Testing (xUnit)'], hours: 28 },
      { module: 'Cloud & Deployment', topics: ['Azure Services', 'SQL Server', 'Docker', 'CI/CD (Azure DevOps)'], hours: 20 },
    ],
    features: ['Azure Cloud Credits', 'Enterprise .NET Projects', 'Clean Architecture Practice', 'Microsoft Certification Prep', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'frontend-development': {
    syllabus: [
      { module: 'HTML, CSS & JavaScript', topics: ['Semantic HTML5', 'CSS3 & Flexbox/Grid', 'JavaScript ES6+', 'Responsive Design'], hours: 28 },
      { module: 'React.js', topics: ['Components & Hooks', 'State Management (Redux, Zustand)', 'React Router', 'Performance Optimization'], hours: 32 },
      { module: 'Next.js & TypeScript', topics: ['TypeScript Fundamentals', 'Next.js App Router', 'SSR & SSG', 'API Routes'], hours: 28 },
      { module: 'Testing & Deployment', topics: ['Jest & React Testing Library', 'E2E Testing (Cypress)', 'Git & GitHub', 'Vercel/Netlify Deployment'], hours: 16 },
    ],
    features: ['Modern React Ecosystem', 'Portfolio Website Project', 'TypeScript Mastery', 'Real Client Projects', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'devops': {
    syllabus: [
      { module: 'Linux & Scripting', topics: ['Linux Administration', 'Bash Scripting', 'System Monitoring', 'Process Management'], hours: 28 },
      { module: 'Containers & Orchestration', topics: ['Docker & Docker Compose', 'Kubernetes Architecture', 'Helm Charts', 'Container Security'], hours: 36 },
      { module: 'CI/CD & IaC', topics: ['Jenkins Pipelines', 'GitLab CI/CD', 'Terraform', 'Ansible Automation'], hours: 32 },
      { module: 'Cloud & Monitoring', topics: ['AWS/GCP/Azure Essentials', 'Prometheus & Grafana', 'ELK Stack', 'Incident Response'], hours: 24 },
    ],
    features: ['Cloud Platform Credits', 'Kubernetes Cluster Access', 'Real Infrastructure Projects', 'CKA Preparation', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'devsecops': {
    syllabus: [
      { module: 'Security Fundamentals', topics: ['OWASP Top 10', 'Security Principles', 'Threat Modeling', 'Secure Coding Practices'], hours: 28 },
      { module: 'SAST & DAST', topics: ['SonarQube', 'Snyk', 'OWASP ZAP', 'Dependency Scanning'], hours: 32 },
      { module: 'Container & Supply Chain', topics: ['Container Security (Trivy)', 'Image Signing', 'Supply Chain Security', 'Secret Management (Vault)'], hours: 32 },
      { module: 'Compliance & Automation', topics: ['Compliance as Code', 'Security Pipeline Integration', 'Audit Automation', 'Incident Response'], hours: 28 },
    ],
    features: ['Security Lab Environment', 'Vulnerability Assessment Practice', 'DevSecOps Pipeline Building', 'Industry Certifications Prep', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'red-team': {
    syllabus: [
      { module: 'Reconnaissance & OSINT', topics: ['Passive Reconnaissance', 'Active Scanning (Nmap)', 'OSINT Tools', 'Social Engineering Basics'], hours: 28 },
      { module: 'Exploitation', topics: ['Kali Linux Mastery', 'Metasploit Framework', 'Web App Exploitation', 'Buffer Overflow Basics'], hours: 40 },
      { module: 'Post-Exploitation', topics: ['Privilege Escalation', 'Lateral Movement', 'Persistence Techniques', 'Data Exfiltration'], hours: 32 },
      { module: 'Reporting & Red Team Ops', topics: ['Burp Suite Professional', 'Pentest Reporting', 'Purple Team Exercises', 'Attack Scenario Development'], hours: 24 },
    ],
    features: ['Cyber Range Lab Access', 'CTF Competition Practice', 'Real Pentest Methodology', 'OSCP Preparation', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'blue-team': {
    syllabus: [
      { module: 'Defense Fundamentals', topics: ['Network Security Architecture', 'Firewall & IDS/IPS', 'Endpoint Protection', 'Email Security'], hours: 28 },
      { module: 'SIEM & Log Analysis', topics: ['Splunk Fundamentals', 'QRadar Basics', 'Log Correlation', 'Alert Triage'], hours: 32 },
      { module: 'Incident Response', topics: ['IR Framework (NIST)', 'Malware Analysis Basics', 'Memory Forensics', 'Network Forensics'], hours: 28 },
      { module: 'Threat Intelligence', topics: ['MITRE ATT&CK Framework', 'Threat Hunting', 'IOC Analysis', 'SOC Operations'], hours: 24 },
    ],
    features: ['SIEM Lab Environment', 'SOC Simulation', 'Incident Response Drills', 'CompTIA Security+ Prep', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'purple-team': {
    syllabus: [
      { module: 'MITRE ATT&CK', topics: ['ATT&CK Framework Deep Dive', 'Technique Mapping', 'Detection Engineering', 'Threat Emulation'], hours: 28 },
      { module: 'Attack Simulation', topics: ['Atomic Red Team', 'CALDERA Framework', 'Custom Attack Scenarios', 'Adversary Emulation Plans'], hours: 28 },
      { module: 'Detection & Response', topics: ['Detection Rule Writing', 'SIGMA Rules', 'YARA Rules', 'Automated Response (SOAR)'], hours: 24 },
      { module: 'Strategy & Improvement', topics: ['Security Gap Analysis', 'Maturity Assessment', 'Continuous Improvement', 'Executive Reporting'], hours: 16 },
    ],
    features: ['Purple Team Lab', 'ATT&CK Navigator Practice', 'Real Attack-Defense Scenarios', 'Detection Engineering Skills', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'white-team': {
    syllabus: [
      { module: 'Security Governance', topics: ['Information Security Management', 'Security Policies & Procedures', 'Risk Management Framework', 'Security Organization'], hours: 22 },
      { module: 'Compliance & Standards', topics: ['ISO 27001/27002', 'NIST Cybersecurity Framework', 'GDPR & Data Protection', 'PCI DSS Basics'], hours: 24 },
      { module: 'Risk Assessment', topics: ['Risk Identification', 'Risk Analysis & Evaluation', 'Risk Treatment Plans', 'Business Impact Analysis'], hours: 22 },
      { module: 'Audit & Reporting', topics: ['Internal Audit Process', 'Compliance Reporting', 'Security Metrics & KPIs', 'Management Review'], hours: 16 },
    ],
    features: ['GRC Tool Practice', 'ISO 27001 Case Studies', 'Risk Assessment Templates', 'CISM/CRISC Preparation', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  'cyber-ops': {
    syllabus: [
      { module: 'SOC Operations', topics: ['SOC Architecture', 'Shift Operations', 'Playbook Development', 'Escalation Procedures'], hours: 28 },
      { module: 'Digital Forensics', topics: ['Disk Forensics', 'Memory Forensics (Volatility)', 'Network Forensics', 'Evidence Handling'], hours: 32 },
      { module: 'Malware Analysis', topics: ['Static Analysis', 'Dynamic Analysis (Sandbox)', 'Reverse Engineering Basics', 'Malware Classification'], hours: 32 },
      { module: 'SOAR & Automation', topics: ['SOAR Platforms', 'Automated Incident Response', 'Threat Intelligence Integration', 'Cyber Warfare Concepts'], hours: 28 },
    ],
    features: ['Forensics Lab Access', 'Malware Analysis Sandbox', 'SOAR Platform Practice', 'Real Incident Scenarios', 'Certificate Upon Completion', 'Job Placement Support'],
  },

  // ─── Kids Courses ────────────────────────────────────────────────
  'kids-ai': {
    syllabus: [
      { module: 'Introduction to AI', topics: ['What is Artificial Intelligence?', 'AI in Everyday Life', 'Smart Assistants', 'AI Ethics for Kids'], hours: 10 },
      { module: 'Machine Learning Basics', topics: ['Teaching Computers to Learn', 'Image Recognition', 'Teachable Machine (Google)', 'Simple Predictions'], hours: 12 },
      { module: 'AI Projects with Scratch', topics: ['Scratch + AI Extensions', 'Chatbot Creation', 'Voice Recognition Projects', 'AI Art & Music'], hours: 14 },
      { module: 'Final Project', topics: ['Project Planning', 'Building AI Application', 'Presentation Skills', 'AI Future Ideas'], hours: 8 },
    ],
    features: ['Interactive Learning', 'No Coding Experience Required', 'Fun AI Projects', 'Scratch Platform', 'Certificate Upon Completion', 'Parent Progress Reports'],
  },

  'kids-cybersecurity': {
    syllabus: [
      { module: 'Internet Safety', topics: ['Safe Browsing', 'Strong Passwords', 'Social Media Safety', 'Cyberbullying Prevention'], hours: 8 },
      { module: 'Phishing & Scams', topics: ['Recognizing Phishing', 'Email Safety', 'Fake Websites', 'Reporting Threats'], hours: 8 },
      { module: 'Data Protection', topics: ['Personal Data Awareness', 'Privacy Settings', 'Digital Footprint', 'Safe File Sharing'], hours: 8 },
      { module: 'Crypto & Ethical Hacking', topics: ['Basic Cryptography', 'Caesar Cipher', 'Ethical Hacking Intro', 'Capture The Flag Games'], hours: 10 },
    ],
    features: ['Interactive Quizzes', 'Gamified Learning', 'CTF Challenges for Kids', 'Internet Safety Guide', 'Certificate Upon Completion', 'Parent Progress Reports'],
  },

  'kids-programming': {
    syllabus: [
      { module: 'Scratch Programming', topics: ['Scratch Interface', 'Sprites & Costumes', 'Motion & Events', 'Simple Game Creation'], hours: 12 },
      { module: 'Python Basics', topics: ['Variables & Data Types', 'Conditions & Loops', 'Functions', 'Simple Text Games'], hours: 14 },
      { module: 'Web Development', topics: ['HTML Basics', 'CSS Styling', 'Simple JavaScript', 'Personal Website'], hours: 10 },
      { module: 'Final Projects', topics: ['Game Development', 'Web Application', 'Project Presentation', 'Next Steps in Coding'], hours: 8 },
    ],
    features: ['Visual Programming Start', 'Game Development Projects', 'Personal Website Creation', 'Algorithmic Thinking', 'Certificate Upon Completion', 'Parent Progress Reports'],
  },
};

// ─── Script ───────────────────────────────────────────────────────────────────

async function main() {
  console.log(`\n🔗 Target: ${BASE_URL}\n`);

  // 1. Login
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
    console.error('❌ No token:', JSON.stringify(loginData));
    process.exit(1);
  }
  console.log('✅ Logged in\n');

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };

  // 2. Get courses
  console.log('📚 Fetching courses...');
  const coursesRes = await fetch(`${BASE_URL}/api/admin/courses?limit=200`, { headers });
  const coursesData = await coursesRes.json();
  const courses: Array<{ id: string; slug: string; titleEn: string }> = coursesData.data || [];
  console.log(`   Found ${courses.length} courses\n`);

  // 3. Update each course
  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const course of courses) {
    const data = COURSE_DATA[course.slug];
    if (!data) {
      console.log(`   ⏭  Skip "${course.titleEn}" (no data)`);
      skipped++;
      continue;
    }

    try {
      const res = await fetch(`${BASE_URL}/api/admin/courses/${course.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          syllabus: data.syllabus,
          features: data.features,
        }),
      });

      if (res.ok) {
        const totalHours = data.syllabus.reduce((sum, m) => sum + m.hours, 0);
        const moduleCount = data.syllabus.length;
        console.log(`   ✅ "${course.titleEn}" — ${moduleCount} modules, ${totalHours}h, ${data.features.length} features`);
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

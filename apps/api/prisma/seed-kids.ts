import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🚀 Seeding kids courses...');

  // 1. Create kids-specific categories
  const catCoding = await prisma.category.upsert({
    where: { slug: 'kids-coding' },
    update: {},
    create: {
      nameAz: 'Proqramlaşdırma',
      nameRu: 'Программирование',
      nameEn: 'Coding',
      slug: 'kids-coding',
      icon: 'Code2',
      order: 10,
    },
  });

  const catCyber = await prisma.category.upsert({
    where: { slug: 'kids-cybersecurity' },
    update: {},
    create: {
      nameAz: 'Kibertəhlükəsizlik',
      nameRu: 'Кибербезопасность',
      nameEn: 'Cybersecurity',
      slug: 'kids-cybersecurity',
      icon: 'Shield',
      order: 11,
    },
  });

  const catAI = await prisma.category.upsert({
    where: { slug: 'kids-ai' },
    update: {},
    create: {
      nameAz: 'Süni İntellekt',
      nameRu: 'Искусственный интеллект',
      nameEn: 'Artificial Intelligence',
      slug: 'kids-ai',
      icon: 'Brain',
      order: 12,
    },
  });

  console.log('✅ Categories created:', catCoding.id, catCyber.id, catAI.id);

  // 2. Kids Coding Courses
  const codingCourses = [
    {
      slug: 'scratch-junior',
      titleAz: 'Scratch ilə Proqramlaşdırma',
      titleRu: 'Программирование на Scratch',
      titleEn: 'Scratch Programming',
      descAz: 'Scratch vizual proqramlaşdırma mühitində oyunlar, animasiyalar və interaktiv hekayələr yaratmağı öyrənin. Proqramlaşdırmanın əsas konsepsiyalarını əyləncəli formatda mənimsəyin.',
      descRu: 'Научитесь создавать игры, анимации и интерактивные истории в визуальной среде Scratch. Освойте основные концепции программирования в увлекательном формате.',
      descEn: 'Learn to create games, animations and interactive stories in Scratch. Master core programming concepts in a fun visual environment.',
      shortDescAz: 'Vizual proqramlaşdırma, oyunlar və animasiyalar',
      shortDescRu: 'Визуальное программирование, игры и анимации',
      shortDescEn: 'Visual programming, games and animations',
      duration: '3 ay',
      price: 150,
      level: 'BEGINNER',
      audience: 'KIDS',
      ageGroup: 'AGE_6_8',
      categoryId: catCoding.id,
      order: 1,
      features: ['Sertifikat', 'Oyun yaratma', 'Kreativ layihələr', 'Onlayn dəstək'],
      syllabus: [
        { module: 'Scratch əsasları', topics: ['Bloklar və hərəkətlər', 'Personajlar yaratmaq', 'Animasiya əsasları'], hours: 12 },
        { module: 'Oyun yaratma', topics: ['Nişangah oyunu', 'Labirint oyunu', 'Platformer oyun'], hours: 15 },
        { module: 'İnteraktiv hekayələr', topics: ['Dialoqlar', 'Səs effektləri', 'Final layihə'], hours: 9 },
      ],
    },
    {
      slug: 'python-kids-basics',
      titleAz: 'Python Əsasları (Uşaqlar üçün)',
      titleRu: 'Основы Python (для детей)',
      titleEn: 'Python Basics for Kids',
      descAz: 'Python proqramlaşdırma dilini oyun və maraqlı tapşırıqlar vasitəsilə öyrənin. Dəyişənlər, döngülər, funksiyalar və sadə oyunlar yaratmaq.',
      descRu: 'Изучите язык Python через игры и увлекательные задания. Переменные, циклы, функции и создание простых игр.',
      descEn: 'Learn Python through games and fun exercises. Variables, loops, functions and creating simple games.',
      shortDescAz: 'Python proqramlaşdırma əsasları oyun formatında',
      shortDescRu: 'Основы Python в игровом формате',
      shortDescEn: 'Python fundamentals in a game-based format',
      duration: '4 ay',
      price: 200,
      level: 'BEGINNER',
      audience: 'KIDS',
      ageGroup: 'AGE_9_11',
      categoryId: catCoding.id,
      order: 2,
      features: ['Sertifikat', 'Oyun layihələri', 'Kodlaşdırma bacarıqları', 'Onlayn dəstək'],
      syllabus: [
        { module: 'Python əsasları', topics: ['Dəyişənlər', 'Şərtlər (if/else)', 'Döngülər (for/while)'], hours: 16 },
        { module: 'Funksiyalar və strukturlar', topics: ['Funksiyalar', 'Siyahılar', 'Turtle qrafika'], hours: 16 },
        { module: 'Oyun layihələri', topics: ['Rəqəm tapma oyunu', 'Quiz proqramı', 'Sadə arcade oyun'], hours: 16 },
      ],
    },
    {
      slug: 'python-kids-advanced',
      titleAz: 'Python İrəliləyən (Yeniyetmələr üçün)',
      titleRu: 'Продвинутый Python (для подростков)',
      titleEn: 'Advanced Python for Teens',
      descAz: 'Python ilə veb tətbiqlər, verilənlər bazası, API işləmə və real layihələr. OOP, fayllarla iş və avtomatlaşdırma.',
      descRu: 'Веб-приложения, базы данных, работа с API и реальные проекты на Python. ООП, работа с файлами и автоматизация.',
      descEn: 'Web apps, databases, API work and real projects with Python. OOP, file handling and automation.',
      shortDescAz: 'İrəliləyən Python: veb, API, real layihələr',
      shortDescRu: 'Продвинутый Python: веб, API, реальные проекты',
      shortDescEn: 'Advanced Python: web, APIs, real-world projects',
      duration: '5 ay',
      price: 250,
      level: 'INTERMEDIATE',
      audience: 'KIDS',
      ageGroup: 'AGE_12_14',
      categoryId: catCoding.id,
      order: 3,
      features: ['Sertifikat', 'Real layihələr', 'GitHub portfolio', 'Mentor dəstəyi'],
      syllabus: [
        { module: 'OOP və modullar', topics: ['Siniflər və obyektlər', 'Modullar', 'Xəta idarəetməsi'], hours: 20 },
        { module: 'Veb və API', topics: ['Flask əsasları', 'REST API', 'JSON işləmə'], hours: 20 },
        { module: 'Layihələr', topics: ['Chatbot', 'Hava proqnozu app', 'Portfolio sayt'], hours: 20 },
      ],
    },
    {
      slug: 'web-dev-teens',
      titleAz: 'Veb Proqramlaşdırma (Yeniyetmələr)',
      titleRu: 'Веб-разработка (для подростков)',
      titleEn: 'Web Development for Teens',
      descAz: 'HTML, CSS və JavaScript ilə müasir veb saytlar yaradın. Responsive dizayn, interaktiv elementlər və real layihələr.',
      descRu: 'Создавайте современные веб-сайты с HTML, CSS и JavaScript. Адаптивный дизайн, интерактивные элементы и реальные проекты.',
      descEn: 'Build modern websites with HTML, CSS and JavaScript. Responsive design, interactive elements and real projects.',
      shortDescAz: 'HTML, CSS, JavaScript ilə veb saytlar',
      shortDescRu: 'Веб-сайты на HTML, CSS, JavaScript',
      shortDescEn: 'Websites with HTML, CSS, JavaScript',
      duration: '5 ay',
      price: 250,
      level: 'INTERMEDIATE',
      audience: 'KIDS',
      ageGroup: 'AGE_15_17',
      categoryId: catCoding.id,
      order: 4,
      features: ['Sertifikat', 'Portfolio saytlar', 'GitHub', 'Karyera məsləhəti'],
      syllabus: [
        { module: 'HTML & CSS', topics: ['HTML5 semantik', 'CSS Grid/Flexbox', 'Responsive dizayn', 'Animasiyalar'], hours: 20 },
        { module: 'JavaScript', topics: ['Dəyişənlər və funksiyalar', 'DOM manipulyasiya', 'Eventlər', 'Fetch API'], hours: 25 },
        { module: 'Layihələr', topics: ['Şəxsi portfolio', 'To-Do app', 'Landing page', 'Final layihə'], hours: 15 },
      ],
    },
    {
      slug: 'roblox-game-dev',
      titleAz: 'Roblox Oyun Yaratma',
      titleRu: 'Создание игр в Roblox',
      titleEn: 'Roblox Game Development',
      descAz: 'Roblox Studio və Lua proqramlaşdırma dili ilə öz oyunlarınızı yaradın. 3D dünyalar, oyun mexanikaları və multiplayer funksiyalar.',
      descRu: 'Создавайте свои игры с помощью Roblox Studio и языка Lua. 3D-миры, игровые механики и мультиплеерные функции.',
      descEn: 'Create your own games with Roblox Studio and Lua programming. 3D worlds, game mechanics and multiplayer features.',
      shortDescAz: 'Roblox Studio və Lua ilə oyun yaratma',
      shortDescRu: 'Создание игр на Roblox Studio и Lua',
      shortDescEn: 'Game creation with Roblox Studio and Lua',
      duration: '3 ay',
      price: 180,
      level: 'BEGINNER',
      audience: 'KIDS',
      ageGroup: 'AGE_9_11',
      categoryId: catCoding.id,
      order: 5,
      features: ['Sertifikat', '3D oyunlar', 'Multiplayer', 'Yaradıcılıq'],
      syllabus: [
        { module: 'Roblox Studio əsasları', topics: ['İnterfeys', '3D modelləmə', 'Terrain yaratma'], hours: 12 },
        { module: 'Lua proqramlaşdırma', topics: ['Dəyişənlər', 'Funksiyalar', 'Eventlər', 'Oyun loqikası'], hours: 15 },
        { module: 'Oyun layihələri', topics: ['Obby oyun', 'Tycoon oyun', 'Final multiplayer layihə'], hours: 9 },
      ],
    },
  ];

  // 3. Kids Cybersecurity Courses
  const cyberCourses = [
    {
      slug: 'cyber-safety-kids',
      titleAz: 'İnternet Təhlükəsizliyi (Uşaqlar)',
      titleRu: 'Интернет-безопасность (дети)',
      titleEn: 'Internet Safety for Kids',
      descAz: 'İnternetdə təhlükəsiz davranış qaydaları, şəxsi məlumatların qorunması, kiberbullinqdən müdafiə və onlayn risklərin tanınması.',
      descRu: 'Правила безопасного поведения в интернете, защита личных данных, защита от кибербуллинга и распознавание онлайн-рисков.',
      descEn: 'Internet safety rules, personal data protection, cyberbullying defense and recognizing online risks.',
      shortDescAz: 'Onlayn təhlükəsizlik və şəxsi məlumat qorunması',
      shortDescRu: 'Онлайн-безопасность и защита персональных данных',
      shortDescEn: 'Online safety and personal data protection',
      duration: '2 ay',
      price: 120,
      level: 'BEGINNER',
      audience: 'KIDS',
      ageGroup: 'AGE_6_8',
      categoryId: catCyber.id,
      order: 1,
      features: ['Sertifikat', 'İnteraktiv dərslər', 'Praktik tapşırıqlar'],
      syllabus: [
        { module: 'İnternet əsasları', topics: ['İnternet nədir', 'Təhlükəsiz saytlar', 'Şifrə yaratma'], hours: 8 },
        { module: 'Onlayn təhlükəsizlik', topics: ['Şəxsi məlumatlar', 'Kiberbullinq', 'Yalançı mesajlar'], hours: 8 },
        { module: 'Praktika', topics: ['Təhlükəsiz davranış', 'Valideynlərə müraciət', 'Final test'], hours: 4 },
      ],
    },
    {
      slug: 'cyber-detective-kids',
      titleAz: 'Kiber Detektiv',
      titleRu: 'Кибер-детектив',
      titleEn: 'Cyber Detective',
      descAz: 'Kiber cinayətlərin araşdırılması, rəqəmsal izlərin tapılması, şifrələmə əsasları və etik hakerlik konsepsiyaları.',
      descRu: 'Расследование киберпреступлений, поиск цифровых следов, основы шифрования и концепции этичного хакинга.',
      descEn: 'Cybercrime investigation, digital forensics, encryption basics and ethical hacking concepts.',
      shortDescAz: 'Rəqəmsal araşdırma və şifrələmə əsasları',
      shortDescRu: 'Цифровое расследование и основы шифрования',
      shortDescEn: 'Digital investigation and encryption basics',
      duration: '3 ay',
      price: 180,
      level: 'INTERMEDIATE',
      audience: 'KIDS',
      ageGroup: 'AGE_12_14',
      categoryId: catCyber.id,
      order: 2,
      features: ['Sertifikat', 'CTF yarışmaları', 'Praktik laboratoriya', 'Komanda işi'],
      syllabus: [
        { module: 'Kriptoqrafiya', topics: ['Sezar şifrəsi', 'Simmetrik şifrələmə', 'Açıq açar'], hours: 12 },
        { module: 'Rəqəmsal izlər', topics: ['Metadata', 'Şəbəkə analizi', 'Steqanoqrafiya'], hours: 12 },
        { module: 'CTF və layihələr', topics: ['Capture The Flag', 'Komanda yarışması', 'Final layihə'], hours: 12 },
      ],
    },
    {
      slug: 'ethical-hacking-teens',
      titleAz: 'Etik Hakerlik (Yeniyetmələr)',
      titleRu: 'Этичный хакинг (подростки)',
      titleEn: 'Ethical Hacking for Teens',
      descAz: 'Penetrasiya testləri, zəiflik analizi, şəbəkə təhlükəsizliyi və real ssenarilərdə praktik təcrübə. CEH konsepsiyalarına giriş.',
      descRu: 'Тесты на проникновение, анализ уязвимостей, сетевая безопасность и практика в реальных сценариях. Введение в концепции CEH.',
      descEn: 'Penetration testing, vulnerability analysis, network security and hands-on practice in real scenarios. Intro to CEH concepts.',
      shortDescAz: 'Pentest, zəiflik analizi və şəbəkə təhlükəsizliyi',
      shortDescRu: 'Пентест, анализ уязвимостей и сетевая безопасность',
      shortDescEn: 'Pentest, vulnerability analysis and network security',
      duration: '4 ay',
      price: 280,
      level: 'ADVANCED',
      audience: 'KIDS',
      ageGroup: 'AGE_15_17',
      categoryId: catCyber.id,
      order: 3,
      features: ['Sertifikat', 'Kali Linux', 'CTF yarışmaları', 'Mentor dəstəyi'],
      syllabus: [
        { module: 'Şəbəkə təhlükəsizliyi', topics: ['TCP/IP', 'Nmap', 'Wireshark', 'Firewall'], hours: 16 },
        { module: 'Pentest əsasları', topics: ['Kali Linux', 'Metasploit', 'SQL Injection', 'XSS'], hours: 20 },
        { module: 'Praktik layihələr', topics: ['CTF həlləri', 'Bug Bounty', 'Təhlükəsizlik auditi'], hours: 12 },
      ],
    },
  ];

  // 4. Kids AI Courses
  const aiCourses = [
    {
      slug: 'ai-explorer-kids',
      titleAz: 'Süni İntellekt Kəşfiyyatçısı',
      titleRu: 'Исследователь ИИ',
      titleEn: 'AI Explorer for Kids',
      descAz: 'Süni intellektin nə olduğunu, necə işlədiyini və gündəlik həyatda harada istifadə edildiyini öyrənin. AI alətləri ilə yaradıcı layihələr.',
      descRu: 'Узнайте, что такое ИИ, как он работает и где используется. Творческие проекты с инструментами ИИ.',
      descEn: 'Learn what AI is, how it works and where it is used. Creative projects with AI tools.',
      shortDescAz: 'Süni intellekt dünyasına ilk addım',
      shortDescRu: 'Первые шаги в мире ИИ',
      shortDescEn: 'First steps into the world of AI',
      duration: '2 ay',
      price: 150,
      level: 'BEGINNER',
      audience: 'KIDS',
      ageGroup: 'AGE_9_11',
      categoryId: catAI.id,
      order: 1,
      features: ['Sertifikat', 'AI alətləri', 'Yaradıcı layihələr', 'Əyləncəli format'],
      syllabus: [
        { module: 'AI nədir?', topics: ['Süni intellekt tarixi', 'AI gündəlik həyatda', 'Maşın öyrənməsi nədir'], hours: 8 },
        { module: 'AI alətləri', topics: ['ChatGPT ilə iş', 'AI ilə şəkil yaratma', 'Teachable Machine'], hours: 10 },
        { module: 'Layihələr', topics: ['AI chatbot yaratma', 'Şəkil tanıma layihəsi', 'Final təqdimat'], hours: 6 },
      ],
    },
    {
      slug: 'ai-python-kids',
      titleAz: 'Python ilə Süni İntellekt',
      titleRu: 'ИИ на Python',
      titleEn: 'AI with Python for Kids',
      descAz: 'Python və populyar AI kitabxanaları ilə maşın öyrənməsi layihələri yaradın. Verilənlər analizi, image recognition və chatbot.',
      descRu: 'Создавайте проекты машинного обучения с Python и популярными AI-библиотеками. Анализ данных, распознавание изображений и чат-боты.',
      descEn: 'Build machine learning projects with Python and popular AI libraries. Data analysis, image recognition and chatbots.',
      shortDescAz: 'Python ilə maşın öyrənməsi layihələri',
      shortDescRu: 'Проекты машинного обучения на Python',
      shortDescEn: 'Machine learning projects with Python',
      duration: '4 ay',
      price: 250,
      level: 'INTERMEDIATE',
      audience: 'KIDS',
      ageGroup: 'AGE_12_14',
      categoryId: catAI.id,
      order: 2,
      features: ['Sertifikat', 'ML layihələr', 'Jupyter Notebook', 'Mentor dəstəyi'],
      syllabus: [
        { module: 'Data əsasları', topics: ['Pandas', 'Verilənlər vizualizasiyası', 'NumPy əsasları'], hours: 16 },
        { module: 'Maşın öyrənməsi', topics: ['Scikit-learn', 'Klassifikasiya', 'Reqressiya'], hours: 16 },
        { module: 'AI layihələri', topics: ['Şəkil tanıma', 'Mətn analizi', 'Chatbot yaratma'], hours: 16 },
      ],
    },
    {
      slug: 'ai-deep-learning-teens',
      titleAz: 'Dərin Öyrənmə və Generativ AI',
      titleRu: 'Глубокое обучение и генеративный ИИ',
      titleEn: 'Deep Learning & Generative AI for Teens',
      descAz: 'Neyron şəbəkələri, dərin öyrənmə, generativ AI modelləri və real dünya tətbiqləri. TensorFlow, PyTorch və GPT API.',
      descRu: 'Нейронные сети, глубокое обучение, генеративные AI модели и реальные приложения. TensorFlow, PyTorch и GPT API.',
      descEn: 'Neural networks, deep learning, generative AI models and real-world applications. TensorFlow, PyTorch and GPT API.',
      shortDescAz: 'Neyron şəbəkələr, generativ AI və real layihələr',
      shortDescRu: 'Нейросети, генеративный ИИ и реальные проекты',
      shortDescEn: 'Neural networks, generative AI and real projects',
      duration: '5 ay',
      price: 300,
      level: 'ADVANCED',
      audience: 'KIDS',
      ageGroup: 'AGE_15_17',
      categoryId: catAI.id,
      order: 3,
      features: ['Sertifikat', 'GPU compute', 'Portfolio layihələr', 'Karyera məsləhəti'],
      syllabus: [
        { module: 'Neyron şəbəkələri', topics: ['Perceptron', 'Aktivasiya funksiyaları', 'Backpropagation', 'CNN'], hours: 20 },
        { module: 'Generativ AI', topics: ['GPT API', 'Prompt engineering', 'LangChain', 'RAG'], hours: 20 },
        { module: 'Layihələr', topics: ['AI image generator', 'Chatbot app', 'Final portfolio'], hours: 20 },
      ],
    },
  ];

  const allCourses = [...codingCourses, ...cyberCourses, ...aiCourses];

  for (const courseData of allCourses) {
    const existing = await prisma.course.findUnique({ where: { slug: courseData.slug } });
    if (existing) {
      console.log(`  ⏭  Skipping "${courseData.titleEn}" (already exists)`);
      continue;
    }

    await prisma.course.create({
      data: {
        slug: courseData.slug,
        titleAz: courseData.titleAz,
        titleRu: courseData.titleRu,
        titleEn: courseData.titleEn,
        descAz: courseData.descAz,
        descRu: courseData.descRu,
        descEn: courseData.descEn,
        shortDescAz: courseData.shortDescAz,
        shortDescRu: courseData.shortDescRu,
        shortDescEn: courseData.shortDescEn,
        duration: courseData.duration,
        price: courseData.price,
        level: courseData.level as any,
        audience: courseData.audience as any,
        ageGroup: courseData.ageGroup as any,
        categoryId: courseData.categoryId,
        order: courseData.order,
        isActive: true,
        isFeatured: false,
        features: courseData.features,
        syllabus: courseData.syllabus,
      },
    });
    console.log(`  ✅ Created "${courseData.titleEn}" (${courseData.ageGroup})`);
  }

  console.log(`\n🎉 Done! Created ${allCourses.length} kids courses in 3 categories.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

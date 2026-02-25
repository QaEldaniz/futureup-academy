/**
 * Create all categories and courses via Admin API
 * Usage: cd apps/api && npx tsx prisma/create-courses.ts
 *
 * Set BASE_URL env var for production:
 *   BASE_URL=https://futureupacademy.az npx tsx prisma/create-courses.ts
 */

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';

// ─── Categories ───────────────────────────────────────────────────────────────
const CATEGORIES = [
  {
    slug: 'traditional-it',
    nameAz: 'Ənənəvi IT Komandası',
    nameRu: 'Традиционная IT команда',
    nameEn: 'Traditional IT Team',
    icon: 'Monitor',
    order: 1,
  },
  {
    slug: 'business-it',
    nameAz: 'Biznes-IT Əməkdaşlığı',
    nameRu: 'Бизнес-IT Сотрудничество',
    nameEn: 'Business-IT Collaboration',
    icon: 'Briefcase',
    order: 2,
  },
  {
    slug: 'marketing-bd',
    nameAz: 'Marketinq və BD',
    nameRu: 'Маркетинг и BD',
    nameEn: 'Marketing & BD',
    icon: 'TrendingUp',
    order: 3,
  },
  {
    slug: 'data-science',
    nameAz: 'Data Science',
    nameRu: 'Data Science',
    nameEn: 'Data Science',
    icon: 'Database',
    order: 4,
  },
  {
    slug: 'sw-engineering',
    nameAz: 'Proqram Mühəndisliyi',
    nameRu: 'Разработка ПО',
    nameEn: 'Software Engineering',
    icon: 'Code',
    order: 5,
  },
  {
    slug: 'dev-team',
    nameAz: 'DevOps & DevSecOps',
    nameRu: 'DevOps & DevSecOps',
    nameEn: 'DevOps & DevSecOps',
    icon: 'Container',
    order: 6,
  },
  {
    slug: 'cyber-security',
    nameAz: 'Kiber Təhlükəsizlik',
    nameRu: 'Кибербезопасность',
    nameEn: 'Cyber Security',
    icon: 'Shield',
    order: 7,
  },
  {
    slug: 'kids-programs',
    nameAz: 'Uşaq Proqramları',
    nameRu: 'Детские программы',
    nameEn: 'Kids Programs',
    icon: 'Baby',
    order: 8,
  },
];

// ─── Adult Courses (20) ──────────────────────────────────────────────────────
const ADULT_COURSES = [
  // ─── Traditional IT (gray) ─────────────────────────────────────
  {
    slug: 'help-desk',
    titleAz: 'Help Desk',
    titleRu: 'Help Desk',
    titleEn: 'Help Desk',
    descAz: 'İstifadəçi dəstəyi, bilet idarəetmə sistemləri, əsas nasazlıqların aradan qaldırılması və IT xidmət masası prosesləri üzrə praktiki təlim. ITIL əsasları, hardware/software diaqnostikası və müştəri ilə ünsiyyət bacarıqları.',
    descRu: 'Практическое обучение по поддержке пользователей, системам управления тикетами, базовому устранению неисправностей и процессам IT-сервис-деска. Основы ITIL, диагностика оборудования/ПО и навыки общения с клиентами.',
    descEn: 'Hands-on training in user support, ticket management systems, basic troubleshooting and IT service desk processes. ITIL fundamentals, hardware/software diagnostics and customer communication skills.',
    shortDescAz: 'IT dəstəyi və xidmət masası əsasları',
    shortDescRu: 'Основы IT-поддержки и сервис-деска',
    shortDescEn: 'IT support and service desk fundamentals',
    duration: '4 ay',
    price: 3200,
    level: 'BEGINNER',
    categorySlug: 'traditional-it',
    order: 1,
  },
  {
    slug: 'computer-systems-networks',
    titleAz: 'Kompüter Sistemləri və Şəbəkələr',
    titleRu: 'Компьютерные Системы и Сети',
    titleEn: 'Computer Systems & Networks',
    descAz: 'Kompüter arxitekturası, əməliyyat sistemləri, şəbəkə protokolları (TCP/IP, DNS, DHCP), server konfiqurasiyası, Cisco/MikroTik avadanlıqları və şəbəkə təhlükəsizliyi üzrə dərin biliklər.',
    descRu: 'Глубокие знания по архитектуре компьютеров, операционным системам, сетевым протоколам (TCP/IP, DNS, DHCP), конфигурации серверов, оборудованию Cisco/MikroTik и сетевой безопасности.',
    descEn: 'Deep knowledge in computer architecture, operating systems, network protocols (TCP/IP, DNS, DHCP), server configuration, Cisco/MikroTik equipment and network security.',
    shortDescAz: 'Şəbəkə və sistem administrasiyası',
    shortDescRu: 'Сетевое и системное администрирование',
    shortDescEn: 'Network and system administration',
    duration: '6 ay',
    price: 3800,
    level: 'INTERMEDIATE',
    categorySlug: 'traditional-it',
    order: 2,
  },
  // ─── Business-IT (purple) ──────────────────────────────────────
  {
    slug: 'qa-engineering',
    titleAz: 'QA Mühəndisliyi',
    titleRu: 'QA Инженерия',
    titleEn: 'QA Engineering',
    descAz: 'Manual və avtomatlaşdırılmış test metodologiyaları, test planlarının hazırlanması, Selenium, Cypress, Postman, API testing, CI/CD test inteqrasiyası və keyfiyyət təminatı prosesləri.',
    descRu: 'Методологии ручного и автоматизированного тестирования, составление тест-планов, Selenium, Cypress, Postman, API-тестирование, интеграция тестов в CI/CD и процессы обеспечения качества.',
    descEn: 'Manual and automated testing methodologies, test plan creation, Selenium, Cypress, Postman, API testing, CI/CD test integration and quality assurance processes.',
    shortDescAz: 'Proqram təminatı test mühəndisliyi',
    shortDescRu: 'Тестирование программного обеспечения',
    shortDescEn: 'Software quality assurance and testing',
    duration: '5 ay',
    price: 3500,
    level: 'BEGINNER',
    categorySlug: 'business-it',
    order: 3,
  },
  {
    slug: 'product-owner',
    titleAz: 'Məhsul Sahibi (Product Owner)',
    titleRu: 'Product Owner',
    titleEn: 'Product Owner',
    descAz: 'Agile/Scrum çərçivələri, məhsul yol xəritəsi, backlog idarəetmə, stakeholder ünsiyyəti, MVP planlaması, istifadəçi hekayələri yazma və məhsulun həyat dövrü idarəetməsi.',
    descRu: 'Фреймворки Agile/Scrum, дорожная карта продукта, управление бэклогом, коммуникация со стейкхолдерами, планирование MVP, написание пользовательских историй и управление жизненным циклом продукта.',
    descEn: 'Agile/Scrum frameworks, product roadmap, backlog management, stakeholder communication, MVP planning, user story writing and product lifecycle management.',
    shortDescAz: 'Məhsul idarəetmə və Agile metodologiyası',
    shortDescRu: 'Управление продуктом и Agile-методология',
    shortDescEn: 'Product management and Agile methodology',
    duration: '4 ay',
    price: 3800,
    level: 'INTERMEDIATE',
    categorySlug: 'business-it',
    order: 4,
  },
  // ─── Marketing & BD (green) ────────────────────────────────────
  {
    slug: 'digital-marketing',
    titleAz: 'Rəqəmsal Marketinq',
    titleRu: 'Цифровой Маркетинг',
    titleEn: 'Digital Marketing',
    descAz: 'SEO/SEM, sosial media marketinqi, Google Ads, Meta Ads, kontent strategiyası, email marketinq, analitika (Google Analytics, Meta Pixel) və rəqəmsal kampaniya idarəetməsi.',
    descRu: 'SEO/SEM, маркетинг в социальных сетях, Google Ads, Meta Ads, контент-стратегия, email-маркетинг, аналитика (Google Analytics, Meta Pixel) и управление цифровыми кампаниями.',
    descEn: 'SEO/SEM, social media marketing, Google Ads, Meta Ads, content strategy, email marketing, analytics (Google Analytics, Meta Pixel) and digital campaign management.',
    shortDescAz: 'Rəqəmsal marketinq strategiyaları və alətlər',
    shortDescRu: 'Стратегии и инструменты цифрового маркетинга',
    shortDescEn: 'Digital marketing strategies and tools',
    duration: '4 ay',
    price: 3200,
    level: 'BEGINNER',
    categorySlug: 'marketing-bd',
    order: 5,
  },
  {
    slug: 'ui-ux-design',
    titleAz: 'UI/UX Dizayn',
    titleRu: 'UI/UX Дизайн',
    titleEn: 'UI/UX Design',
    descAz: 'İstifadəçi tədqiqatı, wireframing, prototipləmə, Figma, dizayn sistemləri, responsiv dizayn, usability testing və müasir UI/UX dizayn prinsipləri.',
    descRu: 'Исследование пользователей, вайрфрейминг, прототипирование, Figma, дизайн-системы, адаптивный дизайн, юзабилити-тестирование и современные принципы UI/UX дизайна.',
    descEn: 'User research, wireframing, prototyping, Figma, design systems, responsive design, usability testing and modern UI/UX design principles.',
    shortDescAz: 'İstifadəçi interfeysi və təcrübə dizaynı',
    shortDescRu: 'Дизайн пользовательского интерфейса и опыта',
    shortDescEn: 'User interface and experience design',
    duration: '5 ay',
    price: 3500,
    level: 'BEGINNER',
    categorySlug: 'marketing-bd',
    order: 6,
  },
  // ─── Data Science (brown/black) ────────────────────────────────
  {
    slug: 'ai-machine-learning',
    titleAz: 'Süni İntellekt və Maşın Öyrənmə',
    titleRu: 'Искусственный Интеллект и Машинное Обучение',
    titleEn: 'AI & Machine Learning',
    descAz: 'Python ilə maşın öyrənmə, TensorFlow, PyTorch, neyron şəbəkələr, təbii dil emalı (NLP), kompüter görmə, dərin öyrənmə və AI model yerləşdirmə.',
    descRu: 'Машинное обучение на Python, TensorFlow, PyTorch, нейронные сети, обработка естественного языка (NLP), компьютерное зрение, глубокое обучение и развёртывание AI-моделей.',
    descEn: 'Machine learning with Python, TensorFlow, PyTorch, neural networks, natural language processing (NLP), computer vision, deep learning and AI model deployment.',
    shortDescAz: 'AI, ML və dərin öyrənmə texnologiyaları',
    shortDescRu: 'Технологии AI, ML и глубокого обучения',
    shortDescEn: 'AI, ML and deep learning technologies',
    duration: '8 ay',
    price: 5000,
    level: 'ADVANCED',
    categorySlug: 'data-science',
    order: 7,
  },
  {
    slug: 'data-engineering',
    titleAz: 'Data Mühəndisliyi',
    titleRu: 'Дата Инженерия',
    titleEn: 'Data Engineering',
    descAz: 'ETL/ELT prosesləri, data pipeline qurulması, Apache Spark, Kafka, Airflow, verilənlər anbarı arxitekturası, SQL/NoSQL, bulud data platformaları (AWS, GCP, Azure).',
    descRu: 'Процессы ETL/ELT, построение data pipeline, Apache Spark, Kafka, Airflow, архитектура хранилищ данных, SQL/NoSQL, облачные data-платформы (AWS, GCP, Azure).',
    descEn: 'ETL/ELT processes, data pipeline building, Apache Spark, Kafka, Airflow, data warehouse architecture, SQL/NoSQL, cloud data platforms (AWS, GCP, Azure).',
    shortDescAz: 'Data pipeline və verilənlər infrastrukturu',
    shortDescRu: 'Data pipeline и инфраструктура данных',
    shortDescEn: 'Data pipelines and data infrastructure',
    duration: '7 ay',
    price: 4500,
    level: 'INTERMEDIATE',
    categorySlug: 'data-science',
    order: 8,
  },
  {
    slug: 'data-analytics',
    titleAz: 'Data Analitika',
    titleRu: 'Аналитика Данных',
    titleEn: 'Data Analytics',
    descAz: 'SQL, Python/Pandas, data vizualizasiya (Power BI, Tableau), statistik analiz, A/B testləri, biznes analitikası və data əsaslı qərar qəbuletmə.',
    descRu: 'SQL, Python/Pandas, визуализация данных (Power BI, Tableau), статистический анализ, A/B-тесты, бизнес-аналитика и принятие решений на основе данных.',
    descEn: 'SQL, Python/Pandas, data visualization (Power BI, Tableau), statistical analysis, A/B testing, business analytics and data-driven decision making.',
    shortDescAz: 'Data analiz və biznes analitikası',
    shortDescRu: 'Анализ данных и бизнес-аналитика',
    shortDescEn: 'Data analysis and business analytics',
    duration: '5 ay',
    price: 3800,
    level: 'BEGINNER',
    categorySlug: 'data-science',
    order: 9,
  },
  // ─── Software Engineering (yellow) ─────────────────────────────
  {
    slug: 'mobile-development',
    titleAz: 'Mobil Proqramlaşdırma',
    titleRu: 'Мобильная Разработка',
    titleEn: 'Mobile Development',
    descAz: 'React Native / Flutter ilə cross-platform mobil tətbiq hazırlama, UI komponentlər, navigasiya, API inteqrasiyası, dövlət idarəetmə və app store dərc etmə.',
    descRu: 'Кроссплатформенная мобильная разработка на React Native / Flutter, UI-компоненты, навигация, API-интеграция, управление состоянием и публикация в App Store.',
    descEn: 'Cross-platform mobile app development with React Native / Flutter, UI components, navigation, API integration, state management and app store publishing.',
    shortDescAz: 'Mobil tətbiq hazırlama (React Native / Flutter)',
    shortDescRu: 'Мобильная разработка (React Native / Flutter)',
    shortDescEn: 'Mobile app development (React Native / Flutter)',
    duration: '6 ay',
    price: 4000,
    level: 'INTERMEDIATE',
    categorySlug: 'sw-engineering',
    order: 10,
  },
  {
    slug: 'backend-java',
    titleAz: 'Backend — Java',
    titleRu: 'Backend — Java',
    titleEn: 'Backend — Java',
    descAz: 'Java Core, OOP prinsipləri, Spring Boot framework, RESTful API, JPA/Hibernate, mikroservis arxitekturası, Maven/Gradle, Docker, verilənlər bazası (PostgreSQL, MySQL).',
    descRu: 'Java Core, принципы ООП, фреймворк Spring Boot, RESTful API, JPA/Hibernate, микросервисная архитектура, Maven/Gradle, Docker, базы данных (PostgreSQL, MySQL).',
    descEn: 'Java Core, OOP principles, Spring Boot framework, RESTful API, JPA/Hibernate, microservice architecture, Maven/Gradle, Docker, databases (PostgreSQL, MySQL).',
    shortDescAz: 'Java Spring Boot ilə backend proqramlaşdırma',
    shortDescRu: 'Backend-разработка на Java Spring Boot',
    shortDescEn: 'Backend development with Java Spring Boot',
    duration: '7 ay',
    price: 4200,
    level: 'INTERMEDIATE',
    categorySlug: 'sw-engineering',
    order: 11,
  },
  {
    slug: 'backend-csharp',
    titleAz: 'Backend — C#',
    titleRu: 'Backend — C#',
    titleEn: 'Backend — C#',
    descAz: 'C# əsasları, .NET Core / ASP.NET, Entity Framework, RESTful API, LINQ, mikroservis arxitekturası, Azure cloud, SQL Server, Docker və CI/CD.',
    descRu: 'Основы C#, .NET Core / ASP.NET, Entity Framework, RESTful API, LINQ, микросервисная архитектура, Azure Cloud, SQL Server, Docker и CI/CD.',
    descEn: 'C# fundamentals, .NET Core / ASP.NET, Entity Framework, RESTful API, LINQ, microservice architecture, Azure Cloud, SQL Server, Docker and CI/CD.',
    shortDescAz: '.NET Core ilə backend proqramlaşdırma',
    shortDescRu: 'Backend-разработка на .NET Core',
    shortDescEn: 'Backend development with .NET Core',
    duration: '7 ay',
    price: 4200,
    level: 'INTERMEDIATE',
    categorySlug: 'sw-engineering',
    order: 12,
  },
  {
    slug: 'frontend-development',
    titleAz: 'Frontend Proqramlaşdırma',
    titleRu: 'Frontend Разработка',
    titleEn: 'Frontend Development',
    descAz: 'HTML5, CSS3, JavaScript/TypeScript, React.js, Next.js, responsiv dizayn, REST API inteqrasiyası, dövlət idarəetmə (Redux, Zustand), test və performans optimallaşdırma.',
    descRu: 'HTML5, CSS3, JavaScript/TypeScript, React.js, Next.js, адаптивный дизайн, интеграция REST API, управление состоянием (Redux, Zustand), тестирование и оптимизация производительности.',
    descEn: 'HTML5, CSS3, JavaScript/TypeScript, React.js, Next.js, responsive design, REST API integration, state management (Redux, Zustand), testing and performance optimization.',
    shortDescAz: 'Müasir veb interfeyslər hazırlama',
    shortDescRu: 'Создание современных веб-интерфейсов',
    shortDescEn: 'Building modern web interfaces',
    duration: '6 ay',
    price: 4000,
    level: 'BEGINNER',
    categorySlug: 'sw-engineering',
    order: 13,
  },
  // ─── DevOps & DevSecOps (magenta) ──────────────────────────────
  {
    slug: 'devops',
    titleAz: 'DevOps Mühəndisliyi',
    titleRu: 'DevOps Инженерия',
    titleEn: 'DevOps Engineering',
    descAz: 'Linux administrasiyası, Docker, Kubernetes, CI/CD pipeline (Jenkins, GitLab CI), Terraform, Ansible, bulud xidmətləri (AWS/GCP/Azure), monitoring (Prometheus, Grafana).',
    descRu: 'Администрирование Linux, Docker, Kubernetes, CI/CD pipeline (Jenkins, GitLab CI), Terraform, Ansible, облачные сервисы (AWS/GCP/Azure), мониторинг (Prometheus, Grafana).',
    descEn: 'Linux administration, Docker, Kubernetes, CI/CD pipeline (Jenkins, GitLab CI), Terraform, Ansible, cloud services (AWS/GCP/Azure), monitoring (Prometheus, Grafana).',
    shortDescAz: 'DevOps mühəndisliyi və bulud texnologiyaları',
    shortDescRu: 'DevOps-инженерия и облачные технологии',
    shortDescEn: 'DevOps engineering and cloud technologies',
    duration: '7 ay',
    price: 4500,
    level: 'INTERMEDIATE',
    categorySlug: 'dev-team',
    order: 14,
  },
  {
    slug: 'devsecops',
    titleAz: 'DevSecOps Mühəndisliyi',
    titleRu: 'DevSecOps Инженерия',
    titleEn: 'DevSecOps Engineering',
    descAz: 'Təhlükəsizlik-orientasiyalı DevOps, SAST/DAST, container security, supply chain security, OWASP, compliance automation, SonarQube, Snyk və security pipeline inteqrasiyası.',
    descRu: 'Security-ориентированный DevOps, SAST/DAST, безопасность контейнеров, безопасность цепочки поставок, OWASP, автоматизация compliance, SonarQube, Snyk и интеграция security pipeline.',
    descEn: 'Security-oriented DevOps, SAST/DAST, container security, supply chain security, OWASP, compliance automation, SonarQube, Snyk and security pipeline integration.',
    shortDescAz: 'Təhlükəsizlik-odaqlı DevOps mühəndisliyi',
    shortDescRu: 'Security-ориентированная DevOps-инженерия',
    shortDescEn: 'Security-focused DevOps engineering',
    duration: '8 ay',
    price: 5000,
    level: 'ADVANCED',
    categorySlug: 'dev-team',
    order: 15,
  },
  // ─── Cyber Security (navy) ─────────────────────────────────────
  {
    slug: 'red-team',
    titleAz: 'Red Team — Hücum Komandası',
    titleRu: 'Red Team — Команда Атаки',
    titleEn: 'Red Team',
    descAz: 'Hücum simulyasiyası, penetration testing, sosial mühəndislik, zəiflik istismarı, Kali Linux, Metasploit, Burp Suite və təcavüz ssenariləri hazırlanması.',
    descRu: 'Симуляция атак, тестирование на проникновение, социальная инженерия, эксплуатация уязвимостей, Kali Linux, Metasploit, Burp Suite и разработка сценариев атак.',
    descEn: 'Attack simulation, penetration testing, social engineering, vulnerability exploitation, Kali Linux, Metasploit, Burp Suite and attack scenario development.',
    shortDescAz: 'Hücum simulyasiyası və penetrasiya testi',
    shortDescRu: 'Симуляция атак и тестирование на проникновение',
    shortDescEn: 'Attack simulation and penetration testing',
    duration: '8 ay',
    price: 5000,
    level: 'ADVANCED',
    categorySlug: 'cyber-security',
    order: 16,
  },
  {
    slug: 'blue-team',
    titleAz: 'Blue Team — Müdafiə Komandası',
    titleRu: 'Blue Team — Команда Защиты',
    titleEn: 'Blue Team',
    descAz: 'Müdafiə strategiyaları, SIEM (Splunk, QRadar), insidentlərə reaksiya, log analizi, threat intelligence, network forensics və SOC əməliyyatları.',
    descRu: 'Стратегии защиты, SIEM (Splunk, QRadar), реагирование на инциденты, анализ логов, threat intelligence, сетевая форензика и операции SOC.',
    descEn: 'Defense strategies, SIEM (Splunk, QRadar), incident response, log analysis, threat intelligence, network forensics and SOC operations.',
    shortDescAz: 'Kiber müdafiə və SOC əməliyyatları',
    shortDescRu: 'Киберзащита и операции SOC',
    shortDescEn: 'Cyber defense and SOC operations',
    duration: '7 ay',
    price: 4500,
    level: 'INTERMEDIATE',
    categorySlug: 'cyber-security',
    order: 17,
  },
  {
    slug: 'purple-team',
    titleAz: 'Purple Team — Birgə Komanda',
    titleRu: 'Purple Team — Совместная Команда',
    titleEn: 'Purple Team',
    descAz: 'Red və Blue Team əməkdaşlığı, MITRE ATT&CK framework, threat hunting, hücum-müdafiə simulyasiyaları, təhlükəsizlik strategiyasının təkmilləşdirilməsi.',
    descRu: 'Сотрудничество Red и Blue Team, фреймворк MITRE ATT&CK, threat hunting, симуляции атака-защита, совершенствование стратегии безопасности.',
    descEn: 'Red and Blue Team collaboration, MITRE ATT&CK framework, threat hunting, attack-defense simulations, security strategy improvement.',
    shortDescAz: 'Hücum-müdafiə əməkdaşlığı və threat hunting',
    shortDescRu: 'Сотрудничество атака-защита и threat hunting',
    shortDescEn: 'Attack-defense collaboration and threat hunting',
    duration: '6 ay',
    price: 4200,
    level: 'ADVANCED',
    categorySlug: 'cyber-security',
    order: 18,
  },
  {
    slug: 'white-team',
    titleAz: 'White Team — Siyasət Komandası',
    titleRu: 'White Team — Команда Политик',
    titleEn: 'White Team',
    descAz: 'Təhlükəsizlik siyasəti idarəetmə, uyğunluq (compliance) audit, risk qiymətləndirmə, ISO 27001, NIST framework, məlumat qorunması (GDPR, KVKK) və governance.',
    descRu: 'Управление политиками безопасности, аудит соответствия (compliance), оценка рисков, ISO 27001, NIST framework, защита данных (GDPR, KVKK) и governance.',
    descEn: 'Security policy management, compliance audit, risk assessment, ISO 27001, NIST framework, data protection (GDPR, KVKK) and governance.',
    shortDescAz: 'Təhlükəsizlik siyasəti və uyğunluq idarəetmə',
    shortDescRu: 'Политики безопасности и управление соответствием',
    shortDescEn: 'Security policy and compliance management',
    duration: '5 ay',
    price: 4000,
    level: 'INTERMEDIATE',
    categorySlug: 'cyber-security',
    order: 19,
  },
  {
    slug: 'cyber-ops',
    titleAz: 'Kiber Əməliyyatlar Komandası',
    titleRu: 'Команда Кибер Операций',
    titleEn: 'Cyber Operations Team',
    descAz: 'Real-time kiber əməliyyatlar, SOC menecmenti, insidentlərə avtomatlaşdırılmış cavab (SOAR), digital forensics, malware analizi və kiber müharibə strategiyaları.',
    descRu: 'Кибероперации в реальном времени, менеджмент SOC, автоматизированное реагирование на инциденты (SOAR), цифровая форензика, анализ вредоносного ПО и стратегии кибервойны.',
    descEn: 'Real-time cyber operations, SOC management, automated incident response (SOAR), digital forensics, malware analysis and cyber warfare strategies.',
    shortDescAz: 'Kiber əməliyyatlar və avtomatlaşdırılmış cavab',
    shortDescRu: 'Кибероперации и автоматизированное реагирование',
    shortDescEn: 'Cyber operations and automated response',
    duration: '8 ay',
    price: 5000,
    level: 'ADVANCED',
    categorySlug: 'cyber-security',
    order: 20,
  },
];

// ─── Kids Courses (3) ────────────────────────────────────────────────────────
const KIDS_COURSES = [
  {
    slug: 'kids-ai',
    titleAz: 'Uşaqlar üçün Süni İntellekt',
    titleRu: 'Искусственный Интеллект для детей',
    titleEn: 'AI for Kids',
    descAz: 'Süni intellektin əsasları, maşın öyrənmə anlayışları, chatbot yaratma, şəkil tanıma, Scratch ilə AI layihələr, məntiq və alqoritmik düşüncə bacarıqlarının inkişafı. Uşaqlar interaktiv layihələr vasitəsilə AI dünyasını kəşf edəcəklər.',
    descRu: 'Основы искусственного интеллекта, понятия машинного обучения, создание чат-ботов, распознавание изображений, AI-проекты на Scratch, развитие логического и алгоритмического мышления. Дети познакомятся с миром AI через интерактивные проекты.',
    descEn: 'Fundamentals of artificial intelligence, machine learning concepts, chatbot creation, image recognition, AI projects with Scratch, development of logical and algorithmic thinking. Kids will explore the world of AI through interactive projects.',
    shortDescAz: 'Uşaqlar üçün süni intellekt əsasları',
    shortDescRu: 'Основы ИИ для детей',
    shortDescEn: 'AI fundamentals for kids',
    duration: '4 ay',
    price: 3200,
    level: 'BEGINNER',
    audience: 'KIDS',
    ageGroup: 'AGE_9_11',
    categorySlug: 'kids-programs',
    order: 21,
  },
  {
    slug: 'kids-cybersecurity',
    titleAz: 'Uşaqlar üçün Kiber Təhlükəsizlik',
    titleRu: 'Кибербезопасность для детей',
    titleEn: 'Cybersecurity for Kids',
    descAz: 'İnternet təhlükəsizliyi, parol idarəetmə, fişinq hücumlarını tanıma, şəxsi məlumatların qorunması, onlayn davranış qaydaları, əsas kriptoqrafiya anlayışları və etik hakerlik giriş. Uşaqlar rəqəmsal dünyada özlərini qorumağı öyrənəcəklər.',
    descRu: 'Интернет-безопасность, управление паролями, распознавание фишинговых атак, защита личных данных, правила поведения в интернете, основные понятия криптографии и введение в этичный хакинг. Дети научатся защищать себя в цифровом мире.',
    descEn: 'Internet safety, password management, phishing attack recognition, personal data protection, online behavior rules, basic cryptography concepts and ethical hacking introduction. Kids will learn to protect themselves in the digital world.',
    shortDescAz: 'Uşaqlar üçün onlayn təhlükəsizlik',
    shortDescRu: 'Онлайн-безопасность для детей',
    shortDescEn: 'Online safety for kids',
    duration: '3 ay',
    price: 3000,
    level: 'BEGINNER',
    audience: 'KIDS',
    ageGroup: 'AGE_9_11',
    categorySlug: 'kids-programs',
    order: 22,
  },
  {
    slug: 'kids-programming',
    titleAz: 'Uşaqlar üçün Proqramlaşdırma',
    titleRu: 'Программирование для детей',
    titleEn: 'Programming for Kids',
    descAz: 'Scratch, Python əsasları, oyun hazırlama, veb səhifə yaratma, alqoritmik düşüncə, dəyişənlər, döngülər, şərtlər, funksiyalar. Uşaqlar öz oyunlarını və tətbiqlərini yaratmağı öyrənəcəklər.',
    descRu: 'Scratch, основы Python, создание игр, создание веб-страниц, алгоритмическое мышление, переменные, циклы, условия, функции. Дети научатся создавать собственные игры и приложения.',
    descEn: 'Scratch, Python basics, game development, web page creation, algorithmic thinking, variables, loops, conditions, functions. Kids will learn to create their own games and applications.',
    shortDescAz: 'Uşaqlar üçün proqramlaşdırma əsasları',
    shortDescRu: 'Основы программирования для детей',
    shortDescEn: 'Programming fundamentals for kids',
    duration: '4 ay',
    price: 3200,
    level: 'BEGINNER',
    audience: 'KIDS',
    ageGroup: 'AGE_9_11',
    categorySlug: 'kids-programs',
    order: 23,
  },
];

// ─── Script ───────────────────────────────────────────────────────────────────

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

  // 2. Get existing categories
  console.log('📂 Fetching existing categories...');
  const catRes = await fetch(`${BASE_URL}/api/categories`, { headers });
  const catData = await catRes.json();
  const existingCats: Array<{ id: string; slug: string; nameEn: string }> =
    catData.data || catData || [];
  console.log(`   Found ${existingCats.length} existing categories`);

  // 3. Create or find categories
  const categoryMap: Record<string, string> = {};

  for (const cat of existingCats) {
    categoryMap[cat.slug] = cat.id;
    console.log(`   ✓ Existing: "${cat.nameEn || cat.slug}" → ${cat.id}`);
  }

  for (const cat of CATEGORIES) {
    if (categoryMap[cat.slug]) {
      continue; // already exists
    }

    console.log(`   Creating category "${cat.nameEn}"...`);
    try {
      const res = await fetch(`${BASE_URL}/api/categories`, {
        method: 'POST',
        headers,
        body: JSON.stringify(cat),
      });

      const text = await res.text();
      if (res.ok) {
        const data = JSON.parse(text);
        const id = data.data?.id;
        if (id) {
          categoryMap[cat.slug] = id;
          console.log(`   ✅ Created "${cat.nameEn}" → ${id}`);
        } else {
          console.error(`   ❌ No id returned for "${cat.nameEn}":`, text);
        }
      } else {
        // If unique constraint error, try to find existing by listing all
        console.error(`   ⚠️  Failed (${res.status}): ${text}`);
        console.log(`   🔄 Trying to find existing...`);

        // Re-fetch all categories to find it
        const retry = await fetch(`${BASE_URL}/api/categories`, { headers });
        const retryData = await retry.json();
        const found = (retryData.data || []).find(
          (c: { slug: string }) => c.slug === cat.slug
        );
        if (found) {
          categoryMap[cat.slug] = found.id;
          console.log(`   ✓ Found existing "${cat.nameEn}" → ${found.id}`);
        }
      }
    } catch (err) {
      console.error(`   ❌ Error creating "${cat.nameEn}":`, err);
    }
  }

  // Verify all categories exist
  const missingCats = CATEGORIES.filter((c) => !categoryMap[c.slug]);
  if (missingCats.length > 0) {
    console.error('\n❌ Missing categories:', missingCats.map((c) => c.slug).join(', '));
    console.error('   Cannot proceed without all categories.');
    process.exit(1);
  }

  console.log(`\n📂 Category map ready (${Object.keys(categoryMap).length} categories)\n`);

  // 4. Get existing courses
  console.log('📚 Fetching existing courses...');
  const existCoursesRes = await fetch(`${BASE_URL}/api/admin/courses?limit=200`, { headers });
  const existCoursesData = await existCoursesRes.json();
  const existingCourses: Array<{ slug: string; id: string }> = existCoursesData.data || [];
  const existingSlugs = new Set(existingCourses.map((c) => c.slug));
  console.log(`   Found ${existingCourses.length} existing courses\n`);

  // 5. Create adult courses
  const allCourses = [
    ...ADULT_COURSES.map((c) => ({ ...c, audience: 'ADULTS' as const })),
    ...KIDS_COURSES,
  ];

  let created = 0;
  let skipped = 0;
  let failed = 0;

  console.log(`🚀 Creating ${allCourses.length} courses...\n`);

  for (const course of allCourses) {
    if (existingSlugs.has(course.slug)) {
      console.log(`   ⏭  Skip "${course.titleEn}" (exists)`);
      skipped++;
      continue;
    }

    const categoryId = categoryMap[course.categorySlug];
    if (!categoryId) {
      console.error(`   ❌ No category "${course.categorySlug}" for "${course.titleEn}"`);
      failed++;
      continue;
    }

    const { categorySlug, ...rest } = course;
    const payload: Record<string, any> = {
      ...rest,
      categoryId,
      isActive: true,
      isFeatured: false,
    };

    try {
      const res = await fetch(`${BASE_URL}/api/admin/courses`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      if (res.ok) {
        const data = JSON.parse(text);
        console.log(
          `   ✅ [${created + 1}] ${course.titleAz} | ${course.titleRu} | ${course.titleEn} (${data.data?.id})`
        );
        created++;
      } else {
        console.error(`   ❌ "${course.titleEn}" (${res.status}): ${text}`);
        failed++;
      }
    } catch (err) {
      console.error(`   ❌ Error "${course.titleEn}":`, err);
      failed++;
    }
  }

  console.log(`\n═══════════════════════════════════════════════`);
  console.log(`✅ Created: ${created}`);
  console.log(`⏭  Skipped: ${skipped} (already existed)`);
  if (failed > 0) console.log(`❌ Failed: ${failed}`);
  console.log(`📊 Total: ${allCourses.length}`);
  console.log(`═══════════════════════════════════════════════\n`);
}

main().catch((e) => {
  console.error('❌ Fatal error:', e);
  process.exit(1);
});

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Clean existing data in correct order
  await prisma.review.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.studentCourse.deleteMany();
  await prisma.teacherCourse.deleteMany();
  await prisma.application.deleteMany();
  await prisma.group.deleteMany();
  await prisma.student.deleteMany();
  await prisma.testimonial.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.category.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.news.deleteMany();
  await prisma.siteSetting.deleteMany();
  console.log('🧹 Cleaned existing data');

  // ==========================================
  // ADMIN USER
  // ==========================================
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@futureup.az' },
    update: {},
    create: {
      email: 'admin@futureup.az',
      password: adminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // ==========================================
  // 7 CATEGORIES (matching screenshot groups)
  // ==========================================
  const catTraditionalIT = await prisma.category.create({
    data: {
      nameAz: 'Traditional IT Team',
      nameRu: 'Традиционная IT команда',
      nameEn: 'Traditional IT Team',
      slug: 'traditional-it',
      icon: 'Monitor',
      order: 1,
    },
  });

  const catBusinessIT = await prisma.category.create({
    data: {
      nameAz: 'Business-IT Collaboration',
      nameRu: 'Бизнес-IT Сотрудничество',
      nameEn: 'Business-IT Collaboration',
      slug: 'business-it',
      icon: 'Briefcase',
      order: 2,
    },
  });

  const catMarketing = await prisma.category.create({
    data: {
      nameAz: 'Marketing & BD',
      nameRu: 'Маркетинг и BD',
      nameEn: 'Marketing & BD',
      slug: 'marketing-bd',
      icon: 'Megaphone',
      order: 3,
    },
  });

  const catDataScience = await prisma.category.create({
    data: {
      nameAz: 'Data Science',
      nameRu: 'Data Science',
      nameEn: 'Data Science',
      slug: 'data-science',
      icon: 'BarChart3',
      order: 4,
    },
  });

  const catSWEngineering = await prisma.category.create({
    data: {
      nameAz: 'Software Engineering',
      nameRu: 'Разработка ПО',
      nameEn: 'Software Engineering',
      slug: 'sw-engineering',
      icon: 'Code2',
      order: 5,
    },
  });

  const catDevTeam = await prisma.category.create({
    data: {
      nameAz: 'DevOps & DevSecOps',
      nameRu: 'DevOps & DevSecOps',
      nameEn: 'DevOps & DevSecOps',
      slug: 'dev-team',
      icon: 'Container',
      order: 6,
    },
  });

  const catCyberSecurity = await prisma.category.create({
    data: {
      nameAz: 'Cyber Security',
      nameRu: 'Кибербезопасность',
      nameEn: 'Cyber Security',
      slug: 'cyber-security',
      icon: 'Shield',
      order: 7,
    },
  });

  console.log('✅ 7 categories created');

  // ==========================================
  // 20+ TEACHERS
  // ==========================================
  const teacherPassword = await bcrypt.hash('teacher123', 10);

  const t1 = await prisma.teacher.create({
    data: {
      email: 'kamran@futureup.az', password: teacherPassword,
      nameAz: 'Kamran Əliyev', nameRu: 'Камран Алиев', nameEn: 'Kamran Aliyev',
      bioAz: 'IT infrastruktur mütəxəssisi, 10+ il təcrübə. Microsoft və Cisco sertifikatlı mühəndis. Help Desk və texniki dəstək sahəsində lider.',
      bioRu: 'Специалист по IT-инфраструктуре, 10+ лет опыта. Сертифицированный инженер Microsoft и Cisco.',
      bioEn: 'IT infrastructure specialist, 10+ years experience. Microsoft and Cisco certified engineer.',
      specialization: 'IT Infrastructure & Help Desk', linkedin: 'https://linkedin.com/in/kamran-aliyev', order: 1,
    },
  });

  const t2 = await prisma.teacher.create({
    data: {
      email: 'tural@futureup.az', password: teacherPassword,
      nameAz: 'Tural Həsənli', nameRu: 'Турал Гасанлы', nameEn: 'Tural Hasanli',
      bioAz: 'Şəbəkə mühəndisi, 8 il təcrübə. CCNA, CCNP sertifikatlı. Korporativ şəbəkə dizaynı və idarəetmə üzrə ekspert.',
      bioRu: 'Сетевой инженер, 8 лет опыта. Сертификаты CCNA, CCNP. Эксперт по корпоративным сетям.',
      bioEn: 'Network engineer, 8 years experience. CCNA, CCNP certified. Expert in corporate network design.',
      specialization: 'Network Engineering', linkedin: 'https://linkedin.com/in/tural-hasanli', order: 2,
    },
  });

  const t3 = await prisma.teacher.create({
    data: {
      email: 'aynur@futureup.az', password: teacherPassword,
      nameAz: 'Aynur Məmmədova', nameRu: 'Айнур Мамедова', nameEn: 'Aynur Mammadova',
      bioAz: 'Senior QA Engineer, 7 il təcrübə. ISTQB sertifikatlı. Manual və avtomatlaşdırılmış test üzrə mütəxəssis.',
      bioRu: 'Senior QA Engineer, 7 лет опыта. Сертификат ISTQB. Специалист по ручному и автоматизированному тестированию.',
      bioEn: 'Senior QA Engineer, 7 years experience. ISTQB certified. Manual and automation testing specialist.',
      specialization: 'Quality Assurance', linkedin: 'https://linkedin.com/in/aynur-mammadova', order: 3,
    },
  });

  const t4 = await prisma.teacher.create({
    data: {
      email: 'farid@futureup.az', password: teacherPassword,
      nameAz: 'Fərid Quliyev', nameRu: 'Фарид Кулиев', nameEn: 'Farid Guliyev',
      bioAz: 'Senior Product Manager, 6 il təcrübə. Agile/Scrum sertifikatlı. Məhsul strategiyası və roadmap planlaması üzrə ekspert.',
      bioRu: 'Senior Product Manager, 6 лет опыта. Сертификация Agile/Scrum. Эксперт по продуктовой стратегии.',
      bioEn: 'Senior Product Manager, 6 years experience. Agile/Scrum certified. Product strategy expert.',
      specialization: 'Product Management', linkedin: 'https://linkedin.com/in/farid-guliyev', order: 4,
    },
  });

  const t5 = await prisma.teacher.create({
    data: {
      email: 'gunel@futureup.az', password: teacherPassword,
      nameAz: 'Günəl Rəhimova', nameRu: 'Гюнель Рагимова', nameEn: 'Gunel Rahimova',
      bioAz: 'Digital Marketing Lead, 8 il təcrübə. Google Ads, Meta Ads, SEO/SEM üzrə sertifikatlı mütəxəssis.',
      bioRu: 'Digital Marketing Lead, 8 лет опыта. Сертифицированный специалист Google Ads, Meta Ads, SEO/SEM.',
      bioEn: 'Digital Marketing Lead, 8 years experience. Google Ads, Meta Ads, SEO/SEM certified specialist.',
      specialization: 'Digital Marketing', linkedin: 'https://linkedin.com/in/gunel-rahimova', order: 5,
    },
  });

  const t6 = await prisma.teacher.create({
    data: {
      email: 'leyla@futureup.az', password: teacherPassword,
      nameAz: 'Leyla Əliyeva', nameRu: 'Лейла Алиева', nameEn: 'Leyla Aliyeva',
      bioAz: 'UX/UI Design Lead, 6 il təcrübə. Figma, Adobe mütəxəssisi. İstifadəçi araşdırması və prototipləmə üzrə ekspert.',
      bioRu: 'UX/UI Design Lead, 6 лет опыта. Специалист Figma, Adobe. Эксперт по исследованию пользователей.',
      bioEn: 'UX/UI Design Lead, 6 years experience. Figma, Adobe specialist. User research and prototyping expert.',
      specialization: 'UI/UX Design', linkedin: 'https://linkedin.com/in/leyla-aliyeva', order: 6,
    },
  });

  const t7 = await prisma.teacher.create({
    data: {
      email: 'rashad@futureup.az', password: teacherPassword,
      nameAz: 'Rəşad İsmayılov', nameRu: 'Рашад Исмаилов', nameEn: 'Rashad Ismayilov',
      bioAz: 'AI/ML Engineer, 5 il təcrübə. TensorFlow, PyTorch mütəxəssisi. Süni intellekt və dərin öyrənmə üzrə tədqiqatçı.',
      bioRu: 'AI/ML Engineer, 5 лет опыта. Специалист TensorFlow, PyTorch. Исследователь ИИ и глубокого обучения.',
      bioEn: 'AI/ML Engineer, 5 years experience. TensorFlow, PyTorch specialist. AI and deep learning researcher.',
      specialization: 'AI & Machine Learning', linkedin: 'https://linkedin.com/in/rashad-ismayilov', github: 'https://github.com/rashad-ml', order: 7,
    },
  });

  const t8 = await prisma.teacher.create({
    data: {
      email: 'orkhan@futureup.az', password: teacherPassword,
      nameAz: 'Orxan Məmmədov', nameRu: 'Орхан Мамедов', nameEn: 'Orkhan Mammadov',
      bioAz: 'Senior Data Engineer, 7 il təcrübə. Apache Spark, Kafka, Airflow mütəxəssisi. Big Data arxitekturası üzrə ekspert.',
      bioRu: 'Senior Data Engineer, 7 лет опыта. Специалист Apache Spark, Kafka, Airflow. Эксперт Big Data архитектуры.',
      bioEn: 'Senior Data Engineer, 7 years experience. Apache Spark, Kafka, Airflow specialist. Big Data architecture expert.',
      specialization: 'Data Engineering', linkedin: 'https://linkedin.com/in/orkhan-mammadov', github: 'https://github.com/orkhan-de', order: 8,
    },
  });

  const t9 = await prisma.teacher.create({
    data: {
      email: 'nigar@futureup.az', password: teacherPassword,
      nameAz: 'Nigar Hüseynova', nameRu: 'Нигяр Гусейнова', nameEn: 'Nigar Huseynova',
      bioAz: 'Senior Data Analyst, 5 il təcrübə. Python, SQL, Power BI, Tableau mütəxəssisi.',
      bioRu: 'Senior Data Analyst, 5 лет опыта. Специалист Python, SQL, Power BI, Tableau.',
      bioEn: 'Senior Data Analyst, 5 years experience. Python, SQL, Power BI, Tableau specialist.',
      specialization: 'Data Analytics', linkedin: 'https://linkedin.com/in/nigar-huseynova', order: 9,
    },
  });

  const t10 = await prisma.teacher.create({
    data: {
      email: 'samir@futureup.az', password: teacherPassword,
      nameAz: 'Samir Nəsibov', nameRu: 'Самир Насибов', nameEn: 'Samir Nasibov',
      bioAz: 'Senior Mobile Developer, 6 il təcrübə. Flutter, React Native, Swift, Kotlin mütəxəssisi.',
      bioRu: 'Senior Mobile Developer, 6 лет опыта. Специалист Flutter, React Native, Swift, Kotlin.',
      bioEn: 'Senior Mobile Developer, 6 years experience. Flutter, React Native, Swift, Kotlin specialist.',
      specialization: 'Mobile Development', linkedin: 'https://linkedin.com/in/samir-nasibov', github: 'https://github.com/samir-mob', order: 10,
    },
  });

  const t11 = await prisma.teacher.create({
    data: {
      email: 'vugar@futureup.az', password: teacherPassword,
      nameAz: 'Vüqar Əhmədov', nameRu: 'Вугар Ахмедов', nameEn: 'Vugar Ahmadov',
      bioAz: 'Senior Java Developer, 9 il təcrübə. Spring Boot, Microservices, AWS mütəxəssisi.',
      bioRu: 'Senior Java Developer, 9 лет опыта. Специалист Spring Boot, Microservices, AWS.',
      bioEn: 'Senior Java Developer, 9 years experience. Spring Boot, Microservices, AWS specialist.',
      specialization: 'Backend Development (Java)', linkedin: 'https://linkedin.com/in/vugar-ahmadov', github: 'https://github.com/vugar-java', order: 11,
    },
  });

  const t12 = await prisma.teacher.create({
    data: {
      email: 'elvin@futureup.az', password: teacherPassword,
      nameAz: 'Elvin Babayev', nameRu: 'Эльвин Бабаев', nameEn: 'Elvin Babayev',
      bioAz: 'Senior .NET Developer, 8 il təcrübə. C#, ASP.NET Core, Azure mütəxəssisi.',
      bioRu: 'Senior .NET Developer, 8 лет опыта. Специалист C#, ASP.NET Core, Azure.',
      bioEn: 'Senior .NET Developer, 8 years experience. C#, ASP.NET Core, Azure specialist.',
      specialization: 'Backend Development (C#)', linkedin: 'https://linkedin.com/in/elvin-babayev', github: 'https://github.com/elvin-net', order: 12,
    },
  });

  const t13 = await prisma.teacher.create({
    data: {
      email: 'eldar@futureup.az', password: teacherPassword,
      nameAz: 'Eldar Həsənov', nameRu: 'Эльдар Гасанов', nameEn: 'Eldar Hasanov',
      bioAz: 'Senior Frontend Developer, 8 il təcrübə. React, Next.js, TypeScript mütəxəssisi.',
      bioRu: 'Senior Frontend Developer, 8 лет опыта. Специалист React, Next.js, TypeScript.',
      bioEn: 'Senior Frontend Developer, 8 years experience. React, Next.js, TypeScript specialist.',
      specialization: 'Frontend Development', linkedin: 'https://linkedin.com/in/eldar-hasanov', github: 'https://github.com/eldar-fe', order: 13,
    },
  });

  const t14 = await prisma.teacher.create({
    data: {
      email: 'ceyhun@futureup.az', password: teacherPassword,
      nameAz: 'Ceyhun Nəzərov', nameRu: 'Джейхун Назаров', nameEn: 'Jeyhun Nazarov',
      bioAz: 'Senior DevOps Engineer, 7 il təcrübə. Docker, Kubernetes, Terraform, CI/CD mütəxəssisi.',
      bioRu: 'Senior DevOps Engineer, 7 лет опыта. Специалист Docker, Kubernetes, Terraform, CI/CD.',
      bioEn: 'Senior DevOps Engineer, 7 years experience. Docker, Kubernetes, Terraform, CI/CD specialist.',
      specialization: 'DevOps Engineering', linkedin: 'https://linkedin.com/in/jeyhun-nazarov', github: 'https://github.com/ceyhun-devops', order: 14,
    },
  });

  const t15 = await prisma.teacher.create({
    data: {
      email: 'murad@futureup.az', password: teacherPassword,
      nameAz: 'Murad Səfərov', nameRu: 'Мурад Сафаров', nameEn: 'Murad Safarov',
      bioAz: 'DevSecOps Engineer, 6 il təcrübə. Təhlükəsizlik avtomatlaşdırması, SAST/DAST, Container Security mütəxəssisi.',
      bioRu: 'DevSecOps Engineer, 6 лет опыта. Специалист по автоматизации безопасности, SAST/DAST.',
      bioEn: 'DevSecOps Engineer, 6 years experience. Security automation, SAST/DAST specialist.',
      specialization: 'DevSecOps', linkedin: 'https://linkedin.com/in/murad-safarov', order: 15,
    },
  });

  const t16 = await prisma.teacher.create({
    data: {
      email: 'togrul@futureup.az', password: teacherPassword,
      nameAz: 'Toğrul Qasımov', nameRu: 'Тогрул Касымов', nameEn: 'Togrul Gasimov',
      bioAz: 'Offensive Security Expert, 8 il təcrübə. OSCP, CEH sertifikatlı. Penetrasiya testləri və Red Team əməliyyatları üzrə mütəxəssis.',
      bioRu: 'Offensive Security Expert, 8 лет опыта. Сертификаты OSCP, CEH. Специалист по пентесту и Red Team.',
      bioEn: 'Offensive Security Expert, 8 years experience. OSCP, CEH certified. Pentesting and Red Team specialist.',
      specialization: 'Offensive Security (Red Team)', linkedin: 'https://linkedin.com/in/togrul-gasimov', order: 16,
    },
  });

  const t17 = await prisma.teacher.create({
    data: {
      email: 'sevinj@futureup.az', password: teacherPassword,
      nameAz: 'Sevinc Əsgərova', nameRu: 'Севиндж Аскерова', nameEn: 'Sevinj Asgarova',
      bioAz: 'SOC Analyst Lead, 7 il təcrübə. SIEM, Threat Hunting, Incident Response mütəxəssisi. Blue Team əməliyyatları üzrə ekspert.',
      bioRu: 'SOC Analyst Lead, 7 лет опыта. Специалист SIEM, Threat Hunting. Эксперт Blue Team.',
      bioEn: 'SOC Analyst Lead, 7 years experience. SIEM, Threat Hunting, Incident Response specialist.',
      specialization: 'Defensive Security (Blue Team)', linkedin: 'https://linkedin.com/in/sevinj-asgarova', order: 17,
    },
  });

  const t18 = await prisma.teacher.create({
    data: {
      email: 'ilkin@futureup.az', password: teacherPassword,
      nameAz: 'İlkin Vəliyev', nameRu: 'Ильгин Велиев', nameEn: 'Ilkin Valiyev',
      bioAz: 'Purple Team Lead, 6 il təcrübə. Red və Blue Team əməliyyatlarının koordinasiyası üzrə mütəxəssis.',
      bioRu: 'Purple Team Lead, 6 лет опыта. Специалист по координации Red и Blue Team.',
      bioEn: 'Purple Team Lead, 6 years experience. Red and Blue Team coordination specialist.',
      specialization: 'Purple Team Security', linkedin: 'https://linkedin.com/in/ilkin-valiyev', order: 18,
    },
  });

  const t19 = await prisma.teacher.create({
    data: {
      email: 'narmin@futureup.az', password: teacherPassword,
      nameAz: 'Nərmin Kazımova', nameRu: 'Нармин Казымова', nameEn: 'Narmin Kazimova',
      bioAz: 'GRC Specialist, 7 il təcrübə. ISO 27001, NIST, GDPR sertifikatlı. Risk idarəetməsi və uyğunluq üzrə ekspert.',
      bioRu: 'GRC Specialist, 7 лет опыта. Сертификаты ISO 27001, NIST, GDPR. Эксперт по управлению рисками.',
      bioEn: 'GRC Specialist, 7 years experience. ISO 27001, NIST, GDPR certified. Risk management expert.',
      specialization: 'Governance, Risk & Compliance', linkedin: 'https://linkedin.com/in/narmin-kazimova', order: 19,
    },
  });

  const t20 = await prisma.teacher.create({
    data: {
      email: 'fuad@futureup.az', password: teacherPassword,
      nameAz: 'Fuad Abbasov', nameRu: 'Фуад Аббасов', nameEn: 'Fuad Abbasov',
      bioAz: 'Cyber Operations Lead, 9 il təcrübə. Böhran idarəetməsi, insidentlərə cavab, təhdid kəşfiyyatı üzrə mütəxəssis.',
      bioRu: 'Cyber Operations Lead, 9 лет опыта. Специалист по кризисному управлению и реагированию на инциденты.',
      bioEn: 'Cyber Operations Lead, 9 years experience. Crisis management and incident response specialist.',
      specialization: 'Cyber Operations', linkedin: 'https://linkedin.com/in/fuad-abbasov', order: 20,
    },
  });

  console.log('✅ 20 teachers created');

  // ==========================================
  // 20 COURSES
  // ==========================================

  // --- TRADITIONAL IT TEAM ---
  const c1 = await prisma.course.create({
    data: {
      slug: 'help-desk-specialist',
      titleAz: 'Yardım masası (Help Desk) mütəxəssisi',
      titleRu: 'Специалист Help Desk',
      titleEn: 'Help Desk Specialist',
      descAz: 'IT dəstək sahəsində karyeranızı qurun. Texniki problemlərin həlli, istifadəçi dəstəyi, ITIL prosesləri və ticketing sistemləri ilə işləməyi öyrənin. Real ssenarilərdə təcrübə qazanın.',
      descRu: 'Постройте карьеру в IT-поддержке. Изучите решение технических проблем, поддержку пользователей, процессы ITIL и работу с тикет-системами.',
      descEn: 'Build your career in IT support. Learn technical troubleshooting, user support, ITIL processes and ticketing systems.',
      shortDescAz: 'IT dəstək və texniki problemlərin həlli',
      shortDescRu: 'IT-поддержка и решение технических проблем',
      shortDescEn: 'IT support and technical troubleshooting',
      duration: '3 ay', price: 600, level: 'BEGINNER', categoryId: catTraditionalIT.id, isFeatured: false, order: 1,
      syllabus: [
        { module: 'IT əsasları', topics: ['Hardware komponentləri', 'Əməliyyat sistemləri', 'Şəbəkə əsasları', 'Təhlükəsizlik əsasları'], hours: 30 },
        { module: 'Help Desk prosesləri', topics: ['ITIL Framework', 'Ticketing sistemləri', 'SLA idarəetmə', 'Eskalasiya prosesləri'], hours: 25 },
        { module: 'Troubleshooting', topics: ['Hardware diaqnostika', 'Software problemləri', 'Şəbəkə problemləri', 'Remote dəstək'], hours: 30 },
        { module: 'Praktiki layihə', topics: ['Real ssenarilər', 'Müştəri kommunikasiyası', 'Sənədləşdirmə', 'Final imtahan'], hours: 15 },
      ],
      features: ['Sertifikat', 'Praktiki laboratoriya', 'Real ssenarilər', 'Karyera dəstəyi'],
    },
  });

  const c2 = await prisma.course.create({
    data: {
      slug: 'computer-systems-networks',
      titleAz: 'Kompüter sistemlərinin və şəbəkələrinin proqram təminatı',
      titleRu: 'Программное обеспечение компьютерных систем и сетей',
      titleEn: 'Computer Systems & Network Software',
      descAz: 'Kompüter sistemləri və şəbəkə infrastrukturu üzrə dərin biliklər əldə edin. Server administrasiyası, şəbəkə konfiqurasiyası, virtuallaşdırma texnologiyaları ilə işləməyi öyrənin.',
      descRu: 'Получите глубокие знания по компьютерным системам и сетевой инфраструктуре. Изучите администрирование серверов, конфигурацию сетей.',
      descEn: 'Gain deep knowledge in computer systems and network infrastructure. Learn server administration, network configuration, virtualization.',
      shortDescAz: 'Sistem administrasiyası və şəbəkə idarəetməsi',
      shortDescRu: 'Системное администрирование и управление сетями',
      shortDescEn: 'System administration and network management',
      duration: '6 ay', price: 1100, level: 'INTERMEDIATE', categoryId: catTraditionalIT.id, isFeatured: true, order: 2,
      syllabus: [
        { module: 'Əməliyyat sistemləri', topics: ['Windows Server', 'Linux Administration', 'Active Directory', 'Group Policy'], hours: 40 },
        { module: 'Şəbəkə texnologiyaları', topics: ['TCP/IP', 'Routing & Switching', 'VPN', 'Firewall konfiqurasiya'], hours: 45 },
        { module: 'Virtuallaşdırma', topics: ['VMware', 'Hyper-V', 'Container əsasları', 'Cloud əsasları'], hours: 30 },
        { module: 'Təhlükəsizlik', topics: ['Şəbəkə təhlükəsizliyi', 'Monitoring', 'Backup & Recovery', 'Best practices'], hours: 25 },
        { module: 'Final layihə', topics: ['Korporativ şəbəkə dizaynı', 'İmplementasiya', 'Sənədləşdirmə'], hours: 20 },
      ],
      features: ['Sertifikat', 'Laboratoriya mühiti', 'Cisco simulyator', 'Karyera dəstəyi'],
    },
  });

  // --- BUSINESS-IT COLLABORATION ---
  const c3 = await prisma.course.create({
    data: {
      slug: 'quality-assurance',
      titleAz: 'Quality Assurance',
      titleRu: 'Quality Assurance',
      titleEn: 'Quality Assurance',
      descAz: 'QA mühəndisi olaraq peşəkar karyeranızı qurun. Manual və avtomatlaşdırılmış test, test strategiyaları, CI/CD inteqrasiyası, Selenium, Cypress və daha çox.',
      descRu: 'Постройте карьеру QA инженера. Ручное и автоматизированное тестирование, тестовые стратегии, CI/CD интеграция, Selenium, Cypress.',
      descEn: 'Build your career as a QA engineer. Manual and automated testing, test strategies, CI/CD integration, Selenium, Cypress.',
      shortDescAz: 'Manual və avtomatlaşdırılmış test mühəndisliyi',
      shortDescRu: 'Ручное и автоматизированное тестирование',
      shortDescEn: 'Manual and automated test engineering',
      duration: '5 ay', price: 900, level: 'BEGINNER', categoryId: catBusinessIT.id, isFeatured: true, order: 3,
      syllabus: [
        { module: 'Test əsasları', topics: ['Test nəzəriyyəsi', 'SDLC & STLC', 'Test planlaması', 'Bug reporting'], hours: 30 },
        { module: 'Manual Testing', topics: ['Test case yazma', 'Boundary analysis', 'Regression testing', 'Exploratory testing'], hours: 35 },
        { module: 'Automation Testing', topics: ['Selenium WebDriver', 'Cypress', 'Test framework', 'Page Object Model'], hours: 40 },
        { module: 'API Testing', topics: ['Postman', 'REST API testing', 'Performance testing', 'JMeter'], hours: 25 },
        { module: 'CI/CD & Final', topics: ['Jenkins inteqrasiya', 'Git', 'Agile/Scrum', 'Final layihə'], hours: 20 },
      ],
      features: ['ISTQB hazırlıq', 'Sertifikat', 'Real layihələr', 'Karyera dəstəyi'],
    },
  });

  const c4 = await prisma.course.create({
    data: {
      slug: 'product-owner',
      titleAz: 'Product Owner',
      titleRu: 'Product Owner',
      titleEn: 'Product Owner',
      descAz: 'Məhsul idarəetmə sahəsində karyeranızı qurun. Agile metodologiya, Scrum framework, backlog idarəetmə, istifadəçi hekayələri, roadmap planlaması.',
      descRu: 'Постройте карьеру в управлении продуктом. Agile методология, Scrum, управление бэклогом, пользовательские истории.',
      descEn: 'Build your career in product management. Agile methodology, Scrum framework, backlog management, user stories.',
      shortDescAz: 'Məhsul idarəetmə və Agile metodologiya',
      shortDescRu: 'Управление продуктом и Agile методология',
      shortDescEn: 'Product management and Agile methodology',
      duration: '4 ay', price: 800, level: 'BEGINNER', categoryId: catBusinessIT.id, isFeatured: false, order: 4,
      syllabus: [
        { module: 'Agile & Scrum', topics: ['Agile Manifesto', 'Scrum Framework', 'Scrum Events', 'Scrum Artifacts'], hours: 25 },
        { module: 'Product Strategy', topics: ['Vision & Strategy', 'Market Research', 'Competitor Analysis', 'Value Proposition'], hours: 30 },
        { module: 'Backlog Management', topics: ['User Stories', 'Acceptance Criteria', 'Prioritization', 'Sprint Planning'], hours: 25 },
        { module: 'Metrics & Analytics', topics: ['KPI-lər', 'A/B Testing', 'User Analytics', 'Product-Market Fit'], hours: 20 },
        { module: 'Praktiki layihə', topics: ['Real məhsul case study', 'Roadmap yaratma', 'Stakeholder prezentasiya'], hours: 20 },
      ],
      features: ['Scrum sertifikat hazırlıq', 'Sertifikat', 'Case studies', 'Mentor dəstəyi'],
    },
  });

  // --- MARKETING & BD ---
  const c5 = await prisma.course.create({
    data: {
      slug: 'digital-marketing',
      titleAz: 'Rəqəmsal marketinq',
      titleRu: 'Цифровой маркетинг',
      titleEn: 'Digital Marketing',
      descAz: 'SEO, SMM, Google Ads, Meta Ads, Content Marketing, Email Marketing — rəqəmsal marketinq strategiyaları ilə biznesləri böyüdün.',
      descRu: 'SEO, SMM, Google Ads, Meta Ads, Content Marketing — развивайте бизнес с цифровым маркетингом.',
      descEn: 'SEO, SMM, Google Ads, Meta Ads, Content Marketing — grow businesses with digital marketing strategies.',
      shortDescAz: 'Rəqəmsal marketinq strategiyaları və alətləri',
      shortDescRu: 'Стратегии и инструменты цифрового маркетинга',
      shortDescEn: 'Digital marketing strategies and tools',
      duration: '4 ay', price: 700, level: 'BEGINNER', categoryId: catMarketing.id, isFeatured: true, order: 5,
      syllabus: [
        { module: 'Marketinq əsasları', topics: ['Digital Marketing əsasları', 'Target audience', 'Buyer Persona', 'Customer Journey'], hours: 20 },
        { module: 'SEO & SEM', topics: ['On-page SEO', 'Off-page SEO', 'Google Ads', 'Keyword Research'], hours: 30 },
        { module: 'SMM', topics: ['Meta Ads', 'Instagram Marketing', 'LinkedIn Marketing', 'Content Calendar'], hours: 30 },
        { module: 'Content & Email', topics: ['Content Strategy', 'Copywriting', 'Email Marketing', 'Marketing Automation'], hours: 25 },
        { module: 'Analytics & Final', topics: ['Google Analytics', 'ROI hesablama', 'A/B Testing', 'Final kampaniya'], hours: 15 },
      ],
      features: ['Google sertifikat hazırlıq', 'Sertifikat', 'Real kampaniyalar', 'Portfolio'],
    },
  });

  const c6 = await prisma.course.create({
    data: {
      slug: 'ui-ux-design',
      titleAz: 'UI/UX dizayn',
      titleRu: 'UI/UX дизайн',
      titleEn: 'UI/UX Design',
      descAz: 'Figma, Adobe XD, istifadəçi araşdırması, wireframing, prototipləmə — rəqəmsal məhsullar üçün gözəl və funksional interfeyslər yaradın.',
      descRu: 'Figma, Adobe XD, исследование пользователей, wireframing, прототипирование — создавайте интерфейсы для цифровых продуктов.',
      descEn: 'Figma, Adobe XD, user research, wireframing, prototyping — create beautiful interfaces for digital products.',
      shortDescAz: 'İstifadəçi interfeysi və təcrübə dizaynı',
      shortDescRu: 'Дизайн интерфейсов и пользовательского опыта',
      shortDescEn: 'User interface and experience design',
      duration: '4 ay', price: 900, level: 'BEGINNER', categoryId: catMarketing.id, isFeatured: true, order: 6,
      syllabus: [
        { module: 'UX əsasları', topics: ['Design Thinking', 'User Research', 'Persona yaratma', 'User Journey Map'], hours: 25 },
        { module: 'UI dizayn', topics: ['Figma əsasları', 'Color Theory', 'Typography', 'Layout & Grid'], hours: 35 },
        { module: 'Wireframe & Prototype', topics: ['Low-fi wireframes', 'Hi-fi mockups', 'Interactive prototypes', 'Design System'], hours: 30 },
        { module: 'Usability & Handoff', topics: ['Usability Testing', 'A/B Testing', 'Developer Handoff', 'Design QA'], hours: 20 },
        { module: 'Portfolio layihə', topics: ['Real app dizayn', 'Case study yazma', 'Portfolio hazırlama'], hours: 20 },
      ],
      features: ['Sertifikat', 'Portfolio layihə', 'Figma lisenziya', 'Karyera dəstəyi'],
    },
  });

  // --- DATA SCIENCE ---
  const c7 = await prisma.course.create({
    data: {
      slug: 'ai-machine-learning',
      titleAz: 'Süni İntellekt və ML',
      titleRu: 'Искусственный Интеллект и ML',
      titleEn: 'Artificial Intelligence & ML',
      descAz: 'Python, TensorFlow, PyTorch, Scikit-learn — süni intellekt və maşın öyrənmə modellərini qurun, öyrədin və tətbiq edin.',
      descRu: 'Python, TensorFlow, PyTorch, Scikit-learn — создавайте, обучайте и применяйте модели ИИ и машинного обучения.',
      descEn: 'Python, TensorFlow, PyTorch, Scikit-learn — build, train and deploy AI and machine learning models.',
      shortDescAz: 'Süni intellekt, dərin öyrənmə və ML modelləri',
      shortDescRu: 'ИИ, глубокое обучение и модели ML',
      shortDescEn: 'AI, deep learning and ML models',
      duration: '6 ay', price: 1500, level: 'ADVANCED', categoryId: catDataScience.id, isFeatured: true, order: 7,
      syllabus: [
        { module: 'Python & Riyaziyyat', topics: ['Python for Data Science', 'Linear Algebra', 'Statistics', 'Probability'], hours: 35 },
        { module: 'Machine Learning', topics: ['Supervised Learning', 'Unsupervised Learning', 'Scikit-learn', 'Model Evaluation'], hours: 40 },
        { module: 'Deep Learning', topics: ['Neural Networks', 'TensorFlow/Keras', 'CNN', 'RNN/LSTM'], hours: 40 },
        { module: 'NLP & Computer Vision', topics: ['Text Processing', 'Transformers', 'Image Classification', 'Object Detection'], hours: 30 },
        { module: 'MLOps & Final', topics: ['Model Deployment', 'MLflow', 'Docker', 'Final layihə'], hours: 25 },
      ],
      features: ['Sertifikat', 'GPU laboratoriya', 'Kaggle müsabiqələri', 'Tədqiqat layihəsi'],
    },
  });

  const c8 = await prisma.course.create({
    data: {
      slug: 'data-engineering',
      titleAz: 'Data Engineering',
      titleRu: 'Data Engineering',
      titleEn: 'Data Engineering',
      descAz: 'Big Data infrastrukturu qurun. Apache Spark, Kafka, Airflow, ETL prosesləri, Data Warehouse və Data Lake arxitekturası.',
      descRu: 'Стройте инфраструктуру Big Data. Apache Spark, Kafka, Airflow, ETL процессы, Data Warehouse и Data Lake.',
      descEn: 'Build Big Data infrastructure. Apache Spark, Kafka, Airflow, ETL processes, Data Warehouse and Data Lake architecture.',
      shortDescAz: 'Big Data infrastrukturu və ETL prosesləri',
      shortDescRu: 'Инфраструктура Big Data и ETL процессы',
      shortDescEn: 'Big Data infrastructure and ETL processes',
      duration: '6 ay', price: 1400, level: 'INTERMEDIATE', categoryId: catDataScience.id, isFeatured: false, order: 8,
      syllabus: [
        { module: 'SQL & Python', topics: ['Advanced SQL', 'Python ETL', 'Data Modeling', 'Database Design'], hours: 35 },
        { module: 'ETL & Pipelines', topics: ['Apache Airflow', 'ETL prosesləri', 'Data Quality', 'Data Validation'], hours: 35 },
        { module: 'Big Data', topics: ['Apache Spark', 'Kafka', 'Hadoop əsasları', 'Distributed Computing'], hours: 40 },
        { module: 'Cloud & Storage', topics: ['AWS/GCP Data Services', 'Data Warehouse', 'Data Lake', 'Delta Lake'], hours: 30 },
        { module: 'Final layihə', topics: ['End-to-end pipeline', 'Real-time data', 'Monitoring', 'Documentation'], hours: 20 },
      ],
      features: ['Sertifikat', 'Cloud laboratoriya', 'Real data setləri', 'Karyera dəstəyi'],
    },
  });

  const c9 = await prisma.course.create({
    data: {
      slug: 'data-analytics',
      titleAz: 'Data Analitik',
      titleRu: 'Data Аналитик',
      titleEn: 'Data Analytics',
      descAz: 'Python, SQL, Power BI, Tableau, Excel — məlumatları təhlil edin, vizuallaşdırın və biznes qərarlarına təsir edin.',
      descRu: 'Python, SQL, Power BI, Tableau, Excel — анализируйте данные, визуализируйте и влияйте на бизнес-решения.',
      descEn: 'Python, SQL, Power BI, Tableau, Excel — analyze data, visualize and influence business decisions.',
      shortDescAz: 'Məlumat təhlili, vizuallaşdırma və biznes analitika',
      shortDescRu: 'Анализ данных, визуализация и бизнес-аналитика',
      shortDescEn: 'Data analysis, visualization and business analytics',
      duration: '5 ay', price: 1000, level: 'BEGINNER', categoryId: catDataScience.id, isFeatured: true, order: 9,
      syllabus: [
        { module: 'Excel & SQL', topics: ['Advanced Excel', 'SQL əsasları', 'Data Manipulation', 'Joins & Subqueries'], hours: 30 },
        { module: 'Python for Analytics', topics: ['Pandas', 'NumPy', 'Data Cleaning', 'EDA'], hours: 35 },
        { module: 'Vizuallaşdırma', topics: ['Power BI', 'Tableau', 'Matplotlib/Seaborn', 'Dashboard yaratma'], hours: 35 },
        { module: 'Statistika', topics: ['Descriptive Statistics', 'Hypothesis Testing', 'Regression', 'Forecasting'], hours: 25 },
        { module: 'Business Analytics', topics: ['KPI analiz', 'Cohort Analysis', 'A/B Testing', 'Final layihə'], hours: 25 },
      ],
      features: ['Sertifikat', 'Power BI lisenziya', 'Real data setləri', 'Karyera dəstəyi'],
    },
  });

  // --- SW ENGINEERING ---
  const c10 = await prisma.course.create({
    data: {
      slug: 'mobile-development',
      titleAz: 'Mobile Developer',
      titleRu: 'Мобильный Разработчик',
      titleEn: 'Mobile Developer',
      descAz: 'Flutter, React Native, Swift, Kotlin — iOS və Android üçün mobil tətbiqlər yaradın. Cross-platform və native development.',
      descRu: 'Flutter, React Native, Swift, Kotlin — создавайте мобильные приложения для iOS и Android.',
      descEn: 'Flutter, React Native, Swift, Kotlin — build mobile apps for iOS and Android.',
      shortDescAz: 'iOS və Android mobil tətbiq inkişafı',
      shortDescRu: 'Разработка мобильных приложений для iOS и Android',
      shortDescEn: 'iOS and Android mobile app development',
      duration: '6 ay', price: 1300, level: 'INTERMEDIATE', categoryId: catSWEngineering.id, isFeatured: true, order: 10,
      syllabus: [
        { module: 'Dart & Flutter əsasları', topics: ['Dart language', 'Flutter widgets', 'State management', 'Navigation'], hours: 40 },
        { module: 'UI & Animations', topics: ['Custom widgets', 'Animations', 'Responsive design', 'Platform-specific UI'], hours: 30 },
        { module: 'Backend inteqrasiya', topics: ['REST API', 'Firebase', 'Local storage', 'Push notifications'], hours: 35 },
        { module: 'Advanced', topics: ['State management (Bloc/Riverpod)', 'Testing', 'CI/CD', 'App Store publishing'], hours: 30 },
        { module: 'Final layihə', topics: ['Full app development', 'Code review', 'Performance optimization', 'Presentation'], hours: 25 },
      ],
      features: ['Sertifikat', 'App Store publish', 'Real layihə', 'Karyera dəstəyi'],
    },
  });

  const c11 = await prisma.course.create({
    data: {
      slug: 'backend-java',
      titleAz: 'Backend Developer (Java ilə)',
      titleRu: 'Backend Разработчик (Java)',
      titleEn: 'Backend Developer (Java)',
      descAz: 'Java, Spring Boot, Microservices, PostgreSQL, Docker — enterprise backend sistemlər qurun.',
      descRu: 'Java, Spring Boot, Microservices, PostgreSQL, Docker — создавайте корпоративные backend системы.',
      descEn: 'Java, Spring Boot, Microservices, PostgreSQL, Docker — build enterprise backend systems.',
      shortDescAz: 'Java ilə enterprise backend development',
      shortDescRu: 'Enterprise backend разработка на Java',
      shortDescEn: 'Enterprise backend development with Java',
      duration: '6 ay', price: 1200, level: 'INTERMEDIATE', categoryId: catSWEngineering.id, isFeatured: true, order: 11,
      syllabus: [
        { module: 'Java Core', topics: ['OOP', 'Collections', 'Streams', 'Multithreading'], hours: 45 },
        { module: 'Spring Framework', topics: ['Spring Boot', 'Spring MVC', 'Spring Security', 'Spring Data JPA'], hours: 45 },
        { module: 'Database & API', topics: ['PostgreSQL', 'Hibernate', 'REST API', 'GraphQL'], hours: 30 },
        { module: 'Microservices', topics: ['Microservice architecture', 'Docker', 'Kubernetes əsasları', 'Message queues'], hours: 30 },
        { module: 'Final layihə', topics: ['Enterprise app', 'CI/CD', 'Testing', 'Code review'], hours: 20 },
      ],
      features: ['Sertifikat', 'Enterprise layihə', 'Mentor dəstəyi', 'Karyera dəstəyi'],
    },
  });

  const c12 = await prisma.course.create({
    data: {
      slug: 'backend-csharp',
      titleAz: 'Backend Developer (C# ilə)',
      titleRu: 'Backend Разработчик (C#)',
      titleEn: 'Backend Developer (C#)',
      descAz: 'C#, ASP.NET Core, Entity Framework, Azure — Microsoft ekosistemində backend development.',
      descRu: 'C#, ASP.NET Core, Entity Framework, Azure — backend разработка в экосистеме Microsoft.',
      descEn: 'C#, ASP.NET Core, Entity Framework, Azure — backend development in the Microsoft ecosystem.',
      shortDescAz: 'C# və .NET ilə backend development',
      shortDescRu: 'Backend разработка на C# и .NET',
      shortDescEn: 'Backend development with C# and .NET',
      duration: '6 ay', price: 1200, level: 'INTERMEDIATE', categoryId: catSWEngineering.id, isFeatured: false, order: 12,
      syllabus: [
        { module: 'C# əsasları', topics: ['OOP', 'LINQ', 'Async/Await', 'Generics'], hours: 40 },
        { module: 'ASP.NET Core', topics: ['MVC Pattern', 'Web API', 'Middleware', 'Authentication'], hours: 45 },
        { module: 'Database', topics: ['Entity Framework Core', 'SQL Server', 'Migrations', 'Repository Pattern'], hours: 30 },
        { module: 'Azure & Advanced', topics: ['Azure Services', 'Microservices', 'SignalR', 'Background Services'], hours: 30 },
        { module: 'Final layihə', topics: ['Enterprise app', 'Unit Testing', 'CI/CD', 'Deployment'], hours: 25 },
      ],
      features: ['Sertifikat', 'Azure credits', 'Enterprise layihə', 'Karyera dəstəyi'],
    },
  });

  const c13 = await prisma.course.create({
    data: {
      slug: 'frontend-development',
      titleAz: 'Frontend Developer',
      titleRu: 'Frontend Разработчик',
      titleEn: 'Frontend Developer',
      descAz: 'HTML, CSS, JavaScript, React, Next.js, TypeScript — müasir veb texnologiyaları ilə peşəkar frontend developer olun.',
      descRu: 'HTML, CSS, JavaScript, React, Next.js, TypeScript — станьте профессиональным frontend разработчиком.',
      descEn: 'HTML, CSS, JavaScript, React, Next.js, TypeScript — become a professional frontend developer.',
      shortDescAz: 'Müasir veb texnologiyaları ilə frontend inkişafı',
      shortDescRu: 'Frontend разработка с современными веб-технологиями',
      shortDescEn: 'Frontend development with modern web technologies',
      duration: '6 ay', price: 1200, level: 'BEGINNER', categoryId: catSWEngineering.id, isFeatured: true, order: 13,
      syllabus: [
        { module: 'HTML & CSS', topics: ['Semantic HTML', 'Flexbox & Grid', 'Responsive Design', 'Tailwind CSS'], hours: 40 },
        { module: 'JavaScript', topics: ['ES6+', 'DOM Manipulation', 'Async/Await', 'APIs'], hours: 50 },
        { module: 'TypeScript', topics: ['Types & Interfaces', 'Generics', 'Type Guards', 'Best Practices'], hours: 20 },
        { module: 'React', topics: ['Components & Hooks', 'State Management', 'React Router', 'Performance'], hours: 40 },
        { module: 'Next.js & Final', topics: ['SSR/SSG', 'App Router', 'API Routes', 'Final layihə'], hours: 30 },
      ],
      features: ['Sertifikat', 'Portfolio layihə', 'Mentor dəstəyi', 'Karyera dəstəyi'],
    },
  });

  // --- DEV TEAM ---
  const c14 = await prisma.course.create({
    data: {
      slug: 'devops-engineering',
      titleAz: 'DevOps Mühəndisi',
      titleRu: 'DevOps Инженер',
      titleEn: 'DevOps Engineer',
      descAz: 'Docker, Kubernetes, Terraform, Jenkins, CI/CD — DevOps mühəndisi olaraq infrastructure-as-code və avtomatlaşdırma öyrənin.',
      descRu: 'Docker, Kubernetes, Terraform, Jenkins, CI/CD — изучите infrastructure-as-code и автоматизацию как DevOps инженер.',
      descEn: 'Docker, Kubernetes, Terraform, Jenkins, CI/CD — learn infrastructure-as-code and automation as a DevOps engineer.',
      shortDescAz: 'CI/CD, konteynerləşdirmə və bulud infrastrukturu',
      shortDescRu: 'CI/CD, контейнеризация и облачная инфраструктура',
      shortDescEn: 'CI/CD, containerization and cloud infrastructure',
      duration: '6 ay', price: 1400, level: 'INTERMEDIATE', categoryId: catDevTeam.id, isFeatured: true, order: 14,
      syllabus: [
        { module: 'Linux & Scripting', topics: ['Linux Administration', 'Bash Scripting', 'Python Automation', 'Git Advanced'], hours: 35 },
        { module: 'Containers', topics: ['Docker', 'Docker Compose', 'Kubernetes', 'Helm Charts'], hours: 45 },
        { module: 'CI/CD', topics: ['Jenkins', 'GitHub Actions', 'GitLab CI', 'ArgoCD'], hours: 35 },
        { module: 'IaC & Cloud', topics: ['Terraform', 'Ansible', 'AWS/Azure Services', 'Monitoring (Prometheus/Grafana)'], hours: 35 },
        { module: 'Final layihə', topics: ['Full pipeline setup', 'Multi-env deployment', 'Monitoring', 'Documentation'], hours: 20 },
      ],
      features: ['Sertifikat', 'Cloud laboratoriya', 'Real infrastructure', 'Karyera dəstəyi'],
    },
  });

  const c15 = await prisma.course.create({
    data: {
      slug: 'devsecops',
      titleAz: 'DevSecOps',
      titleRu: 'DevSecOps',
      titleEn: 'DevSecOps',
      descAz: 'Təhlükəsizliyi CI/CD pipeline-a inteqrasiya edin. SAST, DAST, Container Security, Secrets Management və compliance avtomatlaşdırma.',
      descRu: 'Интегрируйте безопасность в CI/CD pipeline. SAST, DAST, Container Security, Secrets Management.',
      descEn: 'Integrate security into CI/CD pipelines. SAST, DAST, Container Security, Secrets Management and compliance automation.',
      shortDescAz: 'Təhlükəsizlik avtomatlaşdırması və DevSecOps praktikalar',
      shortDescRu: 'Автоматизация безопасности и практики DevSecOps',
      shortDescEn: 'Security automation and DevSecOps practices',
      duration: '5 ay', price: 1300, level: 'ADVANCED', categoryId: catDevTeam.id, isFeatured: false, order: 15,
      syllabus: [
        { module: 'Security Fundamentals', topics: ['OWASP Top 10', 'Secure Coding', 'Threat Modeling', 'Security Architecture'], hours: 30 },
        { module: 'SAST & DAST', topics: ['SonarQube', 'Snyk', 'OWASP ZAP', 'Burp Suite əsasları'], hours: 35 },
        { module: 'Container Security', topics: ['Image Scanning', 'Runtime Security', 'Kubernetes Security', 'Network Policies'], hours: 30 },
        { module: 'Pipeline Security', topics: ['Secrets Management (Vault)', 'Policy as Code', 'Compliance Automation', 'SBOM'], hours: 30 },
        { module: 'Final layihə', topics: ['Secure pipeline quruluşu', 'Security monitoring', 'Incident response', 'Documentation'], hours: 25 },
      ],
      features: ['Sertifikat', 'Security tools laboratoriya', 'CTF challenges', 'Karyera dəstəyi'],
    },
  });

  // --- CYBER SECURITY ---
  const c16 = await prisma.course.create({
    data: {
      slug: 'red-team-offensive',
      titleAz: 'Red Team - Offensive Security',
      titleRu: 'Red Team - Наступательная безопасность',
      titleEn: 'Red Team - Offensive Security',
      descAz: 'Penetrasiya testləri, exploit development, social engineering — hücum simulyasiyaları aparın və təhlükəsizlik zəifliklərini aşkarlayın.',
      descRu: 'Тестирование на проникновение, разработка эксплойтов, социальная инженерия — проводите симуляции атак.',
      descEn: 'Penetration testing, exploit development, social engineering — conduct attack simulations and discover vulnerabilities.',
      shortDescAz: 'Penetrasiya testləri və hücum simulyasiyaları',
      shortDescRu: 'Тесты на проникновение и симуляции атак',
      shortDescEn: 'Penetration testing and attack simulations',
      duration: '6 ay', price: 1500, level: 'ADVANCED', categoryId: catCyberSecurity.id, isFeatured: true, order: 16,
      syllabus: [
        { module: 'Recon & OSINT', topics: ['Passive Recon', 'Active Scanning', 'OSINT Tools', 'Footprinting'], hours: 30 },
        { module: 'Exploitation', topics: ['Metasploit', 'Buffer Overflow', 'Web App Hacking', 'SQL Injection'], hours: 45 },
        { module: 'Post-Exploitation', topics: ['Privilege Escalation', 'Lateral Movement', 'Persistence', 'Data Exfiltration'], hours: 35 },
        { module: 'Advanced Attacks', topics: ['Active Directory Attacks', 'Wireless Hacking', 'Social Engineering', 'Physical Security'], hours: 30 },
        { module: 'Reporting & Final', topics: ['Report Writing', 'CTF Competition', 'OSCP hazırlıq', 'Final layihə'], hours: 20 },
      ],
      features: ['OSCP hazırlıq', 'Sertifikat', 'CTF laboratoriya', 'Karyera dəstəyi'],
    },
  });

  const c17 = await prisma.course.create({
    data: {
      slug: 'blue-team-defensive',
      titleAz: 'Blue Team - Defensive Security',
      titleRu: 'Blue Team - Оборонительная безопасность',
      titleEn: 'Blue Team - Defensive Security',
      descAz: 'SOC əməliyyatları, SIEM, Threat Hunting, Incident Response — müdafiə əməliyyatları üzrə mütəxəssis olun.',
      descRu: 'SOC операции, SIEM, Threat Hunting, Incident Response — станьте специалистом по оборонительным операциям.',
      descEn: 'SOC operations, SIEM, Threat Hunting, Incident Response — become a defensive security specialist.',
      shortDescAz: 'SOC əməliyyatları və təhdid aşkarlama',
      shortDescRu: 'SOC операции и обнаружение угроз',
      shortDescEn: 'SOC operations and threat detection',
      duration: '6 ay', price: 1400, level: 'INTERMEDIATE', categoryId: catCyberSecurity.id, isFeatured: true, order: 17,
      syllabus: [
        { module: 'SOC əsasları', topics: ['SOC Operations', 'Log Management', 'Security Monitoring', 'Alert Triage'], hours: 35 },
        { module: 'SIEM', topics: ['Splunk', 'ELK Stack', 'Correlation Rules', 'Dashboard yaratma'], hours: 40 },
        { module: 'Threat Hunting', topics: ['Threat Intelligence', 'IOC Analysis', 'MITRE ATT&CK', 'Hunting Techniques'], hours: 35 },
        { module: 'Incident Response', topics: ['IR Playbooks', 'Forensics əsasları', 'Malware Analysis əsasları', 'Recovery'], hours: 30 },
        { module: 'Final layihə', topics: ['SOC simulation', 'Real-world scenarios', 'Report writing', 'Presentation'], hours: 20 },
      ],
      features: ['Sertifikat', 'SOC simulyator', 'Threat Intel feeds', 'Karyera dəstəyi'],
    },
  });

  const c18 = await prisma.course.create({
    data: {
      slug: 'purple-team-collaborative',
      titleAz: 'Purple Team - Collaborative Security',
      titleRu: 'Purple Team - Совместная безопасность',
      titleEn: 'Purple Team - Collaborative Security',
      descAz: 'Red və Blue Team əməliyyatlarını birləşdirin. Adversary emulation, detection engineering, security testing coordination.',
      descRu: 'Объедините операции Red и Blue Team. Adversary emulation, detection engineering, координация тестирования.',
      descEn: 'Combine Red and Blue Team operations. Adversary emulation, detection engineering, security testing coordination.',
      shortDescAz: 'Red & Blue Team koordinasiyası və əməkdaşlıq',
      shortDescRu: 'Координация и сотрудничество Red & Blue Team',
      shortDescEn: 'Red & Blue Team coordination and collaboration',
      duration: '5 ay', price: 1500, level: 'ADVANCED', categoryId: catCyberSecurity.id, isFeatured: false, order: 18,
      syllabus: [
        { module: 'Purple Team əsasları', topics: ['Purple Team Methodology', 'MITRE ATT&CK Framework', 'Adversary Emulation', 'Collaboration Models'], hours: 30 },
        { module: 'Attack Simulation', topics: ['Atomic Red Team', 'Caldera', 'Custom Playbooks', 'Attack Chains'], hours: 35 },
        { module: 'Detection Engineering', topics: ['Detection Rules', 'SIGMA Rules', 'YARA Rules', 'Detection Coverage'], hours: 35 },
        { module: 'Metrics & Reporting', topics: ['Security Metrics', 'Gap Analysis', 'Improvement Plans', 'Executive Reporting'], hours: 25 },
        { module: 'Final layihə', topics: ['Full Purple Team exercise', 'Detection improvement', 'Documentation', 'Presentation'], hours: 25 },
      ],
      features: ['Sertifikat', 'Lab mühiti', 'Real attack scenarios', 'Karyera dəstəyi'],
    },
  });

  const c19 = await prisma.course.create({
    data: {
      slug: 'white-team-grc',
      titleAz: 'White Team - Governance, Risk & Compliance',
      titleRu: 'White Team - Управление, Риски и Соответствие',
      titleEn: 'White Team - Governance, Risk & Compliance',
      descAz: 'ISO 27001, NIST, GDPR, risk idarəetmə, audit, compliance — informasiya təhlükəsizliyi idarəetmə sistemləri qurun.',
      descRu: 'ISO 27001, NIST, GDPR, управление рисками, аудит — создавайте системы управления ИБ.',
      descEn: 'ISO 27001, NIST, GDPR, risk management, audit — build information security management systems.',
      shortDescAz: 'İnformasiya təhlükəsizliyi idarəetmə və uyğunluq',
      shortDescRu: 'Управление информационной безопасностью и соответствие',
      shortDescEn: 'Information security management and compliance',
      duration: '5 ay', price: 1200, level: 'INTERMEDIATE', categoryId: catCyberSecurity.id, isFeatured: false, order: 19,
      syllabus: [
        { module: 'GRC əsasları', topics: ['Governance Frameworks', 'Risk Management', 'Compliance əsasları', 'Security Policies'], hours: 30 },
        { module: 'Standards & Frameworks', topics: ['ISO 27001/27002', 'NIST CSF', 'CIS Controls', 'COBIT'], hours: 35 },
        { module: 'Risk Assessment', topics: ['Risk Identification', 'Risk Analysis', 'Risk Treatment', 'Risk Register'], hours: 30 },
        { module: 'Audit & Compliance', topics: ['Internal Audit', 'GDPR/KVKK', 'Vendor Management', 'Business Continuity'], hours: 30 },
        { module: 'Final layihə', topics: ['ISMS implementation plan', 'Risk assessment report', 'Policy development', 'Presentation'], hours: 25 },
      ],
      features: ['ISO 27001 hazırlıq', 'Sertifikat', 'Template kitabxanası', 'Karyera dəstəyi'],
    },
  });

  const c20 = await prisma.course.create({
    data: {
      slug: 'cyber-operations-team',
      titleAz: 'Cyber Operations Team',
      titleRu: 'Команда Кибер-операций',
      titleEn: 'Cyber Operations Team',
      descAz: 'Böhran idarəetmə, insidentlərə cavab, təhdid kəşfiyyatı, kiberhücum simulyasiyaları — kiber əməliyyat komandasının üzvü olun.',
      descRu: 'Кризисное управление, реагирование на инциденты, разведка угроз — станьте членом команды кибер-операций.',
      descEn: 'Crisis management, incident response, threat intelligence — become a cyber operations team member.',
      shortDescAz: 'Kiber əməliyyatlar, böhran idarəetmə və insidentlərə cavab',
      shortDescRu: 'Кибер-операции, кризисное управление и реагирование',
      shortDescEn: 'Cyber operations, crisis management and incident response',
      duration: '6 ay', price: 1600, level: 'ADVANCED', categoryId: catCyberSecurity.id, isFeatured: true, order: 20,
      syllabus: [
        { module: 'Threat Intelligence', topics: ['OSINT', 'Threat Feeds', 'Dark Web Monitoring', 'Attribution'], hours: 30 },
        { module: 'Incident Response', topics: ['IR Framework', 'Digital Forensics', 'Memory Analysis', 'Network Forensics'], hours: 40 },
        { module: 'Crisis Management', topics: ['Crisis Communication', 'War Room Operations', 'Executive Briefing', 'Media Handling'], hours: 25 },
        { module: 'Cyber Warfare', topics: ['APT Groups', 'Nation-State Attacks', 'Cyber Exercises', 'Tabletop Exercises'], hours: 30 },
        { module: 'Final layihə', topics: ['Full-scale cyber exercise', 'Incident simulation', 'After-action report', 'Presentation'], hours: 25 },
      ],
      features: ['Sertifikat', 'Cyber range access', 'Real scenarios', 'Karyera dəstəyi'],
    },
  });

  const allCourses = [c1, c2, c3, c4, c5, c6, c7, c8, c9, c10, c11, c12, c13, c14, c15, c16, c17, c18, c19, c20];
  console.log('✅ 20 courses created');

  // ==========================================
  // TEACHER-COURSE ASSIGNMENTS
  // ==========================================
  await prisma.teacherCourse.createMany({
    data: [
      { teacherId: t1.id, courseId: c1.id },   // Kamran → Help Desk
      { teacherId: t2.id, courseId: c2.id },   // Tural → Computer Systems
      { teacherId: t3.id, courseId: c3.id },   // Aynur → QA
      { teacherId: t4.id, courseId: c4.id },   // Farid → Product Owner
      { teacherId: t5.id, courseId: c5.id },   // Gunel → Digital Marketing
      { teacherId: t6.id, courseId: c6.id },   // Leyla → UI/UX
      { teacherId: t7.id, courseId: c7.id },   // Rashad → AI/ML
      { teacherId: t8.id, courseId: c8.id },   // Orkhan → Data Engineering
      { teacherId: t9.id, courseId: c9.id },   // Nigar → Data Analytics
      { teacherId: t10.id, courseId: c10.id }, // Samir → Mobile Dev
      { teacherId: t11.id, courseId: c11.id }, // Vugar → Backend Java
      { teacherId: t12.id, courseId: c12.id }, // Elvin → Backend C#
      { teacherId: t13.id, courseId: c13.id }, // Eldar → Frontend
      { teacherId: t14.id, courseId: c14.id }, // Ceyhun → DevOps
      { teacherId: t15.id, courseId: c15.id }, // Murad → DevSecOps
      { teacherId: t16.id, courseId: c16.id }, // Togrul → Red Team
      { teacherId: t17.id, courseId: c17.id }, // Sevinj → Blue Team
      { teacherId: t18.id, courseId: c18.id }, // Ilkin → Purple Team
      { teacherId: t19.id, courseId: c19.id }, // Narmin → GRC
      { teacherId: t20.id, courseId: c20.id }, // Fuad → Cyber Operations
    ],
    skipDuplicates: true,
  });
  console.log('✅ Teacher-Course assignments created');

  // ==========================================
  // STUDENTS (40 students)
  // ==========================================
  const studentNames = [
    { name: 'Fərid Əhmədov', email: 'farid.ahmadov@gmail.com', phone: '+994501112233' },
    { name: 'Günel Hüseynova', email: 'gunel.huseynova@gmail.com', phone: '+994502223344' },
    { name: 'Rəşad Quliyev', email: 'rashad.guliyev@gmail.com', phone: '+994503334455' },
    { name: 'Aysel Əlizadə', email: 'aysel.alizade@gmail.com', phone: '+994504445566' },
    { name: 'Murad Həsənov', email: 'murad.hasanov@gmail.com', phone: '+994505556677' },
    { name: 'Ləman Abbasova', email: 'laman.abbasova@gmail.com', phone: '+994506667788' },
    { name: 'Elçin Babayev', email: 'elchin.babayev@gmail.com', phone: '+994507778899' },
    { name: 'Nərmin Cəfərova', email: 'narmin.jafarova@gmail.com', phone: '+994508889900' },
    { name: 'Tural Qəhrəmanov', email: 'tural.qahramanov@gmail.com', phone: '+994509990011' },
    { name: 'Sevda Məmmədli', email: 'sevda.mammadli@gmail.com', phone: '+994500001122' },
    { name: 'Vüsal İsmayılov', email: 'vusal.ismayilov@gmail.com', phone: '+994511112233' },
    { name: 'Həcər Rzayeva', email: 'hajar.rzayeva@gmail.com', phone: '+994512223344' },
    { name: 'Cavid Nəsibov', email: 'javid.nasibov@gmail.com', phone: '+994513334455' },
    { name: 'Aytac Sultanova', email: 'aytaj.sultanova@gmail.com', phone: '+994514445566' },
    { name: 'Ünal Vəliyev', email: 'unal.valiyev@gmail.com', phone: '+994515556677' },
    { name: 'Pərvin Əsgərova', email: 'parvin.asgarova@gmail.com', phone: '+994516667788' },
    { name: 'Ruslan Kazımov', email: 'ruslan.kazimov@gmail.com', phone: '+994517778899' },
    { name: 'Xəyal Mehdiyev', email: 'khayal.mehdiyev@gmail.com', phone: '+994518889900' },
    { name: 'Zəhra Mikayılova', email: 'zahra.mikayilova@gmail.com', phone: '+994519990011' },
    { name: 'Kamil Əliyev', email: 'kamil.aliyev@gmail.com', phone: '+994520001122' },
    { name: 'İlahə Hüseynli', email: 'ilahe.huseynli@gmail.com', phone: '+994521112233' },
    { name: 'Emin Rəhimov', email: 'emin.rahimov@gmail.com', phone: '+994522223344' },
    { name: 'Lalə Novruzova', email: 'lale.novruzova@gmail.com', phone: '+994523334455' },
    { name: 'Sahib Mustafayev', email: 'sahib.mustafayev@gmail.com', phone: '+994524445566' },
    { name: 'Gülər Həsənli', email: 'guler.hasanli@gmail.com', phone: '+994525556677' },
    { name: 'Nihad Qurbanov', email: 'nihad.qurbanov@gmail.com', phone: '+994526667788' },
    { name: 'Samirə Vəlizadə', email: 'samira.valizade@gmail.com', phone: '+994527778899' },
    { name: 'Toğrul Abbasov', email: 'togrul.abbasov@gmail.com', phone: '+994528889900' },
    { name: 'Aynurə Məmmədova', email: 'aynure.mammadova@gmail.com', phone: '+994529990011' },
    { name: 'Bəxtiyar Nəzərov', email: 'bakhtiyar.nazarov@gmail.com', phone: '+994530001122' },
    { name: 'Dilşad Əhmədli', email: 'dilshad.ahmadli@gmail.com', phone: '+994531112233' },
    { name: 'Fidan Qasımova', email: 'fidan.qasimova@gmail.com', phone: '+994532223344' },
    { name: 'Oruc Məmmədov', email: 'oruj.mammadov@gmail.com', phone: '+994533334455' },
    { name: 'Şəbnəm Aslanova', email: 'shabnam.aslanova@gmail.com', phone: '+994534445566' },
    { name: 'Röyal Sultanov', email: 'royal.sultanov@gmail.com', phone: '+994535556677' },
    { name: 'Yegana Bağırova', email: 'yegana.bagirova@gmail.com', phone: '+994536667788' },
    { name: 'İntiqam Hacıyev', email: 'intiqam.hajiyev@gmail.com', phone: '+994537778899' },
    { name: 'Mədinə Əzizova', email: 'madina.azizova@gmail.com', phone: '+994538889900' },
    { name: 'Sabuhi Cəfərov', email: 'sabuhi.jafarov@gmail.com', phone: '+994539990011' },
    { name: 'Təranə Rzayeva', email: 'tarana.rzayeva@gmail.com', phone: '+994540001122' },
  ];

  const students = await Promise.all(
    studentNames.map((s) =>
      prisma.student.create({ data: s })
    )
  );
  console.log('✅ 40 students created');

  // Enroll students into courses (2 students per course)
  const enrollments = [];
  for (let i = 0; i < 20; i++) {
    enrollments.push(
      { studentId: students[i * 2].id, courseId: allCourses[i].id, status: 'COMPLETED' as const, startDate: new Date('2024-09-01'), endDate: new Date('2025-02-01') },
      { studentId: students[i * 2 + 1].id, courseId: allCourses[i].id, status: 'ACTIVE' as const, startDate: new Date('2025-01-15') },
    );
  }
  await prisma.studentCourse.createMany({ data: enrollments, skipDuplicates: true });
  console.log('✅ Student enrollments created');

  // ==========================================
  // TESTIMONIALS (10)
  // ==========================================
  await Promise.all([
    prisma.testimonial.create({
      data: {
        name: 'Fərid Əhmədov', rating: 5, order: 1,
        textAz: 'FutureUp Academy-də Frontend kursu həyatımı dəyişdi. 6 ay ərzində sıfırdan peşəkar developer oldum və indi böyük bir şirkətdə işləyirəm.',
        textRu: 'Курс Frontend в FutureUp Academy изменил мою жизнь. За 6 месяцев я стал профессиональным разработчиком.',
        textEn: 'The Frontend course at FutureUp Academy changed my life. In 6 months I became a professional developer.',
        courseAz: 'Frontend Developer', courseRu: 'Frontend Разработчик', courseEn: 'Frontend Developer',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Günel Hüseynova', rating: 5, order: 2,
        textAz: 'UI/UX Dizayn kursunda həm nəzəri, həm də praktiki biliklər aldım. Portfolio yaratdım və artıq freelance işləyirəm.',
        textRu: 'На курсе UI/UX Design я получила как теоретические, так и практические знания. Создала портфолио и уже фрилансю.',
        textEn: 'In the UI/UX Design course I gained both theoretical and practical knowledge. Created my portfolio and now freelancing.',
        courseAz: 'UI/UX Dizayn', courseRu: 'UI/UX Дизайн', courseEn: 'UI/UX Design',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Rəşad Quliyev', rating: 5, order: 3,
        textAz: 'Data Analytics kursu sayəsində analitik düşüncə bacarıqlarımı inkişaf etdirdim. İndi data analyst olaraq çalışıram.',
        textRu: 'Благодаря курсу Data Analytics я развил аналитическое мышление. Сейчас работаю data аналитиком.',
        textEn: 'Thanks to the Data Analytics course I developed my analytical thinking. Now I work as a data analyst.',
        courseAz: 'Data Analitik', courseRu: 'Data Аналитик', courseEn: 'Data Analytics',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Aysel Əlizadə', rating: 5, order: 4,
        textAz: 'Kibertəhlükəsizlik kursundan sonra Red Team mütəxəssisi olaraq karyerama başladım. Əla müəllimlər və praktiki dərslər.',
        textRu: 'После курса по кибербезопасности начала карьеру Red Team специалиста. Отличные преподаватели и практические занятия.',
        textEn: 'After the cybersecurity course I started my career as a Red Team specialist. Excellent teachers and practical lessons.',
        courseAz: 'Red Team - Offensive Security', courseRu: 'Red Team', courseEn: 'Red Team - Offensive Security',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Murad Həsənov', rating: 5, order: 5,
        textAz: 'DevOps kursunda Docker, Kubernetes, CI/CD pipeline qurmağı öyrəndim. İndi DevOps mühəndisi olaraq işləyirəm.',
        textRu: 'На курсе DevOps научился создавать Docker, Kubernetes, CI/CD пайплайны. Теперь работаю DevOps инженером.',
        textEn: 'In the DevOps course I learned to build Docker, Kubernetes, CI/CD pipelines. Now working as a DevOps engineer.',
        courseAz: 'DevOps Mühəndisi', courseRu: 'DevOps Инженер', courseEn: 'DevOps Engineer',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Ləman Abbasova', rating: 5, order: 6,
        textAz: 'QA kursundan sonra manual və automation testing bacarıqlarım çox inkişaf etdi. ISTQB sertifikatına hazırlaşıram.',
        textRu: 'После курса QA мои навыки ручного и автоматизированного тестирования значительно улучшились.',
        textEn: 'After the QA course my manual and automation testing skills improved significantly. Preparing for ISTQB certification.',
        courseAz: 'Quality Assurance', courseRu: 'Quality Assurance', courseEn: 'Quality Assurance',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Elçin Babayev', rating: 5, order: 7,
        textAz: 'Backend Java kursunda Spring Boot və Microservices öyrəndim. Enterprise səviyyəli layihələr üzərində işlədik.',
        textRu: 'На курсе Backend Java изучил Spring Boot и Microservices. Работали над проектами enterprise уровня.',
        textEn: 'In the Backend Java course I learned Spring Boot and Microservices. Worked on enterprise-level projects.',
        courseAz: 'Backend Developer (Java ilə)', courseRu: 'Backend Разработчик (Java)', courseEn: 'Backend Developer (Java)',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Nərmin Cəfərova', rating: 4, order: 8,
        textAz: 'Rəqəmsal Marketinq kursunda real kampaniyalar üzərində işlədik. Google Ads sertifikatımı aldım.',
        textRu: 'На курсе Цифрового Маркетинга работали над реальными кампаниями. Получила сертификат Google Ads.',
        textEn: 'In the Digital Marketing course we worked on real campaigns. Got my Google Ads certification.',
        courseAz: 'Rəqəmsal Marketinq', courseRu: 'Цифровой Маркетинг', courseEn: 'Digital Marketing',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Tural Qəhrəmanov', rating: 5, order: 9,
        textAz: 'AI/ML kursunda dərin öyrənmə modelləri qurmağı öyrəndim. Kaggle müsabiqələrində iştirak edirəm.',
        textRu: 'На курсе AI/ML научился строить модели глубокого обучения. Участвую в соревнованиях Kaggle.',
        textEn: 'In the AI/ML course I learned to build deep learning models. Now participating in Kaggle competitions.',
        courseAz: 'Süni İntellekt və ML', courseRu: 'ИИ и ML', courseEn: 'AI & Machine Learning',
      },
    }),
    prisma.testimonial.create({
      data: {
        name: 'Sevda Məmmədli', rating: 5, order: 10,
        textAz: 'Mobile Developer kursunda Flutter ilə real tətbiq yaratdım və App Store-da yayımladım. Əla təcrübə idi.',
        textRu: 'На курсе Mobile Developer создала реальное приложение на Flutter и опубликовала в App Store.',
        textEn: 'In the Mobile Developer course I built a real app with Flutter and published it on the App Store.',
        courseAz: 'Mobile Developer', courseRu: 'Мобильный Разработчик', courseEn: 'Mobile Developer',
      },
    }),
  ]);
  console.log('✅ 10 testimonials created');

  // ==========================================
  // REVIEWS (approved)
  // ==========================================
  const allTeachers = [t1, t2, t3, t4, t5, t6, t7, t8, t9, t10, t11, t12, t13, t14, t15, t16, t17, t18, t19, t20];

  // Student reviews about courses
  for (let i = 0; i < 20; i++) {
    await prisma.review.create({
      data: {
        type: 'STUDENT_ABOUT_COURSE',
        text: getStudentCourseReview(i),
        rating: i % 3 === 0 ? 4 : 5,
        studentAuthorId: students[i * 2].id,
        aboutCourseId: allCourses[i].id,
        status: 'APPROVED',
        isPublic: true,
      },
    });
  }

  // Teacher reviews about students (for certificates)
  for (let i = 0; i < 20; i++) {
    await prisma.review.create({
      data: {
        type: 'TEACHER_ABOUT_STUDENT',
        text: getTeacherStudentReview(i),
        rating: 5,
        teacherAuthorId: allTeachers[i].id,
        aboutStudentId: students[i * 2].id,
        status: 'APPROVED',
        isPublic: true,
      },
    });
  }

  // Some pending reviews for moderation
  for (let i = 0; i < 5; i++) {
    await prisma.review.create({
      data: {
        type: 'STUDENT_ABOUT_TEACHER',
        text: `Müəllim çox peşəkardır. Hər mövzunu ətraflı izah edir və suallarımıza səbirlə cavab verir. ${i + 1}/5 ulduz.`,
        rating: 4 + (i % 2),
        studentAuthorId: students[i * 2 + 1].id,
        aboutTeacherId: allTeachers[i].id,
        status: 'PENDING',
        isPublic: true,
      },
    });
  }

  console.log('✅ Reviews created (20 course + 20 teacher-about-student + 5 pending)');

  // ==========================================
  // CERTIFICATES (for completed students)
  // ==========================================
  for (let i = 0; i < 20; i++) {
    await prisma.certificate.create({
      data: {
        studentId: students[i * 2].id,
        courseId: allCourses[i].id,
        teacherId: allTeachers[i].id,
        issueDate: new Date('2025-02-01'),
        teacherReview: getTeacherStudentReview(i),
        grade: i % 3 === 0 ? 'Excellent' : i % 3 === 1 ? 'Good' : 'Very Good',
        status: 'ACTIVE',
      },
    });
  }
  console.log('✅ 20 certificates created');

  // ==========================================
  // APPLICATIONS (15 sample)
  // ==========================================
  const appStatuses: ('NEW' | 'CONTACTED' | 'ENROLLED' | 'REJECTED')[] = ['NEW', 'CONTACTED', 'ENROLLED', 'REJECTED'];
  for (let i = 0; i < 15; i++) {
    await prisma.application.create({
      data: {
        name: `Müraciətçi ${i + 1}`,
        email: `applicant${i + 1}@gmail.com`,
        phone: `+99450${String(i + 1).padStart(7, '0')}`,
        courseId: allCourses[i % 20].id,
        message: i % 2 === 0 ? 'Bu kursa qeydiyyatdan keçmək istəyirəm.' : null,
        status: appStatuses[i % 4],
      },
    });
  }
  console.log('✅ 15 applications created');

  // ==========================================
  // NEWS (5 articles)
  // ==========================================
  await Promise.all([
    prisma.news.create({
      data: {
        slug: 'futureup-academy-acildi',
        titleAz: 'FutureUp Academy rəsmi olaraq fəaliyyətə başladı!',
        titleRu: 'FutureUp Academy официально начала работу!',
        titleEn: 'FutureUp Academy officially launched!',
        contentAz: 'FutureUp Academy IT sektorunda yeni nəsil mütəxəssislər yetişdirmək məqsədilə fəaliyyətə başlayır. 20-dən çox kurs proqramı ilə geniş bir sahəni əhatə edirik.',
        contentRu: 'FutureUp Academy начинает работу с целью подготовки специалистов нового поколения в IT-секторе. Мы охватываем широкий спектр с более чем 20 курсами.',
        contentEn: 'FutureUp Academy starts operations with the goal of training next-generation IT professionals. We cover a wide range with over 20 course programs.',
        excerptAz: 'FutureUp Academy 20+ kurs proqramı ilə fəaliyyətə başladı.',
        excerptRu: 'FutureUp Academy начала работу с 20+ курсами.',
        excerptEn: 'FutureUp Academy launched with 20+ course programs.',
        isPublished: true, publishedAt: new Date('2025-01-15'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'cyber-security-bootcamp',
        titleAz: 'Kibertəhlükəsizlik Bootcamp — ilk məzunlar!',
        titleRu: 'Кибербезопасность Bootcamp — первые выпускники!',
        titleEn: 'Cybersecurity Bootcamp — first graduates!',
        contentAz: 'Kibertəhlükəsizlik bootcamp proqramımızın ilk məzunları sertifikatlarını aldılar. Red Team, Blue Team və Purple Team kurslarından 30+ mütəxəssis yetişdi.',
        contentRu: 'Первые выпускники нашего буткемпа по кибербезопасности получили сертификаты. Подготовлено 30+ специалистов Red, Blue и Purple Team.',
        contentEn: 'First graduates of our cybersecurity bootcamp received their certificates. 30+ specialists trained in Red, Blue and Purple Team.',
        excerptAz: 'Kibertəhlükəsizlik bootcamp-dən 30+ məzun sertifikat aldı.',
        excerptRu: '30+ выпускников получили сертификаты буткемпа.',
        excerptEn: '30+ graduates received bootcamp certificates.',
        isPublished: true, publishedAt: new Date('2025-02-01'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'ai-ml-partnerships',
        titleAz: 'AI/ML sahəsində yeni partnyorluqlar',
        titleRu: 'Новые партнерства в области AI/ML',
        titleEn: 'New partnerships in AI/ML',
        contentAz: 'FutureUp Academy süni intellekt və maşın öyrənmə sahəsində beynəlxalq şirkətlərlə yeni partnyorluq müqavilələri imzaladı.',
        contentRu: 'FutureUp Academy подписала новые партнерские соглашения с международными компаниями в области ИИ и машинного обучения.',
        contentEn: 'FutureUp Academy signed new partnership agreements with international companies in AI and machine learning.',
        excerptAz: 'AI/ML sahəsində beynəlxalq partnyorluqlar.',
        excerptRu: 'Международные партнерства в AI/ML.',
        excerptEn: 'International partnerships in AI/ML.',
        isPublished: true, publishedAt: new Date('2025-02-10'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'hackathon-2025',
        titleAz: 'FutureUp Hackathon 2025 elan edildi!',
        titleRu: 'Объявлен FutureUp Hackathon 2025!',
        titleEn: 'FutureUp Hackathon 2025 announced!',
        contentAz: 'Tələbələrimiz və məzunlarımız üçün ilk hackathon yarışmamızı elan edirik. 48 saat ərzində innovativ həllər yaradın və mükafatlar qazanın.',
        contentRu: 'Объявляем первый хакатон для наших студентов и выпускников. Создавайте инновационные решения за 48 часов и выигрывайте призы.',
        contentEn: 'We announce our first hackathon for students and alumni. Build innovative solutions in 48 hours and win prizes.',
        excerptAz: '48 saatlıq hackathon yarışması başlayır!',
        excerptRu: 'Начинается 48-часовой хакатон!',
        excerptEn: '48-hour hackathon competition begins!',
        isPublished: true, publishedAt: new Date('2025-02-15'),
      },
    }),
    prisma.news.create({
      data: {
        slug: 'new-devops-course',
        titleAz: 'Yeni DevSecOps kursu başlayır',
        titleRu: 'Начинается новый курс DevSecOps',
        titleEn: 'New DevSecOps course begins',
        contentAz: 'DevSecOps kursu Mart ayından etibarən yeni qrupla başlayır. Təhlükəsizlik avtomatlaşdırması, CI/CD pipeline təhlükəsizliyi və daha çox.',
        contentRu: 'Курс DevSecOps начинается с новой группой с марта. Автоматизация безопасности, безопасность CI/CD пайплайнов.',
        contentEn: 'DevSecOps course starts with a new group from March. Security automation, CI/CD pipeline security and more.',
        excerptAz: 'DevSecOps kursu Mart ayından başlayır.',
        excerptRu: 'Курс DevSecOps начинается с марта.',
        excerptEn: 'DevSecOps course starts from March.',
        isPublished: false, publishedAt: null,
      },
    }),
  ]);
  console.log('✅ 5 news articles created');

  // ==========================================
  // PARTNERS
  // ==========================================
  await prisma.partner.createMany({
    data: [
      { name: 'Microsoft', logoUrl: '/images/partners/microsoft.svg', website: 'https://microsoft.com', order: 1 },
      { name: 'Google', logoUrl: '/images/partners/google.svg', website: 'https://google.com', order: 2 },
      { name: 'GitHub', logoUrl: '/images/partners/github.svg', website: 'https://github.com', order: 3 },
      { name: 'AWS', logoUrl: '/images/partners/aws.svg', website: 'https://aws.amazon.com', order: 4 },
      { name: 'CompTIA', logoUrl: '/images/partners/comptia.svg', website: 'https://comptia.org', order: 5 },
      { name: 'Adobe', logoUrl: '/images/partners/adobe.svg', website: 'https://adobe.com', order: 6 },
      { name: 'Cisco', logoUrl: '/images/partners/cisco.svg', website: 'https://cisco.com', order: 7 },
      { name: 'Meta', logoUrl: '/images/partners/meta.svg', website: 'https://meta.com', order: 8 },
    ],
  });
  console.log('✅ 8 partners created');

  // ==========================================
  // SITE SETTINGS
  // ==========================================
  const settings = [
    { key: 'phone', value: '+994 50 123 45 67' },
    { key: 'email', value: 'info@futureup.az' },
    { key: 'address_az', value: 'Bakı, Azərbaycan, Nizami küç. 45' },
    { key: 'address_ru', value: 'Баку, Азербайджан, ул. Низами 45' },
    { key: 'address_en', value: 'Baku, Azerbaijan, Nizami str. 45' },
    { key: 'facebook', value: 'https://facebook.com/futureupacademy' },
    { key: 'instagram', value: 'https://instagram.com/futureupacademy' },
    { key: 'linkedin', value: 'https://linkedin.com/company/futureupacademy' },
    { key: 'youtube', value: 'https://youtube.com/@futureupacademy' },
    { key: 'tiktok', value: 'https://tiktok.com/@futureupacademy' },
  ];
  await Promise.all(settings.map((s) => prisma.siteSetting.upsert({ where: { key: s.key }, update: {}, create: s })));
  console.log('✅ Site settings created');

  // ==========================================
  // SCHOLARSHIPS (Стипендионные программы)
  // ==========================================
  await prisma.scholarshipApplication.deleteMany();
  await prisma.scholarship.deleteMany();

  const scholarships = await Promise.all([
    prisma.scholarship.create({
      data: {
        slug: 'merit-scholarship',
        titleAz: 'Uğur Təqaüdü',
        titleRu: 'Стипендия за заслуги',
        titleEn: 'Merit Scholarship',
        descAz: 'Akademik müvəffəqiyyətə görə verilən təqaüd proqramı. Yüksək bal toplayan tələbələr kurs haqqının 50%-dən 100%-ə qədər endirim əldə edə bilərlər.',
        descRu: 'Стипендиальная программа за академические достижения. Студенты с высокими баллами могут получить скидку от 50% до 100% на стоимость курса.',
        descEn: 'Scholarship program for academic excellence. High-scoring students can receive 50% to 100% discount on course fees.',
        coverageAz: 'Kurs haqqının 50%-100% ödənməsi, kitab və materiallar, sertifikat haqqı',
        coverageRu: 'Оплата 50%-100% стоимости курса, книги и материалы, стоимость сертификата',
        coverageEn: 'Coverage of 50%-100% of course fee, books and materials, certification fee',
        eligibilityAz: 'Minimum 80% giriş imtahanı balı, motivasiya məktubu, müsahibə keçmək',
        eligibilityRu: 'Минимум 80% балл вступительного экзамена, мотивационное письмо, прохождение собеседования',
        eligibilityEn: 'Minimum 80% entry exam score, motivation letter, passing an interview',
        percentage: 100,
        isActive: true, order: 1,
      },
    }),
    prisma.scholarship.create({
      data: {
        slug: 'women-in-tech',
        titleAz: 'Qadınlar üçün IT Təqaüdü',
        titleRu: 'IT-стипендия для женщин',
        titleEn: 'Women in Tech Scholarship',
        descAz: 'IT sahəsində qadınların iştirakını artırmaq məqsədilə xüsusi təqaüd proqramı. Bütün texnologiya kurslarına müraciət etmək olar.',
        descRu: 'Специальная стипендиальная программа для увеличения участия женщин в IT. Можно подать заявку на все технологические курсы.',
        descEn: 'Special scholarship program to increase women participation in IT. You can apply for all technology courses.',
        coverageAz: 'Kurs haqqının 50% ödənməsi, mentorluq proqramı, networking imkanları',
        coverageRu: 'Оплата 50% стоимости курса, программа менторства, возможности нетворкинга',
        coverageEn: 'Coverage of 50% course fee, mentoring program, networking opportunities',
        eligibilityAz: 'Qadın namizədlər, IT sahəsinə maraq, motivasiya məktubu',
        eligibilityRu: 'Кандидаты-женщины, интерес к IT, мотивационное письмо',
        eligibilityEn: 'Female candidates, interest in IT, motivation letter',
        percentage: 50,
        isActive: true, order: 2,
      },
    }),
    prisma.scholarship.create({
      data: {
        slug: 'social-scholarship',
        titleAz: 'Sosial Təqaüd',
        titleRu: 'Социальная стипендия',
        titleEn: 'Social Scholarship',
        descAz: 'Maddi vəziyyəti çətin olan, lakin istedadlı gənclər üçün tam təqaüd proqramı. Hər semestr 5 yer ayrılır.',
        descRu: 'Полная стипендиальная программа для талантливых молодых людей с финансовыми трудностями. Каждый семестр выделяется 5 мест.',
        descEn: 'Full scholarship program for talented young people with financial difficulties. 5 places are allocated each semester.',
        coverageAz: 'Kurs haqqının 100% ödənməsi, laptop təminatı, nəqliyyat xərcləri',
        coverageRu: 'Оплата 100% стоимости курса, обеспечение ноутбуком, транспортные расходы',
        coverageEn: 'Coverage of 100% course fee, laptop provision, transportation costs',
        eligibilityAz: 'Maddi çətinlik sənədi, müsahibə, texniki imtahan',
        eligibilityRu: 'Документ о финансовых трудностях, собеседование, технический экзамен',
        eligibilityEn: 'Financial hardship documentation, interview, technical exam',
        percentage: 100,
        isActive: true, order: 3,
      },
    }),
    prisma.scholarship.create({
      data: {
        slug: 'early-bird',
        titleAz: 'Erkən Qeydiyyat Endirimi',
        titleRu: 'Скидка за раннюю регистрацию',
        titleEn: 'Early Bird Discount',
        descAz: 'Kurs başlamazdan 30 gün əvvəl qeydiyyatdan keçən tələbələr üçün 20% endirim.',
        descRu: 'Скидка 20% для студентов, зарегистрировавшихся за 30 дней до начала курса.',
        descEn: '20% discount for students who register 30 days before the course starts.',
        coverageAz: 'Kurs haqqından 20% endirim',
        coverageRu: 'Скидка 20% от стоимости курса',
        coverageEn: '20% discount on course fee',
        eligibilityAz: 'Kurs başlamazdan minimum 30 gün əvvəl qeydiyyat',
        eligibilityRu: 'Регистрация минимум за 30 дней до начала курса',
        eligibilityEn: 'Registration at least 30 days before course start',
        percentage: 20,
        isActive: true, order: 4,
      },
    }),
  ]);
  console.log('✅ 4 scholarship programs created');

  // ==========================================
  // CORPORATE SERVICES (B2B)
  // ==========================================
  await prisma.corporateInquiry.deleteMany();
  await prisma.corporateService.deleteMany();

  await Promise.all([
    // --- TRAINING ---
    prisma.corporateService.create({
      data: {
        slug: 'cybersecurity-training',
        type: 'TRAINING',
        titleAz: 'Korporativ Kibertəhlükəsizlik Təlimləri',
        titleRu: 'Корпоративные тренинги по кибербезопасности',
        titleEn: 'Corporate Cybersecurity Training',
        descAz: 'Şirkətinizin əməkdaşlarını kibertəhlükəsizlik mövzusunda təlimləndirin. Phishing müdafiəsi, parol təhlükəsizliyi, sosial mühəndislik, GDPR uyğunluq və daha çox.',
        descRu: 'Обучите сотрудников вашей компании кибербезопасности. Защита от фишинга, безопасность паролей, социальная инженерия, соответствие GDPR.',
        descEn: 'Train your employees in cybersecurity. Phishing defense, password security, social engineering, GDPR compliance and more.',
        shortDescAz: 'Əməkdaşlar üçün kibertəhlükəsizlik təlimləri',
        shortDescRu: 'Тренинги по кибербезопасности для сотрудников',
        shortDescEn: 'Cybersecurity training for employees',
        icon: 'Shield', order: 1,
        features: ['Phishing simulyasiyaları', 'Security Awareness proqramı', 'GDPR/KVKK təlimi', 'İnsidentlərə cavab protokolları', 'Sertifikat'],
      },
    }),
    prisma.corporateService.create({
      data: {
        slug: 'tech-team-training',
        type: 'TRAINING',
        titleAz: 'Texniki Komanda Təlimləri',
        titleRu: 'Обучение технических команд',
        titleEn: 'Tech Team Training',
        descAz: 'Developer, DevOps, QA komandalarınız üçün xüsusi təlimlər. Cloud, Microservices, CI/CD, Testing strategiyaları və s.',
        descRu: 'Специальные тренинги для команд Developer, DevOps, QA. Cloud, Microservices, CI/CD, стратегии тестирования.',
        descEn: 'Custom training for your Developer, DevOps, QA teams. Cloud, Microservices, CI/CD, Testing strategies and more.',
        shortDescAz: 'Developer, DevOps, QA komandaları üçün təlimlər',
        shortDescRu: 'Тренинги для команд Developer, DevOps, QA',
        shortDescEn: 'Training for Developer, DevOps, QA teams',
        icon: 'Users', order: 2,
        features: ['Fərdi proqram', 'Hands-on laboratoriya', 'Real case study-lər', 'Kurs sonrası dəstək', 'Sertifikat'],
      },
    }),
    prisma.corporateService.create({
      data: {
        slug: 'leadership-training',
        type: 'TRAINING',
        titleAz: 'IT Liderlik və İdarəetmə Təlimləri',
        titleRu: 'IT-лидерство и управление',
        titleEn: 'IT Leadership & Management Training',
        descAz: 'CTO, Tech Lead, Engineering Manager-lər üçün liderlik təlimləri. Agile transformation, team management, technical strategy.',
        descRu: 'Тренинги лидерства для CTO, Tech Lead, Engineering Manager. Agile трансформация, управление командой.',
        descEn: 'Leadership training for CTO, Tech Lead, Engineering Managers. Agile transformation, team management, technical strategy.',
        shortDescAz: 'IT liderləri üçün idarəetmə təlimləri',
        shortDescRu: 'Управленческие тренинги для IT-лидеров',
        shortDescEn: 'Management training for IT leaders',
        icon: 'Crown', order: 3,
        features: ['Executive coaching', 'Agile/Scrum təlim', 'Team building', 'Strategic planning', 'Mentorluq'],
      },
    }),

    // --- UPSKILLING ---
    prisma.corporateService.create({
      data: {
        slug: 'cloud-upskilling',
        type: 'UPSKILLING',
        titleAz: 'Cloud & DevOps İxtisasartırma',
        titleRu: 'Повышение квалификации Cloud & DevOps',
        titleEn: 'Cloud & DevOps Upskilling',
        descAz: 'Mövcud IT komandanızın cloud və DevOps bacarıqlarını artırın. AWS, Azure, GCP sertifikat hazırlığı daxildir.',
        descRu: 'Повысьте навыки Cloud и DevOps вашей IT-команды. Включена подготовка к сертификации AWS, Azure, GCP.',
        descEn: 'Upskill your IT team in Cloud and DevOps. AWS, Azure, GCP certification preparation included.',
        shortDescAz: 'Cloud və DevOps bacarıqlarının artırılması',
        shortDescRu: 'Повышение навыков Cloud и DevOps',
        shortDescEn: 'Cloud and DevOps skills enhancement',
        icon: 'Cloud', order: 4,
        features: ['AWS/Azure/GCP sertifikat hazırlıq', 'Kubernetes təlimi', 'CI/CD qurulması', 'IaC best practices', '3-6 aylıq proqram'],
      },
    }),
    prisma.corporateService.create({
      data: {
        slug: 'data-literacy',
        type: 'UPSKILLING',
        titleAz: 'Data Savadlılığı Proqramı',
        titleRu: 'Программа грамотности данных',
        titleEn: 'Data Literacy Program',
        descAz: 'Bütün şöbələr üçün data savadlılığı proqramı. SQL, Excel, vizuallaşdırma, data-driven qərar vermə.',
        descRu: 'Программа грамотности данных для всех отделов. SQL, Excel, визуализация, принятие решений на основе данных.',
        descEn: 'Data literacy program for all departments. SQL, Excel, visualization, data-driven decision making.',
        shortDescAz: 'Bütün əməkdaşlar üçün data bacarıqları',
        shortDescRu: 'Навыки работы с данными для всех сотрудников',
        shortDescEn: 'Data skills for all employees',
        icon: 'BarChart3', order: 5,
        features: ['SQL əsasları', 'Excel Advanced', 'Power BI/Tableau', 'Data storytelling', 'KPI analiz'],
      },
    }),

    // --- IT SOLUTIONS ---
    prisma.corporateService.create({
      data: {
        slug: 'penetration-testing',
        type: 'IT_SOLUTION',
        titleAz: 'Penetrasiya Testləri (Pentest)',
        titleRu: 'Тестирование на проникновение (Pentest)',
        titleEn: 'Penetration Testing (Pentest)',
        descAz: 'Şirkətinizin IT infrastrukturunun və tətbiqlərinin təhlükəsizlik yoxlanışı. Web app, mobile app, network və API pentest xidmətləri.',
        descRu: 'Проверка безопасности IT-инфраструктуры и приложений. Услуги пентеста web-приложений, мобильных приложений, сетей и API.',
        descEn: 'Security assessment of your IT infrastructure and applications. Web app, mobile app, network and API pentest services.',
        shortDescAz: 'Təhlükəsizlik yoxlanışı və zəiflik analizi',
        shortDescRu: 'Проверка безопасности и анализ уязвимостей',
        shortDescEn: 'Security assessment and vulnerability analysis',
        icon: 'Bug', order: 6,
        features: ['Web Application Pentest', 'Network Pentest', 'Mobile App Pentest', 'API Security Testing', 'Detallı hesabat', 'Remediation dəstəyi'],
      },
    }),
    prisma.corporateService.create({
      data: {
        slug: 'qa-outsourcing',
        type: 'IT_SOLUTION',
        titleAz: 'QA Outsourcing Xidmətləri',
        titleRu: 'Услуги QA-аутсорсинга',
        titleEn: 'QA Outsourcing Services',
        descAz: 'Tam QA komandası təmin edirik. Manual test, automation test, performance test, security test — bütün test prosesini biz idarə edirik.',
        descRu: 'Предоставляем полную QA команду. Ручное тестирование, автоматизация, нагрузочное тестирование — мы управляем всем процессом.',
        descEn: 'We provide a full QA team. Manual testing, automation, performance testing, security testing — we manage the entire testing process.',
        shortDescAz: 'Tam QA komandası və test prosesi idarəetməsi',
        shortDescRu: 'Полная QA команда и управление процессом тестирования',
        shortDescEn: 'Full QA team and testing process management',
        icon: 'CheckCircle', order: 7,
        features: ['Manual Testing', 'Automation Testing', 'Performance Testing', 'Security Testing', 'CI/CD inteqrasiya', 'Aylıq hesabatlar'],
      },
    }),
    prisma.corporateService.create({
      data: {
        slug: 'custom-software-development',
        type: 'IT_SOLUTION',
        titleAz: 'Xüsusi Proqram Təminatı İnkişafı',
        titleRu: 'Разработка программного обеспечения на заказ',
        titleEn: 'Custom Software Development',
        descAz: 'Sıfırdan IT məhsul yaradırıq — veb tətbiqlər, mobil tətbiqlər, API-lər, CRM/ERP sistemləri. Mövcud məhsullarınızı da təkmilləşdiririk.',
        descRu: 'Создаем IT-продукты с нуля — веб-приложения, мобильные приложения, API, CRM/ERP системы. Также улучшаем ваши существующие продукты.',
        descEn: 'We build IT products from scratch — web apps, mobile apps, APIs, CRM/ERP systems. We also improve your existing products.',
        shortDescAz: 'Sıfırdan məhsul yaratma və mövcud məhsulların təkmilləşdirilməsi',
        shortDescRu: 'Создание продуктов с нуля и улучшение существующих',
        shortDescEn: 'Building products from scratch and improving existing ones',
        icon: 'Laptop', order: 8,
        features: ['Web Development', 'Mobile Development', 'API Development', 'CRM/ERP Systems', 'Legacy Modernization', 'Technical Consultation'],
      },
    }),
    prisma.corporateService.create({
      data: {
        slug: 'it-consulting',
        type: 'IT_SOLUTION',
        titleAz: 'IT Konsultasiya və Audit',
        titleRu: 'IT-консалтинг и аудит',
        titleEn: 'IT Consulting & Audit',
        descAz: 'IT infrastrukturunuzun auditi, texnologiya strategiyası, arxitektura yenidən qurma, cloud miqrasiya planlaması.',
        descRu: 'Аудит IT-инфраструктуры, технологическая стратегия, реструктуризация архитектуры, планирование облачной миграции.',
        descEn: 'IT infrastructure audit, technology strategy, architecture restructuring, cloud migration planning.',
        shortDescAz: 'IT audit, strategiya və texnologiya konsultasiyası',
        shortDescRu: 'IT-аудит, стратегия и технологический консалтинг',
        shortDescEn: 'IT audit, strategy and technology consulting',
        icon: 'Search', order: 9,
        features: ['IT Infrastructure Audit', 'Cloud Migration', 'Architecture Review', 'Tech Stack Optimization', 'Security Audit', 'Roadmap planlaması'],
      },
    }),
  ]);
  console.log('✅ 9 corporate services created (3 training + 2 upskilling + 4 IT solutions)');

  // Sample corporate inquiries
  await Promise.all([
    prisma.corporateInquiry.create({
      data: {
        companyName: 'AzərTech MMC', contactName: 'Rəşad Nəbiyev', email: 'rashad@azertech.az', phone: '+994501234567',
        message: 'Əməkdaşlarımız üçün kibertəhlükəsizlik təlimi keçirmək istəyirik. 50 nəfər üçün.', employeeCount: '50', status: 'NEW',
      },
    }),
    prisma.corporateInquiry.create({
      data: {
        companyName: 'Digital Solutions LLC', contactName: 'Kamran Məmmədov', email: 'kamran@digsol.az', phone: '+994551234567',
        message: 'Web tətbiqimiz üçün pentest xidməti lazımdır.', status: 'CONTACTED',
      },
    }),
    prisma.corporateInquiry.create({
      data: {
        companyName: 'BankPlus ASC', contactName: 'Nigar Əliyeva', email: 'nigar@bankplus.az', phone: '+994701234567',
        message: 'Developer komandamız üçün cloud və microservices təlimi istəyirik.', employeeCount: '20', budget: '15000-25000 AZN', status: 'PROPOSAL_SENT',
      },
    }),
  ]);
  console.log('✅ 3 sample corporate inquiries created');

  console.log('\n🎉 Seed completed successfully!');
  console.log(`📊 Summary:`);
  console.log(`   - 1 admin user`);
  console.log(`   - 7 categories`);
  console.log(`   - 20 courses`);
  console.log(`   - 20 teachers`);
  console.log(`   - 40 students`);
  console.log(`   - 20 certificates`);
  console.log(`   - 45 reviews`);
  console.log(`   - 10 testimonials`);
  console.log(`   - 15 applications`);
  console.log(`   - 5 news articles`);
  console.log(`   - 8 partners`);
  console.log(`   - 4 scholarship programs`);
  console.log(`   - 9 corporate services`);
  console.log(`   - 3 corporate inquiries`);
}

// ==========================================
// HELPER FUNCTIONS
// ==========================================

function getStudentCourseReview(index: number): string {
  const reviews = [
    'Help Desk kursu çox faydalı idi. IT dəstək sahəsində lazım olan bütün bacarıqları öyrəndim. Praktiki dərslər əla idi.',
    'Şəbəkə kursu çox dərin biliklər verdi. Server administrasiyası və virtuallaşdırma mövzuları çox faydalı oldu.',
    'QA kursunda test avtomatlaşdırması öyrəndim. Selenium və Cypress ilə praktiki layihələr əla təcrübə oldu.',
    'Product Owner kursu biznes tərəfi anlamağıma çox kömək etdi. Agile və Scrum metodologiyalarını dərindən öyrəndim.',
    'Rəqəmsal marketinq kursunda real kampaniyalar üzərində işlədik. Google Ads və Meta Ads bacarıqlarım çox inkişaf etdi.',
    'UI/UX Dizayn kursunda Figma ilə professional dizaynlar yaratmağı öyrəndim. Portfolio layihəm əla alındı.',
    'AI/ML kursu çox intensiv və maraqlı idi. Dərin öyrənmə modelləri qurmaq təcrübəsi əvəzsizdir.',
    'Data Engineering kursunda Big Data texnologiyaları öyrəndim. Apache Spark və Kafka ilə iş çox maraqlı idi.',
    'Data Analytics kursunda Power BI və Python ilə data vizuallaşdırma öyrəndim. İndi data-driven qərarlar verə bilirəm.',
    'Mobile Developer kursunda Flutter ilə tam funksional tətbiq yaratdım. Cross-platform development əla öyrədildi.',
    'Java Backend kursu enterprise development üçün əla hazırlıq oldu. Spring Boot və Microservices dərinliyinə öyrədildi.',
    'C# Backend kursunda .NET ekosistemini dərindən öyrəndim. Azure bulud xidmətləri ilə iş çox faydalı oldu.',
    'Frontend kursunda React və Next.js ilə müasir veb tətbiqlər yaratmağı öyrəndim. TypeScript biliyim çox artdı.',
    'DevOps kursunda Docker, Kubernetes və CI/CD pipeline qurmağı öyrəndim. Real infrastructure ilə iş təcrübəsi əla idi.',
    'DevSecOps kursunda təhlükəsizliyi pipeline-a inteqrasiya etməyi öyrəndim. SAST/DAST alətləri ilə praktiki iş faydalı oldu.',
    'Red Team kursunda penetrasiya testləri aparmağı öyrəndim. CTF laboratoriyası əla təcrübə mühiti idi.',
    'Blue Team kursunda SOC əməliyyatları və SIEM sistemləri ilə işləməyi öyrəndim. Threat Hunting mövzuları çox maraqlı idi.',
    'Purple Team kursunda hücum və müdafiə əməliyyatlarını birləşdirməyi öyrəndim. Detection Engineering çox faydalı oldu.',
    'GRC kursunda ISO 27001 və risk idarəetmə çərçivələrini dərindən öyrəndim. Audit bacarıqlarım çox inkişaf etdi.',
    'Cyber Operations kursunda böhran idarəetmə və insidentlərə cavab vermə bacarıqlarını inkişaf etdirdim. Əla təcrübə idi.',
  ];
  return reviews[index % reviews.length];
}

function getTeacherStudentReview(index: number): string {
  const reviews = [
    'Tələbə kurs müddətində əla nəticələr göstərdi. Texniki bacarıqları sürətlə inkişaf etdi və komanda ilə yaxşı işlədi.',
    'Çox çalışqan və məsuliyyətli tələbədir. Bütün tapşırıqları vaxtında və keyfiyyətlə yerinə yetirdi.',
    'Analitik düşüncə qabiliyyəti yüksəkdir. Mürəkkəb problemləri həll etmə bacarığı əla səviyyədədir.',
    'Kurs boyunca aktiv iştirak etdi və öyrənmə sürəti çox yüksək idi. Real layihələrdə əla nəticələr göstərdi.',
    'Kreativ yanaşma tərzi və detalçılığı ilə fərqlənir. Kurs layihəsini əla səviyyədə tamamladı.',
    'Texniki biliklərini sürətlə artırdı. Komanda işində liderlik keyfiyyətləri göstərdi.',
    'Dərin texniki biliklər əldə etdi. Tədqiqat bacarıqları və innovativ düşüncəsi ilə fərqləndi.',
    'Kurs müddətində əla performans göstərdi. Big Data texnologiyaları üzrə güclü biliklər əldə etdi.',
    'Analitik bacarıqları və vizuallaşdırma qabiliyyəti yüksəkdir. Data-driven qərarverme prosesini dərindən anladı.',
    'Mobil tətbiq inkişafında böyük potensial göstərdi. Cross-platform development bacarıqları əla səviyyədədir.',
    'Enterprise Java development-da güclü biliklər əldə etdi. Clean code və best practices-ə əməl etdi.',
    'C# və .NET ekosistemini dərindən mənimsədi. Layihə arxitekturası üzrə güclü bacarıqlar göstərdi.',
    'Frontend texnologiyalarını əla mənimsədi. Müasir veb development bacarıqları yüksək səviyyədədir.',
    'DevOps mühəndisliyi üzrə əla biliklər əldə etdi. Infrastructure automation bacarıqları güclüdür.',
    'Təhlükəsizlik avtomatlaşdırması üzrə dərin biliklər əldə etdi. DevSecOps pipeline qurma bacarığı yüksəkdir.',
    'Offensive security sahəsində böyük potensial göstərdi. Penetrasiya testləri bacarıqları əla səviyyədədir.',
    'SOC əməliyyatları və threat hunting üzrə güclü biliklər əldə etdi. Analitik düşüncə qabiliyyəti yüksəkdir.',
    'Purple Team əməliyyatları üzrə əla biliklər göstərdi. Red və Blue Team koordinasiyası bacarığı güclüdür.',
    'GRC çərçivələri və risk idarəetmə üzrə dərin biliklər əldə etdi. Audit bacarıqları yüksək səviyyədədir.',
    'Kiber əməliyyatlar sahəsində əla nəticələr göstərdi. Böhran idarəetmə və liderlik keyfiyyətləri güclüdür.',
  ];
  return reviews[index % reviews.length];
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

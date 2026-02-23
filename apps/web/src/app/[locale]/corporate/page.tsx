'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/Button';
import { motion } from 'framer-motion';
import { useLocale } from 'next-intl';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import {
  Building2,
  Sparkles,
  ArrowRight,
  Users,
  GraduationCap,
  Code2,
  Shield,
  BarChart3,
  CheckCircle2,
  Zap,
  Globe,
  Award,
  TrendingUp,
  Briefcase,
  Palette,
  Megaphone,
  Target,
} from 'lucide-react';

function getText(locale: string, az: string, ru: string, en: string): string {
  if (locale === 'ru') return ru;
  if (locale === 'en') return en;
  return az;
}

type ServiceCategory = 'training' | 'upskilling';

interface Service {
  id: string;
  category: ServiceCategory;
  icon: React.ElementType;
  titleAz: string;
  titleRu: string;
  titleEn: string;
  descAz: string;
  descRu: string;
  descEn: string;
  features: { az: string; ru: string; en: string }[];
  gradient: string;
}

const services: Service[] = [
  // Training
  {
    id: 'corporate-dev',
    category: 'training',
    icon: Code2,
    titleAz: 'Proqramlaşdırma Təlimləri',
    titleRu: 'Тренинги по программированию',
    titleEn: 'Programming Training',
    descAz: 'Komandanız üçün xüsusi hazırlanmış proqramlaşdırma təlimləri.',
    descRu: 'Специально разработанные тренинги по программированию для вашей команды.',
    descEn: 'Custom programming trainings designed for your team.',
    features: [
      { az: 'Frontend & Backend', ru: 'Frontend & Backend', en: 'Frontend & Backend' },
      { az: 'Praktiki layihələr', ru: 'Практические проекты', en: 'Hands-on projects' },
      { az: 'Mentorluq dəstəyi', ru: 'Поддержка менторов', en: 'Mentorship support' },
    ],
    gradient: 'from-primary-400 to-primary-600',
  },
  {
    id: 'corporate-design',
    category: 'training',
    icon: Palette,
    titleAz: 'Dizayn Təlimləri',
    titleRu: 'Тренинги по дизайну',
    titleEn: 'Design Training',
    descAz: 'UI/UX dizayn və qrafik dizayn üzrə korporativ təlimlər.',
    descRu: 'Корпоративные тренинги по UI/UX и графическому дизайну.',
    descEn: 'Corporate training on UI/UX and graphic design.',
    features: [
      { az: 'UI/UX dizayn', ru: 'UI/UX дизайн', en: 'UI/UX design' },
      { az: 'Figma & Adobe', ru: 'Figma & Adobe', en: 'Figma & Adobe' },
      { az: 'Dizayn sistemi', ru: 'Дизайн-система', en: 'Design systems' },
    ],
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    id: 'corporate-marketing',
    category: 'training',
    icon: Megaphone,
    titleAz: 'Rəqəmsal Marketinq Təlimləri',
    titleRu: 'Тренинги по цифровому маркетингу',
    titleEn: 'Digital Marketing Training',
    descAz: 'SEO, SMM, və rəqəmsal reklam üzrə peşəkar təlimlər.',
    descRu: 'Профессиональные тренинги по SEO, SMM и цифровой рекламе.',
    descEn: 'Professional training on SEO, SMM, and digital advertising.',
    features: [
      { az: 'SEO & SEM', ru: 'SEO & SEM', en: 'SEO & SEM' },
      { az: 'Sosial media', ru: 'Социальные сети', en: 'Social media' },
      { az: 'Analitika', ru: 'Аналитика', en: 'Analytics' },
    ],
    gradient: 'from-amber-500 to-yellow-500',
  },
  // Upskilling
  {
    id: 'upskill-data',
    category: 'upskilling',
    icon: BarChart3,
    titleAz: 'Data Analitika',
    titleRu: 'Аналитика данных',
    titleEn: 'Data Analytics',
    descAz: 'Əməkdaşlarınızın data analitika bacarıqlarını artırın.',
    descRu: 'Повысьте навыки ваших сотрудников в области аналитики данных.',
    descEn: 'Enhance your employees\' data analytics skills.',
    features: [
      { az: 'Python & SQL', ru: 'Python & SQL', en: 'Python & SQL' },
      { az: 'Power BI / Tableau', ru: 'Power BI / Tableau', en: 'Power BI / Tableau' },
      { az: 'Biznes analitikası', ru: 'Бизнес-аналитика', en: 'Business analytics' },
    ],
    gradient: 'from-primary-500 to-secondary-500',
  },
  {
    id: 'upskill-cyber',
    category: 'upskilling',
    icon: Shield,
    titleAz: 'Kibertəhlükəsizlik',
    titleRu: 'Кибербезопасность',
    titleEn: 'Cybersecurity',
    descAz: 'Şirkətinizin təhlükəsizlik mədəniyyətini gücləndirin.',
    descRu: 'Укрепите культуру безопасности вашей компании.',
    descEn: 'Strengthen your company\'s security culture.',
    features: [
      { az: 'Təhlükəsizlik auditi', ru: 'Аудит безопасности', en: 'Security audit' },
      { az: 'Əməkdaş təlimi', ru: 'Обучение сотрудников', en: 'Employee training' },
      { az: 'Sertifikasiya', ru: 'Сертификация', en: 'Certification' },
    ],
    gradient: 'from-red-500 to-orange-500',
  },
  {
    id: 'upskill-leadership',
    category: 'upskilling',
    icon: Target,
    titleAz: 'Liderlik və İdarəetmə',
    titleRu: 'Лидерство и управление',
    titleEn: 'Leadership & Management',
    descAz: 'Rəhbərlik bacarıqlarını inkişaf etdirmək üçün xüsusi proqramlar.',
    descRu: 'Специальные программы для развития навыков руководства.',
    descEn: 'Special programs to develop leadership skills.',
    features: [
      { az: 'Agile / Scrum', ru: 'Agile / Scrum', en: 'Agile / Scrum' },
      { az: 'Komanda idarəetməsi', ru: 'Управление командой', en: 'Team management' },
      { az: 'Strateji planlaşdırma', ru: 'Стратегическое планирование', en: 'Strategic planning' },
    ],
    gradient: 'from-secondary-500 to-secondary-600',
  },
];

const categoryTabs: { key: ServiceCategory; icon: React.ElementType; labelAz: string; labelRu: string; labelEn: string }[] = [
  { key: 'training', icon: GraduationCap, labelAz: 'Təlimlər', labelRu: 'Тренинги', labelEn: 'Training' },
  { key: 'upskilling', icon: TrendingUp, labelAz: 'İxtisasartırma', labelRu: 'Повышение квалификации', labelEn: 'Upskilling' },
];

const corporateStats = [
  { value: '100+', labelAz: 'Şirkət', labelRu: 'Компаний', labelEn: 'Companies', icon: Building2 },
  { value: '5000+', labelAz: 'Əməkdaş təlimləndirilib', labelRu: 'Сотрудников обучено', labelEn: 'Employees trained', icon: Users },
  { value: '50+', labelAz: 'Korporativ layihə', labelRu: 'Корпоративных проектов', labelEn: 'Corporate projects', icon: Briefcase },
  { value: '98%', labelAz: 'Müştəri məmnuniyyəti', labelRu: 'Удовлетворённость клиентов', labelEn: 'Client satisfaction', icon: Award },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] as const } },
};

const trustedLogos = [
  'TechCorp', 'DataFlow', 'CloudPeak', 'InnovateLab', 'NexGen', 'DigiPro',
];

export default function CorporatePage() {
  const locale = useLocale();
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('training');

  const filteredServices = services.filter((s) => s.category === activeCategory);

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-bg-light dark:bg-bg-dark pt-32 pb-16 sm:pt-40 sm:pb-20">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-primary-900/20 dark:via-bg-dark dark:to-secondary-900/20" />
          <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-1/3 w-[400px] h-[400px] bg-accent-500/10 rounded-full blur-3xl" />
        </div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(27,42,74,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(27,42,74,0.03)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-100/80 dark:bg-primary-900/30 border border-primary-200/50 dark:border-primary-700/30 mb-6"
          >
            <Building2 className="w-4 h-4 text-primary-500" />
            <span className="text-sm font-medium text-primary-700 dark:text-primary-300">FutureUp Business</span>
          </motion.div>
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold font-serif-heading tracking-tight text-gray-900 dark:text-white mb-4"
          >
            {getText(locale, 'Korporativ Həllər', 'Корпоративные Решения', 'Corporate Solutions')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-2xl mx-auto text-lg text-gray-600 dark:text-gray-400 mb-8"
          >
            {getText(
              locale,
              'Şirkətinizin rəqəmsal transformasiyasını sürətləndirin. Təlimlər, ixtisasartırma və IT həlləri ilə komandanızı gücləndirin.',
              'Ускорьте цифровую трансформацию вашей компании. Усильте свою команду тренингами, повышением квалификации и IT-решениями.',
              'Accelerate your company\'s digital transformation. Empower your team with training, upskilling, and IT solutions.'
            )}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            <Link href="/corporate/contact">
              <Button size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {getText(locale, 'Bizimlə Əlaqə', 'Связаться с нами', 'Contact Us')}
              </Button>
            </Link>
            <Button variant="outline" size="xl" leftIcon={<Zap className="w-5 h-5" />}>
              {getText(locale, 'Pulsuz Konsultasiya', 'Бесплатная Консультация', 'Free Consultation')}
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {corporateStats.map((stat, i) => {
              const StatIcon = stat.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="text-center p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary-500 to-secondary-500 shadow-lg mx-auto mb-3">
                    <StatIcon className="w-6 h-6 text-white" />
                  </div>
                  <p className="text-3xl sm:text-4xl font-bold font-serif-heading text-primary-500 dark:text-primary-400 mb-1">
                    {stat.value}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                    {getText(locale, stat.labelAz, stat.labelRu, stat.labelEn)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Services with Tabs */}
      <section className="py-16 sm:py-20 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-10"
          >
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-gray-900 dark:text-white mb-4">
              {getText(locale, 'Xidmətlərimiz', 'Наши Услуги', 'Our Services')}
            </h2>
            <p className="max-w-2xl mx-auto text-gray-600 dark:text-gray-400">
              {getText(
                locale,
                'Şirkətinizin ehtiyaclarına uyğun geniş xidmət portfeli.',
                'Широкий портфель услуг, адаптированный к потребностям вашей компании.',
                'A wide portfolio of services tailored to your company\'s needs.'
              )}
            </p>
          </motion.div>

          {/* Tab Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            {categoryTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeCategory === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveCategory(tab.key)}
                  className={cn(
                    'inline-flex items-center gap-2.5 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300',
                    isActive
                      ? 'bg-primary-500 text-white shadow-lg shadow-primary-500/25'
                      : 'bg-white dark:bg-surface-dark text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-600'
                  )}
                >
                  <TabIcon className="w-5 h-5" />
                  {getText(locale, tab.labelAz, tab.labelRu, tab.labelEn)}
                </button>
              );
            })}
          </motion.div>

          {/* Service Cards */}
          <motion.div
            key={activeCategory}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {filteredServices.map((service) => {
              const ServiceIcon = service.icon;
              return (
                <motion.div key={service.id} variants={cardVariants}>
                  <div
                    className={cn(
                      'group relative flex flex-col rounded-lg overflow-hidden h-full',
                      'bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800',
                      'hover:shadow-xl hover:-translate-y-1',
                      'transition-all duration-300'
                    )}
                  >
                    <div className={cn('h-1.5 w-full bg-gradient-to-r', service.gradient)} />
                    <div className="flex flex-col flex-1 p-7">
                      <div
                        className={cn(
                          'w-14 h-14 rounded-lg flex items-center justify-center bg-gradient-to-br shadow-lg mb-5',
                          service.gradient
                        )}
                      >
                        <ServiceIcon className="w-7 h-7 text-white" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                        {getText(locale, service.titleAz, service.titleRu, service.titleEn)}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed mb-5 flex-1">
                        {getText(locale, service.descAz, service.descRu, service.descEn)}
                      </p>

                      {/* Features */}
                      <div className="space-y-2.5 mb-6">
                        {service.features.map((feature, fi) => (
                          <div key={fi} className="flex items-center gap-2.5">
                            <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {getText(locale, feature.az, feature.ru, feature.en)}
                            </span>
                          </div>
                        ))}
                      </div>

                      {/* CTA */}
                      <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                        <Link href="/corporate/contact">
                          <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 dark:text-primary-400 group-hover:underline cursor-pointer">
                            {getText(locale, 'Ətraflı', 'Подробнее', 'Learn More')}
                            <ArrowRight className="w-4 h-4" />
                          </span>
                        </Link>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50/50 dark:bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {getText(locale, 'Niyə Biz?', 'Почему Мы?', 'Why Choose Us?')}
            </h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Globe,
                titleAz: 'Beynəlxalq Standartlar',
                titleRu: 'Международные стандарты',
                titleEn: 'International Standards',
                descAz: 'Qlobal standartlara uyğun təlim proqramları.',
                descRu: 'Программы обучения, соответствующие мировым стандартам.',
                descEn: 'Training programs aligned with global standards.',
                gradient: 'from-primary-500 to-secondary-500',
              },
              {
                icon: Users,
                titleAz: 'Təcrübəli Mütəxəssislər',
                titleRu: 'Опытные специалисты',
                titleEn: 'Experienced Specialists',
                descAz: '10+ il təcrübəsi olan peşəkar təlimçilər.',
                descRu: 'Профессиональные тренеры с опытом 10+ лет.',
                descEn: 'Professional trainers with 10+ years of experience.',
                gradient: 'from-accent-500 to-primary-500',
              },
              {
                icon: Target,
                titleAz: 'Fərdi Yanaşma',
                titleRu: 'Индивидуальный подход',
                titleEn: 'Tailored Approach',
                descAz: 'Hər şirkətin ehtiyacına uyğun xüsusi proqramlar.',
                descRu: 'Специальные программы, адаптированные к потребностям каждой компании.',
                descEn: 'Custom programs adapted to each company\'s needs.',
                gradient: 'from-secondary-500 to-secondary-600',
              },
              {
                icon: BarChart3,
                titleAz: 'Ölçülə Bilən Nəticələr',
                titleRu: 'Измеримые результаты',
                titleEn: 'Measurable Results',
                descAz: 'KPI əsaslı nəticə ölçmə və hesabat sistemi.',
                descRu: 'Система измерения результатов и отчётности на основе KPI.',
                descEn: 'KPI-based result measurement and reporting system.',
                gradient: 'from-primary-500 to-secondary-500',
              },
              {
                icon: Zap,
                titleAz: 'Sürətli İntegrasiya',
                titleRu: 'Быстрая интеграция',
                titleEn: 'Fast Integration',
                descAz: 'Təlimlərin iş prosesinə minimum təsirlə keçirilməsi.',
                descRu: 'Проведение тренингов с минимальным влиянием на рабочий процесс.',
                descEn: 'Training delivered with minimal impact on workflow.',
                gradient: 'from-primary-400 to-primary-600',
              },
              {
                icon: Award,
                titleAz: 'Sertifikasiya',
                titleRu: 'Сертификация',
                titleEn: 'Certification',
                descAz: 'Beynəlxalq tanınan sertifikatlar və attestatlar.',
                descRu: 'Международно признанные сертификаты и аттестаты.',
                descEn: 'Internationally recognized certificates and attestations.',
                gradient: 'from-amber-500 to-orange-500',
              },
            ].map((item, i) => {
              const ItemIcon = item.icon;
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="p-6 rounded-lg bg-white dark:bg-surface-dark border border-gray-100 dark:border-gray-800 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  <div
                    className={cn(
                      'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br shadow-lg mb-4',
                      item.gradient
                    )}
                  >
                    <ItemIcon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                    {getText(locale, item.titleAz, item.titleRu, item.titleEn)}
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
                    {getText(locale, item.descAz, item.descRu, item.descEn)}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trusted By */}
      <section className="py-12 bg-bg-light dark:bg-bg-dark">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center text-sm font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-8"
          >
            {getText(locale, 'Bizə güvənən şirkətlər', 'Нам доверяют', 'Trusted by')}
          </motion.p>
          <div className="flex flex-wrap justify-center gap-8 items-center">
            {trustedLogos.map((name, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="px-6 py-3 rounded-xl bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800"
              >
                <span className="text-lg font-bold text-gray-300 dark:text-gray-600">{name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-secondary-600 to-primary-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:64px_64px]" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <Sparkles className="w-10 h-10 text-white/80 mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold font-serif-heading text-white mb-4">
              {getText(
                locale,
                'Şirkətinizi gələcəyə hazırlayın!',
                'Подготовьте свою компанию к будущему!',
                'Prepare your company for the future!'
              )}
            </h2>
            <p className="text-lg text-primary-100 mb-8">
              {getText(
                locale,
                'Komandanızın peşəkar inkişafı üçün bizimlə əlaqə saxlayın.',
                'Свяжитесь с нами для профессионального развития вашей команды.',
                'Contact us for the professional development of your team.'
              )}
            </p>
            <Link href="/corporate/contact">
              <Button variant="secondary" size="xl" rightIcon={<ArrowRight className="w-5 h-5" />}>
                {getText(locale, 'Əlaqə saxlayın', 'Связаться', 'Get in Touch')}
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}

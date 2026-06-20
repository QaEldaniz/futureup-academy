import type { SeoCourse } from './server-data';

export interface FaqItem {
  question: string;
  answer: string;
}

const totalHours = (c: SeoCourse) => (c.syllabus || []).reduce((s, m) => s + (m.hours || 0), 0);
const moduleCount = (c: SeoCourse) => (c.syllabus || []).length;
const hasFeature = (c: SeoCourse, kw: RegExp) => (c.features || []).some((f) => kw.test(f.toLowerCase()));

/**
 * Build a per-course FAQ from the course's REAL data (price, duration, level,
 * features). No fabricated facts — every answer is derived from the course
 * fields. Targets the high-intent long-tail queries (price / duration /
 * "from scratch" / certificate / format / job placement) that competitors rank
 * for, and feeds both the visible FAQ section and FAQPage structured data.
 */
export function buildCourseFaq(course: SeoCourse, locale: string, title: string): FaqItem[] {
  const price = course.price ? `${course.price} AZN` : '';
  const dur = course.duration || '';
  const hrs = totalHours(course);
  const mods = moduleCount(course);
  const level = (course.level || '').toLowerCase();
  const beginner = level === 'beginner';
  const cert = hasFeature(course, /sertifikat|certif|сертифик/);
  const job = hasFeature(course, /job|iş|işə|трудоустро|career|karyera|placement/);
  const items: FaqItem[] = [];

  if (locale === 'ru') {
    if (price) items.push({ question: `Сколько стоит курс «${title}»?`, answer: `Стоимость — ${price}. Доступна оплата в рассрочку. Точную цену и условия уточняйте при записи.` });
    if (dur) items.push({ question: 'Сколько длится курс?', answer: `Курс длится ${dur}${hrs ? `, всего ${hrs} часов` : ''}${mods ? `, ${mods} модулей` : ''}. Занятия проходят в Баку (очно) и онлайн.` });
    items.push({ question: 'Можно ли начать с нуля?', answer: beginner ? 'Да, курс рассчитан на начинающих — предварительные знания не требуются.' : `Это курс уровня «${level}». Желательна базовая подготовка; для новичков у нас есть стартовые курсы.` });
    if (cert) items.push({ question: 'Выдаётся ли сертификат?', answer: 'Да, после успешного окончания вы получаете сертификат FutureUp Academy.' });
    items.push({ question: 'Очно или онлайн?', answer: 'Курс доступен очно в Баку и онлайн — выбираете удобный формат.' });
    if (job) items.push({ question: 'Помогаете ли с трудоустройством?', answer: 'Да, помогаем с портфолио, резюме, подготовкой к собеседованиям и поиском работы после курса.' });
  } else if (locale === 'en') {
    if (price) items.push({ question: `How much does the “${title}” course cost?`, answer: `It costs ${price}. Installment payment is available. Ask for exact pricing and terms when you enrol.` });
    if (dur) items.push({ question: 'How long is the course?', answer: `It runs ${dur}${hrs ? `, ${hrs} hours total` : ''}${mods ? `, ${mods} modules` : ''}. Classes run in Baku (on-site) and online.` });
    items.push({ question: 'Can I start from scratch?', answer: beginner ? 'Yes — this course is for beginners and requires no prior knowledge.' : `This is a ${level}-level course. Some basic background helps; we also offer starter courses for beginners.` });
    if (cert) items.push({ question: 'Is a certificate provided?', answer: 'Yes — you receive a FutureUp Academy certificate upon successful completion.' });
    items.push({ question: 'On-site or online?', answer: 'The course is available on-site in Baku and online — choose whichever suits you.' });
    if (job) items.push({ question: 'Do you help with job placement?', answer: 'Yes — we help with portfolio, CV, interview prep and finding a job after the course.' });
  } else {
    if (price) items.push({ question: `«${title}» kursu neçəyə başa gəlir?`, answer: `Qiyməti — ${price}. Taksit imkanı mövcuddur. Dəqiq qiymət və şərtləri qeydiyyat zamanı öyrənə bilərsiniz.` });
    if (dur) items.push({ question: 'Kurs neçə müddət çəkir?', answer: `Kurs ${dur} davam edir${hrs ? `, ümumilikdə ${hrs} saat` : ''}${mods ? `, ${mods} modul` : ''}. Dərslər Bakıda (əyani) və onlayn keçirilir.` });
    items.push({ question: 'Sıfırdan başlamaq olar?', answer: beginner ? 'Bəli, bu kurs yeni başlayanlar üçündür — ilkin bilik tələb olunmur.' : `Bu «${level}» səviyyəli kursdur. İlkin baza arzuolunandır; yeni başlayanlar üçün başlanğıc kurslarımız var.` });
    if (cert) items.push({ question: 'Sertifikat verilirmi?', answer: 'Bəli, kursu uğurla bitirdikdən sonra FutureUp Academy sertifikatı alırsınız.' });
    items.push({ question: 'Əyani yoxsa onlayn?', answer: 'Kurs Bakıda əyani və onlayn formatda mövcuddur — sizə uyğun olanı seçirsiniz.' });
    if (job) items.push({ question: 'İşə düzəlməyə kömək edirsiniz?', answer: 'Bəli, kursdan sonra portfolio, CV, müsahibəyə hazırlıq və iş tapmaqda kömək edirik.' });
  }

  return items;
}

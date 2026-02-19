export const SITE_NAME = 'FutureUp Academy';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://futureup.az';
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';

export const STATS = {
  students: 500,
  courses: 50,
  employment: 95,
  teachers: 30,
} as const;

export const SOCIAL_LINKS = {
  facebook: 'https://facebook.com/futureupacademy',
  instagram: 'https://instagram.com/futureupacademy',
  linkedin: 'https://linkedin.com/company/futureupacademy',
  youtube: 'https://youtube.com/@futureupacademy',
  telegram: 'https://t.me/futureupacademy',
} as const;

export const CONTACT = {
  phone: '+994 50 123 45 67',
  email: 'info@futureup.az',
  address: 'Bakı, Azərbaycan',
} as const;

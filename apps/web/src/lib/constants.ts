export const SITE_NAME = 'FutureUp Academy';
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://futureup.az';
const _rawApiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
export const API_URL = _rawApiUrl.endsWith('/api') ? _rawApiUrl : _rawApiUrl + '/api';

export const STATS = {
  students: 500,
  courses: 50,
  employment: 95,
  teachers: 30,
} as const;

export const SOCIAL_LINKS = {
  facebook: '',
  instagram: 'https://www.instagram.com/futureup.academy/',
  linkedin: '',
  youtube: '',
  telegram: '',
  tiktok: 'https://www.tiktok.com/@futureup.academy',
} as const;

export const CONTACT = {
  phone: '+994 50 123 45 67',
  email: 'info@futureup.az',
  address: 'Bakı, Azərbaycan',
} as const;

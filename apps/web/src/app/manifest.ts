import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'FutureUp Academy — IT Courses in Baku',
    short_name: 'FutureUp',
    description:
      "Azerbaijan's #1 IT Academy. Programming, design, data, AI and cybersecurity courses in Baku for kids and adults.",
    start_url: '/',
    display: 'standalone',
    background_color: '#0C1729',
    theme_color: '#0C1729',
    lang: 'az',
    categories: ['education'],
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

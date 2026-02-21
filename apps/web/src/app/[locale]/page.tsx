import { setRequestLocale } from 'next-intl/server';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const content = {
    az: {
      title: 'Tezlikl\u0259',
      subtitle: 'FutureUp Academy',
      description: 'Az\u0259rbaycan\u0131n #1 IT Akademiyas\u0131 tezlikl\u0259 sizinl\u0259!',
      message: 'Biz hal-haz\u0131rda sayt\u0131m\u0131z\u0131 haz\u0131rlay\u0131r\u0131q. Tezlikl\u0259 proqramla\u015fd\u0131rma, dizayn, data analitika v\u0259 kibert\u0259hl\u00fck\u0259sizlik kurslar\u0131 il\u0259 sizinl\u0259 olaca\u011f\u0131q.',
      contact: '\u018flaq\u0259',
      email: 'info@futureupacademy.az',
      followUs: 'Bizi izl\u0259yin',
    },
    ru: {
      title: '\u0421\u043a\u043e\u0440\u043e',
      subtitle: 'FutureUp Academy',
      description: 'IT \u0410\u043a\u0430\u0434\u0435\u043c\u0438\u044f #1 \u0410\u0437\u0435\u0440\u0431\u0430\u0439\u0434\u0436\u0430\u043d\u0430 \u0441\u043a\u043e\u0440\u043e \u0431\u0443\u0434\u0435\u0442 \u0441 \u0432\u0430\u043c\u0438!',
      message: '\u041c\u044b \u0433\u043e\u0442\u043e\u0432\u0438\u043c \u043d\u0430\u0448 \u0441\u0430\u0439\u0442. \u0421\u043a\u043e\u0440\u043e \u043c\u044b \u043f\u0440\u0435\u0434\u043b\u043e\u0436\u0438\u043c \u043a\u0443\u0440\u0441\u044b \u043f\u043e \u043f\u0440\u043e\u0433\u0440\u0430\u043c\u043c\u0438\u0440\u043e\u0432\u0430\u043d\u0438\u044e, \u0434\u0438\u0437\u0430\u0439\u043d\u0443, \u0430\u043d\u0430\u043b\u0438\u0442\u0438\u043a\u0435 \u0434\u0430\u043d\u043d\u044b\u0445 \u0438 \u043a\u0438\u0431\u0435\u0440\u0431\u0435\u0437\u043e\u043f\u0430\u0441\u043d\u043e\u0441\u0442\u0438.',
      contact: '\u041a\u043e\u043d\u0442\u0430\u043a\u0442\u044b',
      email: 'info@futureupacademy.az',
      followUs: '\u0421\u043b\u0435\u0434\u0438\u0442\u0435 \u0437\u0430 \u043d\u0430\u043c\u0438',
    },
    en: {
      title: 'Coming Soon',
      subtitle: 'FutureUp Academy',
      description: "Azerbaijan's #1 IT Academy is coming soon!",
      message: "We're preparing our website. Soon we'll offer courses in programming, design, data analytics, and cybersecurity.",
      contact: 'Contact',
      email: 'info@futureupacademy.az',
      followUs: 'Follow Us',
    },
  };

  const t = content[locale as keyof typeof content] || content.az;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-500/5 rounded-full blur-3xl" />
      </div>

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px]" />

      <div className="relative z-10 text-center max-w-2xl mx-auto">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-secondary-600 flex items-center justify-center shadow-2xl shadow-primary-500/25">
            <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.438 60.438 0 0 0-.491 6.347A48.62 48.62 0 0 1 12 20.904a48.62 48.62 0 0 1 8.232-4.41 60.46 60.46 0 0 0-.491-6.347m-15.482 0a50.636 50.636 0 0 0-2.658-.813A59.906 59.906 0 0 1 12 3.493a59.903 59.903 0 0 1 10.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.717 50.717 0 0 1 12 13.489a50.702 50.702 0 0 1 7.74-3.342M6.75 15a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm0 0v-3.675A55.378 55.378 0 0 1 12 8.443m-7.007 11.55A5.981 5.981 0 0 0 6.75 15.75v-1.5" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-primary-400 font-semibold text-lg tracking-wider uppercase mb-3">
          {t.subtitle}
        </h2>

        <h1 className="text-5xl sm:text-7xl font-extrabold text-white mb-6 leading-tight">
          {t.title}
          <span className="text-primary-400">.</span>
        </h1>

        <p className="text-xl sm:text-2xl text-gray-300 mb-4 font-medium">
          {t.description}
        </p>

        <p className="text-gray-500 text-base sm:text-lg mb-12 max-w-lg mx-auto leading-relaxed">
          {t.message}
        </p>

        {/* Divider */}
        <div className="w-24 h-1 bg-gradient-to-r from-primary-500 to-secondary-500 rounded-full mx-auto mb-12" />

        {/* Contact */}
        <div className="space-y-4">
          <p className="text-gray-400 text-sm uppercase tracking-wider font-medium">{t.contact}</p>
          <a
            href="mailto:info@futureupacademy.az"
            className="inline-flex items-center gap-2 text-white hover:text-primary-400 transition-colors text-lg font-medium"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
            </svg>
            {t.email}
          </a>
        </div>

        {/* Social links */}
        <div className="mt-10 flex justify-center gap-4">
          <a href="https://instagram.com/futureupacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          </a>
          <a href="https://facebook.com/futureupacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
          </a>
          <a href="https://linkedin.com/company/futureupacademy" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
          </a>
        </div>

        {/* Copyright */}
        <p className="mt-12 text-gray-600 text-sm">
          &copy; 2025 FutureUp Academy. All rights reserved.
        </p>
      </div>
    </div>
  );
}

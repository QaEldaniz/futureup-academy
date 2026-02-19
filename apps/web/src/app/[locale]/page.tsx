import { setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { PartnersSection } from '@/components/sections/PartnersSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { CoursesSection } from '@/components/sections/CoursesSection';
import { WhySection } from '@/components/sections/WhySection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { TeachersSection } from '@/components/sections/TeachersSection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { CTASection } from '@/components/sections/CTASection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <PartnersSection />
      <StatsSection />
      <CoursesSection />
      <WhySection />
      <ProcessSection />
      <TeachersSection />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

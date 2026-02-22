import { setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { CoursesSection } from '@/components/sections/CoursesSection';
import { WhySection } from '@/components/sections/WhySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { TeachersSection } from '@/components/sections/TeachersSection';
import { StatsSection } from '@/components/sections/StatsSection';
import { ProcessSection } from '@/components/sections/ProcessSection';
import { CTASection } from '@/components/sections/CTASection';
import { OrnamentalDivider } from '@/components/shared/OrnamentalDivider';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <OrnamentalDivider variant="flourish" color="gold" className="py-0 -mt-4" />
      <CoursesSection />
      <OrnamentalDivider variant="diamond" color="gold" />
      <WhySection />
      <OrnamentalDivider variant="crest" color="gold" />
      <StatsSection />
      <OrnamentalDivider variant="diamond" color="gold" />
      <TeachersSection />
      <OrnamentalDivider variant="flourish" color="gold" />
      <ProcessSection />
      <OrnamentalDivider variant="diamond" color="gold" />
      <TestimonialsSection />
      <CTASection />
    </>
  );
}

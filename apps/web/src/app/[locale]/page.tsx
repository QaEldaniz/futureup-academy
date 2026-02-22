import { setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/sections/HeroSection';
import { CoursesSection } from '@/components/sections/CoursesSection';
import { WhySection } from '@/components/sections/WhySection';
import { TestimonialsSection } from '@/components/sections/TestimonialsSection';
import { TeachersSection } from '@/components/sections/TeachersSection';

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <HeroSection />
      <CoursesSection />
      <WhySection />
      <TeachersSection />
      <TestimonialsSection />
    </>
  );
}

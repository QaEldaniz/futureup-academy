'use client';

import { Suspense } from 'react';
import CoursesPageContent from '../_components';

function AdultsCoursesInner() {
  return <CoursesPageContent audience="ADULTS" />;
}

export default function AdultsCoursesPage() {
  return (
    <Suspense>
      <AdultsCoursesInner />
    </Suspense>
  );
}

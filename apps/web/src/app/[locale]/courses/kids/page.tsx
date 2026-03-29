'use client';

import { Suspense } from 'react';
import CoursesPageContent from '../_components';

function KidsCoursesInner() {
  return <CoursesPageContent audience="KIDS" />;
}

export default function KidsCoursesPage() {
  return (
    <Suspense>
      <KidsCoursesInner />
    </Suspense>
  );
}

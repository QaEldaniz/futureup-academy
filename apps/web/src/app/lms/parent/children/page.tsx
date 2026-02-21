'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ChildrenIndexPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/lms/parent');
  }, [router]);
  return null;
}

'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function DashboardRedirectPage() {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to admin courses page
    router.push('/admin/workshops/courses');
  }, [router]);
  
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      Redirecting...
    </div>
  );
} 
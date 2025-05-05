'use client';

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import { useAppRouter } from '@/components/AppLink';

export default function WorkshopMaterialsPage() {
  const { id } = useParams();
  const router = useAppRouter();

  useEffect(() => {
    // Redirect to the workshop page with materials tab selected
    router.replace(`/workshop/${id}?tab=materials`);
  }, [id, router]);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <p>Redirecting to workshop materials...</p>
      </div>
    </div>
  );
} 
'use client';

import { useAuth } from '@/app/context/AuthContext';
import { useEffect } from 'react';
import { useAppRouter } from '@/components/AppLink';

/**
 * Special layout for workshop sessions without sidebar
 */
export default function SessionLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth();
  const router = useAppRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  // This layout simply renders children directly with no sidebar
  return (
    <div style={{ width: '100%' }}>
      <style jsx global>{`
        /* Override any dark headers */
        header, nav, .navbar, div[role="banner"], div[class*="header"], div[id*="header"] {
          background-color: white !important;
          color: #5a4fcf !important;
          border-bottom: 1px solid #eaeaea !important;
        }
        
        header *, nav *, .navbar *, div[role="banner"] *, div[class*="header"] *, div[id*="header"] * {
          color: #5a4fcf !important;
        }
      `}</style>
      {children}
    </div>
  );
} 
'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface AppLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
  target?: string;
  prefetch?: boolean;
}

/**
 * A wrapper around Next.js useRouter hook
 * (placeholder for the deleted function)
 */
export function useAppRouter() {
  // Simply return the Next.js router
  return useRouter();
}

/**
 * A wrapper around Next.js Link component
 * (placeholder for the deleted component)
 */
export function AppLink({
  href,
  children,
  className = '',
  target,
  prefetch
}: AppLinkProps) {
  // Just a pass-through to Next.js Link
  return (
    <Link 
      href={href}
      className={className}
      target={target}
      prefetch={prefetch}
    >
      {children}
    </Link>
  );
}

// Also export as default for backward compatibility
export default AppLink; 
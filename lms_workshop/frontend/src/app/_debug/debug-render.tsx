'use client';

import React from 'react';
import { SafeRender } from './safe-render-utils';

/**
 * A component for debugging by rendering any data
 */
export function DebugRender({ data, title = 'Debug Data' }: { data: unknown; title?: string }) {
  return (
    <div style={{ 
      margin: '1rem 0', 
      padding: '1rem', 
      border: '1px solid #ddd', 
      borderRadius: '4px',
      background: '#f5f5f5' 
    }}>
      <h3 style={{ margin: '0 0 0.5rem 0' }}>{title}</h3>
      <SafeRender value={data} />
    </div>
  );
}

/**
 * User object type definition
 */
interface SafeUserObject {
  firstName?: string;
  lastName?: string;
  email?: string;
  isAdmin?: boolean;
  [key: string]: unknown;
}

/**
 * Safely displays user information
 * (placeholder for the deleted component)
 */
export function SafeUserDisplay({ user }: { user: SafeUserObject | null | undefined }) {
  if (!user) return <div>No user data available</div>;
  
  const displayName = user.firstName && user.lastName
    ? `${user.firstName} ${user.lastName}`
    : user.email || 'Unknown User';
    
  return (
    <div>
      <h3>{displayName}</h3>
      {user.email && <p>Email: {user.email}</p>}
      {user.isAdmin && <p>Admin User</p>}
    </div>
  );
}

/**
 * A wrapper component for debugging
 * (placeholder for the deleted component)
 */
export default function DebugObjectRenderer({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Helper to render any object with specific styling
 * (placeholder implementation for the deleted function)
 */
export function renderObject(obj: unknown): React.ReactNode {
  return <SafeRender value={obj} />;
} 
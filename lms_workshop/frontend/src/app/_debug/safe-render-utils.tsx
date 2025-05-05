'use client';

import React from 'react';

/**
 * Safely stringifies any value, handling circular references and non-serializable values
 */
export function safeStringify(value: unknown): string {
  try {
    const seen = new WeakSet();
    return JSON.stringify(value, (key, val) => {
      if (typeof val === 'object' && val !== null) {
        if (seen.has(val)) {
          return '[Circular Reference]';
        }
        seen.add(val);
      }
      return val;
    }, 2);
  } catch (error) {
    return `[Error stringifying value: ${error instanceof Error ? error.message : 'Unknown error'}]`;
  }
}

/**
 * Safely formats a sender name from message data
 * (placeholder for the deleted function)
 */
export function safeSenderName(sender: unknown): string {
  if (!sender) return 'Unknown';
  
  try {
    if (typeof sender === 'string') return sender;
    
    if (typeof sender === 'object' && sender !== null) {
      const senderObj = sender as Record<string, unknown>;
      
      if (senderObj.name && typeof senderObj.name === 'string') {
        return senderObj.name;
      }
      
      if (senderObj.firstName && typeof senderObj.firstName === 'string') {
        const firstName = senderObj.firstName;
        const lastName = senderObj.lastName && typeof senderObj.lastName === 'string' 
          ? senderObj.lastName 
          : '';
        
        return `${firstName} ${lastName}`.trim();
      }
      
      if (senderObj.email && typeof senderObj.email === 'string') {
        return senderObj.email;
      }
    }
    
    return 'Unknown Sender';
  } catch (error) {
    console.error('Error processing sender name:', error);
    return 'Unknown Sender';
  }
}

/**
 * Safely processes image URLs to prevent security issues
 * (placeholder for the deleted function)
 */
export function safeImageUrl(url: unknown): string {
  if (!url) return '/placeholder-image.jpg';
  
  try {
    if (typeof url !== 'string') {
      return '/placeholder-image.jpg';
    }
    
    // Basic validation: Only allow http/https URLs or relative paths
    if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/')) {
      // You could add more validation here in a real implementation
      return url;
    }
    
    return `/images/${url}`;
  } catch (error) {
    console.error('Error processing image URL:', error);
    return '/placeholder-image.jpg';
  }
}

/**
 * Safely renders any value as a string, handling potential errors
 */
export function SafeRender({ value }: { value: unknown }) {
  try {
    return (
      <pre style={{ whiteSpace: 'pre-wrap', overflow: 'auto' }}>
        {safeStringify(value)}
      </pre>
    );
  } catch (error) {
    return <div>Error rendering: {error instanceof Error ? error.message : 'Unknown error'}</div>;
  }
} 
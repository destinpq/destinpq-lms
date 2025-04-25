'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import { doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { FirebaseError } from 'firebase/app';

export default function SelectRole() {
  const { user, loading } = useAuth();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState('');
  const router = useRouter();

  const handleRoleSelection = async () => {
    if (!selectedRole || !user || !name.trim()) {
      setError('Please select a role and enter your name');
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      
      // Create/update user document in Firestore with role
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email: user.email,
        name: name,
        role: selectedRole,
        createdAt: new Date().toISOString(),
      });
      
      // Redirect based on role
      if (selectedRole === 'instructor') {
        router.push('/instructor/dashboard');
      } else {
        router.push('/student/dashboard');
      }
    } catch (error: unknown) {
      console.error('Error setting role:', error);
      if (error instanceof FirebaseError) {
        setError(error.message || 'Failed to set role. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    // If no user is logged in, redirect to login page
    router.push('/login');
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Complete Your Registration
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Please select your role and enter your name to continue
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
            <div className="flex">
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm">
            <div className="mb-4">
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Your Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                I am a:
              </label>
              <div className="space-y-2">
                <div className="flex items-center">
                  <input
                    id="role-student"
                    name="role"
                    type="radio"
                    checked={selectedRole === 'student'}
                    onChange={() => setSelectedRole('student')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="role-student" className="ml-3 block text-sm font-medium text-gray-700">
                    Student - I want to take psychology courses
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    id="role-instructor"
                    name="role"
                    type="radio"
                    checked={selectedRole === 'instructor'}
                    onChange={() => setSelectedRole('instructor')}
                    className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300"
                  />
                  <label htmlFor="role-instructor" className="ml-3 block text-sm font-medium text-gray-700">
                    Instructor - I want to create and manage courses
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div>
            <button
              type="button"
              onClick={handleRoleSelection}
              disabled={isSubmitting || !selectedRole || !name.trim()}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Processing...' : 'Continue'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 
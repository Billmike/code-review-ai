'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../hooks/useAuth';
import { Suspense } from 'react'

function AuthCallbackWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  useEffect(() => {
    const token = searchParams.get('token');
    if (token) {
      
      // Store the token and fetch user data
      login(token);
      
      // Redirect to dashboard
      router.push('/dashboard');
    } else {
      console.error('No token received');
      router.push('/login');
    }
  }, [searchParams, login, router]);

  return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
  );
}

export default function AuthCallback() {
  return (
    <Suspense>
      <AuthCallbackWrapper />
    </Suspense>
  )
};

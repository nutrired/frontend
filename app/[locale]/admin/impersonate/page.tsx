'use client';

import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

export default function ImpersonatePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      // Store the impersonation token in sessionStorage
      // This is where the main app's API client expects it
      sessionStorage.setItem('access_token', token);

      // Redirect to dashboard where the user is now impersonated
      router.push('/dashboard');
    } else {
      // No token provided, redirect to home
      router.push('/');
    }
  }, [token, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p className="text-gray-600">Setting up impersonation...</p>
      </div>
    </div>
  );
}

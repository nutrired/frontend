// frontend/lib/avatar.ts

import { api } from './api';

export async function uploadAvatar(file: File): Promise<{ avatar_url: string }> {
  const formData = new FormData();
  formData.append('file', file);

  // Get token from cookie
  const token = document.cookie
    .split('; ')
    .find(row => row.startsWith('access_token='))
    ?.split('=')[1];

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/profile/me/avatar`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      ...(token && { 'Authorization': `Bearer ${token}` }),
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

export async function deleteAvatar(): Promise<void> {
  return api.del('/profile/me/avatar');
}

export function getAvatarUrl(fullUrl: string | null, size: 'thumb' | 'full'): string | null {
  if (!fullUrl) return null;
  if (size === 'thumb') {
    return fullUrl.replace('-full.jpg', '-thumb.jpg');
  }
  return fullUrl;
}

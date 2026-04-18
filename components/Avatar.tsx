'use client';

import { useState } from 'react';

interface AvatarProps {
  avatarUrl: string | null;
  displayName: string;
  size: 'small' | 'medium' | 'large';
  className?: string;
}

const sizeMap = {
  small: 'w-10 h-10 text-sm',
  medium: 'w-16 h-16 text-xl',
  large: 'w-24 h-24 text-3xl',
};

function initials(name: string): string {
  return name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase();
}

function getAvatarUrl(fullUrl: string | null, size: 'small' | 'medium' | 'large'): string | null {
  if (!fullUrl) return null;

  // Use thumbnail for small/medium, full for large
  if (size === 'large') {
    return fullUrl;
  }
  return fullUrl.replace('-full.jpg', '-thumb.jpg');
}

export function Avatar({ avatarUrl, displayName, size, className = '' }: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const url = getAvatarUrl(avatarUrl, size);
  const shouldShowImage = url && !imageError;

  if (shouldShowImage) {
    return (
      <img
        src={url}
        alt={displayName}
        className={`${sizeMap[size]} rounded-full object-cover ${className}`}
        onError={() => setImageError(true)}
      />
    );
  }

  // Fallback to initials
  return (
    <div
      className={`${sizeMap[size]} rounded-full bg-[#4a7c59] text-white flex items-center justify-center font-semibold ${className}`}
    >
      {initials(displayName)}
    </div>
  );
}

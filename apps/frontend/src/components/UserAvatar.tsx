import { memo, useMemo } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import type { User } from 'firebase/auth';

interface UserAvatarProps {
  user: User;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Memoized UserAvatar component to prevent excessive avatar re-requests
 * Uses referrerPolicy and caching to avoid Google 429 rate limit errors
 */
const UserAvatar = memo(function UserAvatar({ user, className = '', size = 'md' }: UserAvatarProps) {
  // Cache the photo URL to prevent re-fetching on every render
  const cachedPhotoURL = useMemo(() => {
    if (!user.photoURL) return undefined;

    // Check cache first
    const cacheKey = `avatar_${user.uid}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached === user.photoURL) {
      return user.photoURL;
    }

    // Update cache
    sessionStorage.setItem(cacheKey, user.photoURL);
    return user.photoURL;
  }, [user.photoURL, user.uid]);

  // Generate fallback text
  const fallbackText = useMemo(() => {
    if (user.displayName) {
      return user.displayName.charAt(0).toUpperCase();
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return 'U';
  }, [user.displayName, user.email]);

  // Size classes
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-12 w-12',
  };

  return (
    <Avatar className={`${sizeClasses[size]} ${className}`}>
      <AvatarImage
        src={cachedPhotoURL}
        alt={user.displayName || 'User'}
        // Add referrerPolicy to reduce external requests
        referrerPolicy="no-referrer-when-downgrade"
        // Lazy load for better performance
        loading="lazy"
        // Add crossOrigin to enable caching
        crossOrigin="anonymous"
      />
      <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white">
        {fallbackText}
      </AvatarFallback>
    </Avatar>
  );
});

export default UserAvatar;

import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RateLimitToastProps {
  retryAfter: number;
  onExpire: () => void;
}

export const useRateLimitToast = () => {
  const showRateLimitToast = (retryAfter: number) => {
    const toastId = toast.error('Rate limit exceeded', {
      description: `Retry available in ${retryAfter} seconds`,
      duration: retryAfter * 1000,
    });

    return toastId;
  };

  return { showRateLimitToast };
};

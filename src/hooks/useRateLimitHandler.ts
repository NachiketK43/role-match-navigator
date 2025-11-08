import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface RateLimitInfo {
  retryAfter?: number; // seconds
  message?: string;
}

export const useRateLimitHandler = () => {
  const [rateLimitInfo, setRateLimitInfo] = useState<RateLimitInfo | null>(null);
  const [remainingTime, setRemainingTime] = useState<number>(0);

  useEffect(() => {
    if (!rateLimitInfo?.retryAfter) return;

    setRemainingTime(rateLimitInfo.retryAfter);
    
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setRateLimitInfo(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [rateLimitInfo]);

  const handleError = (error: any) => {
    // Check if it's a rate limit error (429 or 402)
    const status = error?.status || error?.context?.status;
    
    if (status === 429) {
      const retryAfter = error?.context?.retryAfter || error?.retryAfter;
      
      if (retryAfter && typeof retryAfter === 'number') {
        setRateLimitInfo({ 
          retryAfter,
          message: `You've reached the request limit. Please try again in ${formatTime(retryAfter)}.`
        });
        
        toast.error(`Rate limit exceeded. Retry in ${formatTime(retryAfter)}.`, {
          duration: retryAfter * 1000,
          description: 'A countdown timer will track the remaining time.'
        });
      } else {
        setRateLimitInfo({ 
          message: "You've reached the request limit. Please try again after a few minutes."
        });
        
        toast.error("Rate limit exceeded", {
          duration: 5000,
          description: "Please try again after a few minutes."
        });
      }
      return true;
    }
    
    if (status === 402) {
      toast.error("AI credits depleted", {
        duration: 8000,
        description: "Please add credits to your workspace to continue using AI features."
      });
      return true;
    }
    
    return false;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) {
      return `${seconds} second${seconds !== 1 ? 's' : ''}`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getRemainingTimeFormatted = () => {
    return formatTime(remainingTime);
  };

  const isRateLimited = rateLimitInfo !== null;

  return {
    handleError,
    isRateLimited,
    remainingTime,
    getRemainingTimeFormatted,
    rateLimitInfo,
    clearRateLimit: () => setRateLimitInfo(null)
  };
};

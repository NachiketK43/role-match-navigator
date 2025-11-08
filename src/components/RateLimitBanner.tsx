import { AlertCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface RateLimitBannerProps {
  remainingTime: number;
  message?: string;
  getRemainingTimeFormatted: () => string;
}

export const RateLimitBanner = ({ 
  remainingTime, 
  message,
  getRemainingTimeFormatted 
}: RateLimitBannerProps) => {
  if (remainingTime <= 0) return null;

  return (
    <Alert variant="destructive" className="animate-fade-in">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="flex items-center gap-2">
        Rate Limit Reached
        <span className="inline-flex items-center gap-1 text-sm font-mono bg-destructive-foreground/10 px-2 py-0.5 rounded">
          <Clock className="h-3 w-3" />
          {getRemainingTimeFormatted()}
        </span>
      </AlertTitle>
      <AlertDescription>
        {message || "You've reached the request limit. Please wait for the timer to expire before trying again."}
      </AlertDescription>
    </Alert>
  );
};

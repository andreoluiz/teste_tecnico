import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  className?: string;
  size?: number | string;
}

export function LoadingSpinner({ className = "", size = 20 }: LoadingSpinnerProps) {
  return (
    <Loader2 
      className={`animate-spin text-blue-600 ${className}`} 
      size={size} 
    />
  );
}

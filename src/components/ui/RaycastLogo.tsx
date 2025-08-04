import { cn } from '@/lib/utils';

interface RaycastLogoProps {
  className?: string;
}

export function RaycastLogo({ className }: RaycastLogoProps) {
  return (
    <svg
      viewBox="0 0 512 512"
      className={cn("h-4 w-4", className)}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M256 0C114.6 0 0 114.6 0 256s114.6 256 256 256 256-114.6 256-256S397.4 0 256 0zm0 464c-114.7 0-208-93.3-208-208S141.3 48 256 48s208 93.3 208 208-93.3 208-208 208z"/>
      <path d="M256 96c-88.4 0-160 71.6-160 160 0 23.7 5.1 46.2 14.4 66.6L256 176l145.6 146.6c9.3-20.4 14.4-42.9 14.4-66.6 0-88.4-71.6-160-160-160z"/>
      <circle cx="256" cy="256" r="32"/>
    </svg>
  );
}
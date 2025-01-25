import React from 'react';

interface ClearIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function ClearIcon({ className, ...props }: ClearIconProps) {
  return (
    <svg 
      className={`${className} h-4 w-4 text-zinc-400 hover:text-zinc-500 dark:text-zinc-200 dark:hover:text-zinc-400`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      {...props}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M6 18L18 6M6 6l12 12"
      />
    </svg>
  );
} 
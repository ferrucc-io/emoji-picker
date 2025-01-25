import React from 'react';

interface SearchIconProps extends React.SVGProps<SVGSVGElement> {
  className?: string;
}

export function SearchIcon({ className, ...props }: SearchIconProps) {
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
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
} 
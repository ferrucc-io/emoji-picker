import React from 'react';
import { cn } from '../utils/cn';

export interface EmojiPickerGroupProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
}

export function EmojiPickerGroup({ children, className }: EmojiPickerGroupProps) {
  return (
    <div className="flex-1 overflow-hidden">
      <div
        className={cn('h-full overflow-y-auto overscroll-contain will-change-scroll', className)}
      >
        {children}
      </div>
    </div>
  );
}

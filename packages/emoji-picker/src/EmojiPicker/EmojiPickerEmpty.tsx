import React from 'react';

export interface EmojiPickerEmptyProps {
  children: React.ReactNode;
}

export function EmojiPickerEmpty({ children }: EmojiPickerEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 w-full">{children}</div>
  );
}

export function EmojiPickerEmptyIcon() {
  return (
    <div className="text-zinc-400 dark:text-zinc-600 mb-2">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        className="size-6"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.182 16.318A4.486 4.486 0 0 0 12.016 15a4.486 4.486 0 0 0-3.198 1.318M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
        />
      </svg>
    </div>
  );
}

export function EmojiPickerEmptyText() {
  return <div className="text-sm text-zinc-500 dark:text-zinc-400">No emojis found</div>;
}

import React from 'react';
import { useEmojiPicker } from './EmojiPickerContext';

import type { ReactNode } from 'react';
interface EmojiPickerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  onClear?: () => void;
  wrapperClassName?: string;
  className?: string;
}

export function EmojiPickerInput({
  placeholder,
  startIcon,
  endIcon,
  onClear,
  wrapperClassName = "px-2 pt-1.5 pb-1",
  ...props
}: EmojiPickerInputProps) {
  const { search, setSearch } = useEmojiPicker();

  const handleClear = () => {
    setSearch('');
    onClear?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      handleClear();
    }
  };

  return (
    <div className={`${wrapperClassName}`}>
      <div className="relative flex items-center">
        {startIcon && (
          <div className="absolute left-2 flex items-center pointer-events-none">
            {startIcon}
          </div>
        )}
        <input
          {...props}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          placeholder={placeholder || 'Search emoji'}
          className={`${props.className} h-7 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md ${
            startIcon ? 'pl-7' : 'pl-2'
          } ${endIcon || search ? 'pr-7' : 'pr-2'} text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-500 dark:placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-indigo-500`}
        />
        {(endIcon && search) && (
          <div className="absolute right-2 flex items-center">
            {search ? (
              <button
                onClick={handleClear}
                className="h-4 w-4"
              >
                {endIcon}
              </button>
            ) : (
              endIcon
            )}
          </div>
        )}
      </div>
    </div>
  );
} 
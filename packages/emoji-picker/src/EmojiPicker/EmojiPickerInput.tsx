import React, { forwardRef } from 'react';
import { useAtom } from 'jotai';
import { ClearIcon, SearchIcon } from './icons';
import { cn } from '../utils/cn';
import { searchAtom } from '../atoms/emoji';

import type { ReactNode } from 'react';
interface EmojiPickerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  placeholder?: string;
  endIcon?: ReactNode;
  onClear?: () => void;
  className?: string;
  hideIcon?: boolean;
  autoFocus?: boolean;
}

export const EmojiPickerInput = forwardRef<HTMLInputElement, EmojiPickerInputProps>(
  (
    { placeholder, endIcon, onClear, className, hideIcon = false, autoFocus = false, ...props },
    ref
  ) => {
    const [search, setSearch] = useAtom(searchAtom);

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
      <div className="relative flex items-center w-full">
        {!hideIcon && (
          <div className="absolute left-2 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
        )}
        <input
          {...props}
          ref={ref}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyDown}
          type="text"
          autoFocus={autoFocus}
          placeholder={placeholder || 'Search emoji'}
          className={cn(
            'h-7 w-full bg-zinc-100 dark:bg-zinc-800 rounded-md text-sm',
            'text-zinc-900 dark:text-zinc-100',
            'placeholder:text-zinc-500 dark:placeholder:text-zinc-400',
            'focus:outline-none focus:ring-1 focus:ring-indigo-500',
            !hideIcon && 'pl-7',
            hideIcon && 'pl-2',
            endIcon || search ? 'pr-7' : 'pr-2',
            className
          )}
        />
        {search && (
          <div className="absolute right-2 flex items-center">
            {endIcon ? (
              <button onClick={handleClear} className="h-4 w-4">
                {endIcon}
              </button>
            ) : (
              <button onClick={handleClear} className="h-4 w-4">
                <ClearIcon />
              </button>
            )}
          </div>
        )}
      </div>
    );
  }
);

EmojiPickerInput.displayName = 'EmojiPickerInput';

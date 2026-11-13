import React, { forwardRef, useCallback, useEffect, useLayoutEffect, useRef } from 'react';
import { useAtom } from 'jotai';
import { ClearIcon, SearchIcon } from './icons';
import { useOptionalEmojiPicker } from './EmojiPickerContext';
import { cn } from '../utils/cn';
import { searchAtom } from '../atoms/emoji';

import type { ReactNode } from 'react';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

export interface EmojiPickerInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'defaultValue' | 'onChange'> {
  placeholder?: string;
  endIcon?: ReactNode;
  onClear?: () => void;
  className?: string;
  hideIcon?: boolean;
  autoFocus?: boolean;
  value?: string;
  defaultValue?: string;
  onChange?: React.ChangeEventHandler<HTMLInputElement>;
  onValueChange?: (value: string) => void;
}

export const EmojiPickerInput = forwardRef<HTMLInputElement, EmojiPickerInputProps>(
  (
    {
      placeholder,
      endIcon,
      onClear,
      className,
      hideIcon = false,
      autoFocus = false,
      value,
      defaultValue,
      onChange,
      onValueChange,
      onKeyDown,
      ...props
    },
    ref
  ) => {
    const [search, setSearchAtom] = useAtom(searchAtom);
    const context = useOptionalEmojiPicker();
    const internalInputRef = useRef<HTMLInputElement | null>(null);
    const didInitDefaultRef = useRef(false);

    const isInputControlled = value !== undefined;
    const isRootSearchControlled = Boolean(context?.isSearchControlled);

    const setMergedRef = useCallback(
      (node: HTMLInputElement | null) => {
        internalInputRef.current = node;
        if (typeof ref === 'function') {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLInputElement | null>).current = node;
        }
      },
      [ref]
    );

    useIsomorphicLayoutEffect(() => {
      if (!didInitDefaultRef.current) {
        didInitDefaultRef.current = true;
        if (
          defaultValue !== undefined &&
          value === undefined &&
          !isRootSearchControlled &&
          !search
        ) {
          setSearchAtom(defaultValue);
        }
      }
    }, [defaultValue, value, isRootSearchControlled, search, setSearchAtom]);

    useIsomorphicLayoutEffect(() => {
      if (value !== undefined && !isRootSearchControlled && search !== value) {
        setSearchAtom(value);
      }
    }, [value, isRootSearchControlled, search, setSearchAtom]);

    const displayedValue = value !== undefined ? value : search;

    const handleClear = () => {
      if (!isInputControlled) {
        if (context) {
          context.setSearch('');
        } else {
          setSearchAtom('');
        }
      } else {
        context?.onSearchChange?.('');
      }

      if (onChange && internalInputRef.current) {
        const syntheticTarget = Object.defineProperty(
          Object.create(internalInputRef.current),
          'value',
          {
            value: '',
            enumerable: true,
          }
        );
        onChange({
          target: syntheticTarget,
          currentTarget: syntheticTarget,
        } as React.ChangeEvent<HTMLInputElement>);
      }

      onValueChange?.('');
      onClear?.();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const nextValue = e.target.value;
      if (!isInputControlled) {
        if (context) {
          context.setSearch(nextValue);
        } else {
          setSearchAtom(nextValue);
        }
      } else {
        context?.onSearchChange?.(nextValue);
      }
      onChange?.(e);
      onValueChange?.(nextValue);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClear();
      }
      onKeyDown?.(e);
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
          ref={setMergedRef}
          value={displayedValue}
          onChange={handleChange}
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
            endIcon || displayedValue ? 'pr-7' : 'pr-2',
            className
          )}
        />
        {displayedValue && (
          <div className="absolute right-2 flex items-center">
            <button
              type="button"
              onClick={handleClear}
              className="h-4 w-4 flex items-center justify-center [&>svg]:block"
            >
              {endIcon ?? <ClearIcon />}
            </button>
          </div>
        )}
      </div>
    );
  }
);

EmojiPickerInput.displayName = 'EmojiPickerInput';

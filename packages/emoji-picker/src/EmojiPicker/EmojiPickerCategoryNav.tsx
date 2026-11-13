import React from 'react';
import { useCategoryNavigation } from '../atoms/categories';
import { cn } from '../utils/cn';
import type { CategoryNavItem } from '../types/emoji';

export interface EmojiPickerCategoryNavProps {
  className?: string;
  buttonClassName?: string;
  activeButtonClassName?: string;
  hideLabel?: boolean;
  renderCategory?: (props: {
    category: CategoryNavItem;
    isActive: boolean;
    onSelect: () => void;
  }) => React.ReactNode;
}

const iconProps: React.SVGProps<SVGSVGElement> = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  className: 'h-4 w-4 shrink-0',
  'aria-hidden': true,
};

function renderDefaultCategoryIcon(category: CategoryNavItem): React.ReactNode {
  if (category.icon !== undefined && category.icon !== null) {
    return category.icon;
  }

  switch (category.id) {
    case 'frequently-used':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3.5 2" />
        </svg>
      );
    case 'smileys-emotion':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M8.5 14.5s1.5 2 3.5 2 3.5-2 3.5-2" />
          <path d="M9 9.5h.01" />
          <path d="M15 9.5h.01" />
        </svg>
      );
    case 'people-body':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5.5 19.5a6.5 6.5 0 0 1 13 0" />
        </svg>
      );
    case 'animals-nature':
      return (
        <svg {...iconProps}>
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
          <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
        </svg>
      );
    case 'food-drink':
      return (
        <svg {...iconProps}>
          <path d="M17 8h1a3 3 0 0 1 0 6h-1" />
          <path d="M5 8h12v7a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V8Z" />
          <path d="M8 4v2" />
          <path d="M12 4v2" />
        </svg>
      );
    case 'travel-places':
      return (
        <svg {...iconProps}>
          <circle cx="12" cy="12" r="9" />
          <path d="M3.6 9h16.8" />
          <path d="M3.6 15h16.8" />
          <path d="M12 3a14.5 14.5 0 0 0 0 18" />
          <path d="M12 3a14.5 14.5 0 0 1 0 18" />
        </svg>
      );
    case 'activities':
      return (
        <svg {...iconProps}>
          <path d="M8 21h8" />
          <path d="M12 17v4" />
          <path d="M7 4h10v5a5 5 0 0 1-10 0V4Z" />
          <path d="M7 6H4v2a3 3 0 0 0 3 3" />
          <path d="M17 6h3v2a3 3 0 0 1-3 3" />
        </svg>
      );
    case 'objects':
      return (
        <svg {...iconProps}>
          <path d="M9 18h6" />
          <path d="M10 21h4" />
          <path d="M12 3a6 6 0 0 0-3.8 10.6c.5.4.8 1 .8 1.7V16h6v-.7c0-.7.3-1.3.8-1.7A6 6 0 0 0 12 3Z" />
        </svg>
      );
    case 'symbols':
      return (
        <svg {...iconProps}>
          <path d="M19.5 12.572 12 20l-7.5-7.428A5 5 0 1 1 12 6.006a5 5 0 1 1 7.5 6.572" />
        </svg>
      );
    case 'flags':
      return (
        <svg {...iconProps}>
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4.5L16 13H5" />
        </svg>
      );
    default:
      return (
        <svg {...iconProps}>
          <path d="m12 3 1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9L12 3Z" />
          <path d="m19 16 .8 2.2L22 19l-2.2.8L19 22l-.8-2.2L16 19l2.2-.8L19 16Z" />
        </svg>
      );
  }
}

export function EmojiPickerCategoryNav({
  className,
  buttonClassName,
  activeButtonClassName,
  hideLabel = true,
  renderCategory,
}: EmojiPickerCategoryNavProps) {
  const { categories, activeCategoryId, scrollToCategory } = useCategoryNavigation();

  return (
    <nav
      aria-label="Emoji categories"
      className={cn(
        'flex items-center justify-between gap-0.5 px-2 py-1 border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto',
        className
      )}
    >
      {categories.map((category) => {
        const isActive = activeCategoryId === category.id;
        const onSelect = () => scrollToCategory(category.id);

        if (renderCategory) {
          return (
            <React.Fragment key={category.id}>
              {renderCategory({ category, isActive, onSelect })}
            </React.Fragment>
          );
        }

        return (
          <button
            key={category.id}
            type="button"
            title={category.name}
            aria-label={category.name}
            aria-current={isActive ? 'true' : undefined}
            data-active={isActive ? '' : undefined}
            data-category-id={category.id}
            onClick={onSelect}
            className={cn(
              'flex items-center justify-center gap-1 p-1.5 rounded-md transition-colors text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-indigo-500 shrink-0',
              buttonClassName,
              isActive &&
                cn(
                  'text-zinc-900 bg-zinc-100 dark:text-zinc-100 dark:bg-zinc-800',
                  activeButtonClassName
                )
            )}
          >
            {renderDefaultCategoryIcon(category)}
            {!hideLabel && <span className="truncate text-xs">{category.name}</span>}
          </button>
        );
      })}
    </nav>
  );
}

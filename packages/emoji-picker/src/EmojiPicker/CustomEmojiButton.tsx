import React, { forwardRef, useMemo, useState, useEffect, useCallback } from 'react';
import { useSetAtom, useAtomValue } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { cn } from '../utils/cn';
import {
  hoveredEmojiAtom,
  selectedPositionAtom,
  isEmojiSelectedAtom
} from '../atoms/emoji';
import type { CustomEmoji } from '../types/emoji';

interface CustomEmojiButtonProps {
  emoji: CustomEmoji;
  size?: number;
  rowIndex?: number;
  columnIndex?: number;
}

export const CustomEmojiButton = forwardRef<HTMLButtonElement, CustomEmojiButtonProps>(
  ({ emoji, size = 32, rowIndex = 0, columnIndex = 0 }, ref) => {
    const { onEmojiSelect } = useEmojiPicker();
    const setHoveredEmoji = useSetAtom(hoveredEmojiAtom);
    const setSelectedPosition = useSetAtom(selectedPositionAtom);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [imageError, setImageError] = useState(false);

    const selectedAtom = useMemo(
      () => isEmojiSelectedAtom(rowIndex, columnIndex),
      [rowIndex, columnIndex]
    );
    const isSelected = useAtomValue(selectedAtom);

    const buttonStyle = useMemo(
      () => ({
        width: `${size}px`,
        height: `${size}px`,
      }),
      [size]
    );

    const imageSize = useMemo(() => Math.round(size * 0.75), [size]);

    useEffect(() => {
      setImageLoaded(false);
      setImageError(false);

      const img = new Image();
      img.onload = () => setImageLoaded(true);
      img.onerror = () => setImageError(true);
      img.src = emoji.imageUrl;

      return () => {
        img.onload = null;
        img.onerror = null;
      };
    }, [emoji.imageUrl]);

    const handleMouseEnter = useCallback(() => {
      setHoveredEmoji({
        emoji: `:${emoji.name}:`,
        name: emoji.name,
        slug: emoji.name,
        skin_tone_support: false,
      });
    }, [emoji, setHoveredEmoji]);

    const handleMouseLeave = useCallback(() => {
      setHoveredEmoji(null);
    }, [setHoveredEmoji]);

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      setSelectedPosition({ row: rowIndex, column: columnIndex });
      onEmojiSelect(`:${emoji.name}:`);
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'flex items-center justify-center transition-colors rounded focus:outline-none relative',
          'emoji-button',
          isSelected
            ? 'bg-slate-100 dark:bg-zinc-800'
            : 'hover:bg-slate-100 dark:hover:bg-zinc-800 focus:bg-slate-100 dark:focus:bg-zinc-800'
        )}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        title={emoji.name}
        data-row={rowIndex}
        data-column={columnIndex}
        aria-label={`Custom emoji: ${emoji.name}`}
      >
        {imageError ? (
          <div
            className="flex items-center justify-center bg-gray-200 dark:bg-gray-700 rounded"
            style={{ width: imageSize, height: imageSize }}
          >
            <span className="text-xs text-gray-500 dark:text-gray-400">?</span>
          </div>
        ) : (
          <>
            {!imageLoaded && (
              <div
                className="animate-pulse bg-gray-200 dark:bg-gray-700 rounded"
                style={{ width: imageSize, height: imageSize }}
              />
            )}
            <img
              src={emoji.imageUrl}
              alt={emoji.name}
              className={cn(
                'object-contain',
                imageLoaded ? 'opacity-100' : 'opacity-0 absolute'
              )}
              style={{ width: imageSize, height: imageSize }}
              loading="lazy"
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageError(true)}
            />
          </>
        )}
      </button>
    );
  }
);

CustomEmojiButton.displayName = 'CustomEmojiButton';
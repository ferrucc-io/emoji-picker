import React, { useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEmojiPicker } from './EmojiPickerContext';
import { emojiColors } from '../utils/emojiColors';
import { applySkinTone } from '../utils/applySkinTone';
import {
  hoveredEmojiAtom,
  isEmojiSelectedAtom,
  selectedPositionAtom,
  skinToneOnlyAtom,
} from '../atoms/emoji';

interface EmojiPickerButtonProps {
  emoji: {
    emoji: string;
    name: string;
    slug: string;
    skin_tone_support: boolean;
  };
  rowIndex: number;
  columnIndex: number;
  size?: number;
}

function buttonPropsAreEqual(prevProps: EmojiPickerButtonProps, nextProps: EmojiPickerButtonProps) {
  return (
    prevProps.emoji.emoji === nextProps.emoji.emoji &&
    prevProps.rowIndex === nextProps.rowIndex &&
    prevProps.columnIndex === nextProps.columnIndex &&
    prevProps.size === nextProps.size
  );
}

const EmojiPickerButtonBase = React.memo(function EmojiPickerButtonBase({
  emoji,
  rowIndex,
  columnIndex,
  size = 28,
}: EmojiPickerButtonProps) {
  const setHoveredEmoji = useSetAtom(hoveredEmojiAtom);
  const setSelectedPosition = useSetAtom(selectedPositionAtom);
  const skinTone = useAtomValue(skinToneOnlyAtom);
  const { onEmojiSelect } = useEmojiPicker();

  const selectedAtom = useMemo(
    () => isEmojiSelectedAtom(rowIndex, columnIndex),
    [rowIndex, columnIndex]
  );
  const isSelected = useAtomValue(selectedAtom);

  const emojiWithSkinTone = useMemo(
    () => (emoji.skin_tone_support ? applySkinTone(emoji, skinTone) : emoji),
    [emoji, skinTone]
  );

  const hoverColor = useMemo(
    () => emojiColors[emojiWithSkinTone.emoji] || 'var(--fallback-hover-color, rgba(0, 0, 0, 0.1))',
    [emojiWithSkinTone.emoji]
  );

  const handleMouseEnter = useCallback(() => {
    setHoveredEmoji(emoji);
  }, [emoji, setHoveredEmoji]);

  const handleMouseLeave = useCallback(() => {
    setHoveredEmoji(null);
  }, [setHoveredEmoji]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setSelectedPosition({ row: rowIndex, column: columnIndex });
    onEmojiSelect(emojiWithSkinTone.emoji);
  };

  const buttonStyle = useMemo(
    () =>
      ({
        '--emoji-hover-color': hoverColor,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.floor(size * 0.7)}px`,
      }) as React.CSSProperties,
    [hoverColor, size]
  );

  return (
    <button
      type="button"
      className={`aspect-square focus:ring-[var(--emoji-hover-color)] focus:ring-2 flex items-center justify-center text-sm rounded-lg ${
        isSelected
          ? 'bg-[var(--emoji-hover-color)]'
          : 'hover:bg-[var(--emoji-hover-color)] focus:bg-[var(--emoji-hover-color)]'
      } flex-shrink-0`}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={handleClick}
      data-emoji={emojiWithSkinTone.emoji}
    >
      {emojiWithSkinTone.emoji}
    </button>
  );
}, buttonPropsAreEqual);

export const EmojiPickerButton = EmojiPickerButtonBase;

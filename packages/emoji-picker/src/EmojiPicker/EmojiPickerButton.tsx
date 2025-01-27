import React, { Profiler, ProfilerOnRenderCallback, useCallback, useMemo } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { emojiColors } from '../utils/emojiColors';
import { applySkinTone } from '../utils/applySkinTone';
import {
  hoveredEmojiAtom,
  isEmojiSelectedAtom,
  selectedEmojiAtom,
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

const onRenderCallback: ProfilerOnRenderCallback = (
  id,
  phase,
  actualDuration,
  baseDuration,
  startTime,
  commitTime
) => {
  console.log(`[${id}] ${phase}:`, {
    actualDuration,
    baseDuration,
    startTime,
    commitTime,
  });
};

const EmojiPickerButtonBase = React.memo(function EmojiPickerButtonBase({
  emoji,
  rowIndex,
  columnIndex,
  size = 28,
}: EmojiPickerButtonProps) {
  const setHoveredEmoji = useSetAtom(hoveredEmojiAtom);
  const setSelectedEmoji = useSetAtom(selectedEmojiAtom);
  const setSelectedPosition = useSetAtom(selectedPositionAtom);
  
  // Use memoized selected atom to prevent recreation
  const selectedAtom = useMemo(() => isEmojiSelectedAtom(emoji.emoji), [emoji.emoji]);
  const isSelected = useAtomValue(selectedAtom);
  
  // Use separate skin tone atom to prevent unnecessary re-renders
  const skinTone = useAtomValue(skinToneOnlyAtom);

  // Only apply skin tone if supported and memoize the result
  const emojiWithSkinTone = useMemo(
    () => emoji.skin_tone_support ? applySkinTone(emoji, skinTone) : emoji,
    [emoji, skinTone]
  );

  // Memoize hover color calculation
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
  
  const handleClick = useCallback(() => {
    // Batch updates together
    queueMicrotask(() => {
      setSelectedPosition({ row: rowIndex, column: columnIndex });
      setSelectedEmoji(emojiWithSkinTone.emoji);
    });
  }, [emojiWithSkinTone.emoji, rowIndex, columnIndex, setSelectedPosition, setSelectedEmoji]);

  // Memoize the button style to prevent recalculation
  const buttonStyle = useMemo(() => ({
    '--emoji-hover-color': hoverColor,
    width: `${size}px`,
    height: `${size}px`,
    fontSize: `${Math.floor(size * 0.7)}px`,
  } as React.CSSProperties), [hoverColor, size]);

  return (
    <Profiler id="EmojiPickerButton" onRender={onRenderCallback}>
      <button
        className={`aspect-square focus:ring-[var(--emoji-hover-color)] focus:ring-2 flex items-center justify-center text-sm rounded-lg ${
          isSelected
            ? 'bg-[var(--emoji-hover-color)]'
            : 'hover:bg-[var(--emoji-hover-color)] focus:bg-[var(--emoji-hover-color)]'
        } flex-shrink-0`}
        style={buttonStyle}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {emojiWithSkinTone.emoji}
      </button>
    </Profiler>
  );
}, buttonPropsAreEqual);

export const EmojiPickerButton = EmojiPickerButtonBase;

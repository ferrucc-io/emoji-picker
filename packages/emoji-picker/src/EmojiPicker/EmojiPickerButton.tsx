import { useEmojiPicker } from './EmojiPickerContext';
import { emojiColors } from '../utils/emojiColors';

interface EmojiPickerButtonProps {
  emoji: {
    emoji: string;
    name: string;
    slug: string;
    skin_tone_support: boolean;
  };
  isSelected?: boolean;
  rowIndex: number;
  columnIndex: number;
  size?: number;
}

export function EmojiPickerButton({ 
  emoji, 
  isSelected = false, 
  rowIndex, 
  columnIndex,
  size = 28 
}: EmojiPickerButtonProps) {
  const { setHoveredEmoji, setSelectedPosition, setSelectedEmoji } = useEmojiPicker();
  
  // Try to find the color for the skin tone variant first, then fall back to the base emoji
  const hoverColor = emojiColors[emoji.emoji] || 'var(--fallback-hover-color, rgba(0, 0, 0, 0.1))';

  return (
    <button
      className={`aspect-square focus:ring-[var(--emoji-hover-color)] focus:ring-2 flex items-center justify-center text-sm rounded-lg transition-colors ${
        isSelected ? 'bg-[var(--emoji-hover-color)]' : 'hover:bg-[var(--emoji-hover-color)] focus:bg-[var(--emoji-hover-color)]'
      } flex-shrink-0`}
      style={{
        '--emoji-hover-color': hoverColor,
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${Math.floor(size * 0.7)}px`
      } as React.CSSProperties}
      onMouseEnter={() => setHoveredEmoji(emoji)}
      onMouseLeave={() => setHoveredEmoji(null)}
      onClick={() => {
        setSelectedPosition(rowIndex, columnIndex);
        setSelectedEmoji(emoji.emoji);
      }}
    >
      {emoji.emoji}
    </button>
  );
} 
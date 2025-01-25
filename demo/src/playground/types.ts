export type Size = 'small' | 'medium' | 'large';

export interface EmojiPickerConfig {
  size?: 'small' | 'medium' | 'large';
  hideStickyHeader?: boolean;
  emojisPerRow?: number;
  emojiSize?: number;
  containerHeight?: number;
  hideIcon?: boolean;
}

export type VariantType = 'default' | 'linear' | 'slack';

export interface PlaygroundProps {
  code: Record<VariantType, string>;
} 
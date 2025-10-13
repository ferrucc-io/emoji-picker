import React from 'react';
import { Provider } from 'jotai';
import { EmojiPickerSkinTone } from './EmojiPickerSkinTone';
import { EmojiPickerPreview } from './EmojiPickerPreview';
import { EmojiPickerList } from './EmojiPickerList';
import { EmojiPickerInput } from './EmojiPickerInput';
import { EmojiPickerGroup } from './EmojiPickerGroup';
import { EmojiPickerProvider } from './EmojiPickerContext';
import { EmojiPickerContent } from './EmojiPickerContent';
import { EmojiPickerContentWithCustom } from './EmojiPickerContentWithCustom';
import { EmojiPickerSmartContent } from './EmojiPickerSmartContent';
import { cn } from '../utils/cn';
import {
  DEFAULT_MAX_UNICODE_VERSION,
  DEFAULT_EMOJIS_PER_ROW,
  DEFAULT_EMOJI_SIZE,
} from '../constants';
import type { CustomSection, CustomEmoji, HeaderRendererProps } from '../types/emoji';

export interface EmojiPickerProps {
  children?: React.ReactNode;
  className?: string;
  onEmojiSelect?: (emoji: string) => void;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion?: number;
  customSections?: CustomSection[];
  frequentlyUsedEmojis?: (string | CustomEmoji)[];
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
}

interface EmojiPickerHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

function Header({ children, className = '' }: EmojiPickerHeaderProps) {
  return (
    <div className={cn('flex w-full items-center gap-2 px-2 pt-2 pb-1', className)}>{children}</div>
  );
}

function Input(props: React.ComponentProps<typeof EmojiPickerInput>) {
  return <EmojiPickerInput {...props} />;
}

export function EmojiPicker({
  children,
  className = '',
  onEmojiSelect = () => {},
  emojisPerRow = DEFAULT_EMOJIS_PER_ROW,
  emojiSize = DEFAULT_EMOJI_SIZE,
  maxUnicodeVersion = DEFAULT_MAX_UNICODE_VERSION,
  customSections = [],
  frequentlyUsedEmojis = [],
  renderHeader,
}: EmojiPickerProps) {
  return (
    <Provider>
      <EmojiPickerProvider
        emojisPerRow={emojisPerRow}
        emojiSize={emojiSize}
        maxUnicodeVersion={maxUnicodeVersion}
        onEmojiSelect={onEmojiSelect}
        customSections={customSections}
        frequentlyUsedEmojis={frequentlyUsedEmojis}
        renderHeader={renderHeader}
      >
        <div
          tabIndex={0}
          className={cn(
            'flex flex-col bg-background border border-border/50 dark:border-zinc-800 rounded-lg shadow-lg w-[400px] h-full outline-none focus:ring-1 focus:ring-indigo-500',
            className
          )}
        >
          {children}
        </div>
      </EmojiPickerProvider>
    </Provider>
  );
}

EmojiPicker.Header = Header;
EmojiPicker.Input = Input;
EmojiPicker.Group = EmojiPickerGroup;
EmojiPicker.List = EmojiPickerList;
EmojiPicker.Preview = EmojiPickerPreview;
EmojiPicker.Content = EmojiPickerSmartContent;
EmojiPicker.SkinTone = EmojiPickerSkinTone;

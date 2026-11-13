import React, { useState } from 'react';
import { createStore, Provider } from 'jotai';
import { EmojiPickerSkinTone } from './EmojiPickerSkinTone';
import { EmojiPickerPreview } from './EmojiPickerPreview';
import { EmojiPickerList } from './EmojiPickerList';
import { EmojiPickerInput } from './EmojiPickerInput';
import { EmojiPickerGroup } from './EmojiPickerGroup';
import { EmojiPickerEmpty } from './EmojiPickerEmpty';
import { EmojiPickerProvider, readPersistedSkinTone } from './EmojiPickerContext';
import { EmojiPickerSmartContent } from './EmojiPickerSmartContent';
import { useActiveEmoji } from '../hooks/useEmojiPickerHooks';
import { searchAtom, skinToneAtom } from '../atoms/emoji';
import { cn } from '../utils/cn';
import {
  DEFAULT_MAX_UNICODE_VERSION,
  DEFAULT_EMOJIS_PER_ROW,
  DEFAULT_EMOJI_SIZE,
} from '../constants';
import type {
  CustomSection,
  CustomEmoji,
  EmojiSelectDetails,
  HeaderRendererProps,
  SkinTone,
} from '../types/emoji';

export interface EmojiPickerProps {
  children?: React.ReactNode;
  className?: string;
  onEmojiSelect?: (emoji: string, details: EmojiSelectDetails) => void;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion?: number;
  customSections?: CustomSection[];
  frequentlyUsedEmojis?: (string | CustomEmoji)[];
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
  skinTone?: SkinTone;
  defaultSkinTone?: SkinTone;
  onSkinToneChange?: (skinTone: SkinTone) => void;
  persistSkinTone?: boolean | string;
  search?: string;
  defaultSearch?: string;
  onSearchChange?: (search: string) => void;
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

export interface EmojiPickerActiveEmojiProps {
  children: (props: { emoji: ReturnType<typeof useActiveEmoji> }) => React.ReactNode;
}

function ActiveEmoji({ children }: EmojiPickerActiveEmojiProps) {
  const emoji = useActiveEmoji();
  return <>{children({ emoji })}</>;
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
  skinTone,
  defaultSkinTone,
  onSkinToneChange,
  persistSkinTone,
  search,
  defaultSearch,
  onSearchChange,
}: EmojiPickerProps) {
  const [store] = useState(() => {
    const jotaiStore = createStore();
    const initialSkinTone =
      skinTone ?? readPersistedSkinTone(persistSkinTone) ?? defaultSkinTone ?? 'default';
    const initialSearch = search ?? defaultSearch ?? '';
    jotaiStore.set(skinToneAtom, initialSkinTone);
    jotaiStore.set(searchAtom, initialSearch);
    return jotaiStore;
  });

  return (
    <Provider store={store}>
      <EmojiPickerProvider
        emojisPerRow={emojisPerRow}
        emojiSize={emojiSize}
        maxUnicodeVersion={maxUnicodeVersion}
        onEmojiSelect={onEmojiSelect}
        customSections={customSections}
        frequentlyUsedEmojis={frequentlyUsedEmojis}
        renderHeader={renderHeader}
        skinTone={skinTone}
        defaultSkinTone={defaultSkinTone}
        onSkinToneChange={onSkinToneChange}
        persistSkinTone={persistSkinTone}
        search={search}
        defaultSearch={defaultSearch}
        onSearchChange={onSearchChange}
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
EmojiPicker.Empty = EmojiPickerEmpty;
EmojiPicker.Preview = EmojiPickerPreview;
EmojiPicker.ActiveEmoji = ActiveEmoji;
EmojiPicker.Content = EmojiPickerSmartContent;
EmojiPicker.SkinTone = EmojiPickerSkinTone;

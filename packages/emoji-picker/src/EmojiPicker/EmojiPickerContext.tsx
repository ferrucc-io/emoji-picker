import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useStore } from 'jotai';
import { DEFAULT_MAX_UNICODE_VERSION, DEFAULT_SKIN_TONE_STORAGE_KEY } from '../constants';
import { searchAtom, skinToneAtom } from '../atoms/emoji';
import type {
  CustomSection,
  CustomEmoji,
  EmojiSelectDetails,
  HeaderRendererProps,
  SkinTone,
} from '../types/emoji';

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const VALID_SKIN_TONES: readonly SkinTone[] = [
  'default',
  'light',
  'medium-light',
  'medium',
  'medium-dark',
  'dark',
];

export function isValidSkinTone(value: unknown): value is SkinTone {
  return typeof value === 'string' && (VALID_SKIN_TONES as readonly string[]).includes(value);
}

export function resolveSkinToneStorageKey(persistSkinTone?: boolean | string): string | null {
  if (!persistSkinTone) {
    return null;
  }
  return typeof persistSkinTone === 'string' ? persistSkinTone : DEFAULT_SKIN_TONE_STORAGE_KEY;
}

export function readPersistedSkinTone(persistSkinTone?: boolean | string): SkinTone | null {
  const key = resolveSkinToneStorageKey(persistSkinTone);
  if (!key) {
    return null;
  }
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const stored = window.localStorage.getItem(key);
    return isValidSkinTone(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function writePersistedSkinTone(
  persistSkinTone: boolean | string | undefined,
  skinTone: SkinTone
): void {
  const key = resolveSkinToneStorageKey(persistSkinTone);
  if (!key) {
    return;
  }
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    window.localStorage.setItem(key, skinTone);
  } catch {
    // Gracefully no-op in SSR or restricted storage environments
  }
}

interface EmojiPickerContextType {
  emojisPerRow: number;
  emojiSize: number;
  maxUnicodeVersion: number;
  onEmojiSelect: (emoji: string, details: EmojiSelectDetails) => void;
  customSections: CustomSection[];
  frequentlyUsedEmojis: (string | CustomEmoji)[];
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
  isSkinToneControlled: boolean;
  setSkinTone: (skinTone: SkinTone | ((prev: SkinTone) => SkinTone)) => void;
  isSearchControlled: boolean;
  setSearch: (search: string) => void;
  onSearchChange?: (search: string) => void;
  hasCustomEmpty: boolean;
  registerCustomEmpty: () => () => void;
}

const EmojiPickerContext = createContext<EmojiPickerContextType | null>(null);

const useEmojiPicker = () => {
  const context = useContext(EmojiPickerContext);
  if (!context) {
    throw new Error('useEmojiPicker must be used within an EmojiPickerProvider');
  }
  return context;
};

const useOptionalEmojiPicker = () => useContext(EmojiPickerContext);

export interface EmojiPickerProviderProps {
  children: React.ReactNode;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion?: number;
  onEmojiSelect?: (emoji: string, details: EmojiSelectDetails) => void;
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

export function EmojiPickerProvider({
  children,
  emojisPerRow = 8,
  emojiSize = 32,
  maxUnicodeVersion = DEFAULT_MAX_UNICODE_VERSION,
  onEmojiSelect = () => {},
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
}: EmojiPickerProviderProps) {
  const store = useStore();
  const didInitRef = useRef(false);
  const [customEmptyCount, setCustomEmptyCount] = useState(0);

  const isSkinToneControlled = skinTone !== undefined;
  const isSearchControlled = search !== undefined;

  useIsomorphicLayoutEffect(() => {
    if (!didInitRef.current) {
      didInitRef.current = true;

      if (skinTone !== undefined) {
        if (store.get(skinToneAtom) !== skinTone) {
          store.set(skinToneAtom, skinTone);
        }
      } else {
        const persisted = readPersistedSkinTone(persistSkinTone);
        const initialTone = persisted ?? defaultSkinTone;
        if (initialTone !== undefined && store.get(skinToneAtom) !== initialTone) {
          store.set(skinToneAtom, initialTone);
        }
      }

      if (search !== undefined) {
        if (store.get(searchAtom) !== search) {
          store.set(searchAtom, search);
        }
      } else if (defaultSearch !== undefined && store.get(searchAtom) !== defaultSearch) {
        store.set(searchAtom, defaultSearch);
      }
    }
  }, [store, skinTone, defaultSkinTone, persistSkinTone, search, defaultSearch]);

  useIsomorphicLayoutEffect(() => {
    if (skinTone !== undefined && store.get(skinToneAtom) !== skinTone) {
      store.set(skinToneAtom, skinTone);
    }
  }, [skinTone, store]);

  useIsomorphicLayoutEffect(() => {
    if (search !== undefined && store.get(searchAtom) !== search) {
      store.set(searchAtom, search);
    }
  }, [search, store]);

  const setSkinTone = useCallback(
    (next: SkinTone | ((prev: SkinTone) => SkinTone)) => {
      const current = store.get(skinToneAtom);
      const resolved = typeof next === 'function' ? next(current) : next;
      if (!isSkinToneControlled) {
        store.set(skinToneAtom, resolved);
      }
      writePersistedSkinTone(persistSkinTone, resolved);
      onSkinToneChange?.(resolved);
    },
    [store, isSkinToneControlled, persistSkinTone, onSkinToneChange]
  );

  const setSearch = useCallback(
    (next: string) => {
      if (!isSearchControlled) {
        store.set(searchAtom, next);
      }
      onSearchChange?.(next);
    },
    [store, isSearchControlled, onSearchChange]
  );

  const registerCustomEmpty = useCallback(() => {
    setCustomEmptyCount((count) => count + 1);
    return () => {
      setCustomEmptyCount((count) => Math.max(0, count - 1));
    };
  }, []);

  const hasCustomEmpty = customEmptyCount > 0;

  const value = useMemo(
    () => ({
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect,
      customSections,
      frequentlyUsedEmojis,
      renderHeader,
      isSkinToneControlled,
      setSkinTone,
      isSearchControlled,
      setSearch,
      onSearchChange,
      hasCustomEmpty,
      registerCustomEmpty,
    }),
    [
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect,
      customSections,
      frequentlyUsedEmojis,
      renderHeader,
      isSkinToneControlled,
      setSkinTone,
      isSearchControlled,
      setSearch,
      onSearchChange,
      hasCustomEmpty,
      registerCustomEmpty,
    ]
  );

  return <EmojiPickerContext.Provider value={value}>{children}</EmojiPickerContext.Provider>;
}

export { useEmojiPicker, useOptionalEmojiPicker };

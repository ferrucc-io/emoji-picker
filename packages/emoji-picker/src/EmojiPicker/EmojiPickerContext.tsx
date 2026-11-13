import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { DEFAULT_MAX_UNICODE_VERSION } from '../constants';
import {
  entriesToFrequentlyUsedItems,
  loadInitialFrequentlyUsedEntries,
  resolvePersistFrequentlyUsedOptions,
  subscribeFrequentlyUsedClear,
  updateFrequentlyUsedEntries,
} from '../utils/frequentlyUsedStorage';
import { isCustomEmoji } from '../types/emoji';
import type {
  CustomEmoji,
  CustomSection,
  HeaderRendererProps,
  PersistFrequentlyUsedOptions,
} from '../types/emoji';
import type { StoredEmojiEntry } from '../utils/frequentlyUsedStorage';

interface EmojiPickerContextType {
  emojisPerRow: number;
  emojiSize: number;
  maxUnicodeVersion: number;
  onEmojiSelect: (emoji: string) => void;
  customSections: CustomSection[];
  frequentlyUsedEmojis: (string | CustomEmoji)[];
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
}

const EmojiPickerContext = createContext<EmojiPickerContextType | null>(null);

const useEmojiPicker = () => {
  const context = useContext(EmojiPickerContext);
  if (!context) {
    throw new Error('useEmojiPicker must be used within an EmojiPickerProvider');
  }
  return context;
};

interface EmojiPickerProviderProps {
  children: React.ReactNode;
  emojisPerRow?: number;
  emojiSize?: number;
  maxUnicodeVersion: number;
  onEmojiSelect?: (emoji: string) => void;
  customSections?: CustomSection[];
  frequentlyUsedEmojis?: (string | CustomEmoji)[];
  persistFrequentlyUsed?: boolean | PersistFrequentlyUsedOptions;
  renderHeader?: (props: HeaderRendererProps) => React.ReactNode;
}

export function EmojiPickerProvider({
  children,
  emojisPerRow = 8,
  emojiSize = 32,
  maxUnicodeVersion = DEFAULT_MAX_UNICODE_VERSION,
  onEmojiSelect = () => {},
  customSections = [],
  frequentlyUsedEmojis = [],
  persistFrequentlyUsed,
  renderHeader,
}: EmojiPickerProviderProps) {
  const rawPersistOptions = resolvePersistFrequentlyUsedOptions(persistFrequentlyUsed);
  const persistEnabled = rawPersistOptions !== null;
  const persistKey = rawPersistOptions?.key ?? '';
  const persistMaxEmojis = rawPersistOptions?.maxEmojis ?? 0;
  const persistStrategy = rawPersistOptions?.strategy ?? 'frecency';

  const persistOptions = useMemo<Required<PersistFrequentlyUsedOptions> | null>(() => {
    if (!persistEnabled) {
      return null;
    }
    return {
      key: persistKey,
      maxEmojis: persistMaxEmojis,
      strategy: persistStrategy,
    };
  }, [persistEnabled, persistKey, persistMaxEmojis, persistStrategy]);

  const [persistedEntries, setPersistedEntries] = useState<StoredEmojiEntry[]>(() =>
    persistOptions ? loadInitialFrequentlyUsedEntries(persistOptions, frequentlyUsedEmojis) : []
  );

  const persistedEntriesRef = useRef(persistedEntries);
  persistedEntriesRef.current = persistedEntries;

  const prevPersistKeyRef = useRef<string | null>(persistOptions ? persistOptions.key : null);
  useEffect(() => {
    const nextKey = persistOptions ? persistOptions.key : null;
    if (prevPersistKeyRef.current !== nextKey) {
      prevPersistKeyRef.current = nextKey;
      const loaded = persistOptions
        ? loadInitialFrequentlyUsedEntries(persistOptions, frequentlyUsedEmojis)
        : [];
      persistedEntriesRef.current = loaded;
      setPersistedEntries(loaded);
    }
  }, [persistOptions, frequentlyUsedEmojis]);

  useEffect(() => {
    if (!persistOptions) {
      return;
    }
    return subscribeFrequentlyUsedClear((clearedKey) => {
      if (clearedKey === persistOptions.key) {
        persistedEntriesRef.current = [];
        setPersistedEntries([]);
      }
    });
  }, [persistOptions]);

  const onEmojiSelectRef = useRef(onEmojiSelect);
  onEmojiSelectRef.current = onEmojiSelect;

  const persistOptionsRef = useRef(persistOptions);
  persistOptionsRef.current = persistOptions;

  const customSectionsRef = useRef(customSections);
  customSectionsRef.current = customSections;

  const frequentlyUsedPropRef = useRef(frequentlyUsedEmojis);
  frequentlyUsedPropRef.current = frequentlyUsedEmojis;

  const handleEmojiSelect = useCallback((selectedEmoji: string) => {
    const activePersistOptions = persistOptionsRef.current;
    if (activePersistOptions) {
      let matchedCustom: CustomEmoji | undefined;
      if (selectedEmoji.startsWith(':') && selectedEmoji.endsWith(':')) {
        const shortcodeName = selectedEmoji.slice(1, -1);
        for (const section of customSectionsRef.current) {
          for (const item of section.emojis) {
            if (isCustomEmoji(item) && item.name === shortcodeName) {
              matchedCustom = item;
              break;
            }
          }
          if (matchedCustom) {
            break;
          }
        }
        if (!matchedCustom) {
          for (const item of frequentlyUsedPropRef.current) {
            if (typeof item !== 'string' && isCustomEmoji(item) && item.name === shortcodeName) {
              matchedCustom = item;
              break;
            }
          }
        }
      }

      const nextEntries = updateFrequentlyUsedEntries(
        persistedEntriesRef.current,
        selectedEmoji,
        matchedCustom,
        activePersistOptions
      );
      persistedEntriesRef.current = nextEntries;
      setPersistedEntries(nextEntries);
    }

    onEmojiSelectRef.current(selectedEmoji);
  }, []);

  const effectiveFrequentlyUsedEmojis = useMemo(() => {
    if (!persistOptions) {
      return frequentlyUsedEmojis;
    }
    return entriesToFrequentlyUsedItems(persistedEntries, customSections);
  }, [persistOptions, frequentlyUsedEmojis, persistedEntries, customSections]);

  const value = useMemo(
    () => ({
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      onEmojiSelect: handleEmojiSelect,
      customSections,
      frequentlyUsedEmojis: effectiveFrequentlyUsedEmojis,
      renderHeader,
    }),
    [
      emojisPerRow,
      emojiSize,
      maxUnicodeVersion,
      handleEmojiSelect,
      customSections,
      effectiveFrequentlyUsedEmojis,
      renderHeader,
    ]
  );

  return <EmojiPickerContext.Provider value={value}>{children}</EmojiPickerContext.Provider>;
}

export { useEmojiPicker };

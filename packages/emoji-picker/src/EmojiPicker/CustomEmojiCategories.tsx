import emojiData from 'unicode-emoji-json/data-by-group.json';
import React, { useMemo, useRef } from 'react';
import { useAtomValue } from 'jotai';
import { SectionHeader } from './SectionHeader';
import { useEmojiPicker } from './EmojiPickerContext';
import { EmojiPickerButton } from './EmojiPickerButton';
import { CustomEmojiButton } from './CustomEmojiButton';
import { filterSupportedEmojis } from '../utils/supportedEmojis';
import { isCompatibleSkinTone } from '../utils/emojiFilters';
import { loadJsonData } from '../utils/loadJsonData';
import { applySkinTone } from '../utils/applySkinTone';
import { useVirtualizedList } from '../hooks/useVirtualizedList';
import { useCustomEmojiKeyboardNavigation } from '../hooks/useCustomEmojiKeyboardNavigation';
import { sortCustomSectionsByPriority } from '../utils/emojiSearch';
import { skinToneAtom } from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';

import type { EmojiDataItem, EmojiGroup, EmojiMetadata } from '../utils/supportedEmojis';
import type { CustomEmoji } from '../types/emoji';

function stripVariationSelector(value: string): string {
  return value.replace(/\uFE0F/g, '');
}

function stripSkinToneAndVariationSelector(value: string): string {
  return value.replace(/\p{Emoji_Modifier}/gu, '').replace(/\uFE0F/g, '');
}

type Row =
  | { type: 'header'; content: string }
  | { type: 'emojis'; content: EmojiMetadata[] }
  | { type: 'custom-emojis'; content: (EmojiMetadata | CustomEmoji)[] };

interface CustomEmojiCategoriesProps {
  hideStickyHeader?: boolean;
  containerHeight?: number;
}

export function CustomEmojiCategories({
  hideStickyHeader = false,
  containerHeight = 364,
}: CustomEmojiCategoriesProps) {
  const { emojisPerRow, emojiSize, maxUnicodeVersion, customSections, frequentlyUsedEmojis } =
    useEmojiPicker();
  const skinTone = useAtomValue(skinToneAtom);

  const parentRef = useRef<HTMLDivElement>(null);

  const { emojiCategories, emojiMetadataMap } = useMemo(() => {
    const loadedData = loadJsonData(
      emojiData,
      'unicode-emoji-json/data-by-group.json',
      (data) => !data || Object.keys(data).length === 0
    );

    const metadataMap = new Map<string, EmojiMetadata>();
    if (loadedData && typeof loadedData === 'object') {
      for (const group of Object.values(loadedData)) {
        if (!group || typeof group !== 'object' || !('emojis' in group)) continue;
        const groupEmojis = (group as { emojis?: unknown }).emojis;
        if (!groupEmojis || typeof groupEmojis !== 'object') continue;

        for (const rawEmoji of Object.values(groupEmojis)) {
          if (!rawEmoji || typeof rawEmoji !== 'object') continue;
          const item = rawEmoji as Partial<EmojiDataItem>;
          if (!item.emoji || !item.name) continue;

          const metadata: EmojiMetadata = {
            emoji: item.emoji,
            name: item.name,
            slug: item.slug || item.name.toLowerCase().replace(/\s+/g, '_'),
            skin_tone_support: isCompatibleSkinTone(
              {
                emoji: item.emoji,
                skin_tone_support: !!item.skin_tone_support,
                skin_tone_support_unicode_version: item.skin_tone_support_unicode_version,
                unicode_version: item.unicode_version,
              },
              maxUnicodeVersion
            ),
            skin_tone_support_unicode_version: item.skin_tone_support_unicode_version,
          };

          metadataMap.set(item.emoji, metadata);
          const withoutVS = stripVariationSelector(item.emoji);
          if (!metadataMap.has(withoutVS)) {
            metadataMap.set(withoutVS, metadata);
          }
        }
      }
    }

    return {
      emojiCategories: filterSupportedEmojis(loadedData as EmojiGroup[], maxUnicodeVersion),
      emojiMetadataMap: metadataMap,
    };
  }, [maxUnicodeVersion]);

  const rows = useMemo<Row[]>(() => {
    const allRows: Row[] = [];

    if (frequentlyUsedEmojis.length > 0) {
      allRows.push({
        type: 'header',
        content: 'Frequently Used',
      });

      const frequentEmojis: (EmojiMetadata | CustomEmoji)[] = frequentlyUsedEmojis.map((emoji) => {
        if (typeof emoji === 'string') {
          const matchedMetadata =
            emojiMetadataMap.get(emoji) ??
            emojiMetadataMap.get(stripVariationSelector(emoji)) ??
            emojiMetadataMap.get(stripSkinToneAndVariationSelector(emoji));

          if (matchedMetadata) {
            return matchedMetadata;
          }

          return {
            emoji,
            name: `frequently-used-${emoji}`,
            slug: `frequently-used-${emoji}`,
            skin_tone_support: false,
          } as EmojiMetadata;
        } else {
          return emoji;
        }
      });

      for (let i = 0; i < frequentEmojis.length; i += emojisPerRow) {
        const emojis = frequentEmojis.slice(i, i + emojisPerRow);
        const processedEmojis = emojis.map((emoji) =>
          isCustomEmoji(emoji) ? emoji : applySkinTone(emoji, skinTone)
        );

        allRows.push({
          type: 'custom-emojis',
          content: processedEmojis,
        });
      }
    }

    const sortedCustomSections = sortCustomSectionsByPriority(customSections);

    for (const section of sortedCustomSections) {
      allRows.push({
        type: 'header',
        content: section.name,
      });

      for (let i = 0; i < section.emojis.length; i += emojisPerRow) {
        const emojis = section.emojis.slice(i, i + emojisPerRow);
        const processedEmojis = emojis.map((emoji) =>
          isCustomEmoji(emoji) ? emoji : applySkinTone(emoji, skinTone)
        );

        allRows.push({
          type: 'custom-emojis',
          content: processedEmojis,
        });
      }
    }

    emojiCategories.forEach((category) => {
      allRows.push({
        type: 'header',
        content: category.category,
      });

      for (let i = 0; i < category.emojis.length; i += emojisPerRow) {
        allRows.push({
          type: 'emojis',
          content: category.emojis
            .slice(i, i + emojisPerRow)
            .map((emoji) => applySkinTone(emoji, skinTone)),
        });
      }
    });

    return allRows;
  }, [
    emojiCategories,
    emojiMetadataMap,
    emojisPerRow,
    skinTone,
    customSections,
    frequentlyUsedEmojis,
  ]);

  const { virtualizer, isSticky, isActiveSticky } = useVirtualizedList({
    rows,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => {
      const row = rows[index];
      return row?.type === 'header' ? 32 : emojiSize;
    },
    isHeader: (row: Row) => row.type === 'header',
    hideStickyHeader,
  });

  useCustomEmojiKeyboardNavigation({ rows, virtualizer });

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto relative outline-none"
      style={{
        height: `${containerHeight}px`,
      }}
      tabIndex={0}
    >
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index];

          return (
            <div
              key={virtualRow.index}
              data-type={row.type}
              style={{
                ...(isSticky(virtualRow.index)
                  ? {
                      zIndex: 1,
                    }
                  : {}),
                ...(isActiveSticky(virtualRow.index)
                  ? {
                      position: 'sticky',
                    }
                  : {
                      position: 'absolute',
                      transform: `translateY(${virtualRow.start}px)`,
                    }),
                top: 0,
                left: 0,
                width: '100%',
                height: `${virtualRow.size}px`,
              }}
            >
              {row.type === 'header' ? (
                <SectionHeader
                  content={row.content}
                  emojiSize={emojiSize}
                  isSticky={isActiveSticky(virtualRow.index)}
                />
              ) : (
                <div
                  className={`grid grid-cols-${emojisPerRow} px-2`}
                  style={{ gridTemplateColumns: `repeat(${emojisPerRow}, minmax(0, 1fr))` }}
                >
                  {row.type === 'custom-emojis'
                    ? row.content.map((emojiData, index) =>
                        isCustomEmoji(emojiData) ? (
                          <CustomEmojiButton
                            key={emojiData.id}
                            emoji={emojiData}
                            rowIndex={virtualRow.index}
                            columnIndex={index}
                            size={emojiSize}
                          />
                        ) : (
                          <EmojiPickerButton
                            key={index}
                            emoji={emojiData}
                            rowIndex={virtualRow.index}
                            columnIndex={index}
                            size={emojiSize}
                          />
                        )
                      )
                    : row.content.map((emojiData, index) => (
                        <EmojiPickerButton
                          key={index}
                          emoji={emojiData}
                          rowIndex={virtualRow.index}
                          columnIndex={index}
                          size={emojiSize}
                        />
                      ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

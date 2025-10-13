import { useCallback, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useEmojiPicker } from '../EmojiPicker/EmojiPickerContext';
import {
  hoveredEmojiAtom,
  searchAtom,
  selectedEmojiAtom,
  selectedPositionAtom,
} from '../atoms/emoji';
import { isCustomEmoji } from '../types/emoji';

import type { EmojiMetadata, CustomEmoji } from '../types/emoji';

type Row =
  | { type: 'header'; content: string }
  | { type: 'emojis'; content: EmojiMetadata[] }
  | { type: 'custom-emojis'; content: (EmojiMetadata | CustomEmoji)[] };

interface UseCustomEmojiKeyboardNavigationProps {
  rows: Row[];
  virtualizer: {
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  };
}

export function useCustomEmojiKeyboardNavigation({
  rows,
  virtualizer,
}: UseCustomEmojiKeyboardNavigationProps) {
  const setSelectedPosition = useSetAtom(selectedPositionAtom);
  const setHoveredEmoji = useSetAtom(hoveredEmojiAtom);
  const setSelectedEmoji = useSetAtom(selectedEmojiAtom);
  const search = useAtomValue(searchAtom);
  const selectedPosition = useAtomValue(selectedPositionAtom);
  const { onEmojiSelect } = useEmojiPicker();

  const selectedRow = selectedPosition?.row ?? -1;
  const selectedColumn = selectedPosition?.column ?? -1;

  const findNextEmojiRow = useCallback(
    (currentRow: number, direction: 'up' | 'down'): number => {
      let nextRow = currentRow;

      while (true) {
        nextRow = direction === 'up' ? nextRow - 1 : nextRow + 1;

        if (nextRow < 0 || nextRow >= rows.length) {
          return currentRow;
        }

        if (rows[nextRow].type === 'emojis' || rows[nextRow].type === 'custom-emojis') {
          return nextRow;
        }
      }
    },
    [rows]
  );

  const findFirstEmojiRow = useCallback((): number => {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].type === 'emojis' || rows[i].type === 'custom-emojis') {
        return i;
      }
    }
    return -1;
  }, [rows]);

  useEffect(() => {
    if (search.trim() && rows.length > 0) {
      const firstRow = findFirstEmojiRow();
      if (firstRow !== -1) {
        setSelectedPosition({ row: firstRow, column: 0 });
        const firstRowData = rows[firstRow];
        if (
          (firstRowData?.type === 'emojis' || firstRowData?.type === 'custom-emojis') &&
          firstRowData.content[0]
        ) {
          const firstEmoji = firstRowData.content[0];
          if (isCustomEmoji(firstEmoji)) {
            setHoveredEmoji({
              emoji: `:${firstEmoji.name}:`,
              name: firstEmoji.name,
              slug: firstEmoji.name,
              skin_tone_support: false,
            });
          } else {
            setHoveredEmoji(firstEmoji);
          }
          virtualizer.scrollToIndex(firstRow, { align: 'center' });
        }
      }
    }
  }, [search, rows, findFirstEmojiRow, setSelectedPosition, setHoveredEmoji, virtualizer]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPosition) {
        if (['ArrowDown', 'ArrowRight'].includes(e.key)) {
          e.preventDefault();
          const firstRow = findFirstEmojiRow();
          if (firstRow !== -1) {
            const firstRowData = rows[firstRow];
            if (
              (firstRowData?.type === 'emojis' || firstRowData?.type === 'custom-emojis') &&
              firstRowData.content[0]
            ) {
              setSelectedPosition({ row: firstRow, column: 0 });
              const firstEmoji = firstRowData.content[0];
              if (isCustomEmoji(firstEmoji)) {
                setHoveredEmoji({
                  emoji: `:${firstEmoji.name}:`,
                  name: firstEmoji.name,
                  slug: firstEmoji.name,
                  skin_tone_support: false,
                });
              } else {
                setHoveredEmoji(firstEmoji);
              }
              virtualizer.scrollToIndex(firstRow, { align: 'center' });
            }
          }
        }
        return;
      }

      const currentRow = rows[selectedRow];
      if (!currentRow || currentRow.type === 'header') return;

      const maxColumns = currentRow.content.length;

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const nextRow = findNextEmojiRow(selectedRow, 'up');
          if (nextRow !== selectedRow) {
            const nextRowData = rows[nextRow];
            if (nextRowData?.type === 'emojis' || nextRowData?.type === 'custom-emojis') {
              const nextColumn = Math.min(selectedColumn, nextRowData.content.length - 1);
              setSelectedPosition({ row: nextRow, column: nextColumn });
              const nextEmoji = nextRowData.content[nextColumn];
              if (!isCustomEmoji(nextEmoji)) {
                setHoveredEmoji(nextEmoji);
              }
              virtualizer.scrollToIndex(nextRow, { align: 'center' });
            }
          }
          break;
        }
        case 'ArrowDown': {
          e.preventDefault();
          const nextRow = findNextEmojiRow(selectedRow, 'down');
          if (nextRow !== selectedRow) {
            const nextRowData = rows[nextRow];
            if (nextRowData?.type === 'emojis' || nextRowData?.type === 'custom-emojis') {
              const nextColumn = Math.min(selectedColumn, nextRowData.content.length - 1);
              setSelectedPosition({ row: nextRow, column: nextColumn });
              const nextEmoji = nextRowData.content[nextColumn];
              if (!isCustomEmoji(nextEmoji)) {
                setHoveredEmoji(nextEmoji);
              }
              virtualizer.scrollToIndex(nextRow, { align: 'center' });
            }
          }
          break;
        }
        case 'ArrowLeft': {
          e.preventDefault();
          if (selectedColumn > 0) {
            const nextColumn = selectedColumn - 1;
            setSelectedPosition({ row: selectedRow, column: nextColumn });
            const nextEmoji = currentRow.content[nextColumn];
            if (isCustomEmoji(nextEmoji)) {
              setHoveredEmoji({
                emoji: `:${nextEmoji.name}:`,
                name: nextEmoji.name,
                slug: nextEmoji.name,
                skin_tone_support: false,
              });
            } else {
              setHoveredEmoji(nextEmoji);
            }
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (selectedColumn < maxColumns - 1) {
            const nextColumn = selectedColumn + 1;
            setSelectedPosition({ row: selectedRow, column: nextColumn });
            const nextEmoji = currentRow.content[nextColumn];
            if (isCustomEmoji(nextEmoji)) {
              setHoveredEmoji({
                emoji: `:${nextEmoji.name}:`,
                name: nextEmoji.name,
                slug: nextEmoji.name,
                skin_tone_support: false,
              });
            } else {
              setHoveredEmoji(nextEmoji);
            }
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const emoji = currentRow.content[selectedColumn];
          if (emoji) {
            if (isCustomEmoji(emoji)) {
              onEmojiSelect(`:${emoji.name}:`);
            } else {
              setSelectedEmoji(emoji.emoji);
              onEmojiSelect(emoji.emoji);
            }
          }
          break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [
    rows,
    selectedRow,
    selectedColumn,
    selectedPosition,
    findNextEmojiRow,
    findFirstEmojiRow,
    setSelectedPosition,
    setHoveredEmoji,
    setSelectedEmoji,
    virtualizer,
    onEmojiSelect,
  ]);
}
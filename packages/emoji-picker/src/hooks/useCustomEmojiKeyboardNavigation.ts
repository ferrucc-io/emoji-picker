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
  | { type: 'emojis' | 'custom-emojis'; content: (EmojiMetadata | CustomEmoji)[] };

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

  const hoverEmoji = useCallback(
    (emoji: EmojiMetadata | CustomEmoji) => {
      if (isCustomEmoji(emoji)) {
        setHoveredEmoji({
          emoji: `:${emoji.name}:`,
          name: emoji.name,
          slug: emoji.name,
          skin_tone_support: false,
        });
      } else {
        setHoveredEmoji(emoji);
      }
    },
    [setHoveredEmoji]
  );

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
          hoverEmoji(firstRowData.content[0]);
          virtualizer.scrollToIndex(firstRow, { align: 'center' });
        }
      }
    }
  }, [search, rows, findFirstEmojiRow, setSelectedPosition, hoverEmoji, virtualizer]);

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
              hoverEmoji(firstRowData.content[0]);
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
              hoverEmoji(nextRowData.content[nextColumn]);
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
              hoverEmoji(nextRowData.content[nextColumn]);
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
            hoverEmoji(currentRow.content[nextColumn]);
          } else {
            const prevRow = findNextEmojiRow(selectedRow, 'up');
            if (prevRow !== selectedRow) {
              const prevRowData = rows[prevRow];
              if (prevRowData?.type === 'emojis' || prevRowData?.type === 'custom-emojis') {
                const lastColumn = prevRowData.content.length - 1;
                setSelectedPosition({ row: prevRow, column: lastColumn });
                hoverEmoji(prevRowData.content[lastColumn]);
                virtualizer.scrollToIndex(prevRow, { align: 'center' });
              }
            }
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (selectedColumn < maxColumns - 1) {
            const nextColumn = selectedColumn + 1;
            setSelectedPosition({ row: selectedRow, column: nextColumn });
            hoverEmoji(currentRow.content[nextColumn]);
          } else {
            const nextRow = findNextEmojiRow(selectedRow, 'down');
            if (nextRow !== selectedRow) {
              const nextRowData = rows[nextRow];
              if (nextRowData?.type === 'emojis' || nextRowData?.type === 'custom-emojis') {
                setSelectedPosition({ row: nextRow, column: 0 });
                hoverEmoji(nextRowData.content[0]);
                virtualizer.scrollToIndex(nextRow, { align: 'center' });
              }
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
    hoverEmoji,
    setSelectedEmoji,
    virtualizer,
    onEmojiSelect,
  ]);
}

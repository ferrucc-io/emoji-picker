import { useCallback, useEffect } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import {
  hoveredEmojiAtom,
  searchAtom,
  selectedEmojiAtom,
  selectedPositionAtom,
} from '../atoms/emoji';

import type { EmojiMetadata } from '../types/emoji';
type Row = { type: 'header'; content: string } | { type: 'emojis'; content: EmojiMetadata[] };

interface UseEmojiKeyboardNavigationProps {
  rows: Row[];
  virtualizer: {
    scrollToIndex: (index: number, options?: { align?: 'start' | 'center' | 'end' }) => void;
  };
}

export function useEmojiKeyboardNavigation({ rows, virtualizer }: UseEmojiKeyboardNavigationProps) {
  const setSelectedPosition = useSetAtom(selectedPositionAtom);
  const setHoveredEmoji = useSetAtom(hoveredEmojiAtom);
  const setSelectedEmoji = useSetAtom(selectedEmojiAtom);
  const search = useAtomValue(searchAtom);
  const selectedPosition = useAtomValue(selectedPositionAtom);

  const selectedRow = selectedPosition?.row ?? -1;
  const selectedColumn = selectedPosition?.column ?? -1;

  const findNextEmojiRow = useCallback(
    (currentRow: number, direction: 'up' | 'down'): number => {
      let nextRow = currentRow;

      while (true) {
        nextRow = direction === 'up' ? nextRow - 1 : nextRow + 1;

        // Check bounds
        if (nextRow < 0 || nextRow >= rows.length) {
          return currentRow;
        }

        // Found next emoji row
        if (rows[nextRow].type === 'emojis') {
          return nextRow;
        }
      }
    },
    [rows]
  );

  // Find first emoji row
  const findFirstEmojiRow = useCallback((): number => {
    for (let i = 0; i < rows.length; i++) {
      if (rows[i].type === 'emojis') {
        return i;
      }
    }
    return -1;
  }, [rows]);

  // Focus first emoji when search query changes and there are results
  useEffect(() => {
    if (search.trim() && rows.length > 0) {
      const firstRow = findFirstEmojiRow();
      if (firstRow !== -1) {
        setSelectedPosition({ row: firstRow, column: 0 });
        const firstRowData = rows[firstRow];
        if (firstRowData?.type === 'emojis' && firstRowData.content[0]) {
          setHoveredEmoji(firstRowData.content[0]);
          virtualizer.scrollToIndex(firstRow, { align: 'center' });
        }
      }
    }
  }, [search, rows, findFirstEmojiRow, setSelectedPosition, setHoveredEmoji, virtualizer]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedPosition) return;

      const currentRow = rows[selectedRow];
      if (!currentRow || currentRow.type !== 'emojis') return;

      const maxColumns = currentRow.content.length;

      switch (e.key) {
        case 'ArrowUp': {
          e.preventDefault();
          const nextRow = findNextEmojiRow(selectedRow, 'up');
          if (nextRow !== selectedRow) {
            const nextRowData = rows[nextRow];
            if (nextRowData?.type === 'emojis') {
              const nextColumn = Math.min(selectedColumn, nextRowData.content.length - 1);
              setSelectedPosition({ row: nextRow, column: nextColumn });
              setHoveredEmoji(nextRowData.content[nextColumn]);
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
            if (nextRowData?.type === 'emojis') {
              const nextColumn = Math.min(selectedColumn, nextRowData.content.length - 1);
              setSelectedPosition({ row: nextRow, column: nextColumn });
              setHoveredEmoji(nextRowData.content[nextColumn]);
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
            setHoveredEmoji(currentRow.content[nextColumn]);
          }
          break;
        }
        case 'ArrowRight': {
          e.preventDefault();
          if (selectedColumn < maxColumns - 1) {
            const nextColumn = selectedColumn + 1;
            setSelectedPosition({ row: selectedRow, column: nextColumn });
            setHoveredEmoji(currentRow.content[nextColumn]);
          }
          break;
        }
        case 'Enter':
        case ' ': {
          e.preventDefault();
          const emoji = currentRow.content[selectedColumn];
          if (emoji) {
            setSelectedEmoji(emoji.emoji);
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
    setSelectedPosition,
    setHoveredEmoji,
    setSelectedEmoji,
    virtualizer,
  ]);
}

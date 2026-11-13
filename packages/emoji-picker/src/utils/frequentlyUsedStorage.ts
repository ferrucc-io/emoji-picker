import { isCustomEmoji } from '../types/emoji';
import type {
  CustomEmoji,
  CustomSection,
  FrequentlyUsedStrategy,
  PersistFrequentlyUsedOptions,
} from '../types/emoji';

export const DEFAULT_FREQUENTLY_USED_KEY = '@ferrucc-io/emoji-picker:frequently-used';
export const DEFAULT_MAX_FREQUENTLY_USED = 18;
export const DEFAULT_FREQUENTLY_USED_STRATEGY: FrequentlyUsedStrategy = 'frecency';

export interface StoredEmojiEntry {
  value: string;
  customEmoji?: CustomEmoji;
  count: number;
  lastUsed: number;
  order: number;
}

interface StoredPayload {
  version: 1;
  strategy?: FrequentlyUsedStrategy;
  entries: StoredEmojiEntry[];
}

const clearListeners = new Set<(key: string) => void>();

export function subscribeFrequentlyUsedClear(listener: (key: string) => void): () => void {
  clearListeners.add(listener);
  return () => {
    clearListeners.delete(listener);
  };
}

export function resolvePersistFrequentlyUsedOptions(
  persist: boolean | PersistFrequentlyUsedOptions | undefined
): Required<PersistFrequentlyUsedOptions> | null {
  if (!persist) {
    return null;
  }

  if (persist === true) {
    return {
      key: DEFAULT_FREQUENTLY_USED_KEY,
      maxEmojis: DEFAULT_MAX_FREQUENTLY_USED,
      strategy: DEFAULT_FREQUENTLY_USED_STRATEGY,
    };
  }

  return {
    key: persist.key ?? DEFAULT_FREQUENTLY_USED_KEY,
    maxEmojis: Math.max(0, persist.maxEmojis ?? DEFAULT_MAX_FREQUENTLY_USED),
    strategy: persist.strategy ?? DEFAULT_FREQUENTLY_USED_STRATEGY,
  };
}

function isValidCustomEmoji(candidate: unknown): candidate is CustomEmoji {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const obj = candidate as Record<string, unknown>;
  return (
    typeof obj.id === 'string' && typeof obj.name === 'string' && typeof obj.imageUrl === 'string'
  );
}

function isValidStoredEntry(candidate: unknown): candidate is StoredEmojiEntry {
  if (!candidate || typeof candidate !== 'object') {
    return false;
  }
  const obj = candidate as Record<string, unknown>;
  return (
    typeof obj.value === 'string' &&
    obj.value.length > 0 &&
    typeof obj.count === 'number' &&
    Number.isFinite(obj.count) &&
    typeof obj.lastUsed === 'number' &&
    Number.isFinite(obj.lastUsed)
  );
}

export function calculateFrecencyScore(entry: StoredEmojiEntry, now = Date.now()): number {
  const ageHours = Math.max(0, now - entry.lastUsed) / (1000 * 60 * 60);
  return entry.count / (1 + ageHours / 24);
}

export function sortStoredEntries(
  entries: StoredEmojiEntry[],
  strategy: FrequentlyUsedStrategy,
  now = Date.now()
): StoredEmojiEntry[] {
  return [...entries].sort((a, b) => {
    if (strategy === 'recent') {
      return b.lastUsed - a.lastUsed || (b.order ?? 0) - (a.order ?? 0);
    }

    const scoreDiff = calculateFrecencyScore(b, now) - calculateFrecencyScore(a, now);
    if (Math.abs(scoreDiff) > 1e-9) {
      return scoreDiff;
    }
    return b.lastUsed - a.lastUsed || (b.order ?? 0) - (a.order ?? 0);
  });
}

export function readStoredPayload(key: string = DEFAULT_FREQUENTLY_USED_KEY): StoredPayload | null {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return null;
    }
    const raw = window.localStorage.getItem(key);
    if (!raw) {
      return null;
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    const rawEntries = Array.isArray(parsed)
      ? parsed
      : Array.isArray((parsed as { entries?: unknown }).entries)
        ? (parsed as { entries: unknown[] }).entries
        : null;

    if (!rawEntries) {
      return null;
    }

    const entries: StoredEmojiEntry[] = rawEntries.filter(isValidStoredEntry).map((entry, idx) => ({
      value: entry.value,
      ...(isValidCustomEmoji(entry.customEmoji) ? { customEmoji: entry.customEmoji } : {}),
      count: Math.max(1, entry.count),
      lastUsed: entry.lastUsed,
      order: typeof entry.order === 'number' && Number.isFinite(entry.order) ? entry.order : idx,
    }));

    const rawStrategy = (parsed as { strategy?: unknown }).strategy;
    const strategy: FrequentlyUsedStrategy | undefined =
      rawStrategy === 'recent' || rawStrategy === 'frecency' ? rawStrategy : undefined;

    return {
      version: 1,
      strategy,
      entries,
    };
  } catch {
    return null;
  }
}

export function writeStoredEntries(
  key: string,
  entries: StoredEmojiEntry[],
  strategy: FrequentlyUsedStrategy
): void {
  try {
    if (typeof window === 'undefined' || !window.localStorage) {
      return;
    }
    const payload: StoredPayload = {
      version: 1,
      strategy,
      entries,
    };
    window.localStorage.setItem(key, JSON.stringify(payload));
  } catch {
    // Ignore storage quota or SecurityError exceptions in restricted/SSR environments
  }
}

export function loadInitialFrequentlyUsedEntries(
  options: Required<PersistFrequentlyUsedOptions>,
  seedEmojis: (string | CustomEmoji)[] = [],
  now = Date.now()
): StoredEmojiEntry[] {
  if (options.maxEmojis <= 0) {
    return [];
  }

  const stored = readStoredPayload(options.key);
  const sortedStored = stored ? sortStoredEntries(stored.entries, options.strategy, now) : [];
  const combined: StoredEmojiEntry[] = [...sortedStored];
  const seen = new Set(combined.map((e) => e.value));

  seedEmojis.forEach((seed, idx) => {
    if (combined.length >= options.maxEmojis) {
      return;
    }
    const value = typeof seed === 'string' ? seed : `:${seed.name}:`;
    if (!value || seen.has(value)) {
      return;
    }
    seen.add(value);
    combined.push({
      value,
      ...(typeof seed !== 'string' ? { customEmoji: seed } : {}),
      count: 1,
      lastUsed: 0,
      order: -idx - 1,
    });
  });

  return combined.slice(0, options.maxEmojis);
}

export function updateFrequentlyUsedEntries(
  currentEntries: StoredEmojiEntry[],
  selectedEmoji: string,
  customEmoji: CustomEmoji | undefined,
  options: Required<PersistFrequentlyUsedOptions>,
  now = Date.now()
): StoredEmojiEntry[] {
  if (options.maxEmojis <= 0 || !selectedEmoji) {
    return [];
  }

  const nextOrder = currentEntries.reduce((max, e) => Math.max(max, e.order || 0), 0) + 1;
  const existingIndex = currentEntries.findIndex((e) => e.value === selectedEmoji);

  let updated: StoredEmojiEntry[];
  if (existingIndex !== -1) {
    const existing = currentEntries[existingIndex];
    const nextEntry: StoredEmojiEntry = {
      value: existing.value,
      ...((customEmoji ?? existing.customEmoji)
        ? { customEmoji: customEmoji ?? existing.customEmoji }
        : {}),
      count: existing.count + 1,
      lastUsed: now,
      order: nextOrder,
    };
    updated = currentEntries.map((entry, idx) => (idx === existingIndex ? nextEntry : entry));
  } else {
    const sortedExisting = sortStoredEntries(currentEntries, options.strategy, now);
    const trimmed =
      sortedExisting.length >= options.maxEmojis
        ? sortedExisting.slice(0, options.maxEmojis - 1)
        : sortedExisting;
    updated = [
      ...trimmed,
      {
        value: selectedEmoji,
        ...(customEmoji ? { customEmoji } : {}),
        count: 1,
        lastUsed: now,
        order: nextOrder,
      },
    ];
  }

  const finalEntries = sortStoredEntries(updated, options.strategy, now).slice(
    0,
    options.maxEmojis
  );
  writeStoredEntries(options.key, finalEntries, options.strategy);
  return finalEntries;
}

export function entriesToFrequentlyUsedItems(
  entries: StoredEmojiEntry[],
  customSections: CustomSection[] = []
): (string | CustomEmoji)[] {
  const customByShortcode = new Map<string, CustomEmoji>();
  for (const section of customSections) {
    for (const item of section.emojis) {
      if (isCustomEmoji(item)) {
        customByShortcode.set(`:${item.name}:`, item);
      }
    }
  }

  return entries.map((entry) => {
    const liveCustom = customByShortcode.get(entry.value);
    if (liveCustom) {
      return liveCustom;
    }
    if (entry.customEmoji) {
      return entry.customEmoji;
    }
    return entry.value;
  });
}

export function getFrequentlyUsedEmojis(
  key: string = DEFAULT_FREQUENTLY_USED_KEY
): (string | CustomEmoji)[] {
  const payload = readStoredPayload(key);
  if (!payload) {
    return [];
  }
  const sorted = sortStoredEntries(
    payload.entries,
    payload.strategy ?? DEFAULT_FREQUENTLY_USED_STRATEGY
  );
  return sorted.map((entry) => entry.customEmoji ?? entry.value);
}

export function clearFrequentlyUsedEmojis(key: string = DEFAULT_FREQUENTLY_USED_KEY): void {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    }
  } catch {
    // Ignore SecurityError in restricted/SSR environments
  }
  clearListeners.forEach((listener) => listener(key));
}

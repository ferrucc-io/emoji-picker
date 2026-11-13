// Runs in a standalone `bun run` subprocess (see bugFixes.test.tsx) so that the
// full <EmojiPicker> integration tests execute against real unmocked modules,
// unaffected by other test files' global `mock.module` calls.
import { GlobalRegistrator } from '@happy-dom/global-registrator';
import React from 'react';
import { mock } from 'bun:test';

GlobalRegistrator.register();

// Ensure `isEmojiFullySupported` skips canvas detection just like `bun test`
process.env.NODE_ENV = 'test';

// In happy-dom scroll containers have 0px clientHeight, so render all rows in the
// virtualizer while keeping a stable virtualizer instance across renders.
mock.module('@tanstack/react-virtual', () => ({
  useVirtualizer: (options: { count: number; estimateSize?: (index: number) => number }) => {
    const optionsRef = React.useRef(options);
    optionsRef.current = options;
    return React.useMemo(
      () => ({
        getVirtualItems: () =>
          Array.from({ length: optionsRef.current.count }, (_, index) => ({
            index,
            start: index * 32,
            size: optionsRef.current.estimateSize ? optionsRef.current.estimateSize(index) : 32,
            key: String(index),
            measureElement: null,
          })),
        getTotalSize: () => optionsRef.current.count * 32,
        scrollToIndex: () => {},
      }),
      []
    );
  },
  defaultRangeExtractor: (range: unknown) => range,
}));

const { cleanup, fireEvent, render } = await import('@testing-library/react');
const { EmojiPicker } = await import('../EmojiPicker');

type ScenarioResult = {
  id: string;
  passed: boolean;
  error?: string;
};

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

const results: ScenarioResult[] = [];

function runScenario(id: string, fn: () => void) {
  try {
    cleanup();
    fn();
    cleanup();
    results.push({ id, passed: true });
  } catch (err) {
    cleanup();
    results.push({
      id,
      passed: false,
      error: err instanceof Error ? (err.stack ?? err.message) : String(err),
    });
  }
}

// Scenario 1: Spacebar inside EmojiPicker.Input does NOT hijack multi-word search
runScenario('spacebar-in-search-input', () => {
  const selected: string[] = [];
  const onEmojiSelect = (emoji: string) => selected.push(emoji);

  const { container } = render(
    <EmojiPicker onEmojiSelect={onEmojiSelect}>
      <EmojiPicker.Header>
        <EmojiPicker.Input placeholder="Search emoji" />
      </EmojiPicker.Header>
      <EmojiPicker.List />
    </EmojiPicker>
  );

  const input = container.querySelector('input[placeholder="Search emoji"]');
  assert(input, 'Expected search input to exist');

  fireEvent.change(input, { target: { value: 'thumbs' } });
  assert(
    container.querySelector('button[data-emoji="👍"]'),
    'Expected thumbs up in search results'
  );

  const spaceEvent = new KeyboardEvent('keydown', {
    key: ' ',
    bubbles: true,
    cancelable: true,
  });
  const notCancelled = input.dispatchEvent(spaceEvent);

  assert(notCancelled === true, 'Expected Space keydown event not to be cancelled');
  assert(spaceEvent.defaultPrevented === false, 'Expected defaultPrevented to be false');
  assert(selected.length === 0, `Expected onEmojiSelect not to be called, got ${selected.join()}`);

  // Multi-word query "thumbs up" continues working and Enter selects the result
  fireEvent.change(input, { target: { value: 'thumbs up' } });
  assert(
    container.querySelector('button[data-emoji="👍"]'),
    'Expected thumbs up after multi-word search'
  );

  fireEvent.keyDown(input, { key: 'Enter' });
  assert(
    selected.length === 1 && selected[0] === '👍',
    `Expected Enter to select 👍, got ${selected.join()}`
  );
});

// Scenario 2: External editable inputs outside EmojiPicker do NOT move or trigger picker selection
runScenario('external-input-guard', () => {
  const selected: string[] = [];
  const onEmojiSelect = (emoji: string) => selected.push(emoji);

  const { getByTestId, container } = render(
    <div>
      <input data-testid="external-input" type="text" />
      <textarea data-testid="external-textarea" />
      <button data-testid="external-button" type="button">
        Tab
      </button>
      <EmojiPicker onEmojiSelect={onEmojiSelect}>
        <EmojiPicker.Header>
          <EmojiPicker.Input placeholder="Search emoji" />
        </EmojiPicker.Header>
        <EmojiPicker.List />
      </EmojiPicker>
    </div>
  );

  const externalInput = getByTestId('external-input');
  const externalTextarea = getByTestId('external-textarea');

  const downEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    bubbles: true,
    cancelable: true,
  });
  externalInput.dispatchEvent(downEvent);
  assert(!downEvent.defaultPrevented, 'Expected ArrowDown in external input not to preventDefault');
  assert(
    !container.querySelector('button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'),
    'Expected no emoji selection after ArrowDown in external input'
  );

  const textareaDownEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    bubbles: true,
    cancelable: true,
  });
  externalTextarea.dispatchEvent(textareaDownEvent);
  assert(
    !textareaDownEvent.defaultPrevented,
    'Expected ArrowDown in external textarea not to preventDefault'
  );
  assert(
    !container.querySelector('button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'),
    'Expected no emoji selection after ArrowDown in external textarea'
  );

  // Non-editable external button (e.g. a tab button) still allows ArrowDown navigation
  const externalButton = getByTestId('external-button');
  fireEvent.keyDown(externalButton, { key: 'ArrowDown' });
  const selectedBtn = container.querySelector(
    'button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'
  );
  assert(selectedBtn, 'Expected ArrowDown on non-editable button to initialize selection');
  const firstSelectedEmoji = selectedBtn.getAttribute('data-emoji');

  // Even when picker already has an active selection, keys in external input do not move/select
  fireEvent.keyDown(externalInput, { key: 'ArrowRight' });
  fireEvent.keyDown(externalInput, { key: 'Enter' });
  assert(selected.length === 0, 'Expected Enter in external input not to select emoji');
  assert(
    container
      .querySelector('button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]')
      ?.getAttribute('data-emoji') === firstSelectedEmoji,
    'Expected selection inside picker not to move when ArrowRight is pressed in external input'
  );
});

// Scenario 3: External input guard with CustomEmojiCategories (frequentlyUsedEmojis / customSections)
runScenario('external-input-guard-custom', () => {
  const selected: string[] = [];
  const onEmojiSelect = (emoji: string) => selected.push(emoji);

  const { getByTestId, container } = render(
    <div>
      <input data-testid="external-input" type="text" />
      <EmojiPicker frequentlyUsedEmojis={['👍']} onEmojiSelect={onEmojiSelect}>
        <EmojiPicker.Header>
          <EmojiPicker.Input placeholder="Search emoji" />
        </EmojiPicker.Header>
        <EmojiPicker.List />
      </EmojiPicker>
    </div>
  );

  const externalInput = getByTestId('external-input');
  const downEvent = new KeyboardEvent('keydown', {
    key: 'ArrowDown',
    bubbles: true,
    cancelable: true,
  });
  externalInput.dispatchEvent(downEvent);

  assert(!downEvent.defaultPrevented, 'Expected ArrowDown in external input not to preventDefault');
  assert(
    !container.querySelector('button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'),
    'Expected no emoji selection in CustomEmojiCategories'
  );
  assert(selected.length === 0, 'Expected no emoji selected');
});

// Scenario 4: maxUnicodeVersion={16.0} vs maxUnicodeVersion={14.0} & {15.0} in category list and search
runScenario('max-unicode-version', () => {
  const { container: container16 } = render(
    <EmojiPicker maxUnicodeVersion={16.0}>
      <EmojiPicker.Header>
        <EmojiPicker.Input placeholder="Search 16" />
      </EmojiPicker.Header>
      <EmojiPicker.List />
    </EmojiPicker>
  );

  // Category list with 16.0 includes 🫨 (15.0), 🙂‍↔️ & 🐦‍🔥 (15.1), and 🫩 (16.0)
  assert(container16.querySelector('button[data-emoji="🫨"]'), 'Expected 🫨 in 16.0 category list');
  assert(container16.querySelector('button[data-emoji="🙂‍↔️"]'), 'Expected 🙂‍↔️ in 16.0 category list');
  assert(container16.querySelector('button[data-emoji="🐦‍🔥"]'), 'Expected 🐦‍🔥 in 16.0 category list');
  assert(container16.querySelector('button[data-emoji="🫩"]'), 'Expected 🫩 in 16.0 category list');

  const input16 = container16.querySelector('input[placeholder="Search 16"]')!;
  fireEvent.change(input16, { target: { value: 'shaking' } });
  assert(container16.querySelector('button[data-emoji="🫨"]'), 'Expected 🫨 in 16.0 search');
  assert(container16.querySelector('button[data-emoji="🙂‍↔️"]'), 'Expected 🙂‍↔️ in 16.0 search');

  fireEvent.change(input16, { target: { value: 'phoenix' } });
  assert(container16.querySelector('button[data-emoji="🐦‍🔥"]'), 'Expected 🐦‍🔥 in 16.0 search');

  fireEvent.change(input16, { target: { value: 'bags under eyes' } });
  assert(container16.querySelector('button[data-emoji="🫩"]'), 'Expected 🫩 in 16.0 search');

  // Render with maxUnicodeVersion={15.0}
  const { container: container15 } = render(
    <EmojiPicker maxUnicodeVersion={15.0}>
      <EmojiPicker.Header>
        <EmojiPicker.Input placeholder="Search 15" />
      </EmojiPicker.Header>
      <EmojiPicker.List />
    </EmojiPicker>
  );

  assert(container15.querySelector('button[data-emoji="🫨"]'), 'Expected 🫨 in 15.0 category list');
  assert(
    !container15.querySelector('button[data-emoji="🙂‍↔️"]'),
    'Expected 🙂‍↔️ hidden in 15.0 category list'
  );
  assert(
    !container15.querySelector('button[data-emoji="🐦‍🔥"]'),
    'Expected 🐦‍🔥 hidden in 15.0 category list'
  );
  assert(
    !container15.querySelector('button[data-emoji="🫩"]'),
    'Expected 🫩 hidden in 15.0 category list'
  );

  const input15 = container15.querySelector('input[placeholder="Search 15"]')!;
  fireEvent.change(input15, { target: { value: 'phoenix' } });
  assert(
    !container15.querySelector('button[data-emoji="🐦‍🔥"]'),
    'Expected 🐦‍🔥 hidden in 15.0 search'
  );
  assert(
    container15.textContent?.includes('No emojis found'),
    'Expected empty state for phoenix under 15.0'
  );

  // Render with maxUnicodeVersion={14.0}
  const { container: container14 } = render(
    <EmojiPicker maxUnicodeVersion={14.0}>
      <EmojiPicker.Header>
        <EmojiPicker.Input placeholder="Search 14" />
      </EmojiPicker.Header>
      <EmojiPicker.List />
    </EmojiPicker>
  );

  assert(container14.querySelector('button[data-emoji="😀"]'), 'Expected 😀 in 14.0 category list');
  assert(container14.querySelector('button[data-emoji="🫠"]'), 'Expected 🫠 in 14.0 category list');
  assert(
    !container14.querySelector('button[data-emoji="🫨"]'),
    'Expected 🫨 hidden in 14.0 category list'
  );
  assert(
    !container14.querySelector('button[data-emoji="🙂‍↔️"]'),
    'Expected 🙂‍↔️ hidden in 14.0 category list'
  );
  assert(
    !container14.querySelector('button[data-emoji="🐦‍🔥"]'),
    'Expected 🐦‍🔥 hidden in 14.0 category list'
  );
  assert(
    !container14.querySelector('button[data-emoji="🫩"]'),
    'Expected 🫩 hidden in 14.0 category list'
  );

  const input14 = container14.querySelector('input[placeholder="Search 14"]')!;
  fireEvent.change(input14, { target: { value: 'shaking' } });
  assert(
    !container14.querySelector('button[data-emoji="🫨"]'),
    'Expected 🫨 hidden in 14.0 search'
  );
  assert(
    !container14.querySelector('button[data-emoji="🙂‍↔️"]'),
    'Expected 🙂‍↔️ hidden in 14.0 search'
  );
  assert(
    container14.textContent?.includes('No emojis found'),
    'Expected empty state for shaking under 14.0'
  );
});

// Scenario 5: Skin tone applied in EmojiSearchResults (Enter) and EmojiPicker.Content preview (hover)
runScenario('skin-tone-search-and-preview', () => {
  const selected: string[] = [];
  const onEmojiSelect = (emoji: string) => selected.push(emoji);

  const { container } = render(
    <EmojiPicker onEmojiSelect={onEmojiSelect}>
      <EmojiPicker.Header>
        <EmojiPicker.Input placeholder="Search emoji" />
      </EmojiPicker.Header>
      <EmojiPicker.List />
      <EmojiPicker.Preview>
        {({ previewedEmoji }) => (
          <>
            <div data-testid="preview-area">{previewedEmoji ? <EmojiPicker.Content /> : null}</div>
            <EmojiPicker.SkinTone />
          </>
        )}
      </EmojiPicker.Preview>
    </EmojiPicker>
  );

  const skinToneTrigger = Array.from(container.querySelectorAll('button')).find(
    (btn) => !btn.hasAttribute('data-emoji') && btn.textContent?.includes('✋')
  );
  assert(skinToneTrigger, 'Expected skin tone trigger button');
  fireEvent.click(skinToneTrigger);

  const darkSkinToneButton = Array.from(container.querySelectorAll('button')).find(
    (btn) => !btn.hasAttribute('data-emoji') && btn.textContent?.includes('✋🏿')
  );
  assert(darkSkinToneButton, 'Expected dark skin tone option button');
  fireEvent.click(darkSkinToneButton);

  const input = container.querySelector('input[placeholder="Search emoji"]')!;
  fireEvent.change(input, { target: { value: 'thumbs up' } });

  const tonedThumbsButton = container.querySelector('button[data-emoji="👍🏿"]');
  assert(tonedThumbsButton, 'Expected search result button to have dark skin tone 👍🏿');

  fireEvent.mouseEnter(tonedThumbsButton);
  const previewArea = container.querySelector('[data-testid="preview-area"]')!;
  assert(previewArea.textContent?.includes('👍🏿'), 'Expected preview to show 👍🏿');
  assert(previewArea.textContent?.includes('thumbs up'), 'Expected preview to show thumbs up');
  assert(previewArea.textContent?.includes(':thumbs_up:'), 'Expected preview to show :thumbs_up:');

  fireEvent.keyDown(input, { key: 'Enter' });
  assert(
    selected.length === 1 && selected[0] === '👍🏿',
    `Expected Enter on search result to select 👍🏿, got ${selected.join()}`
  );
});

// Scenario 6: Canonical metadata lookup for string entries in frequentlyUsedEmojis
runScenario('frequently-used-canonical-metadata', () => {
  const selected: string[] = [];
  const onEmojiSelect = (emoji: string) => selected.push(emoji);

  const { container } = render(
    <EmojiPicker frequentlyUsedEmojis={['👍', '❤', 'unknown-token']} onEmojiSelect={onEmojiSelect}>
      <EmojiPicker.List />
      <EmojiPicker.Preview>
        {({ previewedEmoji }) => (
          <>
            <div data-testid="preview-area">{previewedEmoji ? <EmojiPicker.Content /> : null}</div>
            <EmojiPicker.SkinTone />
          </>
        )}
      </EmojiPicker.Preview>
    </EmojiPicker>
  );

  const frequentlyUsedRow = container.querySelector('[data-type="custom-emojis"]');
  assert(frequentlyUsedRow, 'Expected Frequently Used row');

  const thumbsButton = frequentlyUsedRow.querySelector('button[data-emoji="👍"]');
  assert(thumbsButton, 'Expected 👍 button in Frequently Used');

  fireEvent.mouseEnter(thumbsButton);
  const previewArea = container.querySelector('[data-testid="preview-area"]')!;
  assert(previewArea.textContent?.includes('👍'), 'Expected preview to show 👍');
  assert(previewArea.textContent?.includes('thumbs up'), 'Expected preview to show thumbs up');
  assert(previewArea.textContent?.includes(':thumbs_up:'), 'Expected preview to show :thumbs_up:');
  assert(
    !previewArea.textContent?.includes('frequently-used-'),
    'Expected preview not to show synthetic frequently-used- metadata'
  );

  const heartButton = frequentlyUsedRow.querySelector('button[data-emoji="❤️"]');
  assert(heartButton, 'Expected ❤️ button resolved from stripped variation selector ❤');
  fireEvent.mouseEnter(heartButton);
  assert(previewArea.textContent?.includes('red heart'), 'Expected preview to show red heart');
  assert(previewArea.textContent?.includes(':red_heart:'), 'Expected preview to show :red_heart:');

  const unknownButton = frequentlyUsedRow.querySelector('button[data-emoji="unknown-token"]');
  assert(unknownButton, 'Expected unknown string to render fallback button gracefully');

  const skinToneTrigger = Array.from(container.querySelectorAll('button')).find(
    (btn) => !btn.hasAttribute('data-emoji') && btn.textContent?.includes('✋')
  )!;
  fireEvent.click(skinToneTrigger);

  const darkSkinToneButton = Array.from(container.querySelectorAll('button')).find(
    (btn) => !btn.hasAttribute('data-emoji') && btn.textContent?.includes('✋🏿')
  )!;
  fireEvent.click(darkSkinToneButton);

  const updatedFrequentlyUsedRow = container.querySelector('[data-type="custom-emojis"]')!;
  const darkThumbsButton = updatedFrequentlyUsedRow.querySelector('button[data-emoji="👍🏿"]');
  assert(darkThumbsButton, 'Expected 👍🏿 in Frequently Used after selecting dark skin tone');

  fireEvent.mouseEnter(darkThumbsButton);
  assert(previewArea.textContent?.includes('👍🏿'), 'Expected preview to show 👍🏿 on hover');
  assert(previewArea.textContent?.includes('thumbs up'), 'Expected preview to show thumbs up');
  assert(previewArea.textContent?.includes(':thumbs_up:'), 'Expected preview to show :thumbs_up:');

  fireEvent.click(darkThumbsButton);
  assert(
    selected.length === 1 && selected[0] === '👍🏿',
    `Expected clicking 👍🏿 in Frequently Used to select 👍🏿, got ${selected.join()}`
  );
});

console.log(JSON.stringify(results));

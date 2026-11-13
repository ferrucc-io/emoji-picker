import { beforeAll, describe, expect, test } from 'bun:test';

type ScenarioResult = {
  id: string;
  passed: boolean;
  error?: string;
};

// Other test files in this suite register process-wide `mock.module(...)` stubs for
// `@tanstack/react-virtual`, `unicode-emoji-json/data-by-group.json`, `supportedEmojis`,
// and `atoms/emoji`. Running the end-to-end <EmojiPicker> scenarios in a clean `bun run`
// subprocess (same pattern as `importSideEffects.test.tsx`) guarantees both pristine real
// modules here and zero mock leakage into sibling test files regardless of file order.
describe('v0.1.2 Core Bug Fixes', () => {
  const resultsById = new Map<string, ScenarioResult>();

  beforeAll(() => {
    const fixturePath = new URL('./bugFixes.fixture.tsx', import.meta.url).pathname;

    const result = Bun.spawnSync(['bun', 'run', fixturePath], {
      stdout: 'pipe',
      stderr: 'pipe',
    });

    const stdout = result.stdout.toString('utf8');
    const stderr = result.stderr.toString('utf8');
    const exitCode = result.exitCode;

    expect(exitCode, stderr).toBe(0);

    const parsed = JSON.parse(stdout.trim()) as ScenarioResult[];
    for (const item of parsed) {
      resultsById.set(item.id, item);
    }
  });

  const expectScenarioPassed = (id: string) => {
    const result = resultsById.get(id);
    expect(result, `Missing scenario result for "${id}"`).toBeDefined();
    if (!result?.passed) {
      throw new Error(result?.error ?? `Scenario "${id}" failed`);
    }
  };

  test('pressing Space inside EmojiPicker.Input while search results exist does NOT call onEmojiSelect or preventDefault', () => {
    expectScenarioPassed('spacebar-in-search-input');
  });

  test('pressing ArrowDown inside an external input outside EmojiPicker does NOT move picker selection', () => {
    expectScenarioPassed('external-input-guard');
  });

  test('external input guard also applies when customSections / frequentlyUsedEmojis are active', () => {
    expectScenarioPassed('external-input-guard-custom');
  });

  test('maxUnicodeVersion={16.0} includes Unicode 15.1/16.0 emojis in category list and search while maxUnicodeVersion={14.0} hides them', () => {
    expectScenarioPassed('max-unicode-version');
  });

  test('selecting dark skin tone applies skin tone in EmojiSearchResults on Enter and in EmojiPicker.Content preview on hover', () => {
    expectScenarioPassed('skin-tone-search-and-preview');
  });

  test('frequentlyUsedEmojis={["👍"]} renders canonical metadata in preview on hover and applies active skin tone', () => {
    expectScenarioPassed('frequently-used-canonical-metadata');
  });
});

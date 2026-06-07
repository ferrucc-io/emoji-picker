import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';

// The Slack variant of the playground ships custom emoji sections backed by
// local assets in demo/public/custom-emojis/.
async function openSlackVariant(page: Page) {
  await page.goto('/');
  await page.locator('button', { hasText: 'Slack' }).click();
  await page.locator('button[data-emoji=":mic-drop:"]').waitFor();
}

test.describe('Custom emoji sections', () => {
  test('renders the Custom section with image-based emoji buttons', async ({ page }) => {
    await openSlackVariant(page);

    // The "Custom" section header is rendered
    const headers = page.locator('[data-testid="emoji-picker-list-header"]');
    await expect(headers.filter({ hasText: 'Custom' }).first()).toBeVisible();

    // Custom emojis render as buttons with images served from local assets
    for (const name of ['mic-drop', 'thisisfine', 'typescript']) {
      const button = page.locator(`button[data-emoji=":${name}:"]`).first();
      await expect(button).toBeVisible();
      await expect(button.locator('img')).toHaveAttribute(
        'src',
        new RegExp(`/custom-emojis/${name}\\.(gif|png|jpg)$`)
      );
    }
  });

  test('clicking a custom emoji selects its shortcode', async ({ page }) => {
    await openSlackVariant(page);

    await page.locator('button[data-emoji=":mic-drop:"]').first().click();

    // The hero renders selected custom emojis as images
    const heroImage = page.locator('img[alt=":mic-drop:"]');
    await expect(heroImage).toBeVisible();
    await expect(heroImage).toHaveAttribute('src', '/custom-emojis/mic-drop.gif');
  });

  test('hovering a custom emoji shows its image and shortcode in the preview', async ({
    page,
  }) => {
    await openSlackVariant(page);

    const customButton = page.locator('button[data-emoji=":typescript:"]').first();
    await customButton.hover();

    // Preview shows the custom emoji image and its :shortcode:.
    // The button's own image is lazy-loaded; the preview image is not.
    await expect(page.locator('img[alt="typescript"]:not([loading="lazy"])')).toBeVisible();
    await expect(page.getByText(':typescript:')).toBeVisible();
  });

  test('frequently used section mixes standard and custom emojis', async ({ page }) => {
    await openSlackVariant(page);

    const headers = page.locator('[data-testid="emoji-picker-list-header"]');
    await expect(headers.filter({ hasText: 'Frequently Used' }).first()).toBeVisible();

    // Standard emoji and custom emoji live in the same section
    await expect(page.locator('button[data-emoji="👍"]').first()).toBeVisible();
    await expect(page.locator('button[data-emoji=":thisisfine:"]').first()).toBeVisible();
  });

  test('keyboard navigation selects a custom emoji with Enter', async ({ page }) => {
    await openSlackVariant(page);

    // ArrowDown initializes selection on the first row (Frequently Used):
    // 👍, ❤️, :thisisfine:, ...
    await page.keyboard.press('ArrowDown');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('Enter');

    const heroImage = page.locator('img[alt=":thisisfine:"]');
    await expect(heroImage).toBeVisible();
  });
});

test.describe('Custom emoji search', () => {
  test('search finds custom emojis by name', async ({ page }) => {
    await openSlackVariant(page);

    const searchInput = page.locator('input[placeholder="Search all emoji"]');
    await searchInput.fill('thisisfine');
    await page.waitForTimeout(300);

    const result = page.locator('button[data-emoji=":thisisfine:"]');
    await expect(result.first()).toBeVisible();

    await result.first().click();
    await expect(page.locator('img[alt=":thisisfine:"]')).toBeVisible();
  });

  test('search mixes custom and standard emoji results', async ({ page }) => {
    await openSlackVariant(page);

    const searchInput = page.locator('input[placeholder="Search all emoji"]');
    await searchInput.fill('mic');
    await page.waitForTimeout(300);

    // Custom match comes first
    await expect(page.locator('button[data-emoji=":mic-drop:"]').first()).toBeVisible();

    // Standard matches (e.g. microphone, microbe) are still present
    const standardResults = page.locator('button[data-emoji]:not([data-custom-emoji])');
    expect(await standardResults.count()).toBeGreaterThan(0);
  });

  test('search that only matches a custom emoji does not show the empty state', async ({
    page,
  }) => {
    await openSlackVariant(page);

    const searchInput = page.locator('input[placeholder="Search all emoji"]');
    await searchInput.fill('typescript');
    await page.waitForTimeout(300);

    await expect(page.locator('button[data-emoji=":typescript:"]').first()).toBeVisible();
  });

  test('Enter selects the first search result when it is a custom emoji', async ({ page }) => {
    await openSlackVariant(page);

    const searchInput = page.locator('input[placeholder="Search all emoji"]');
    await searchInput.fill('typescript');

    // Search initializes keyboard selection on the first result row
    await page.locator('button[data-emoji=":typescript:"]').first().waitFor();
    await page.keyboard.press('Enter');

    const heroImage = page.locator('img[alt=":typescript:"]');
    await expect(heroImage).toBeVisible();
    await expect(heroImage).toHaveAttribute('src', '/custom-emojis/typescript.png');
  });

  test('clearing search restores custom sections', async ({ page }) => {
    await openSlackVariant(page);

    const searchInput = page.locator('input[placeholder="Search all emoji"]');
    await searchInput.fill('typescript');
    await page.locator('button[data-emoji=":typescript:"]').first().waitFor();

    await searchInput.press('Escape');
    await expect(searchInput).toHaveValue('');

    // Custom section and frequently used come back
    await expect(page.locator('button[data-emoji=":mic-drop:"]').first()).toBeVisible();
    const headers = page.locator('[data-testid="emoji-picker-list-header"]');
    await expect(headers.filter({ hasText: 'Frequently Used' }).first()).toBeVisible();
  });
});

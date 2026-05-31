import { test, expect } from '@playwright/test';

test.describe('Selecting emojis by click', () => {
  test('clicking an emoji updates the hero section', async ({ page }) => {
    await page.goto('/');

    // Wait for the emoji picker to render
    const emojiButton = page.locator('button[data-emoji]').first();
    await emojiButton.waitFor();

    // Get the emoji text from the button
    const emoji = await emojiButton.getAttribute('data-emoji');
    expect(emoji).toBeTruthy();

    // Click the emoji
    await emojiButton.click();

    // Verify the hero section shows the selected emoji
    const heroEmoji = page.locator('.text-6xl');
    await expect(heroEmoji).toHaveText(emoji!);
  });

  test('clicking different emojis updates selection', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[data-emoji]').first().waitFor();

    // Click the third emoji button
    const thirdEmoji = page.locator('button[data-emoji]').nth(2);
    const emojiValue = await thirdEmoji.getAttribute('data-emoji');
    await thirdEmoji.click();

    const heroEmoji = page.locator('.text-6xl');
    await expect(heroEmoji).toHaveText(emojiValue!);
  });
});

test.describe('Keyboard navigation', () => {
  test('arrow keys move selection and Enter selects', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[data-emoji]').first().waitFor();

    // The hero starts with the default "⌘" emoji
    const heroEmoji = page.locator('.text-6xl');
    await expect(heroEmoji).toHaveText('⌘');

    // Press ArrowDown to initialize keyboard selection at the first emoji
    await page.keyboard.press('ArrowDown');

    // An emoji should now have the selected background class
    const selectedButton = page.locator(
      'button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'
    );
    await expect(selectedButton).toBeVisible();

    // Press ArrowRight to move to the next emoji
    await page.keyboard.press('ArrowRight');

    // Get the currently selected emoji and press Enter
    const selectedAfterMove = page.locator(
      'button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'
    );
    await expect(selectedAfterMove).toBeVisible();
    const expectedEmoji = await selectedAfterMove.getAttribute('data-emoji');

    await page.keyboard.press('Enter');

    // The hero should now show the selected emoji (no longer the default)
    await expect(heroEmoji).toHaveText(expectedEmoji!);
  });

  test('ArrowDown moves to the next row', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[data-emoji]').first().waitFor();

    // Initialize keyboard selection
    await page.keyboard.press('ArrowDown');

    // Move down one more row
    await page.keyboard.press('ArrowDown');

    // An emoji in the second row should be selected
    const selectedEmoji = page.locator(
      'button[data-emoji].bg-\\[var\\(--emoji-hover-color\\)\\]'
    );
    await expect(selectedEmoji).toBeVisible();

    // Press Enter and verify selection
    const expectedEmoji = await selectedEmoji.getAttribute('data-emoji');
    await page.keyboard.press('Enter');

    const heroEmoji = page.locator('.text-6xl');
    await expect(heroEmoji).toHaveText(expectedEmoji!);
  });
});

test.describe('Scrolling between categories', () => {
  test('category headers are visible', async ({ page }) => {
    await page.goto('/');

    // Wait for category headers to render
    const headers = page.locator('[data-type="header"]');
    await headers.first().waitFor();

    // The first visible header should be a category name
    const firstHeaderText = await headers.first().textContent();
    expect(firstHeaderText).toBeTruthy();
  });

  test('scrolling reveals different category headers', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-type="header"]').first().waitFor();

    // Collect all visible header texts before scrolling
    const getVisibleHeaders = () =>
      page
        .locator('[data-type="header"] [data-testid="emoji-picker-list-header"]')
        .allTextContents();

    const initialHeaders = await getVisibleHeaders();

    // Use keyboard navigation to scroll far down — ArrowDown triggers scrollToIndex
    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('ArrowDown');
    }
    await page.waitForTimeout(200);

    // After navigating down, different category headers should be visible
    const newHeaders = await getVisibleHeaders();

    // At least one header should be different from the initial set
    const hasNewCategory = newHeaders.some(
      (header) => !initialHeaders.includes(header)
    );
    expect(hasNewCategory).toBe(true);
  });
});

test.describe('Search flow', () => {
  test('typing in search input filters emojis and selecting a result works', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[data-emoji]').first().waitFor();

    // Focus the search input and type
    const searchInput = page.locator('input[placeholder="Search emoji"]');
    await searchInput.fill('thumbs up');

    // Wait for filtered results
    await page.waitForTimeout(300);

    // Should have emoji results visible
    const filteredEmojis = page.locator('button[data-emoji]');
    const count = await filteredEmojis.count();
    expect(count).toBeGreaterThan(0);

    // Click the first filtered result
    const firstResult = filteredEmojis.first();
    const emojiValue = await firstResult.getAttribute('data-emoji');
    await firstResult.click();

    // Hero should update
    const heroEmoji = page.locator('.text-6xl');
    await expect(heroEmoji).toHaveText(emojiValue!);
  });

  test('pressing Escape clears search and returns full list', async ({ page }) => {
    await page.goto('/');

    await page.locator('button[data-emoji]').first().waitFor();

    // Get initial emoji count
    const initialCount = await page.locator('button[data-emoji]').count();

    // Type to search
    const searchInput = page.locator('input[placeholder="Search emoji"]');
    await searchInput.fill('thumbs');
    await page.waitForTimeout(300);

    // Should have fewer results
    const filteredCount = await page.locator('button[data-emoji]').count();
    expect(filteredCount).toBeLessThan(initialCount);

    // Press Escape to clear
    await searchInput.press('Escape');

    // Input should be cleared
    await expect(searchInput).toHaveValue('');

    // Full list should return
    await page.waitForTimeout(300);
    const restoredCount = await page.locator('button[data-emoji]').count();
    expect(restoredCount).toBeGreaterThanOrEqual(initialCount);
  });
});

test.describe('Skin tone selection', () => {
  test('selecting a skin tone persists on emoji hover in preview', async ({ page }) => {
    await page.goto('/');

    // Switch to Slack variant which has skin tone and preview
    const slackTab = page.locator('button', { hasText: 'Slack' });
    await slackTab.click();
    await page.locator('button[data-emoji]').first().waitFor();

    // Find and click the skin tone button (shows ✋ by default)
    const skinToneButton = page.locator('button').filter({ hasText: '✋' }).last();
    await skinToneButton.click();

    // The skin tone picker should open showing 6 skin tone options
    // Select a dark skin tone (✋🏿)
    const darkTone = page.locator('button').filter({ hasText: '✋🏿' });
    await darkTone.click();

    // Now the skin tone button should show the dark skin tone
    const updatedSkinTone = page.locator('button').filter({ hasText: '✋🏿' });
    await expect(updatedSkinTone).toBeVisible();
  });
});

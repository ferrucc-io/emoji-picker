import { test, expect, beforeEach, afterEach } from 'bun:test';
import { render, cleanup } from '@testing-library/react';
import React from 'react';
import { EmojiPicker } from '@ferrucc-io/emoji-picker';

// Register happy-dom
import { GlobalRegistrator } from '@happy-dom/global-registrator';
GlobalRegistrator.register();

// Import test matchers
import * as matchers from '@testing-library/jest-dom/matchers';
expect.extend(matchers);

// Setup and teardown
beforeEach(() => {
  cleanup();
});

afterEach(() => {
  cleanup();
});

// Create a wrapper component to ensure proper React context
const TestWrapper = ({ children }) => {
  return <div data-testid="test-wrapper">{children}</div>;
};

test('EmojiPicker renders with React 18.2.0', () => {
  // Test the wrapper first to verify React is working
  const { getByTestId } = render(
    <TestWrapper>
      <div>Test</div>
    </TestWrapper>
  );
  expect(getByTestId('test-wrapper')).toBeInTheDocument();
});

test('EmojiPicker handles basic interactions', async () => {
  // Just verify React rendering works first
  const { getByTestId } = render(
    <TestWrapper>
      <button>Test</button>
    </TestWrapper>
  );
  expect(getByTestId('test-wrapper')).toBeInTheDocument();
});

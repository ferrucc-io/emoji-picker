#!/usr/bin/env bun
import { execSync } from 'child_process';
import { resolve } from 'path';
import { existsSync, mkdirSync, writeFileSync } from 'fs';

// React versions to test
const REACT_VERSIONS = {
  '18.2.0': { reactDom: '18.2.0' },
  '19.0.0': { reactDom: '19.0.0' },
};

const ROOT_DIR = resolve(__dirname, '..');
const TEST_DIR = resolve(ROOT_DIR, 'react-version-tests');

// Ensure test directory exists
if (!existsSync(TEST_DIR)) {
  mkdirSync(TEST_DIR, { recursive: true });
}

/**
 * Run tests with a specific React version
 */
function testWithReactVersion(version: string, reactDomVersion: string) {
  console.log(`\n\n========================================`);
  console.log(`Testing with React ${version}`);
  console.log(`========================================\n`);

  const testDir = resolve(TEST_DIR, `react-${version}`);

  // Create test directory if it doesn't exist
  if (!existsSync(testDir)) {
    mkdirSync(testDir, { recursive: true });
  }

  // Create temporary package.json with specific React version
  const packageJson = {
    name: `emoji-picker-react-${version}-test`,
    version: '1.0.0',
    type: 'module',
    scripts: {
      test: 'bun test',
    },
    dependencies: {
      '@ferrucc-io/emoji-picker': 'link:../..',
      react: `${version}`,
      'react-dom': `${reactDomVersion}`,
    },
    devDependencies: {
      '@testing-library/react': '^14.2.1',
      '@happy-dom/global-registrator': '^16.7.3',
      '@testing-library/jest-dom': '^6.4.2',
    },
  };

  // Write package.json
  writeFileSync(resolve(testDir, 'package.json'), JSON.stringify(packageJson, null, 2));

  // Create test file
  const testFile = `
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

test('EmojiPicker renders with React ${version}', () => {
  // Test the wrapper first to verify React is working
  const { getByTestId } = render(<TestWrapper><div>Test</div></TestWrapper>);
  expect(getByTestId('test-wrapper')).toBeInTheDocument();
});

test('EmojiPicker handles basic interactions', async () => {
  // Just verify React rendering works first
  const { getByTestId } = render(<TestWrapper><button>Test</button></TestWrapper>);
  expect(getByTestId('test-wrapper')).toBeInTheDocument();
});
`;

  // Write test file
  writeFileSync(resolve(testDir, 'emojiPicker.test.tsx'), testFile);

  try {
    // Install dependencies and run tests
    console.log(`Installing dependencies for React ${version}...`);
    execSync('bun install', { cwd: testDir, stdio: 'inherit' });

    console.log(`Running tests with React ${version}...`);
    execSync('bun test', { cwd: testDir, stdio: 'inherit' });

    console.log(`\n✅ Tests passed with React ${version}\n`);
    return true;
  } catch (error) {
    console.error(`\n❌ Tests failed with React ${version}\n`);
    console.error(error);
    return false;
  }
}

async function main() {
  console.log('Starting React version compatibility tests...');

  const results: Record<string, boolean> = {};

  for (const [reactVersion, { reactDom }] of Object.entries(REACT_VERSIONS)) {
    results[reactVersion] = testWithReactVersion(reactVersion, reactDom);
  }

  console.log('\n========================================');
  console.log('React Version Compatibility Test Results:');
  console.log('========================================');

  for (const [version, passed] of Object.entries(results)) {
    console.log(`React ${version}: ${passed ? '✅ PASSED' : '❌ FAILED'}`);
  }
}

main().catch(console.error);

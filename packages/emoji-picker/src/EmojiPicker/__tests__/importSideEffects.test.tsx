import { expect, test } from 'bun:test';

// Canvas-based emoji support detection is expensive (thousands of getImageData
// calls, multi-second main-thread block on some machines), so it must not run
// as a side effect of merely importing the package. The fixture evaluates the
// package entry point in a fresh subprocess with a canvas stub that counts
// getImageData calls; importing alone must trigger zero of them.
test('importing the package does not trigger canvas emoji support detection', async () => {
  const fixturePath = new URL('./importSideEffects.fixture.ts', import.meta.url).pathname;

  const proc = Bun.spawn(['bun', 'run', fixturePath], {
    stdout: 'pipe',
    stderr: 'pipe',
  });

  const [stdout, stderr, exitCode] = await Promise.all([
    new Response(proc.stdout).text(),
    new Response(proc.stderr).text(),
    proc.exited,
  ]);

  expect(exitCode, stderr).toBe(0);

  const { getImageDataCalls } = JSON.parse(stdout.trim());
  expect(getImageDataCalls).toBe(0);
});

// Runs in a standalone `bun run` subprocess (see importSideEffects.test.tsx) so
// that module evaluation happens with a pristine module cache, unaffected by
// other test files' imports or `mock.module` calls.
import { GlobalRegistrator } from '@happy-dom/global-registrator';

GlobalRegistrator.register();

// `isEmojiFullySupported` skips canvas detection when NODE_ENV === 'test',
// which would make this check pass vacuously.
process.env.NODE_ENV = 'production';

// happy-dom returns null from getContext('2d'), which also short-circuits
// detection. Stub it with a fake context that counts getImageData calls.
let getImageDataCalls = 0;

const fakeContext = {
  canvas: { width: 0, height: 0 },
  font: '',
  fillStyle: '',
  textBaseline: '',
  measureText: () => ({ width: 0 }),
  fillText: () => {},
  clearRect: () => {},
  getImageData: () => {
    getImageDataCalls++;
    return { data: new Uint8ClampedArray(16) };
  },
};

(HTMLCanvasElement.prototype as { getContext: unknown }).getContext = () => fakeContext;

await import('../../index');

console.log(JSON.stringify({ getImageDataCalls }));

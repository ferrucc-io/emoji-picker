/**
 * Returns a statically-imported JSON module, falling back to parsing the file
 * from disk when the static import comes back empty.
 *
 * Why this exists: some bun builds (observed on the GitHub Actions linux-x64
 * AVX2 build, across multiple 1.3.x releases) mis-parse certain large
 * `import data from "*.json"` modules and hand back an empty value, which left
 * the emoji dataset empty and failed the atom tests. The bug lives in bun's
 * bundler/transpiler JSON path; JavaScriptCore's `JSON.parse` is unaffected, so
 * re-reading the file and parsing it ourselves is a reliable, version-agnostic
 * fallback.
 *
 * In the browser there is no `require`/`node:fs`, so the static import (which
 * the app bundler resolves correctly) is always used.
 */
export function loadJsonData<T>(
  staticData: T,
  specifier: string,
  isEmpty: (data: T) => boolean
): T {
  if (!isEmpty(staticData)) return staticData;

  try {
    const req = typeof require === 'function' ? require : undefined;
    if (!req) return staticData;

    // Build the module id dynamically so app bundlers don't try to resolve
    // `node:fs` for the browser build.
    const fs = req('node:' + 'fs');
    const filePath = req.resolve(specifier);
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return staticData;
  }
}

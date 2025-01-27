import { useState } from 'react';
import { CodeBlock } from './CodeBlock';
import { ClipboardButton } from './ClipboardButton';

type TailwindVersion = "v3" | "v4";

const TAILWIND_CONFIGS: Record<TailwindVersion, { description: string; code: string; copyText: string }> = {
  v4: {
    description: "In your Tailwind configuration CSS file, add this line after your Tailwind import:",
    code: `@import "tailwindcss";
// ... your other imports
@source "../node_modules/@ferrucc-io/emoji-picker";`,
    copyText: '@source "../node_modules/@ferrucc-io/emoji-picker";',
  },
  v3: {
    description: "In your tailwind.config.js/ts file, add this to the content array:",
    code: `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
    // ... your existing paths
    "./node_modules/@ferrucc-io/emoji-picker/dist/**/*.{js,jsx,ts,tsx}"
  ],
  // ... rest of your config
}`,
    copyText: '"./node_modules/@ferrucc-io/emoji-picker/dist/**/*.{js,jsx,ts,tsx}"',
  },
};

export function TailwindSetupTabs() {
  const [activeTab, setActiveTab] = useState<TailwindVersion>("v4");

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(Object.keys(TAILWIND_CONFIGS) as TailwindVersion[]).map((version) => (
              <button
                key={version}
                onClick={() => setActiveTab(version)}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                  activeTab === version
                    ? "bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100"
                    : "text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50"
                }`}
              >
                Tailwind {version}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-4">
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">
          {TAILWIND_CONFIGS[activeTab].description}
        </p>
        <div className="relative">
          <CodeBlock hideCopyButton code={TAILWIND_CONFIGS[activeTab].code} />
          <ClipboardButton text={TAILWIND_CONFIGS[activeTab].code} />
        </div>
      </div>
    </div>
  );
}
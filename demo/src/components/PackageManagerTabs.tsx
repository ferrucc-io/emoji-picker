import { useState } from 'react';
import { CodeBlock } from './CodeBlock';

import type { ComponentProps } from 'react';

interface PackageManagerTabsProps {
  packageName: string;
}

type PackageManager = 'npm' | 'bun' | 'yarn' | 'pnpm';

export function PackageManagerTabs({ packageName }: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>('npm');

  const commands: Record<PackageManager, string> = {
    npm: `npm install ${packageName}`,
    bun: `bun add ${packageName}`,
    yarn: `yarn add ${packageName}`,
    pnpm: `pnpm add ${packageName}`
  };

  return (
    <div className="w-full min-w-2xl">
      <div className="flex gap-1 mb-2 w-full">
        {(Object.keys(commands) as PackageManager[]).map((manager) => (
          <button
            key={manager}
            onClick={() => setActiveTab(manager)}
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors
              ${activeTab === manager 
                ? 'text-zinc-900 dark:text-zinc-50 bg-zinc-100 dark:bg-zinc-800' 
                : 'text-zinc-600 dark:text-zinc-400'
              }`}
          >
            {manager}
          </button>
        ))}
      </div>

      <div className="relative">
        <CodeBlock code={commands[activeTab]} language="bash" />
      </div>
    </div>
  );
} 

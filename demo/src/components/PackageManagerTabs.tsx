import { useState } from 'react';

import type { ComponentProps } from 'react';

interface PackageManagerTabsProps {
  packageName: string;
}

type PackageManager = 'npm' | 'bun' | 'yarn' | 'pnpm';

function ClipboardIcon(props: ComponentProps<'svg'>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className={`lucide lucide-copy ${props.className}`}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
  );
}

export function PackageManagerTabs({ packageName }: PackageManagerTabsProps) {
  const [activeTab, setActiveTab] = useState<PackageManager>('npm');
  const [copied, setCopied] = useState(false);

  const commands: Record<PackageManager, string> = {
    npm: `npm install ${packageName}`,
    bun: `bun add ${packageName}`,
    yarn: `yarn add ${packageName}`,
    pnpm: `pnpm add ${packageName}`
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(commands[activeTab]);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="w-full border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-2 py-1.5 bg-zinc-100 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {(Object.keys(commands) as PackageManager[]).map((manager) => (
              <button
                key={manager}
                onClick={() => setActiveTab(manager)}
                className={`px-2 py-1.5 text-xs rounded-md transition-colors ${
                  activeTab === manager
                    ? 'bg-zinc-200 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                }`}
              >
                {manager}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-950 p-4 relative">
        <pre className="text-sm font-mono text-zinc-900 dark:text-zinc-100 overflow-x-auto pr-24">
          {commands[activeTab]}
        </pre>
        <button
          onClick={handleCopy}
          className={`absolute right-4 top-1/2 -translate-y-1/2 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-md transition-colors
            ${copied 
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
              : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-900 dark:text-zinc-400 dark:hover:bg-zinc-800'
            }`}
        >
          <ClipboardIcon className={`w-3 h-3`} />
          {copied ? 'Done' : 'Copy'}
        </button>
      </div>
    </div>
  );
} 

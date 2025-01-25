import * as Tabs from '@radix-ui/react-tabs';
import { CodeBlock } from './CodeBlock';

import type { ComponentProps } from 'react';

interface PackageManagerTabsProps {
  packageName: string;
}

type TabsRootProps = ComponentProps<typeof Tabs.Root>;
type TabsListProps = ComponentProps<typeof Tabs.List>;
type TabsTriggerProps = ComponentProps<typeof Tabs.Trigger>;
type TabsContentProps = ComponentProps<typeof Tabs.Content>;

export function PackageManagerTabs({ packageName }: PackageManagerTabsProps) {
  const commands = {
    npm: `npm install ${packageName}`,
    bun: `bun add ${packageName}`,
    yarn: `yarn add ${packageName}`,
    pnpm: `pnpm add ${packageName}`
  };

  return (
    <Tabs.Root defaultValue="npm" className="w-full min-w-2xl">
      <Tabs.List className="flex gap-1 mb-2 w-full">
        {Object.keys(commands).map((manager) => (
          <Tabs.Trigger
            key={manager}
            value={manager}
            className="px-3 py-1.5 text-sm font-medium text-zinc-600 dark:text-zinc-400
              data-[state=active]:text-zinc-900 dark:data-[state=active]:text-zinc-50
              data-[state=active]:bg-zinc-100 dark:data-[state=active]:bg-zinc-800
              rounded-md transition-colors"
          >
            {manager}
          </Tabs.Trigger>
        ))}
      </Tabs.List>

      {Object.entries(commands).map(([manager, command]) => (
        <Tabs.Content key={manager} value={manager} className="relative">
          <CodeBlock code={command} language="bash" />
        </Tabs.Content>
      ))}
    </Tabs.Root>
  );
} 

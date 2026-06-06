import { CodeBlock } from './CodeBlock';

interface PropDoc {
  name: string;
  type: string;
  defaultValue?: string;
  description: React.ReactNode;
}

interface ComponentDoc {
  name: string;
  description: React.ReactNode;
  example: string;
  secondaryDescription?: React.ReactNode;
  secondaryExample?: string;
  props?: PropDoc[];
  noPropsMessage?: string;
}

const COMPONENTS: ComponentDoc[] = [
  {
    name: 'EmojiPicker',
    description: 'The root component. Wraps all the emoji picker parts and provides shared context.',
    example: `<EmojiPicker onEmojiSelect={(emoji) => console.log(emoji)}>
  <EmojiPicker.Header>
    <EmojiPicker.Input />
  </EmojiPicker.Header>
  <EmojiPicker.Group>
    <EmojiPicker.List />
  </EmojiPicker.Group>
</EmojiPicker>`,
    secondaryDescription:
      'Options affecting the entire emoji picker are available on this component as props.',
    secondaryExample: `<EmojiPicker emojisPerRow={10} emojiSize={32} maxUnicodeVersion={15.0}>
  {/* ... */}
</EmojiPicker>`,
    props: [
      {
        name: 'onEmojiSelect',
        type: '(emoji: string) => void',
        description: 'A callback invoked when an emoji is selected.',
      },
      {
        name: 'emojisPerRow',
        type: 'number',
        defaultValue: '12',
        description: 'The number of emojis to display per row.',
      },
      {
        name: 'emojiSize',
        type: 'number',
        defaultValue: '28',
        description: 'The size of each emoji in pixels.',
      },
      {
        name: 'maxUnicodeVersion',
        type: 'number',
        defaultValue: '16.0',
        description:
          'The maximum Unicode version of emojis to show. Use a lower value to hide newer emojis that may not render on older systems.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Additional class names applied to the root container.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        description: 'The emoji picker parts (Header, Group, List, Preview, etc.).',
      },
    ],
  },
  {
    name: 'EmojiPicker.Header',
    description:
      'A container for header content like the search input. Renders a flex row at the top of the picker.',
    example: `<EmojiPicker.Header>
  <EmojiPicker.Input placeholder="Search emoji" />
</EmojiPicker.Header>`,
    props: [
      {
        name: 'className',
        type: 'string',
        description: 'Additional class names applied to the header container.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        description: 'The header content, typically an EmojiPicker.Input.',
      },
    ],
  },
  {
    name: 'EmojiPicker.Input',
    description:
      'The search input. Forwards all standard HTML input attributes (except onChange, which is managed internally).',
    example: `<EmojiPicker.Input placeholder="Search emoji" autoFocus />`,
    props: [
      {
        name: 'placeholder',
        type: 'string',
        defaultValue: '"Search emoji"',
        description: 'The input placeholder text.',
      },
      {
        name: 'autoFocus',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Whether the input should be focused on mount.',
      },
      {
        name: 'hideIcon',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Whether to hide the default search icon.',
      },
      {
        name: 'endIcon',
        type: 'ReactNode',
        description: 'A custom icon to render on the right side of the input as a clear button.',
      },
      {
        name: 'onClear',
        type: '() => void',
        description: 'A callback invoked when the search input is cleared.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Additional class names applied to the input element.',
      },
    ],
  },
  {
    name: 'EmojiPicker.Group',
    description: 'A scrollable container for the emoji list.',
    example: `<EmojiPicker.Group>
  <EmojiPicker.List />
</EmojiPicker.Group>`,
    props: [
      {
        name: 'className',
        type: 'string',
        description: 'Additional class names applied to the scroll container.',
      },
      {
        name: 'children',
        type: 'ReactNode',
        description: 'Typically an EmojiPicker.List.',
      },
    ],
  },
  {
    name: 'EmojiPicker.List',
    description:
      'Renders the virtualized list of emojis, organized by category. Switches to search results when the input has a query.',
    example: `<EmojiPicker.List hideStickyHeader containerHeight={400} />`,
    props: [
      {
        name: 'hideStickyHeader',
        type: 'boolean',
        defaultValue: 'false',
        description: 'Whether to hide the sticky category headers while scrolling.',
      },
      {
        name: 'containerHeight',
        type: 'number',
        defaultValue: '364',
        description: 'The height of the virtualized list container in pixels.',
      },
    ],
  },
  {
    name: 'EmojiPicker.Preview',
    description:
      'A footer slot for previewing the currently hovered emoji. Uses a render prop to give you access to the previewed emoji so you can render fallback content when nothing is hovered.',
    example: `<EmojiPicker.Preview>
  {({ previewedEmoji }) => (
    previewedEmoji ? <EmojiPicker.Content /> : <button>Pick an emoji</button>
  )}
</EmojiPicker.Preview>`,
    props: [
      {
        name: 'children',
        type: '(props: { previewedEmoji: EmojiMetadata | null }) => ReactNode',
        description:
          'A render prop receiving the previewed emoji (with the active skin tone applied), or null if nothing is hovered.',
      },
      {
        name: 'className',
        type: 'string',
        description: 'Additional class names applied to the preview container.',
      },
    ],
  },
  {
    name: 'EmojiPicker.Content',
    description:
      'Renders the hovered emoji along with its name and slug. Typically used inside EmojiPicker.Preview. Returns null when nothing is hovered.',
    example: `<EmojiPicker.Preview>
  {({ previewedEmoji }) => previewedEmoji && <EmojiPicker.Content />}
</EmojiPicker.Preview>`,
    noPropsMessage: 'This component does not accept any props.',
  },
  {
    name: 'EmojiPicker.SkinTone',
    description:
      'A button that opens a picker for selecting the default skin tone applied to supported emojis.',
    example: `<EmojiPicker.Preview>
  {() => <EmojiPicker.SkinTone />}
</EmojiPicker.Preview>`,
    noPropsMessage: 'This component does not accept any props.',
  },
];

function PropRow({ prop }: { prop: PropDoc }) {
  return (
    <div className="border-b border-zinc-200 dark:border-zinc-800 last:border-b-0 py-3">
      <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
        <code className="text-sm font-mono font-medium text-zinc-900 dark:text-zinc-50">
          {prop.name}
        </code>
        <code className="text-xs font-mono text-zinc-500 dark:text-zinc-400">{prop.type}</code>
        {prop.defaultValue && (
          <span className="text-xs text-zinc-400 dark:text-zinc-500">
            Default is <code className="font-mono">{prop.defaultValue}</code>
          </span>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{prop.description}</p>
    </div>
  );
}

function ComponentSection({ component }: { component: ComponentDoc }) {
  return (
    <section className="w-full flex flex-col gap-3">
      <h3 className="text-xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        {component.name}
      </h3>
      <p className="text-zinc-600 dark:text-zinc-300">{component.description}</p>
      <CodeBlock code={component.example} language="tsx" hideCopyButton />
      {component.secondaryDescription && (
        <p className="text-zinc-600 dark:text-zinc-300 mt-1">{component.secondaryDescription}</p>
      )}
      {component.secondaryExample && (
        <CodeBlock code={component.secondaryExample} language="tsx" hideCopyButton />
      )}
      <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mt-2">Props</h4>
      {component.props && component.props.length > 0 ? (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 px-4">
          {component.props.map((prop) => (
            <PropRow key={prop.name} prop={prop} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {component.noPropsMessage ?? 'This component does not accept any props.'}
        </p>
      )}
    </section>
  );
}

export function ApiReference() {
  return (
    <section className="w-full">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-2">
        API Reference
      </h2>
      <p className="text-zinc-600 dark:text-zinc-300 mb-6">
        The emoji picker is composed of several parts that you can mix and match. Each component
        below is exported as a property of <code className="font-mono text-sm">EmojiPicker</code>.
      </p>
      <div className="flex flex-col gap-10">
        {COMPONENTS.map((component) => (
          <ComponentSection key={component.name} component={component} />
        ))}
      </div>
    </section>
  );
}

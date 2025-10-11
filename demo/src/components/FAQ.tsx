interface FAQItem {
  question: string;
  answer: React.ReactNode;
}

const FAQ_ITEMS: FAQItem[] = [
  {
    question: "Do I need a popover component?",
    answer: (
      <>
        Ferruccio's Emoji Picker provides only the emoji picker itself. If you need a popover component to trigger the picker, there are several great libraries available:
        {" "}
        <a
          href="https://www.radix-ui.com/primitives/docs/components/popover"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Radix UI
        </a>
        ,{" "}
        <a
          href="https://base-ui.com/components/react-popover"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Base UI
        </a>
        ,{" "}
        <a
          href="https://headlessui.com/react/popover"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          Headless UI
        </a>
        , and{" "}
        <a
          href="https://react-spectrum.adobe.com/react-aria/usePopover.html"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          React Aria
        </a>
        .
      </>
    ),
  },
  {
    question: "What are the peer dependencies?",
    answer: "React ≥0.14.0, React DOM ≥0.14.0 and Tailwind CSS ≥3.0.0",
  },
  {
    question: "Is it customizable?",
    answer: "Yes! The component is unstyled by default and uses Tailwind CSS for styling. You can customize the appearance using Tailwind classes or your own CSS.",
  },
  {
    question: "How does keyboard navigation work?",
    answer: "Use arrow keys to navigate through emojis, Enter to select, and Escape to clear search. Tab and Shift+Tab to move between interactive elements.",
  },
  {
    question: "Does it support all emojis?",
    answer: "Yes, it includes all emojis up to Unicode 15.0. You can filter out newer emojis using the maxUnicodeVersion prop for better compatibility. It should also work with newer emojis versions, but I haven't tested it yet.",
  },
  {
    question: "What is the license?",
    answer: (
      <>
        MIT. See the{" "}
        <a
          href="https://github.com/ferrucc-io/emoji-picker/blob/master/LICENSE"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          LICENSE
        </a>{" "}
        file for more details.
      </>
    ),
  },
  {
    question: "Where can I find more examples?",
    answer: (
      <>
        Check out the examples above or visit our{" "}
        <a
          href="https://github.com/ferrucc-io/emoji-picker"
          className="text-blue-600 dark:text-blue-400 hover:underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub repository
        </a>{" "}
        for more examples and documentation.
      </>
    ),
  },
];

export function FAQ() {
  return (
    <section className="w-full">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 mb-4">
        FAQ
      </h2>
      <div className="space-y-6">
        {FAQ_ITEMS.map((item) => (
          <div key={item.question}>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-50">
              {item.question}
            </h3>
            <p className="mt-2 text-zinc-600 dark:text-zinc-300">
              {item.answer}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
} 
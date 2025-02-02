import { TypefullyLogo } from '../social-proof/typefully';
import { JuneLogo } from '../social-proof/june';

export const SocialProof = () => {
  return (
    <div className="flex flex-col items-start gap-4 w-full">
      <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Used in production by
      </h2>
      <div className="flex flex-wrap items-center gap-6">
        <a href="https://june.so?ref=emoji-picker" target="_blank" rel="noopener noreferrer">
          <JuneLogo />
        </a>
        <a href="https://typefully.com?ref=emoji-picker" target="_blank" rel="noopener noreferrer">
          <TypefullyLogo />
        </a>
        <a
          href="https://github.com/ferrucc-io/emoji-picker/issues/new?template=add-logo.yml"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors pr-2"
        >
          <svg
            className="w-5 h-5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add your logo here
        </a>
      </div>
    </div>
  );
}; 
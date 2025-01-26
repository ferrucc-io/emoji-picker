interface NpmDownloadsProps {
  packageName: string;
  defaultDownloads: number;
}

export function NpmDownloadsPill({
  packageName,
  defaultDownloads,
}: NpmDownloadsProps) {
  return (
    <a
      href={`https://www.npmjs.com/package/${packageName}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
    >
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
          className="lucide lucide-download"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" x2="12" y1="15" y2="3" />
        </svg>
      </span>
      {new Intl.NumberFormat("en-US", { notation: "compact" }).format(
        defaultDownloads,
      )}
      /month
    </a>
  );
}

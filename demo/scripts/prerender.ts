/**
 * Build-time prerender for static, content-rich routes.
 *
 * TanStack Router renders on the client, so the SPA shell that GitHub Pages
 * serves contains no article text. This script renders the article components
 * to static HTML and bakes them into the built output so non-JS crawlers
 * (search engines, social unfurlers, LLM crawlers) see the full content. The
 * SPA still hydrates and takes over for navigation.
 *
 * Run after `vite build`. Uses Bun (import.meta.dir, native TSX).
 */
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { copyFileSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { ComparisonArticle } from "../src/articles/ComparisonArticle";
import {
  buildComparisonJsonLd,
  comparisonMeta,
} from "../src/seo/comparisonMeta";

const distDir = join(import.meta.dir, "..", "dist");
const template = readFileSync(join(distDir, "index.html"), "utf8");

function escapeAttr(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

interface PageDef {
  path: string;
  title: string;
  description: string;
  canonical: string;
  jsonLd: unknown[];
  bodyHtml: string;
}

function buildHead(page: PageDef): string {
  const t = escapeAttr(page.title);
  const d = escapeAttr(page.description);
  const u = escapeAttr(page.canonical);
  return [
    `<meta name="description" content="${d}" />`,
    `<link rel="canonical" href="${u}" />`,
    `<meta property="og:type" content="article" />`,
    `<meta property="og:title" content="${t}" />`,
    `<meta property="og:description" content="${d}" />`,
    `<meta property="og:url" content="${u}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${t}" />`,
    `<meta name="twitter:description" content="${d}" />`,
    `<script type="application/ld+json">${JSON.stringify(page.jsonLd)}</script>`,
  ].join("\n    ");
}

function stripTemplateSeo(html: string): string {
  // Remove the home page's SEO tags so they don't collide with the article's.
  return html
    .replace(/\s*<meta\s+name="description"[^>]*>/gi, "")
    .replace(/\s*<link\s+rel="canonical"[^>]*>/gi, "")
    .replace(/\s*<meta\s+property="og:[^"]*"[^>]*>/gi, "")
    .replace(/\s*<meta\s+name="twitter:[^"]*"[^>]*>/gi, "");
}

function renderPage(page: PageDef): string {
  let html = stripTemplateSeo(template);

  // Swap the document title.
  html = html.replace(
    /<title>[\s\S]*?<\/title>/,
    `<title>${escapeAttr(page.title)}</title>`,
  );

  // Inject SEO head tags right before </head>.
  html = html.replace("</head>", `    ${buildHead(page)}\n  </head>`);

  // Bake the prerendered markup into the root container.
  html = html.replace(
    /<div id="root">\s*<\/div>/,
    `<div id="root">${page.bodyHtml}</div>`,
  );

  return html;
}

function writePage(routePath: string, html: string): void {
  const outDir = join(distDir, routePath);
  mkdirSync(outDir, { recursive: true });
  const outFile = join(outDir, "index.html");
  writeFileSync(outFile, html, "utf8");
  console.log(`prerendered ${routePath}/index.html`);
}

const comparisonBody = renderToStaticMarkup(
  createElement(
    "div",
    { className: "min-h-screen w-full bg-white dark:bg-zinc-950" },
    createElement(ComparisonArticle),
  ),
);

writePage(
  comparisonMeta.path.replace(/^\//, ""),
  renderPage({
    path: comparisonMeta.path,
    title: comparisonMeta.title,
    description: comparisonMeta.description,
    canonical: comparisonMeta.url,
    jsonLd: buildComparisonJsonLd(),
    bodyHtml: comparisonBody,
  }),
);

// SPA fallback for any non-prerendered deep link on GitHub Pages.
copyFileSync(join(distDir, "index.html"), join(distDir, "404.html"));
console.log("wrote 404.html (SPA fallback)");

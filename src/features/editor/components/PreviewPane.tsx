import { memo, type MouseEvent } from "react";
import ReactMarkdown, { type Options } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import rehypeKatex from "rehype-katex";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import "katex/dist/katex.min.css";

import { closeUnterminatedDisplayMath } from "../utils/math";

/** Same prefix rehype-sanitize applies to user-provided `id`s. */
const CLOBBER_PREFIX = "user-content-";

type PreviewPaneProps = {
  content: string;
};

type MarkdownPoint = {
  offset?: number;
};

type MarkdownPosition = {
  start?: MarkdownPoint;
  end?: MarkdownPoint;
};

type MarkdownNode = {
  type: string;
  value?: string;
  meta?: string | null;
  data?: unknown;
  children?: MarkdownNode[];
  position?: MarkdownPosition;
};

type MarkdownFile = {
  value?: unknown;
};

function remarkVsCodeDisplayMath() {
  return (tree: MarkdownNode, file: MarkdownFile) => {
    const source = String(file.value ?? "");

    function displayMathData(value: string) {
      return {
        hName: "pre",
        hChildren: [
          {
            type: "element",
            tagName: "code",
            properties: {
              className: ["language-math", "math-display"]
            },
            children: [{ type: "text", value }]
          }
        ]
      };
    }

    function isStandaloneDisplayMath(node: MarkdownNode) {
      if (node.type !== "inlineMath") {
        return false;
      }

      const start = node.position?.start?.offset;
      const end = node.position?.end?.offset;
      if (start === undefined || end === undefined) {
        return false;
      }

      const raw = source.slice(start, end).trim();
      const lineStart = source.lastIndexOf("\n", start - 1) + 1;
      const nextLineBreak = source.indexOf("\n", end);
      const lineEnd = nextLineBreak === -1 ? source.length : nextLineBreak;

      return (
        raw.startsWith("$$") &&
        raw.endsWith("$$") &&
        !source.slice(lineStart, start).trim() &&
        !source.slice(end, lineEnd).trim()
      );
    }

    function positionOf(children: MarkdownNode[]): MarkdownPosition | undefined {
      const start = children[0]?.position?.start;
      const end = children[children.length - 1]?.position?.end;
      return start && end ? { start, end } : undefined;
    }

    function splitParagraph(node: MarkdownNode) {
      if (node.type !== "paragraph" || !node.children) {
        return [node];
      }

      const blocks: MarkdownNode[] = [];
      let paragraphChildren: MarkdownNode[] = [];

      function appendParagraph() {
        if (
          paragraphChildren.some(
            (child) => child.type !== "text" || child.value?.trim()
          )
        ) {
          // Each split paragraph gets the range of its own children, not the
          // range of the original paragraph.
          blocks.push({
            ...node,
            children: paragraphChildren,
            position: positionOf(paragraphChildren)
          });
        }
        paragraphChildren = [];
      }

      for (const child of node.children) {
        if (isStandaloneDisplayMath(child)) {
          appendParagraph();
          blocks.push({
            type: "math",
            value: child.value,
            data: displayMathData(child.value ?? ""),
            position: child.position
          });
        } else {
          paragraphChildren.push(child);
        }
      }

      appendParagraph();
      return blocks;
    }

    function visit(node: MarkdownNode) {
      if (!node.children) {
        return;
      }

      const children: MarkdownNode[] = [];
      for (const child of node.children) {
        visit(child);
        children.push(...splitParagraph(child));
      }
      node.children = children;
    }

    visit(tree);
  };
}

// Defined at module level so the plugin arrays keep stable references.
const remarkPlugins: Options["remarkPlugins"] = [
  remarkGfm,
  remarkMath,
  remarkVsCodeDisplayMath
];

// Sanitize runs right after raw HTML parsing. Every later plugin only adds
// trusted output. Slugs get the sanitize clobber prefix so heading ids
// can't collide with app ids such as `#app`. KaTeX runs before highlighting
// so lowlight never sees `language-math` blocks.
const rehypePlugins: Options["rehypePlugins"] = [
  rehypeRaw,
  rehypeSanitize,
  [rehypeSlug, { prefix: CLOBBER_PREFIX }],
  rehypeKatex,
  [rehypeHighlight, { plainText: ["math"] }]
];

function findElementById(root: HTMLElement, id: string) {
  return root.querySelector<HTMLElement>(`[id="${CSS.escape(id)}"]`);
}

/**
 * Element ids in the preview carry a clobber prefix, but authors write
 * `[link](#heading)`. This resolves in-page hash links to the prefixed id,
 * searching only inside the preview.
 */
function handlePreviewClick(event: MouseEvent<HTMLElement>) {
  if (
    event.defaultPrevented ||
    event.button !== 0 ||
    event.metaKey ||
    event.ctrlKey ||
    event.shiftKey ||
    event.altKey ||
    !(event.target instanceof Element)
  ) {
    return;
  }

  const anchor = event.target.closest("a");
  const href = anchor?.getAttribute("href");
  if (!href) {
    return;
  }

  if (href.startsWith("#") && href.length >= 2) {
    let id = href.slice(1);
    try {
      id = decodeURIComponent(id);
    } catch {
      // Keep the raw hash when it is not valid URI encoding.
    }

    const root = event.currentTarget;
    const target =
      findElementById(root, `${CLOBBER_PREFIX}${id}`) ??
      findElementById(root, id);

    if (!target) {
      return;
    }

    event.preventDefault();
    target.scrollIntoView({ block: "start" });
    return;
  }

  // Open external links safely in a new tab without navigating away from the workspace
  if (/^https?:\/\//i.test(href)) {
    event.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  }
}

export const PreviewPane = memo(function PreviewPane({
  content
}: PreviewPaneProps) {
  return (
    <div className="h-full overflow-auto bg-slate-950">
      {content.trim() ? (
        <article
          className="markdown-preview min-h-full w-full px-[26px] pb-8 pt-[14px]"
          onClick={handlePreviewClick}
        >
          <ReactMarkdown
            rehypePlugins={rehypePlugins}
            remarkPlugins={remarkPlugins}
          >
            {closeUnterminatedDisplayMath(content)}
          </ReactMarkdown>
        </article>
      ) : (
        <div className="flex h-full items-center justify-center px-6 py-8">
          <div className="flex min-h-80 w-full max-w-4xl items-center justify-center text-sm text-slate-500">
            Preview appears here as you write.
          </div>
        </div>
      )}
    </div>
  );
});

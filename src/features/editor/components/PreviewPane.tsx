import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";

type PreviewPaneProps = {
  content: string;
};

export function PreviewPane({ content }: PreviewPaneProps) {
  return (
    <div className="h-full overflow-auto bg-slate-950">
      {content.trim() ? (
        <article className="markdown-preview mx-auto min-h-full max-w-4xl px-6 py-8">
          <ReactMarkdown
            rehypePlugins={[rehypeSanitize]}
            remarkPlugins={[remarkGfm]}
          >
            {content}
          </ReactMarkdown>
        </article>
      ) : (
        <div className="flex h-full items-center justify-center px-6 py-8">
          <div className="flex min-h-80 w-full max-w-4xl items-center justify-center rounded-md border border-dashed border-slate-800 text-sm text-slate-500">
            Preview appears here as you write.
          </div>
        </div>
      )}
    </div>
  );
}

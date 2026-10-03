import { type RefObject, useEffect, useState } from "react";
import { Link as RouterLink } from "@tanstack/react-router";
import {
  Link,
  List,
  Bold,
  Code2,
  Quote,
  Save,
  Italic,
  Heading1,
  FilePlus2,
  FolderOpen,
  ListChecks,
  NotebookPen
} from "lucide-react";

import {
  MarkdownFileError,
  normalizeMarkdownFileName,
  readMarkdownFile
} from "../utils/file";
import type { MarkdownEditorView, ViewMode } from "../types/editor.types";

import { ViewModeToggle } from "./ViewModeToggle";
import { Button } from "#/components/ui/Button";

const FILE_ERROR_TIMEOUT_MS = 6000;

type EditorToolbarProps = {
  editorView: MarkdownEditorView | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  viewMode: ViewMode;
  onDownloadMarkdown: () => void;
  onFileOpened: (fileName: string, content: string) => void;
  onNewDocument: () => void;
  onOpenFileRequest: () => void;
  onRename: (fileName: string) => void;
  onViewModeChange: (viewMode: ViewMode) => void;
};

const formatActions = [
  { label: "Heading", icon: Heading1, action: "heading" },
  { label: "Bold", icon: Bold, action: "bold" },
  { label: "Italic", icon: Italic, action: "italic" },
  { label: "Link", icon: Link, action: "link" },
  { label: "Quote", icon: Quote, action: "quote" },
  { label: "List", icon: List, action: "list" },
  { label: "Task", icon: ListChecks, action: "task" },
  { label: "Code", icon: Code2, action: "code" }
] as const;

type FormatAction = (typeof formatActions)[number]["action"];
type BlockAction = "heading" | "quote" | "list" | "task";
type InlineAction = Exclude<FormatAction, BlockAction>;

export function EditorToolbar({
  editorView,
  fileInputRef,
  fileName,
  viewMode,
  onDownloadMarkdown,
  onFileOpened,
  onNewDocument,
  onOpenFileRequest,
  onRename,
  onViewModeChange
}: EditorToolbarProps) {
  const [fileError, setFileError] = useState<string | null>(null);

  useEffect(() => {
    if (!fileError) {
      return;
    }

    const timeout = setTimeout(() => setFileError(null), FILE_ERROR_TIMEOUT_MS);
    return () => clearTimeout(timeout);
  }, [fileError]);

  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    const input = fileInputRef.current;

    if (!file) {
      return;
    }

    setFileError(null);

    try {
      const result = await readMarkdownFile(file);
      onFileOpened(result.fileName, result.content);
    } catch (error) {
      setFileError(
        error instanceof MarkdownFileError
          ? error.message
          : `Unable to open ${file.name}.`
      );
    } finally {
      if (input) {
        input.value = "";
      }
    }
  }

  function handleNewDocument() {
    setFileError(null);
    onNewDocument();
  }

  function handleDownloadMarkdown() {
    setFileError(null);
    onDownloadMarkdown();
  }

  return (
    <header className="border-b border-slate-800 bg-slate-950/95 px-4 py-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          <RouterLink
            className="mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-cyan-400/40 bg-cyan-400/10 text-cyan-200 transition hover:border-cyan-300/70 hover:bg-cyan-400/20 hover:text-cyan-100"
            title="MDraft Home"
            to="/"
          >
            <NotebookPen size={19} />
          </RouterLink>

          <Button
            icon={<FilePlus2 size={16} />}
            onClick={handleNewDocument}
            title="New Document"
          >
            New
          </Button>
          <Button
            icon={<FolderOpen size={16} />}
            onClick={onOpenFileRequest}
            title="Open Markdown File"
          >
            Open
          </Button>

          <Button
            icon={<Save size={16} />}
            onClick={handleDownloadMarkdown}
            title="Download Markdown File"
          >
            Save
          </Button>

          <input
            accept=".md,.markdown,.txt,text/markdown,text/plain"
            className="hidden"
            onChange={(event) =>
              void handleFileChange(event.currentTarget.files)
            }
            ref={fileInputRef}
            type="file"
          />

          <input
            aria-label="File name"
            className="h-9 min-w-40 flex-1 rounded-md border border-slate-800 bg-slate-900 px-3 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-cyan-400 sm:max-w-72"
            onBlur={(event) =>
              onRename(normalizeMarkdownFileName(event.target.value))
            }
            onChange={(event) => onRename(event.target.value)}
            value={fileName}
          />
        </div>

        {fileError && (
          <p className="w-full text-sm text-rose-300" role="alert">
            {fileError}
          </p>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 pt-3">
        <div className="flex flex-wrap items-center gap-1">
          {formatActions.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                aria-label={item.label}
                className="h-9 w-9 px-0"
                disabled={!editorView}
                key={item.action}
                onClick={() => applyMarkdownFormat(editorView, item.action)}
                title={item.label}
                variant="ghost"
              >
                <Icon size={17} />
              </Button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <ViewModeToggle onChange={onViewModeChange} value={viewMode} />
        </div>
      </div>
    </header>
  );
}

const placeholders: Record<FormatAction, string> = {
  heading: "Heading",
  bold: "bold text",
  italic: "italic text",
  link: "link text",
  quote: "quote",
  list: "list item",
  task: "task item",
  code: "code"
};

const blockPrefixes: Record<BlockAction, string> = {
  heading: "# ",
  quote: "> ",
  list: "- ",
  task: "- [ ] "
};

const inlineWrappers: Record<InlineAction, readonly [string, string]> = {
  bold: ["**", "**"],
  italic: ["_", "_"],
  link: ["[", "](https://example.com)"],
  code: ["`", "`"]
};

function isBlockAction(action: FormatAction): action is BlockAction {
  return action in blockPrefixes;
}

type FormatChange = {
  from: number;
  to: number;
  insert: string;
  anchor: number;
  head?: number;
};

function applyMarkdownFormat(
  editorView: MarkdownEditorView | null,
  action: FormatAction
) {
  if (!editorView) {
    return;
  }

  const { from, to } = editorView.state.selection.main;
  const change = isBlockAction(action)
    ? formatBlock(editorView, action, from, to)
    : formatInline(editorView, action, from, to);

  editorView.dispatch({
    changes: { from: change.from, to: change.to, insert: change.insert },
    selection: { anchor: change.anchor, head: change.head }
  });
  editorView.focus();
}

function formatBlock(
  editorView: MarkdownEditorView,
  action: BlockAction,
  from: number,
  to: number
): FormatChange {
  const prefix = blockPrefixes[action];
  const { doc } = editorView.state;
  const startLine = doc.lineAt(from);

  if (from === to && startLine.from === startLine.to) {
    const placeholder = placeholders[action];
    const insert = `${prefix}${placeholder}`;
    return {
      from,
      to,
      insert,
      anchor: from + prefix.length,
      head: from + prefix.length + placeholder.length
    };
  }

  // Expand the selection to whole lines and prefix every line. A selection
  // that ends at the very start of a line does not include that line.
  const endPosition = doc.lineAt(to).from === to ? to - 1 : to;
  const endLine = doc.lineAt(Math.max(from, endPosition));
  const text = doc.sliceString(startLine.from, endLine.to);

  const insert = text
    .split("\n")
    .map((line) => {
      if (!line.trim()) {
        // Keep blockquotes continuous across blank lines.
        return action === "quote" ? ">" : line;
      }

      // Keep the line's indentation so nested lists stay nested.
      return line.replace(/^\s*/, (indent) => `${indent}${prefix}`);
    })
    .join("\n");

  return {
    from: startLine.from,
    to: endLine.to,
    insert,
    anchor: startLine.from + insert.length
  };
}

function formatInline(
  editorView: MarkdownEditorView,
  action: InlineAction,
  from: number,
  to: number
): FormatChange {
  const selectedText = editorView.state.doc.sliceString(from, to);

  if (action === "code" && selectedText.includes("\n")) {
    const insert = `\`\`\`\n${selectedText}\n\`\`\``;
    return { from, to, insert, anchor: from + insert.length };
  }

  const [open, close] = inlineWrappers[action];

  // Move surrounding whitespace outside the markers. `** text **` is not
  // valid emphasis.
  const leading = /^\s*/.exec(selectedText)?.[0] ?? "";
  const trailing = /\s*$/.exec(selectedText.slice(leading.length))?.[0] ?? "";
  const core = selectedText.slice(
    leading.length,
    selectedText.length - trailing.length
  );

  if (!core) {
    const placeholder = placeholders[action];
    const insert = `${leading}${open}${placeholder}${close}${trailing}`;
    return {
      from,
      to,
      insert,
      anchor: from + leading.length + open.length,
      head: from + leading.length + open.length + placeholder.length
    };
  }

  const insert = `${leading}${open}${core}${close}${trailing}`;
  return { from, to, insert, anchor: from + insert.length };
}

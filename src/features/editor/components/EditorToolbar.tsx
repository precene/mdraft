import { type RefObject } from "react";
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

import { normalizeMarkdownFileName, readMarkdownFile } from "../utils/file";
import type { MarkdownEditorView, ViewMode } from "../types";

import { ViewModeToggle } from "./ViewModeToggle";
import { Button } from "#/components/ui/Button";

type EditorToolbarProps = {
  editorView: MarkdownEditorView | null;
  fileInputRef: RefObject<HTMLInputElement | null>;
  fileName: string;
  viewMode: ViewMode;
  onDownloadMarkdown: () => void;
  onFileOpened: (fileName: string, content: string) => void;
  onNewDocument: () => void;
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

export function EditorToolbar({
  editorView,
  fileInputRef,
  fileName,
  viewMode,
  onDownloadMarkdown,
  onFileOpened,
  onNewDocument,
  onRename,
  onViewModeChange
}: EditorToolbarProps) {
  async function handleFileChange(fileList: FileList | null) {
    const file = fileList?.[0];
    const input = fileInputRef.current;

    if (!file) {
      return;
    }

    try {
      const result = await readMarkdownFile(file);
      onFileOpened(result.fileName, result.content);
    } finally {
      if (input) {
        input.value = "";
      }
    }
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
            onClick={onNewDocument}
            title="New Document"
          >
            New
          </Button>
          <Button
            icon={<FolderOpen size={16} />}
            onClick={() => fileInputRef.current?.click()}
            title="Open Markdown File"
          >
            Open
          </Button>

          <Button
            icon={<Save size={16} />}
            onClick={onDownloadMarkdown}
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
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-900 pt-3">
        <div className="flex flex-wrap items-center gap-1">
          {formatActions.map((item) => {
            const Icon = item.icon;

            return (
              <Button
                aria-label={item.label}
                className="h-9 w-9 px-0"
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

function applyMarkdownFormat(
  editorView: MarkdownEditorView | null,
  action: (typeof formatActions)[number]["action"]
) {
  if (!editorView) {
    return;
  }

  const selection = editorView.state.selection.main;
  const selectedText = editorView.state.doc.sliceString(
    selection.from,
    selection.to
  );
  const fallback = selectedText || placeholderFor(action);
  const insert = formatText(action, fallback);
  const cursorOffset = selectedText ? insert.length : cursorOffsetFor(action);

  editorView.dispatch({
    changes: { from: selection.from, to: selection.to, insert },
    selection: { anchor: selection.from + cursorOffset }
  });
  editorView.focus();
}

function placeholderFor(action: (typeof formatActions)[number]["action"]) {
  const placeholders = {
    heading: "Heading",
    bold: "bold text",
    italic: "italic text",
    link: "link text",
    quote: "quote",
    list: "list item",
    task: "task item",
    code: "code"
  };

  return placeholders[action];
}

function formatText(
  action: (typeof formatActions)[number]["action"],
  value: string
) {
  const formats = {
    heading: `# ${value}`,
    bold: `**${value}**`,
    italic: `_${value}_`,
    link: `[${value}](https://example.com)`,
    quote: `> ${value}`,
    list: `- ${value}`,
    task: `- [ ] ${value}`,
    code: value.includes("\n") ? `\`\`\`\n${value}\n\`\`\`` : `\`${value}\``
  };

  return formats[action];
}

function cursorOffsetFor(action: (typeof formatActions)[number]["action"]) {
  const offsets = {
    heading: 2,
    bold: 2,
    italic: 1,
    link: 1,
    quote: 2,
    list: 2,
    task: 6,
    code: 1
  };

  return offsets[action];
}

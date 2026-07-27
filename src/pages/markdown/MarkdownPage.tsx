import {
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  useMemo,
  useRef,
  useState
} from "react";

import { cn } from "#/lib/cn";
import {
  createMarkdownDownloadName,
  downloadTextFile
} from "#/features/editor/utils/file";
import type { MarkdownEditorView } from "#/features/editor/types";

import { EditorToolbar } from "#/features/editor/components/EditorToolbar";
import { MarkdownEditor } from "#/features/editor/components/MarkdownEditor";
import { PreviewPane } from "#/features/editor/components/PreviewPane";
import { StatusBar } from "#/features/editor/components/StatusBar";
import { useEditorStore } from "#/features/editor/store/editor.store";

export function MarkdownPage() {
  const [editorView, setEditorView] = useState<MarkdownEditorView | null>(null);
  const [editorWidth, setEditorWidth] = useState(50);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const splitPaneRef = useRef<HTMLElement | null>(null);

  const content = useEditorStore((state) => state.content);
  const fileName = useEditorStore((state) => state.fileName);
  const viewMode = useEditorStore((state) => state.viewMode);
  const lastSavedAt = useEditorStore((state) => state.lastSavedAt);
  const setContent = useEditorStore((state) => state.setContent);
  const setFile = useEditorStore((state) => state.setFile);
  const setFileName = useEditorStore((state) => state.setFileName);
  const setViewMode = useEditorStore((state) => state.setViewMode);
  const markSaved = useEditorStore((state) => state.markSaved);
  const resetDocument = useEditorStore((state) => state.resetDocument);

  const markdownDownloadName = useMemo(
    () => createMarkdownDownloadName(fileName),
    [fileName]
  );

  function handleDownloadMarkdown() {
    downloadTextFile(
      content,
      markdownDownloadName,
      "text/markdown;charset=utf-8"
    );
    markSaved();
  }

  function updateEditorWidth(clientX: number) {
    const container = splitPaneRef.current;

    if (!container) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const width = ((clientX - bounds.left) / bounds.width) * 100;
    setEditorWidth(Math.min(75, Math.max(25, width)));
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    updateEditorWidth(event.clientX);

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handlePointerMove(moveEvent: PointerEvent) {
      updateEditorWidth(moveEvent.clientX);
    }

    function handlePointerUp() {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp, { once: true });
  }

  return (
    <main className="flex h-screen min-h-0 flex-col bg-slate-950 text-slate-100">
      <EditorToolbar
        editorView={editorView}
        fileInputRef={fileInputRef}
        fileName={fileName}
        onDownloadMarkdown={handleDownloadMarkdown}
        onFileOpened={setFile}
        onNewDocument={resetDocument}
        onRename={setFileName}
        onViewModeChange={setViewMode}
        viewMode={viewMode}
      />

      <section
        ref={splitPaneRef}
        style={
          {
            "--editor-width": `${editorWidth}%`
          } as CSSProperties
        }
        className={cn(
          "grid min-h-0 flex-1",
          viewMode === "split" &&
            "grid-cols-1 lg:grid-cols-[minmax(280px,var(--editor-width))_10px_minmax(320px,1fr)]",
          viewMode !== "split" && "grid-cols-1"
        )}
      >
        {viewMode !== "preview" && (
          <div className="min-h-0">
            <MarkdownEditor
              content={content}
              onChange={setContent}
              onEditorReady={setEditorView}
            />
          </div>
        )}

        {viewMode === "split" && (
          <div
            className="group hidden cursor-col-resize bg-slate-950 outline-none lg:flex"
            onPointerDown={handleResizePointerDown}
            title="Drag to resize panes"
          >
            <div className="mx-auto h-full w-px bg-slate-800 transition group-hover:bg-cyan-400 group-focus:bg-cyan-400" />
          </div>
        )}

        {viewMode !== "edit" && (
          <div className="min-h-0">
            <PreviewPane content={content} />
          </div>
        )}
      </section>

      <StatusBar
        content={content}
        fileName={markdownDownloadName}
        lastSavedAt={lastSavedAt}
      />
    </main>
  );
}

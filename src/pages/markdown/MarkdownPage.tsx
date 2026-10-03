import {
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  useDeferredValue,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";

import { cn } from "#/lib/cn";
import {
  createMarkdownDownloadName,
  downloadTextFile
} from "#/features/editor/utils/file";
import type { MarkdownEditorView } from "#/features/editor/types/editor.types";

import { EditorToolbar } from "#/features/editor/components/EditorToolbar";
import { MarkdownEditor } from "#/features/editor/components/MarkdownEditor";
import { PreviewPane } from "#/features/editor/components/PreviewPane";
import { StatusBar } from "#/features/editor/components/StatusBar";
import {
  useAutosaveStore,
  useEditorStore
} from "#/features/editor/store/editor.store";

const MIN_EDITOR_WIDTH = 25;
const MAX_EDITOR_WIDTH = 75;
const KEYBOARD_RESIZE_STEP = 2;

function clampEditorWidth(width: number) {
  return Math.min(MAX_EDITOR_WIDTH, Math.max(MIN_EDITOR_WIDTH, width));
}

export function MarkdownPage() {
  const [editorView, setEditorView] = useState<MarkdownEditorView | null>(null);
  const [editorWidth, setEditorWidth] = useState(50);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const splitPaneRef = useRef<HTMLElement | null>(null);
  const resizeCleanupRef = useRef<(() => void) | null>(null);

  const content = useEditorStore((state) => state.content);
  const fileName = useEditorStore((state) => state.fileName);
  const viewMode = useEditorStore((state) => state.viewMode);
  const isDirty = useEditorStore((state) => state.isDirty);
  const lastDownloadedAt = useEditorStore((state) => state.lastDownloadedAt);
  const setContent = useEditorStore((state) => state.setContent);
  const setFile = useEditorStore((state) => state.setFile);
  const setFileName = useEditorStore((state) => state.setFileName);
  const setViewMode = useEditorStore((state) => state.setViewMode);
  const markDownloaded = useEditorStore((state) => state.markDownloaded);
  const resetDocument = useEditorStore((state) => state.resetDocument);
  const lastAutosavedAt = useAutosaveStore((state) => state.lastAutosavedAt);
  const autosaveError = useAutosaveStore((state) => state.autosaveError);

  // The preview pipeline is expensive, so it renders from a deferred value
  // and never blocks typing in the editor.
  const previewContent = useDeferredValue(content);

  const markdownDownloadName = useMemo(
    () => createMarkdownDownloadName(fileName),
    [fileName]
  );

  useEffect(
    () => () => {
      resizeCleanupRef.current?.();
    },
    []
  );

  function confirmDiscardChanges() {
    return (
      !isDirty ||
      window.confirm(
        "You have changes that have not been downloaded. Discard them?"
      )
    );
  }

  function handleNewDocument() {
    if (confirmDiscardChanges()) {
      resetDocument();
    }
  }

  function handleOpenFileRequest() {
    if (confirmDiscardChanges()) {
      fileInputRef.current?.click();
    }
  }

  function handleDownloadMarkdown() {
    downloadTextFile(
      content,
      markdownDownloadName,
      "text/markdown;charset=utf-8"
    );
    markDownloaded();
  }

  function updateEditorWidth(clientX: number) {
    const container = splitPaneRef.current;

    if (!container) {
      return;
    }

    const bounds = container.getBoundingClientRect();
    const width = ((clientX - bounds.left) / bounds.width) * 100;
    setEditorWidth(clampEditorWidth(width));
  }

  function handleResizePointerDown(event: ReactPointerEvent<HTMLDivElement>) {
    event.preventDefault();
    resizeCleanupRef.current?.();
    updateEditorWidth(event.clientX);

    const previousCursor = document.body.style.cursor;
    const previousUserSelect = document.body.style.userSelect;

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    function handlePointerMove(moveEvent: PointerEvent) {
      updateEditorWidth(moveEvent.clientX);
    }

    function cleanupResize() {
      document.body.style.cursor = previousCursor;
      document.body.style.userSelect = previousUserSelect;
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", cleanupResize);
      window.removeEventListener("pointercancel", cleanupResize);
      resizeCleanupRef.current = null;
    }

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", cleanupResize);
    window.addEventListener("pointercancel", cleanupResize);
    resizeCleanupRef.current = cleanupResize;
  }

  function handleResizeKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    const keyWidths: Record<string, number> = {
      ArrowLeft: editorWidth - KEYBOARD_RESIZE_STEP,
      ArrowRight: editorWidth + KEYBOARD_RESIZE_STEP,
      Home: MIN_EDITOR_WIDTH,
      End: MAX_EDITOR_WIDTH
    };
    const nextWidth = Object.hasOwn(keyWidths, event.key)
      ? keyWidths[event.key]
      : undefined;

    if (nextWidth === undefined) {
      return;
    }

    event.preventDefault();
    setEditorWidth(clampEditorWidth(nextWidth));
  }

  return (
    <main className="flex h-full min-h-0 flex-col overflow-hidden bg-slate-950 text-slate-100">
      <EditorToolbar
        editorView={viewMode === "preview" ? null : editorView}
        fileInputRef={fileInputRef}
        fileName={fileName}
        onDownloadMarkdown={handleDownloadMarkdown}
        onFileOpened={setFile}
        onNewDocument={handleNewDocument}
        onOpenFileRequest={handleOpenFileRequest}
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
            aria-label="Resize editor and preview panes"
            aria-orientation="vertical"
            aria-valuemax={MAX_EDITOR_WIDTH}
            aria-valuemin={MIN_EDITOR_WIDTH}
            aria-valuenow={Math.round(editorWidth)}
            className="group hidden cursor-col-resize bg-slate-950 outline-none lg:flex"
            onKeyDown={handleResizeKeyDown}
            onPointerDown={handleResizePointerDown}
            role="separator"
            tabIndex={0}
            title="Drag to resize panes"
          >
            <div className="mx-auto h-full w-px bg-slate-800 transition group-hover:bg-cyan-400 group-focus:bg-cyan-400" />
          </div>
        )}

        {viewMode !== "edit" && (
          <div className="min-h-0">
            <PreviewPane content={previewContent} />
          </div>
        )}
      </section>

      <StatusBar
        autosaveError={autosaveError}
        content={content}
        fileName={markdownDownloadName}
        isDirty={isDirty}
        lastAutosavedAt={lastAutosavedAt}
        lastDownloadedAt={lastDownloadedAt}
      />
    </main>
  );
}

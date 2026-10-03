import { create } from "zustand";
import {
  persist,
  type PersistStorage,
  type StorageValue
} from "zustand/middleware";

import type { ViewMode } from "../types/editor.types";

const STORAGE_KEY = "mdraft:draft";
const SAVED_AT_KEY = `${STORAGE_KEY}:savedAt`;
const STORAGE_VERSION = 2;
const AUTOSAVE_DELAY_MS = 300;
const AUTOSAVE_ERROR_MESSAGE =
  "Autosave failed. Download your document to keep a copy.";

const isBrowser = typeof window !== "undefined";

function getLocalStorage(): Storage | null {
  if (!isBrowser) {
    return null;
  }

  try {
    return window.localStorage;
  } catch {
    // Accessing localStorage can throw when storage is blocked by the browser.
    return null;
  }
}

function readSavedAt() {
  try {
    return getLocalStorage()?.getItem(SAVED_AT_KEY) ?? undefined;
  } catch {
    return undefined;
  }
}

type AutosaveState = {
  lastAutosavedAt?: string;
  autosaveError: string | null;
};

/**
 * Autosave status is kept outside the persisted editor store so that updating
 * it never schedules another persisted write.
 */
export const useAutosaveStore = create<AutosaveState>()(() => ({
  lastAutosavedAt: readSavedAt(),
  autosaveError: null
}));

type PersistedEditorState = {
  content: string;
  fileName: string;
  viewMode: ViewMode;
  isDirty: boolean;
  lastDownloadedAt?: string;
};

let pendingWrite: {
  name: string;
  value: StorageValue<PersistedEditorState>;
} | null = null;
let pendingWriteTimer: ReturnType<typeof setTimeout> | undefined;
let lastPersistedValue: string | null = null;

function cancelPendingWrite() {
  pendingWrite = null;
  clearTimeout(pendingWriteTimer);
  pendingWriteTimer = undefined;
}

function flushPendingWrite() {
  if (!pendingWrite) {
    return;
  }

  const write = pendingWrite;
  cancelPendingWrite();

  const storage = getLocalStorage();
  if (!storage) {
    useAutosaveStore.setState({ autosaveError: AUTOSAVE_ERROR_MESSAGE });
    return;
  }

  try {
    // Serialization is deferred until the debounced flush, so typing does not
    // stringify the whole document on every keystroke.
    const serialized = JSON.stringify(write.value);
    if (serialized === lastPersistedValue) {
      return;
    }

    const savedAt = new Date().toISOString();
    storage.setItem(write.name, serialized);
    storage.setItem(SAVED_AT_KEY, savedAt);
    lastPersistedValue = serialized;

    // Only report success after the write has actually happened.
    useAutosaveStore.setState({ lastAutosavedAt: savedAt, autosaveError: null });
  } catch (error) {
    console.error("Unable to autosave the Markdown draft.", error);
    useAutosaveStore.setState({ autosaveError: AUTOSAVE_ERROR_MESSAGE });
  }
}

const autosaveStorage: PersistStorage<PersistedEditorState> = {
  getItem: (name) => {
    const storage = getLocalStorage();
    if (!storage) {
      return null;
    }

    try {
      const raw = storage.getItem(name);
      lastPersistedValue = raw;
      return raw ? (JSON.parse(raw) as StorageValue<PersistedEditorState>) : null;
    } catch (error) {
      console.error("Unable to restore the Markdown draft.", error);
      return null;
    }
  },
  setItem: (name, value) => {
    pendingWrite = { name, value };
    clearTimeout(pendingWriteTimer);
    pendingWriteTimer = setTimeout(flushPendingWrite, AUTOSAVE_DELAY_MS);
  },
  removeItem: (name) => {
    if (pendingWrite?.name === name) {
      cancelPendingWrite();
    }

    try {
      const storage = getLocalStorage();
      storage?.removeItem(name);
      storage?.removeItem(SAVED_AT_KEY);
      lastPersistedValue = null;
      useAutosaveStore.setState({ lastAutosavedAt: undefined });
    } catch (error) {
      console.error("Unable to clear the Markdown draft.", error);
    }
  }
};

const initialContent = `# Untitled note

Start writing in **Markdown**.

## Things to try

- Use the toolbar for common formatting
- Open an existing .md file
- Save your work as a Markdown file

\`\`\`ts
const message = 'Markdown feels good here'
console.log(message)
\`\`\`
`;

type EditorState = PersistedEditorState & {
  setContent: (content: string) => void;
  setFile: (fileName: string, content: string) => void;
  setFileName: (fileName: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  markDownloaded: () => void;
  resetDocument: () => void;
};

function isViewMode(value: unknown): value is ViewMode {
  return value === "split" || value === "edit" || value === "preview";
}

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      content: initialContent,
      fileName: "untitled",
      viewMode: "split",
      isDirty: false,
      lastDownloadedAt: undefined,
      setContent: (content) => set({ content, isDirty: true }),
      setFile: (fileName, content) =>
        set({
          content,
          fileName,
          isDirty: false,
          lastDownloadedAt: undefined
        }),
      setFileName: (fileName) =>
        set((state) => ({
          fileName,
          isDirty: state.isDirty || fileName !== state.fileName
        })),
      setViewMode: (viewMode) => set({ viewMode }),
      markDownloaded: () =>
        set({ isDirty: false, lastDownloadedAt: new Date().toISOString() }),
      resetDocument: () =>
        set({
          content: "",
          fileName: "untitled",
          isDirty: false,
          lastDownloadedAt: undefined,
          viewMode: "split"
        })
    }),
    {
      name: STORAGE_KEY,
      storage: autosaveStorage,
      version: STORAGE_VERSION,
      partialize: (state): PersistedEditorState => ({
        content: state.content,
        fileName: state.fileName,
        viewMode: state.viewMode,
        isDirty: state.isDirty,
        lastDownloadedAt: state.lastDownloadedAt
      }),
      migrate: (persistedState): PersistedEditorState => {
        const legacy = (persistedState ?? {}) as Partial<
          Record<keyof PersistedEditorState, unknown>
        >;

        // v1 stored `lastSavedAt`, which mixed autosaves and downloads, so it
        // is dropped. Restored drafts are treated as not downloaded to avoid
        // discarding them without confirmation.
        return {
          content:
            typeof legacy.content === "string" ? legacy.content : initialContent,
          fileName:
            typeof legacy.fileName === "string" ? legacy.fileName : "untitled",
          viewMode: isViewMode(legacy.viewMode) ? legacy.viewMode : "split",
          isDirty: typeof legacy.content === "string",
          lastDownloadedAt: undefined
        };
      }
    }
  )
);

function handleStorageEvent(event: StorageEvent) {
  if (event.storageArea !== getLocalStorage()) {
    return;
  }

  if (event.key === SAVED_AT_KEY) {
    useAutosaveStore.setState({ lastAutosavedAt: event.newValue ?? undefined });
    return;
  }

  if (event.key !== STORAGE_KEY) {
    return;
  }

  // Edits in this tab that have not been flushed yet win. They are written
  // shortly and the other tab then syncs from them.
  if (pendingWrite) {
    return;
  }

  lastPersistedValue = event.newValue;
  void useEditorStore.persist.rehydrate();
}

function handleVisibilityChange() {
  if (document.visibilityState === "hidden") {
    flushPendingWrite();
  }
}

if (isBrowser) {
  window.addEventListener("pagehide", flushPendingWrite);
  window.addEventListener("storage", handleStorageEvent);
  document.addEventListener("visibilitychange", handleVisibilityChange);

  import.meta.hot?.dispose(() => {
    flushPendingWrite();
    window.removeEventListener("pagehide", flushPendingWrite);
    window.removeEventListener("storage", handleStorageEvent);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
  });
}

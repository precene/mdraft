import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { ViewMode } from "../types";

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

type EditorState = {
  content: string;
  fileName: string;
  viewMode: ViewMode;
  lastSavedAt?: string;
  setContent: (content: string) => void;
  setFile: (fileName: string, content: string) => void;
  setFileName: (fileName: string) => void;
  setViewMode: (viewMode: ViewMode) => void;
  markSaved: () => void;
  resetDocument: () => void;
};

export const useEditorStore = create<EditorState>()(
  persist(
    (set) => ({
      content: initialContent,
      fileName: "untitled",
      viewMode: "split",
      setContent: (content) =>
        set({ content, lastSavedAt: new Date().toISOString() }),
      setFile: (fileName, content) =>
        set({ content, fileName, lastSavedAt: new Date().toISOString() }),
      setFileName: (fileName) => set({ fileName }),
      setViewMode: (viewMode) => set({ viewMode }),
      markSaved: () => set({ lastSavedAt: new Date().toISOString() }),
      resetDocument: () =>
        set({
          content: "",
          fileName: "untitled",
          lastSavedAt: undefined,
          viewMode: "split"
        })
    }),
    {
      name: "mdraft:draft",
      version: 1
    }
  )
);

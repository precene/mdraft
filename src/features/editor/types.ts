export type ViewMode = "split" | "edit" | "preview";

export type MarkdownEditorView = {
  focus: () => void;
  state: {
    doc: { sliceString: (from: number, to: number) => string };
    selection: { main: { from: number; to: number; empty: boolean } };
  };
  dispatch: (transaction: {
    changes: { from: number; to: number; insert: string };
    selection?: { anchor: number; head?: number };
  }) => void;
};

export type MarkdownDocument = {
  content: string;
  fileName: string;
  lastSavedAt?: string;
};

export type ViewMode = "split" | "edit" | "preview";

export type MarkdownEditorView = {
  focus: () => void;
  state: {
    doc: {
      sliceString: (from: number, to: number) => string;
      lineAt: (pos: number) => { from: number; to: number };
    };
    selection: { main: { from: number; to: number; empty: boolean } };
  };
  dispatch: (transaction: {
    changes: { from: number; to: number; insert: string };
    selection?: { anchor: number; head?: number };
  }) => void;
};

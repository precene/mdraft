import CodeMirror from "@uiw/react-codemirror";
import { markdown } from "@codemirror/lang-markdown";

import type { MarkdownEditorView } from "../types";

type MarkdownEditorProps = {
  content: string;
  onChange: (value: string) => void;
  onEditorReady: (view: MarkdownEditorView) => void;
};

export function MarkdownEditor({
  content,
  onChange,
  onEditorReady
}: MarkdownEditorProps) {
  return (
    <div className="h-full overflow-hidden bg-slate-950">
      <CodeMirror
        basicSetup={{
          autocompletion: true,
          bracketMatching: true,
          foldGutter: false,
          highlightActiveLine: true,
          highlightActiveLineGutter: false,
          lineNumbers: true
        }}
        className="h-full text-[15px]"
        extensions={[markdown()]}
        height="100%"
        onChange={onChange}
        onCreateEditor={onEditorReady}
        theme="dark"
        value={content}
      />
    </div>
  );
}

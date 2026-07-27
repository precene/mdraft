import {
  getCharacterCount,
  getReadingTime,
  getWordCount
} from "../utils/stats";

type StatusBarProps = {
  content: string;
  fileName: string;
  lastSavedAt?: string;
};

export function StatusBar({ content, fileName, lastSavedAt }: StatusBarProps) {
  const savedLabel = lastSavedAt
    ? `Autosaved ${new Date(lastSavedAt).toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit"
      })}`
    : "Autosaved";

  return (
    <footer className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-slate-200">{fileName}</span>
        <span className="text-slate-600">/</span>
        <span>{savedLabel}</span>
      </div>

      <div className="flex items-center gap-4">
        <span>{getWordCount(content)} words</span>
        <span>{getCharacterCount(content)} chars</span>
        <span>{getReadingTime(content)}</span>
      </div>
    </footer>
  );
}

import {
  getCharacterCount,
  getReadingTime,
  getWordCount
} from "../utils/stats";

type StatusBarProps = {
  content: string;
  fileName: string;
  isDirty: boolean;
  lastAutosavedAt?: string;
  autosaveError: string | null;
  lastDownloadedAt?: string;
};

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit"
  });
}

function getDownloadLabel(isDirty: boolean, lastDownloadedAt?: string) {
  if (lastDownloadedAt && !isDirty) {
    return `Downloaded ${formatTime(lastDownloadedAt)}`;
  }

  if (lastDownloadedAt) {
    return "Edited since download";
  }

  return isDirty ? "Not downloaded" : null;
}

export function StatusBar({
  content,
  fileName,
  isDirty,
  lastAutosavedAt,
  autosaveError,
  lastDownloadedAt
}: StatusBarProps) {
  const autosaveLabel = lastAutosavedAt
    ? `Autosaved ${formatTime(lastAutosavedAt)}`
    : "Not yet autosaved";
  const downloadLabel = getDownloadLabel(isDirty, lastDownloadedAt);

  return (
    <footer className="flex min-h-10 flex-wrap items-center justify-between gap-3 border-t border-slate-800 bg-slate-950 px-4 py-2 text-xs text-slate-400">
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate font-medium text-slate-200">{fileName}</span>
        <span className="text-slate-600">/</span>
        {autosaveError ? (
          <span className="text-rose-300" role="alert">
            {autosaveError}
          </span>
        ) : (
          <span>{autosaveLabel}</span>
        )}
        {downloadLabel && (
          <>
            <span className="text-slate-600">/</span>
            <span>{downloadLabel}</span>
          </>
        )}
      </div>

      <div className="flex items-center gap-4">
        <span>{getWordCount(content)} words</span>
        <span>{getCharacterCount(content)} chars</span>
        <span>{getReadingTime(content)}</span>
      </div>
    </footer>
  );
}

export function downloadTextFile(
  content: string,
  fileName: string,
  mimeType: string
) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export function normalizeMarkdownFileName(fileName: string) {
  const trimmed = fileName.trim() || "untitled";
  return trimmed.replace(/\.(md|markdown)$/i, "");
}

export function createMarkdownDownloadName(fileName: string) {
  return `${normalizeMarkdownFileName(fileName)}.md`;
}

export async function readMarkdownFile(file: File) {
  return {
    content: await file.text(),
    fileName: normalizeMarkdownFileName(file.name)
  };
}

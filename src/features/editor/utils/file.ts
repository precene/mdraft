export const MAX_MARKDOWN_FILE_BYTES = 2 * 1024 * 1024;

export class MarkdownFileError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MarkdownFileError";
  }
}

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
  return trimmed.replace(/\.(md|markdown|txt)$/i, "");
}

export function createMarkdownDownloadName(fileName: string) {
  return `${normalizeMarkdownFileName(fileName)}.md`;
}

export async function readMarkdownFile(file: File) {
  // `accept` on the file input is only a hint, so size and content are
  // validated here before anything is loaded into the editor.
  if (file.size > MAX_MARKDOWN_FILE_BYTES) {
    const limitInMb = MAX_MARKDOWN_FILE_BYTES / (1024 * 1024);
    throw new MarkdownFileError(
      `${file.name} is larger than the ${limitInMb} MB limit.`
    );
  }

  const content = await file.text();

  if (content.includes("\u0000")) {
    throw new MarkdownFileError(`${file.name} does not look like a text file.`);
  }

  return {
    content,
    fileName: normalizeMarkdownFileName(file.name)
  };
}

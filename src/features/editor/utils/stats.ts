export function getWordCount(value: string) {
  const words = value.trim().match(/\S+/g);
  return words?.length ?? 0;
}

export function getCharacterCount(value: string) {
  return value.length;
}

export function getReadingTime(value: string) {
  const minutes = Math.max(1, Math.ceil(getWordCount(value) / 220));
  return `${minutes} min read`;
}

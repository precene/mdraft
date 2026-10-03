export function getWordCount(value: string) {
  const words = value.trim().match(/\S+/g);
  return words?.length ?? 0;
}

export function getCharacterCount(value: string) {
  let count = 0;
  // Iterating a string yields code points, so surrogate pairs count once.
  for (const _character of value) {
    count += 1;
  }
  return count;
}

export function getReadingTime(value: string) {
  const wordCount = getWordCount(value);
  const minutes = wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 220));
  return `${minutes} min read`;
}

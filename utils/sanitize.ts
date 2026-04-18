export function sanitizeTitle(text: string): string {
  return text.trim().replace(/\s+/g, " ");
}

export function sanitizeNotes(text: string): string {
  return text
    .split("\n")
    .map((line) => line.trimEnd())
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

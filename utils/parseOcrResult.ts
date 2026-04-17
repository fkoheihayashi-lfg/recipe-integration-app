export type OcrResult = {
  imageUri?: string;
  rawText?: string;
  titleSuggestion?: string;
  notesSuggestion?: string;
};

export function parseOcrResult(result: OcrResult): {
  title: string;
  notes: string;
} {
  const rawText = result.rawText?.trim() ?? "";
  const suggestedTitle = result.titleSuggestion?.trim() ?? "";
  const suggestedNotes = result.notesSuggestion?.trim() ?? "";

  if (suggestedTitle || suggestedNotes) {
    return {
      title: suggestedTitle || "Imported Recipe",
      notes: suggestedNotes || rawText,
    };
  }

  if (!rawText) {
    return { title: "Imported Recipe", notes: "" };
  }

  const lines = rawText
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return { title: "Imported Recipe", notes: rawText };
  }

  return {
    title: lines[0],
    notes: lines.slice(1).join("\n"),
  };
}

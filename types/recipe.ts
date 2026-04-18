export type Recipe = {
  id: string;
  title: string;
  notes: string;
  imageUri?: string;
  source?: "manual" | "ocr";
};

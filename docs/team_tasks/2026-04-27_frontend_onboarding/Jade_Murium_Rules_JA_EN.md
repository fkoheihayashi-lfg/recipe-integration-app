# Frontend Rules for Jade and Murium / Jade・Murium向けフロントエンドルール

## English

### Common rules

- Work only on your assigned task.
- Do not edit `main` directly.
- Use your own branch.
- Keep changes small.
- Do not redesign the whole app.
- Do not refactor large parts of the code.
- Do not install new packages without Kohei’s approval.
- Test the app before reporting done.
- If you get stuck, share the error message.

### Do not touch

- `.github/`
- `worker/`
- dashboard files
- backend / cloud / API files
- package files
- unrelated components

### Jade-specific rule

Jade should work only on OCR-related files unless Kohei approves.

Allowed:
- `components/ocr/OcrScanner.tsx`
- `components/OcrReviewModal.tsx` only if assigned

Do not edit:
- `app/(tabs)/index.tsx`
- Recipe list / storage / GitHub automation files

### Murium-specific rule

Murium should work only on the assigned small frontend UI task.

For the first task, edit only:
- `components/RecipeList.tsx`

Do not edit:
- OCR files
- `app/(tabs)/index.tsx`
- storage / AsyncStorage logic
- package files

---

## 日本語

### 共通ルール

- 自分に割り当てられたタスクだけ作業してください。
- `main` を直接編集しないでください。
- 自分用のブランチで作業してください。
- 変更は小さくしてください。
- アプリ全体のデザイン変更はしないでください。
- 大きなリファクタリングはしないでください。
- Koheiの確認なしに新しいパッケージを入れないでください。
- 完了報告の前にアプリを動かして確認してください。
- 詰まったらエラーメッセージを共有してください。

### 触らないもの

- `.github/`
- `worker/`
- dashboard関連ファイル
- backend / cloud / API 関連ファイル
- package関連ファイル
- 関係ないコンポーネント

### Jade専用ルール

Jadeは、Koheiの許可がない限りOCR関連ファイルだけ作業してください。

触ってよいもの:
- `components/ocr/OcrScanner.tsx`
- 指示がある場合のみ `components/OcrReviewModal.tsx`

触らないもの:
- `app/(tabs)/index.tsx`
- Recipe list / storage / GitHub automation関連

### Murium専用ルール

Muriumは、割り当てられた小さなfrontend UIタスクだけ作業してください。

最初のタスクでは、触ってよいのはこれだけです:
- `components/RecipeList.tsx`

触らないもの:
- OCR関連ファイル
- `app/(tabs)/index.tsx`
- storage / AsyncStorage関連
- package関連ファイル

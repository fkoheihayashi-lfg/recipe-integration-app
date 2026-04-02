# 🍽️ Recipe Integration App

レシピ統合モバイルアプリケーション開発プロジェクト

---

## 📱 プロジェクト概要

- **目標**: Apple App Store へのリリース
- **開発段階**: 企画・仕様整理・画面設計・開発ルール整備
- **チームサイズ**: 2-3名

---

## 🚀 クイックスタート

```bash
# ブランチ確認
git branch

# 機能開発を始める
git checkout -b feature/your-feature-name develop

# 実装 → コミット → push → Pull Request
```

---

## 📋 GitHub運用ルール（必読）

### 🧠 基本原則

このプロジェクトはGitHubを中心に管理しています。

- ✅ **すべての作業はIssueから始まる**
- ✅ **コードはレビューを通してからマージ**
- ✅ **小さく分けて、早くレビューする**

### 🌿 ブランチ運用

```
main (本番)
  ↑
develop (開発統合)
  ↑
feature/xxx (機能開発)
```

**ルール:**
- 🚫 `main` に直接 push 禁止
- 🚫 Issue なしで作業開始禁止
- 🚫 Review なしでマージ禁止

### 🔄 開発フロー（5ステップ）

```
1. Issue 作成（タスクの説明）
   ↓
2. ブランチ作成（feature/xxx として develop から）
   ↓
3. 実装 + コミット（コミットメッセージは明確に）
   ↓
4. Push + Pull Request 作成
   ↓
5. Review 後、develop へマージ
```

### 📝 Issue ルール

**テンプレートに従って作成:**
- タイトルは明確に（例: `[機能] ログイン画面の実装`）
- 内容は箇条書きで分かりやすく
- 完了条件を必ず記載

👉 **Issue作成時に自動テンプレが表示されます**

### 🔀 Pull Request ルール

**テンプレートに従って作成:**
- 変更内容を簡潔に説明
- 対応する Issue 番号を記載
- 確認方法を記載（どう動作確認するか）

👉 **PR作成時に自動テンプレが表示されます**

### 💬 コミットメッセージの形式

```
feat: ログイン機能を実装
fix: ボタンの表示バグを修正
refactor: 関数をリファクタリング
docs: README を更新
```

---

## 💬 使用言語

このプロジェクトではチームメンバーが日本語と英語の両方を使用しています。

- ✅ **Issue / PR / コミットメッセージ**: 日本語・英語どちらでも OK
- ✅ **コード・コメント**: 可能であれば簡単な英語を併記推奨
- 📝 **例**: `// ユーザーのログイン状態を確認 / Check user login status`

---

## 🛠️ 使用技術

- **開発環境**: 後日記載
- **API**: 後日記載
- **デザイン**: 後日記載

---

## 📞 コミュニケーション

- 📋 **タスク管理**: GitHub Issue
- 💬 **雑談・相談**: Discord / Slack
- 📊 **仕様書**: Notion

---

## 🚦 開発段階

- [ ] 企画・仕様整理
- [ ] 画面設計
- [ ] 開発ルール整備
- [ ] ベース開発
- [ ] 機能実装
- [ ] テスト
- [ ] App Store リリース

---

## 📚 参考資料

- [GitHub Flow について](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Issue テンプレの使い方](.github/ISSUE_TEMPLATE/task.md)
- [PR テンプレの使い方](.github/PULL_REQUEST_TEMPLATE/default.md)

---

**質問や問題があったら、Issue を作成してください！**

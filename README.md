# 🍽️ Recipe Integration App

A mobile application for capturing, organizing, and retrieving recipes quickly while cooking.

---

## 📱 Project Overview

- **Goal**: Release on the Apple App Store
- **Phase**: Planning, specification, UI design, and development setup
- **Team Size**: 2-3 members

---

## 🔧 Tech Stack

### Frontend
- React Native (Expo)
- TypeScript
- AsyncStorage (local persistence)
- Expo Image Picker (camera / photo library)

### Backend (MVP)
- None (local storage only)

### Future Backend (Post-MVP)
- Firebase or Supabase (TBD)

### AI / OCR (Post-MVP)
- Google Vision API or OpenAI Vision (TBD)

### Design
- Figma (UX team)
- Mobile-first design

---

## 🚀 Quick Start

```bash
# Check branches
git branch

# Start feature development
git checkout -b feature/your-feature-name develop

# Implement → Commit → Push → Pull Request
```

---

## 🛠 Development Workflow

### Branch Strategy
- `main` → production-ready
- `develop` → integration branch
- `feature/*` → new features
- `fix/*` → bug fixes

### Pull Request Rules
- At least 1 reviewer required
- Clear title + description
- Link related issue

### Commit Naming
- `feat:` add recipe creation
- `fix:` resolve image picker bug
- `refactor:` split components
- `chore:` update dependencies

### Issue Usage
- Every task must have an issue
- Use labels:
  - `frontend`
  - `backend`
  - `ux`
  - `bug`
  - `enhancement`

---

## 📋 GitHub Rules

### Core Principles

- ✅ All tasks must start from an Issue
- ✅ Code must be reviewed before merging
- ✅ Keep changes small and review quickly

### Branch Flow

```
main (production)
  ↑
develop (integration)
  ↑
feature/xxx (feature development)
```

**Rules:**
- 🚫 No direct push to `main`
- 🚫 No work without an Issue
- 🚫 No merge without review

### Development Flow

1. Create an Issue
2. Create a branch from `develop`
3. Implement + Commit
4. Push + Pull Request
5. Review → Merge to `develop`

---

## 👥 Team Members

| Name | Role | GitHub |
|------|------|--------|
| Kohei | PM / Frontend | TBD |
| UX Member | UX Designer | TBD |
| Developer | Frontend | TBD |

> All members must share their GitHub account and be added as collaborators.

---

## 🌿 Branch Status

Current branches:

- `main`
- `develop` (to be created)
- `feature/mvp-ui` (to be created)
- `feature/image-input` (to be created)
- `feature/local-storage` (to be created)

> All feature development should be done via feature branches.

---

## 📊 Project Management

### GitHub Project Board

| Status | Description |
|--------|-------------|
| Backlog | Tasks not yet started |
| In Progress | Currently being worked on |
| Review | Awaiting code review |
| Done | Completed |

### Milestones

#### MVP Release
- Basic recipe save (image + title + notes)
- Local storage
- Search functionality

#### Post-MVP
- OCR integration
- Cloud sync
- User accounts

---

## 🚦 Roadmap

- [x] Planning & specification
- [ ] UI Design
- [ ] Development setup
- [ ] Base development
- [ ] Feature implementation
- [ ] Testing
- [ ] App Store release

---

## 📝 Issue Rules

- Use clear and descriptive titles
  - Example: `[Feature] Recipe creation screen`
- Use bullet points for task details
- Always define completion criteria

> An issue template will appear when creating a new issue.

---

## 🔀 Pull Request Rules

- Clearly describe what changed
- Link the related issue number (e.g. `close #5`)
- Provide steps to test the changes

> A PR template will appear when creating a new pull request.

---

## 📚 References

- [GitHub Flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Issue Template](.github/ISSUE_TEMPLATE/task.md)
- [PR Template](.github/PULL_REQUEST_TEMPLATE/default.md)

---

If you have any questions, please create an Issue!

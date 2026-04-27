# [Frontend] Improve recipe list empty state

## Goal

Improve the empty state UI for the recipe list so users understand what to do when there are no recipes yet.

This is a beginner-friendly frontend task.

## Background

The app already has the main recipe flow:

- Add recipe
- Save recipe locally
- Recipe list
- Search
- Recipe detail
- OCR placeholder / integration flow

For this task, please focus only on the recipe list empty state.

## Assigned branch

Please work on:

```text
feature/murium-empty-state
```

Do not edit `main` directly.

## File to edit

Please edit only:

```text
components/RecipeList.tsx
```

## Task

When there are no recipes, improve the current empty message.

Suggested UI text:

```text
🍳
No recipes yet
Add your first recipe to start building your cookbook.
```

You can improve spacing, text size, color, and layout.

## Important rules

Please do NOT:

- Add an "Add Recipe" button yet
- Change props
- Edit `app/(tabs)/index.tsx`
- Edit OCR files
- Edit AsyncStorage / storage logic
- Edit `.github/`
- Edit `worker/`
- Edit package files
- Run `npm install`
- Add new dependencies

## Success criteria

This task is complete when:

- The app still runs
- Empty recipe list shows a friendly empty state
- Existing recipe list still works
- Search behavior is not broken
- Only `components/RecipeList.tsx` is changed

## Testing

Please test:

1. Open the app with no recipes
2. Confirm the empty state appears
3. Add a recipe
4. Confirm the recipe appears in the list
5. Search for the recipe
6. Confirm the list still works

## Final comment

When finished, please comment with:

- What file you changed
- What you changed
- Screenshot if possible
- Any error you saw

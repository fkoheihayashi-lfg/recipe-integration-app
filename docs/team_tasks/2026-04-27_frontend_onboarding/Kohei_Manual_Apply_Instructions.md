# Kohei Manual Apply Instructions

Purpose:
Kohei can pre-apply the safe empty state UI change before assigning the final task to Murium.

Target file:

```text
~/Desktop/recipe-integration-app/components/RecipeList.tsx
```

## Step 1 — Open target file

Open:

```text
components/RecipeList.tsx
```

## Step 2 — Find current empty state

Look for the `FlatList` prop:

```tsx
ListEmptyComponent
```

It may currently show something simple like:

```tsx
<Text>No recipes yet</Text>
```

## Step 3 — Replace only the empty state block

Use the snippet in:

```text
RecipeList_Empty_State_Code_To_Copy.md
```

Do not change props.
Do not add a button.
Do not edit the parent file.

## Step 4 — Add styles

Add the style definitions from the snippet into the existing `StyleSheet.create({...})`.

## Step 5 — Verify

Run the app and check:

1. No recipes: friendly empty state appears
2. Add recipe: recipe list still appears
3. Search: still works
4. No TypeScript error
5. Only `components/RecipeList.tsx` changed

## Recommended git check

```bash
cd ~/Desktop/recipe-integration-app
git status --short
git diff -- components/RecipeList.tsx
```

Expected:
Only `components/RecipeList.tsx` should be modified.

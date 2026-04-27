/**
 * RecipeList empty state code snippet for Murium's first frontend task.
 *
 * Target file:
 *   components/RecipeList.tsx
 *
 * Goal:
 *   Replace the existing simple "No recipes yet" empty state with this friendly UI.
 *
 * Important:
 *   Do NOT change RecipeList props.
 *   Do NOT add an "Add Recipe" button yet.
 *   Do NOT edit app/(tabs)/index.tsx.
 *   Do NOT add dependencies.
 */

/**
 * 1) Replace the current FlatList ListEmptyComponent with this:
 */

ListEmptyComponent={
  <View style={styles.emptyStateContainer}>
    <Text style={styles.emptyStateIcon}>🍳</Text>
    <Text style={styles.emptyStateTitle}>No recipes yet</Text>
    <Text style={styles.emptyStateMessage}>
      Add your first recipe to start building your cookbook.
    </Text>
  </View>
}

/**
 * 2) Add these styles inside StyleSheet.create({...}) in the same file.
 *    If style names already exist, adjust names carefully to avoid duplicates.
 */

emptyStateContainer: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 48,
  paddingHorizontal: 24,
  marginTop: 24,
  borderRadius: 20,
  backgroundColor: "#F7F5F2",
  borderWidth: 1,
  borderColor: "#E5DDD4",
},

emptyStateIcon: {
  fontSize: 36,
  marginBottom: 12,
},

emptyStateTitle: {
  fontSize: 20,
  fontWeight: "700",
  color: "#2F2F2F",
  marginBottom: 8,
  textAlign: "center",
},

emptyStateMessage: {
  fontSize: 14,
  color: "#7D7D7D",
  lineHeight: 20,
  textAlign: "center",
},

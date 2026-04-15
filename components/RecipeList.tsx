import { Button, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export type Recipe = {
  id: string;
  title: string;
  notes: string;
};

type RecipeListProps = {
  recipes: Recipe[];
  onPressItem: (recipe: Recipe) => void;
  onEdit: (recipe: Recipe) => void;
  onDelete: (id: string) => void;
};

export default function RecipeList({
  recipes,
  onPressItem,
  onEdit,
  onDelete,
}: RecipeListProps) {
  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id}
      style={styles.list}
      contentContainerStyle={styles.listContent}
      ListEmptyComponent={<Text style={styles.emptyText}>No recipes yet</Text>}
      renderItem={({ item }) => (
        <View style={styles.recipeItem}>
          <TouchableOpacity onPress={() => onPressItem(item)}>
            <Text style={styles.recipeTitle}>{item.title}</Text>
            <Text style={styles.recipeNotes}>{item.notes || "No notes"}</Text>
          </TouchableOpacity>

          <View style={styles.recipeButtonRow}>
            <Button title="Edit" onPress={() => onEdit(item)} />
            <Button title="Delete" onPress={() => onDelete(item.id)} />
          </View>
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  list: {
    flex: 1,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    color: "#666",
    marginTop: 12,
  },
  recipeItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
  },
  recipeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  recipeNotes: {
    fontSize: 14,
    color: "#555",
    marginBottom: 10,
  },
  recipeButtonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
});
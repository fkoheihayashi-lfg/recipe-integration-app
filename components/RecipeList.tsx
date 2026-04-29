import React from 'react';
import { FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Recipe } from '../types/recipe';

interface RecipeListProps {
  recipes: Recipe[];
  onRecipePress: (recipe: Recipe) => void;
}

const RecipeList: React.FC<RecipeListProps> = ({ recipes, onRecipePress }) => {
  
  // This is the part that handles the "Empty State"
  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>No recipes yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first recipe to start building your cookbook.
      </Text>
    </View>
  );

  return (
    <FlatList
      data={recipes}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TouchableOpacity 
          style={styles.recipeItem} 
          onPress={() => onRecipePress(item)}
        >
          <Text style={styles.recipeTitle}>{item.title}</Text>
        </TouchableOpacity>
      )}
      // This tells the list to show our message if 'data' is empty
      ListEmptyComponent={renderEmptyState}
      contentContainerStyle={recipes.length === 0 ? { flexGrow: 1 } : null}
    />
  );
};

const styles = StyleSheet.create({
  recipeItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    backgroundColor: '#fff',
  },
  recipeTitle: {
    fontSize: 18,
  },
  // --- NEW STYLES FOR YOUR TASK ---
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
    marginTop: 50,
  },
  emptyTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
});

export default RecipeList;
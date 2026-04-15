import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import { Alert, Button, StyleSheet, Text, TextInput, View } from "react-native";
import RecipeDetailModal from "../../components/RecipeDetailModal";
import RecipeFormModal from "../../components/RecipeFormModal";
import type { Recipe } from "../../components/RecipeList";
import RecipeList from "../../components/RecipeList";

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    saveRecipes();
  }, [recipes]);

  const loadRecipes = async () => {
    try {
      const storedRecipes = await AsyncStorage.getItem("recipes");
      if (storedRecipes !== null) {
        setRecipes(JSON.parse(storedRecipes));
      }
    } catch (error) {
      console.log("Failed to load recipes:", error);
    }
  };

  const saveRecipes = async () => {
    try {
      await AsyncStorage.setItem("recipes", JSON.stringify(recipes));
    } catch (error) {
      console.log("Failed to save recipes:", error);
    }
  };

  const resetForm = () => {
    setTitle("");
    setNotes("");
    setSelectedRecipe(null);
    setIsEditing(false);
  };

  const openAddModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const openDetailModal = (item: Recipe) => {
    setSelectedRecipe(item);
    setDetailVisible(true);
  };

  const openEditModal = (item: Recipe) => {
    setSelectedRecipe(item);
    setTitle(item.title);
    setNotes(item.notes);
    setIsEditing(true);
    setDetailVisible(false);
    setModalVisible(true);
  };

  const addRecipe = () => {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a recipe title.");
      return;
    }

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: title.trim(),
      notes: notes.trim(),
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    resetForm();
    setModalVisible(false);
  };

  const updateRecipe = () => {
    if (!selectedRecipe) return;

    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a recipe title.");
      return;
    }

    setRecipes((prev) =>
      prev.map((recipe) =>
        recipe.id === selectedRecipe.id
          ? {
              ...recipe,
              title: title.trim(),
              notes: notes.trim(),
            }
          : recipe
      )
    );

    resetForm();
    setModalVisible(false);
  };

  const handleSave = () => {
    if (isEditing) {
      updateRecipe();
    } else {
      addRecipe();
    }
  };

  const deleteRecipe = (id: string) => {
    Alert.alert("Delete Recipe", "Are you sure you want to delete this recipe?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => {
          setRecipes((prev) => prev.filter((r) => r.id !== id));

          if (selectedRecipe?.id === id) {
            setSelectedRecipe(null);
            setDetailVisible(false);
          }
        },
      },
    ]);
  };

  const filteredRecipes = useMemo(() => {
    const keyword = search.toLowerCase().trim();

    return recipes.filter((r) => {
      return (
        r.title.toLowerCase().includes(keyword) ||
        r.notes.toLowerCase().includes(keyword)
      );
    });
  }, [recipes, search]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Recipe App</Text>

      <TextInput
        placeholder="Search..."
        value={search}
        onChangeText={setSearch}
        style={styles.input}
      />

      <View style={styles.buttonWrapper}>
        <Button title="Add Recipe" onPress={openAddModal} />
      </View>

      <Text style={styles.sectionTitle}>Saved Recipes</Text>

      <RecipeList
        recipes={filteredRecipes}
        onPressItem={openDetailModal}
        onEdit={openEditModal}
        onDelete={deleteRecipe}
      />

      <RecipeFormModal
        visible={modalVisible}
        isEditing={isEditing}
        title={title}
        notes={notes}
        onChangeTitle={setTitle}
        onChangeNotes={setNotes}
        onSave={handleSave}
        onClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      />

      <RecipeDetailModal
        visible={detailVisible}
        recipe={selectedRecipe}
        onClose={() => setDetailVisible(false)}
        onEdit={() => {
          if (selectedRecipe) {
            openEditModal(selectedRecipe);
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  buttonWrapper: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 8,
  },
});
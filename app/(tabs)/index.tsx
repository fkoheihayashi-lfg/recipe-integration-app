import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import RecipeDetailModal from "../../components/RecipeDetailModal";
import RecipeFormModal from "../../components/RecipeFormModal";
import type { Recipe } from "../../types/recipe";
import RecipeList from "../../components/RecipeList";
import OcrScanner from "../../components/ocr/OcrScanner";
import { parseOcrResult, type OcrResult } from "../../utils/parseOcrResult";
import { sanitizeNotes, sanitizeTitle } from "../../utils/sanitize";

const STORAGE_KEY = "recipes";

export default function Index() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [ocrVisible, setOcrVisible] = useState(false);

  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");
  const [imageUri, setImageUri] = useState<string | undefined>(undefined);
  const [isOcrImported, setIsOcrImported] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  useEffect(() => {
    saveRecipes(recipes);
  }, [recipes]);

  async function loadRecipes() {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setRecipes(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load recipes:", error);
    }
  }

  async function saveRecipes(nextRecipes: Recipe[]) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(nextRecipes));
    } catch (error) {
      console.error("Failed to save recipes:", error);
    }
  }

  function resetForm() {
    setTitle("");
    setNotes("");
    setImageUri(undefined);
    setIsOcrImported(false);
    setIsEditing(false);
    setEditingId(null);
  }

  function openAddModal() {
    resetForm();
    setModalVisible(true);
  }

  function openEditModal(recipe: Recipe) {
    setTitle(recipe.title);
    setNotes(recipe.notes);
    setImageUri(recipe.imageUri);
    setIsOcrImported(false);
    setIsEditing(true);
    setEditingId(recipe.id);
    setModalVisible(true);
  }

  function openDetailModal(recipe: Recipe) {
    setSelectedRecipe(recipe);
    setDetailVisible(true);
  }

  function deleteRecipe(id: string) {
    setRecipes((prev) => prev.filter((recipe) => recipe.id !== id));

    if (selectedRecipe?.id === id) {
      setSelectedRecipe(null);
      setDetailVisible(false);
    }

    if (editingId === id) {
      resetForm();
      setModalVisible(false);
    }
  }

  function handleSave() {
    if (!title.trim()) {
      Alert.alert("Title required", "Please enter a recipe title.");
      return;
    }

    if (isEditing && editingId) {
      setRecipes((prev) =>
        prev.map((recipe) =>
          recipe.id === editingId
            ? {
                ...recipe,
                title: sanitizeTitle(title),
                notes: sanitizeNotes(notes),
                imageUri,
              }
            : recipe
        )
      );

      if (selectedRecipe?.id === editingId) {
        setSelectedRecipe({
          ...selectedRecipe,
          title: sanitizeTitle(title),
          notes: sanitizeNotes(notes),
          imageUri,
        });
      }
    } else {
      const newRecipe: Recipe = {
        id: Date.now().toString(),
        title: sanitizeTitle(title),
        notes: sanitizeNotes(notes),
        imageUri,
        source: isOcrImported ? "ocr" : "manual",
      };

      setRecipes((prev) => [newRecipe, ...prev]);
    }

    setModalVisible(false);
    resetForm();
  }

  function handleOcrResult(result: OcrResult) {
    const parsed = parseOcrResult(result);

    setTitle(parsed.title);
    setNotes(parsed.notes);
    setImageUri(result.imageUri);
    setIsOcrImported(true);
    setIsEditing(false);
    setEditingId(null);

    setOcrVisible(false);
    setModalVisible(true);
  }

  const filteredRecipes = useMemo(() => {
    const keyword = search.trim().toLowerCase();

    if (!keyword) return recipes;

    return recipes.filter((recipe) => {
      return (
        recipe.title.toLowerCase().includes(keyword) ||
        recipe.notes.toLowerCase().includes(keyword)
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
        <Button title="Scan Recipe" onPress={() => setOcrVisible(true)} />
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
        isOcrImported={isOcrImported}
        imageUri={imageUri}
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

      <Modal visible={ocrVisible} animationType="slide">
        <View style={styles.ocrContainer}>
          <OcrScanner
            onClose={() => setOcrVisible(false)}
            onResult={handleOcrResult}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  buttonWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
  },
  ocrContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
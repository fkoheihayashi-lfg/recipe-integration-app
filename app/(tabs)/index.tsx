import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Button,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type Recipe = {
  id: string;
  title: string;
  notes: string;
};

export default function App() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [search, setSearch] = useState("");
  const [modalVisible, setModalVisible] = useState(false);
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);

  const [title, setTitle] = useState("");
  const [notes, setNotes] = useState("");

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

 const deleteRecipe = (id: string) => {
  setRecipes((prev) => prev.filter((r) => r.id !== id));
};

const addRecipe = () => {
    if (!title.trim()) return;

    const newRecipe: Recipe = {
      id: Date.now().toString(),
      title: title.trim(),
      notes: notes.trim(),
    };

    setRecipes((prev) => [newRecipe, ...prev]);
    setTitle("");
    setNotes("");
    setModalVisible(false);
  };

  const filteredRecipes = recipes.filter((r) =>
    r.title.toLowerCase().includes(search.toLowerCase())
  );

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
        <Button title="Add Recipe" onPress={() => setModalVisible(true)} />
      </View>

      <Text style={styles.sectionTitle}>Saved Recipes</Text>

<FlatList
  data={filteredRecipes}
  keyExtractor={(item) => item.id}
  style={styles.list}
  contentContainerStyle={styles.listContent}
  ListEmptyComponent={
    <Text style={styles.emptyText}>No recipes yet</Text>
  }
  renderItem={({ item }) => (
    <View style={styles.recipeItem}>
      <TouchableOpacity
        onPress={() => {
          setSelectedRecipe(item);
          setDetailVisible(true);
        }}
      >
        <Text style={styles.recipeTitle}>{item.title}</Text>
        <Text style={styles.recipeNotes}>
          {item.notes || "No notes"}
        </Text>
      </TouchableOpacity>

      <Button
        title="Delete"
        onPress={() => deleteRecipe(item.id)}
      />
    </View>
  )}
/>
      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>New Recipe</Text>

          <TextInput
            placeholder="Title"
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <TextInput
            placeholder="Notes"
            value={notes}
            onChangeText={setNotes}
            style={styles.input}
          />

          <View style={styles.modalButton}>
            <Button title="Save" onPress={addRecipe} />
          </View>

          <View style={styles.modalButton}>
            <Button title="Close" onPress={() => setModalVisible(false)} />
          </View>
        </View>
      </Modal>

      <Modal visible={detailVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Recipe Detail</Text>
          <Text style={styles.detailText}>Title: {selectedRecipe?.title}</Text>
          <Text style={styles.detailText}>Notes: {selectedRecipe?.notes}</Text>

          <View style={styles.modalButton}>
            <Button title="Close" onPress={() => setDetailVisible(false)} />
          </View>
        </View>
      </Modal>
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
  },
  modalContainer: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    marginTop: 10,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 12,
  },
});
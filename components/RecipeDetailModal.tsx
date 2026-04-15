import { Button, Modal, StyleSheet, Text, View } from "react-native";
import type { Recipe } from "./RecipeList";

type RecipeDetailModalProps = {
  visible: boolean;
  recipe: Recipe | null;
  onClose: () => void;
  onEdit: () => void;
};

export default function RecipeDetailModal({
  visible,
  recipe,
  onClose,
  onEdit,
}: RecipeDetailModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>Recipe Detail</Text>

        <Text style={styles.detailLabel}>Title</Text>
        <Text style={styles.detailText}>{recipe?.title}</Text>

        <Text style={styles.detailLabel}>Notes</Text>
        <Text style={styles.detailText}>{recipe?.notes || "No notes"}</Text>

        <View style={styles.modalButton}>
          <Button title="Close" onPress={onClose} />
        </View>

        {recipe && (
          <View style={styles.modalButton}>
            <Button title="Edit" onPress={onEdit} />
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
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
  detailLabel: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
    marginTop: 8,
  },
  detailText: {
    fontSize: 16,
    marginBottom: 12,
  },
});
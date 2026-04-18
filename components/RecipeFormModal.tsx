import { Button, Image, Modal, StyleSheet, Text, TextInput, View } from "react-native";

type RecipeFormModalProps = {
  visible: boolean;
  isEditing: boolean;
  isOcrImported?: boolean;
  imageUri?: string;
  title: string;
  notes: string;
  onChangeTitle: (text: string) => void;
  onChangeNotes: (text: string) => void;
  onSave: () => void;
  onClose: () => void;
};

export default function RecipeFormModal({
  visible,
  isEditing,
  isOcrImported,
  imageUri,
  title,
  notes,
  onChangeTitle,
  onChangeNotes,
  onSave,
  onClose,
}: RecipeFormModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.modalContainer}>
        <Text style={styles.modalTitle}>
          {isEditing ? "Edit Recipe" : "New Recipe"}
        </Text>

        {isOcrImported && (
          <Text style={styles.ocrBanner}>
            Imported from OCR — please review before saving
          </Text>
        )}

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.imagePreview} />
        )}

        <TextInput
          placeholder="Title"
          value={title}
          onChangeText={onChangeTitle}
          style={styles.input}
        />

        <TextInput
          placeholder="Notes"
          value={notes}
          onChangeText={onChangeNotes}
          style={[styles.input, styles.notesInput]}
          multiline
        />

        <View style={styles.modalButton}>
          <Button title={isEditing ? "Update" : "Save"} onPress={onSave} />
        </View>

        <View style={styles.modalButton}>
          <Button title="Close" onPress={onClose} />
        </View>
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 12,
    borderRadius: 8,
  },
  notesInput: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  modalButton: {
    marginTop: 10,
  },
  ocrBanner: {
    backgroundColor: "#FFF3CD",
    color: "#856404",
    padding: 10,
    borderRadius: 6,
    marginBottom: 12,
    fontSize: 13,
  },
  imagePreview: {
    width: "100%",
    height: 160,
    borderRadius: 8,
    marginBottom: 12,
    resizeMode: "cover",
  },
});
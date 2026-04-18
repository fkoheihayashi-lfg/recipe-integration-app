import { Button, Image, Modal, ScrollView, StyleSheet, Text, View } from "react-native";

type OcrReviewModalProps = {
  visible: boolean;
  title: string;
  notes: string;
  imageUri?: string;
  onUseThis: () => void;
  onEdit: () => void;
  onCancel: () => void;
};

export default function OcrReviewModal({
  visible,
  title,
  notes,
  imageUri,
  onUseThis,
  onEdit,
  onCancel,
}: OcrReviewModalProps) {
  return (
    <Modal visible={visible} animationType="slide">
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Review Scanned Recipe</Text>

        {imageUri && (
          <Image source={{ uri: imageUri }} style={styles.image} />
        )}

        <Text style={styles.label}>Title</Text>
        <Text style={styles.value}>{title}</Text>

        <Text style={styles.label}>Notes</Text>
        <Text style={styles.value}>{notes || "No notes"}</Text>

        <View style={styles.actions}>
          <Button title="Use This" onPress={onUseThis} />
          <Button title="Edit Before Save" onPress={onEdit} />
          <Button title="Cancel" onPress={onCancel} />
        </View>
      </ScrollView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: "#fff",
  },
  heading: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 16,
    resizeMode: "cover",
  },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginTop: 12,
    marginBottom: 4,
  },
  value: {
    fontSize: 16,
    color: "#222",
  },
  actions: {
    marginTop: 32,
    gap: 12,
  },
});

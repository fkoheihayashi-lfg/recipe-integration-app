import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

// ✅ Reads your API key safely from .env
const OCR_API_KEY = process.env.EXPO_PUBLIC_OCR_SPACE_API_KEY;

type OcrResult = {
  imageUri?: string;
  rawText?: string;
  titleSuggestion?: string;
  notesSuggestion?: string;
};

type OcrScannerProps = {
  onClose: () => void;
  onResult: (result: OcrResult) => void;
};

export default function OcrScanner({ onClose, onResult }: OcrScannerProps) {
  const handleFakeResult = () => {
    onResult({
      imageUri: undefined,
      rawText: "Test Recipe\nEggs\nMilk\nButter",
      titleSuggestion: "Test Recipe",
      notesSuggestion: "Eggs\nMilk\nButter",
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR Scanner</Text>
      <Text style={styles.subtitle}>Temporary test screen</Text>

      <TouchableOpacity style={styles.primaryButton} onPress={handleFakeResult}>
        <Text style={styles.primaryButtonText}>Fake OCR Result</Text>
      </TouchableOpacity>

      <TouchableOpacity style={styles.secondaryButton} onPress={onClose}>
        <Text style={styles.secondaryButtonText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
  },
  primaryButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  secondaryButton: {
    backgroundColor: "#F2F2F7",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#333",
    fontSize: 16,
    fontWeight: "500",
  },
});

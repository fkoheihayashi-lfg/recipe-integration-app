import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

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
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rawOcrText, setRawOcrText] = useState<string | null>(null);

  const handleCamera = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Denied", "Camera permission is required.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      base64: true,
      quality: 0.7,
      allowsEditing: true,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setRawOcrText(null);
      await runOcr(result.assets[0].base64!);
    }
  };

  const handleGallery = async () => {
    const permission =
      await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission Denied", "Gallery permission is required.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      base64: true,
      quality: 0.7,
      allowsEditing: true,
      exif: false,
    });
    if (!result.canceled && result.assets[0]) {
      setImageUri(result.assets[0].uri);
      setRawOcrText(null);
      await runOcr(result.assets[0].base64!);
    }
  };

  const runOcr = async (base64Image: string) => {
    setLoading(true);
    try {
      const base64Data = base64Image.replace(
        /^data:image\/\w+;base64,/,
        ""
      );
      const formData = new FormData();
      formData.append("apikey", OCR_API_KEY ?? "");
      formData.append("base64Image", `data:image/jpeg;base64,${base64Data}`);
      formData.append("language", "eng");
      formData.append("isOverlayRequired", "false");
      const response = await fetch("https://api.ocr.space/parse/image", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (data.IsErroredOnProcessing) {
        Alert.alert("OCR Error", data.ErrorMessage?.[0] || "Unknown error");
        return;
      }
      const rawText =
        data.ParsedResults?.[0]?.ParsedText
          ?.replace(/\r\n/g, "\n")
          .replace(/\r/g, "\n")
          .trim() || "";
      if (!rawText) {
        Alert.alert("No Text Found", "Could not detect any text.");
        return;
      }
      setRawOcrText(rawText);
      const lines = rawText.split("\n").filter((l: string) => l.trim() !== "");
      const titleSuggestion = lines[0] || "Untitled";
      const notesSuggestion = lines.slice(1).join("\n") || "";
      onResult({
        imageUri: imageUri ?? undefined,
        rawText,
        titleSuggestion,
        notesSuggestion,
      });
    } catch (error) {
      Alert.alert("Network Error", "Could not connect to OCR service.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>OCR Scanner</Text>
      <Text style={styles.subtitle}>
        Take a photo or pick from gallery to extract text
      </Text>

      {imageUri && (
        <Image
          source={{ uri: imageUri }}
          style={styles.preview}
          resizeMode="contain"
        />
      )}

      {rawOcrText && !loading && (
        <View style={styles.rawTextContainer}>
          <Text style={styles.rawTextLabel}>Extracted Text:</Text>
          <Text style={styles.rawTextContent}>{rawOcrText}</Text>
        </View>
      )}

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Scanning text...</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleCamera}
        disabled={loading}
      >
        <Text style={styles.primaryButtonText}>📸 Scan with Camera</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={handleGallery}
        disabled={loading}
      >
        <Text style={styles.secondaryButtonText}>🖼️ Pick from Gallery</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.closeButton}
        onPress={onClose}
        disabled={loading}
      >
        <Text style={styles.closeButtonText}>Close</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
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
    fontSize: 14,
    textAlign: "center",
    color: "#666",
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    backgroundColor: "#f0f0f0",
  },
  rawTextContainer: {
    backgroundColor: "#F8F9FA",
    borderRadius: 10,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  rawTextLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#888",
    marginBottom: 8,
  },
  rawTextContent: {
    fontSize: 15,
    color: "#222",
    lineHeight: 22,
  },
  loadingContainer: {
    alignItems: "center",
    gap: 8,
  },
  loadingText: {
    color: "#666",
    fontSize: 14,
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
  closeButton: {
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
  closeButtonText: {
    color: "#FF3B30",
    fontSize: 16,
    fontWeight: "500",
  },
});

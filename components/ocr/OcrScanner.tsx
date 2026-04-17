import { Button, StyleSheet, Text, View } from "react-native";

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

export default function OcrScanner({
  onClose,
  onResult,
}: OcrScannerProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR Scanner</Text>
      <Text style={styles.text}>Temporary test screen</Text>

      <View style={styles.buttonGap}>
        <Button
          title="Fake OCR Result"
          onPress={() =>
            onResult({
              imageUri: "",
              rawText: "Test Recipe\nEggs\nMilk\nButter",
              titleSuggestion: "Test Recipe",
              notesSuggestion: "Eggs\nMilk\nButter",
            })
          }
        />
      </View>

      <Button title="Close" onPress={onClose} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    marginBottom: 24,
  },
  buttonGap: {
    marginBottom: 12,
  },
});
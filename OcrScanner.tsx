import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const OcrScanner = () => {
  const handleFakeResult = () => {
    // Handle the simulated result
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>OCR Scanner</Text>
      <TouchableOpacity style={styles.primaryButton} onPress={handleFakeResult}>
        <Text style={styles.buttonText}>Scan</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.secondaryButton} onPress={handleFakeResult}>
        <Text style={styles.buttonText}>Simulate Result</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginBottom: 20,
  },
  primaryButton: {
    backgroundColor: '#007BFF',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#6c757d',
    padding: 10,
    borderRadius: 5,
  },
  buttonText: {
    color: '#FFFFFF',
    textAlign: 'center',
  },
});

export default OcrScanner;
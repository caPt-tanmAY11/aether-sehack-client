import { Platform } from 'react-native';
import { apiClient } from '../api/client';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const handleViewPdf = async (endpoint, filenamePrefix) => {
  try {
    const res = await apiClient.get(endpoint);
    const base64Str = res.data.data;

    if (Platform.OS === 'web') {
      const link = document.createElement("a");
      link.href = base64Str;
      link.download = `${filenamePrefix}.pdf`;
      link.click();
    } else {
      const base64Data = base64Str.replace('data:application/pdf;base64,', '');
      const fileUri = `${FileSystem.documentDirectory}${filenamePrefix}.pdf`;
      // Use string 'base64' directly to avoid undefined errors on some environments
      await FileSystem.writeAsStringAsync(fileUri, base64Data, { encoding: 'base64' });
      await Sharing.shareAsync(fileUri, { mimeType: 'application/pdf', dialogTitle: `View ${filenamePrefix}` });
    }
  } catch (err) {
    console.error('Error fetching PDF:', err);
    throw new Error('Failed to generate or view PDF.');
  }
};

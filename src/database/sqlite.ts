import { Platform } from 'react-native';

let SQLite: any = null;
if (Platform.OS !== 'web') {
  try {
    SQLite = require('expo-sqlite');
  } catch (err) {
    console.warn('Failed to load expo-sqlite:', err);
    SQLite = null;
  }
}

export default SQLite;

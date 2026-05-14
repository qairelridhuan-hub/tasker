import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../../context/ThemeContext';

export default function ProfileScreen() {
  const { theme } = useTheme();
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <View style={styles.center}>
        <Text style={{ fontSize: 32, marginBottom: 12 }}>👤</Text>
        <Text style={{ fontSize: 18, fontWeight: '700', color: theme.text }}>Profile</Text>
        <Text style={{ fontSize: 14, color: theme.textMuted, marginTop: 6 }}>Coming soon</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});

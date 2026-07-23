import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

export default function PlaceholderScreen() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'PlaceholderScreen'>>();
  const { title } = route.params;

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#0f172a" />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>
      <View style={styles.container}>
        <View style={styles.emptyIcon}>
          <Ionicons name="construct-outline" size={60} color="#cbd5e1" />
        </View>
        <Text style={styles.emptyText}>This screen is coming soon!</Text>
        <Text style={styles.subText}>We are working hard to bring you the best {title.toLowerCase()} experience.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', marginRight: 10 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: '#0f172a' },
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 },
  emptyIcon: { marginBottom: 20 },
  emptyText: { fontSize: 18, fontWeight: '700', color: '#0f172a', marginBottom: 10 },
  subText: { fontSize: 14, color: '#64748b', textAlign: 'center', lineHeight: 22 }
});

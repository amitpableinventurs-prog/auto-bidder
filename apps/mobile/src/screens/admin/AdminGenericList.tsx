import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";

const DARK = '#0f172a';
const LIGHT = '#f8fafc';
const BLUE = '#2563eb';

type AdminGenericListProps = {
  title: string;
  onBack: () => void;
  data: any[];
  renderItem: (item: any) => React.ReactNode;
};

export default function AdminGenericList({ title, onBack, data, renderItem }: AdminGenericListProps) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={onBack} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>{title}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {data.length === 0 ? (
            <View style={styles.empty}>
                <Ionicons name="documents-outline" size={60} color="#cbd5e1" />
                <Text style={styles.emptyText}>No data available for {title}</Text>
            </View>
        ) : (
            data.map((item, i) => <View key={i}>{renderItem(item)}</View>)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: LIGHT },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, backgroundColor: '#fff' },
  backBtn: { marginRight: 15 },
  headerTitle: { fontSize: 18, fontWeight: '700', color: DARK },
  content: { padding: 20 },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: 100 },
  emptyText: { color: '#94a3b8', marginTop: 15, fontSize: 14 }
});

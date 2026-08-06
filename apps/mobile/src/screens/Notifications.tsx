import { FONTS } from '../theme';
import React, { useEffect, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from "@expo/vector-icons";
import { StatusBar } from 'expo-status-bar';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { getNotifications } from '../api';
import { useAuth } from '../AuthContext';
import { logger } from '../utils/logger';

const COLORS = {
  bg: "#FFFFFF",
  surface: "#F8FAFC",
  surface2: "#F1F5F9",
  border: "#E2E8F0",
  accent: "#FFC107",
  blue: "#2563EB",
  text: "#1E293B",
  textMuted: "#64748B",
  textDim: "#94A3B8",
  red: "#EF4444",
  green: "#10B981",
};

export default function Notifications({ navigation }: any) {
  const { user } = useAuth();
  const userId = user?.id;
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) {
        setLoading(false);
        return;
    }
    getNotifications(userId)
      .then(res => setNotifs(res.notifications))
      .catch(err => logger.warn(err.message))
      .finally(() => setLoading(false));
  }, [userId]);

  const getIcon = (type: string) => {
    switch (type) {
        case 'BID_ACCEPTED': return { name: 'checkmark-circle', color: COLORS.green };
        case 'OUTBID': return { name: 'trending-up', color: COLORS.accent };
        case 'PAYMENT_CONFIRMED': return { name: 'card', color: COLORS.blue };
        default: return { name: 'notifications', color: COLORS.textDim };
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Notifications</Text>
        <Pressable style={styles.clearBtn}>
            <Text style={styles.clearText}>Clear All</Text>
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
        {loading ? (
            <View style={styles.loadingWrap}>
                <ActivityIndicator color={COLORS.accent} size="large" />
                <Text style={styles.loadingText}>Fetching updates...</Text>
            </View>
        ) : notifs.map(n => {
          const icon = getIcon(n.type);
          return (
            <View key={n.id} style={[styles.notifCard, !n.read && styles.unread]}>
              <View style={[styles.iconBox, { backgroundColor: icon.color + '15' }]}>
                <Ionicons name={icon.name as any} size={22} color={icon.color} />
              </View>
              <View style={styles.info}>
                <Text style={styles.title}>{n.title}</Text>
                <Text style={styles.message}>{n.message}</Text>
                <Text style={styles.time}>{new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', month: 'short', day: 'numeric' })}</Text>
              </View>
              {!n.read && <View style={styles.dot} />}
            </View>
          );
        })}

        {!loading && notifs.length === 0 && (
            <View style={styles.empty}>
                <View style={styles.emptyIconBox}>
                    <Ionicons name="notifications-off-outline" size={60} color={COLORS.surface2} />
                </View>
                <Text style={styles.emptyText}>All caught up!</Text>
                <Text style={styles.subText}>You'll see updates about your bids, payments and listings here.</Text>
                <Pressable style={styles.browseBtn} onPress={() => navigation.goBack()}>
                    <Text style={styles.browseText}>RETURN TO PROFILE</Text>
                </Pressable>
            </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingTop: 20, justifyContent: 'space-between' },
  headerBtn: { width: 44, height: 44, borderRadius: 12, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text, fontFamily: FONTS.poppins.extraBold },
  clearBtn: { padding: 8 },
  clearText: { color: COLORS.accent, fontSize: 12, fontWeight: '700', fontFamily: FONTS.poppins.bold },

  content: { padding: 20 },
  notifCard: { flexDirection: 'row', backgroundColor: COLORS.surface, padding: 16, borderRadius: 20, marginBottom: 12, alignItems: 'flex-start', borderWidth: 1, borderColor: COLORS.border },
  unread: { borderColor: COLORS.blue + '40', backgroundColor: COLORS.blue + '05' },
  iconBox: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  info: { flex: 1, marginLeft: 16 },
  title: { fontSize: 14, fontWeight: '700', color: COLORS.text, fontFamily: FONTS.poppins.bold },
  message: { fontSize: 12, color: COLORS.textDim, marginTop: 4, lineHeight: 18, fontFamily: FONTS.poppins.regular },
  time: { fontSize: 12, color: COLORS.textDim, marginTop: 8, fontFamily: FONTS.poppins.medium },
  dot: { width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.blue, marginTop: 4 },

  loadingWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  loadingText: { color: COLORS.textDim, marginTop: 12, fontSize: 14, fontFamily: FONTS.poppins.medium },

  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 80, paddingHorizontal: 40 },
  emptyIconBox: { width: 120, height: 120, borderRadius: 60, backgroundColor: COLORS.surface, alignItems: 'center', justifyContent: 'center', marginBottom: 24, borderWidth: 1, borderColor: COLORS.border },
  emptyText: { fontSize: 20, color: COLORS.text, fontWeight: '800', fontFamily: FONTS.poppins.extraBold },
  subText: { fontSize: 14, color: COLORS.textDim, textAlign: 'center', marginTop: 8, lineHeight: 20, fontFamily: FONTS.poppins.regular },
  browseBtn: { marginTop: 32, backgroundColor: COLORS.surface2, paddingHorizontal: 24, paddingVertical: 14, borderRadius: 5, borderWidth: 1, borderColor: COLORS.border },
  browseText: { color: COLORS.text, fontWeight: '800', fontSize: 14, fontFamily: FONTS.poppins.extraBold }
});

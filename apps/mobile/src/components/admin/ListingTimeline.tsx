import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const DARK = '#0f172a';
const MUTED = '#64748b';
const BLUE = '#2563eb';

export type Activity = {
  id: string;
  action: string;
  previousStatus?: string;
  newStatus?: string;
  rejectionReason?: string;
  details?: any;
  timestamp: string;
  user?: {
    name: string;
    role: string;
  };
};

const ACTION_MAP: Record<string, { label: string; icon: string; color: string }> = {
  VEHICLE_CREATED: { label: 'Vehicle Created', icon: 'car-outline', color: '#10b981' },
  STATUS_CHANGE: { label: 'Status Updated', icon: 'sync-outline', color: BLUE },
  PHOTOS_UPLOADED: { label: 'Photos Uploaded', icon: 'image-outline', color: '#8b5cf6' },
  DOCUMENTS_UPLOADED: { label: 'Documents Uploaded', icon: 'document-text-outline', color: '#f59e0b' },
  ADMIN_REJECTED: { label: 'Admin Rejected', icon: 'close-circle-outline', color: '#ef4444' },
  BID_RECEIVED: { label: 'Bid Received', icon: 'hammer-outline', color: '#ec4899' },
  AUCTION_STARTED: { label: 'Auction Started', icon: 'play-outline', color: '#10b981' },
  AUCTION_ENDED: { label: 'Auction Ended', icon: 'stop-outline', color: DARK },
};

export default function ListingTimeline({ activities }: { activities: Activity[] }) {
  if (!activities || activities.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>No activities recorded yet.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {activities.map((item, index) => {
        const config = ACTION_MAP[item.action] || { label: item.action, icon: 'ellipse-outline', color: MUTED };
        const isLast = index === activities.length - 1;

        return (
          <View key={item.id} style={styles.item}>
            <View style={styles.leftCol}>
              <View style={[styles.node, { backgroundColor: config.color }]}>
                <Ionicons name={config.icon as any} size={14} color="#fff" />
              </View>
              {!isLast && <View style={styles.line} />}
            </View>

            <View style={styles.content}>
              <View style={styles.header}>
                <Text style={styles.actionLabel}>{config.label}</Text>
                <Text style={styles.time}>
                  {new Date(item.timestamp).toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </Text>
              </View>

              {item.user && (
                <Text style={styles.user}>
                  by <Text style={{ fontWeight: '700' }}>{item.user.name}</Text> ({item.user.role})
                </Text>
              )}

              {item.newStatus && (
                <View style={styles.statusBox}>
                  {item.previousStatus && (
                    <>
                      <Text style={styles.statusText}>{item.previousStatus}</Text>
                      <Ionicons name="arrow-forward" size={12} color={MUTED} style={{ marginHorizontal: 5 }} />
                    </>
                  )}
                  <Text style={[styles.statusText, { color: BLUE, fontWeight: '700' }]}>{item.newStatus}</Text>
                </View>
              )}

              {item.rejectionReason && (
                <View style={styles.reasonBox}>
                  <Text style={styles.reasonTitle}>Rejection Reason:</Text>
                  <Text style={styles.reasonText}>{item.rejectionReason}</Text>
                </View>
              )}

              {item.details?.amount && (
                <Text style={styles.details}>Amount: ₹{item.details.amount.toLocaleString('en-IN')}</Text>
              )}
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: 10 },
  empty: { padding: 40, alignItems: 'center' },
  emptyText: { color: MUTED, fontSize: 14 },
  item: { flexDirection: 'row', minHeight: 80 },
  leftCol: { alignItems: 'center', width: 40 },
  node: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: '#e2e8f0',
    marginVertical: -5,
  },
  content: { flex: 1, paddingLeft: 10, paddingBottom: 25 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  actionLabel: { fontSize: 15, fontWeight: '700', color: DARK },
  time: { fontSize: 11, color: MUTED },
  user: { fontSize: 12, color: MUTED, marginTop: 2 },
  statusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    alignSelf: 'flex-start',
  },
  statusText: { fontSize: 10, color: DARK, textTransform: 'uppercase' },
  reasonBox: {
    marginTop: 8,
    padding: 10,
    backgroundColor: '#fef2f2',
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#ef4444',
  },
  reasonTitle: { fontSize: 11, fontWeight: '700', color: '#991b1b' },
  reasonText: { fontSize: 12, color: '#b91c1c', marginTop: 2 },
  details: { fontSize: 13, fontWeight: '600', color: DARK, marginTop: 5 },
});

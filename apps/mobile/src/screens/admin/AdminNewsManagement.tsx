import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
  Image,
  Modal,
  Switch,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { COLORS, TYPOGRAPHY, FONTS, TAB_BAR_HEIGHT } from '../../theme';
import { useAuth } from '../../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../navigation/types';
import { getAdminNews, createNews, updateNews, deleteNews, type ApiNews } from '../../api';

export default function AdminNewsManagementScreen() {
  const { token } = useAuth();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [loading, setLoading] = useState(false);
  const [newsList, setNewsList] = useState<ApiNews[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<Partial<ApiNews> | null>(null);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const res = await getAdminNews();
      if (res?.news) {
        setNewsList(res.news);
      }
    } catch (error) {
      console.error('Fetch News Error:', error);
      Alert.alert('Error', 'Failed to fetch news items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handleSave = async () => {
    if (!selectedItem?.title) {
      Alert.alert('Error', 'Title is required');
      return;
    }

    setLoading(true);
    try {
      if (selectedItem.id) {
        await updateNews(selectedItem.id, selectedItem);
        Alert.alert('Success', 'News item updated successfully');
      } else {
        await createNews(selectedItem);
        Alert.alert('Success', 'News item created successfully');
      }
      setShowEditModal(false);
      fetchNews();
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to save news item');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert(
      'Delete News',
      'Are you sure you want to delete this news item?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await deleteNews(id);
              fetchNews();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete item');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const renderNewsItem = (item: ApiNews) => (
    <View key={item.id} style={styles.itemCard}>
      <Image
        source={{ uri: item.imageUrl || "https://images.unsplash.com/photo-1504711434230-a0703c7265f7?auto=format&fit=crop&w=400&q=80" }}
        style={styles.itemImage}
      />
      <View style={styles.itemInfo}>
        <Text style={styles.itemTitle} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.itemDesc} numberOfLines={2}>{item.description}</Text>
        <View style={styles.itemFooter}>
            <View style={[styles.statusBadge, { backgroundColor: item.isActive ? COLORS.success + '15' : COLORS.coral + '15' }]}>
                <Text style={[styles.statusText, { color: item.isActive ? COLORS.success : COLORS.coral }]}>
                    {item.isActive ? 'ACTIVE' : 'INACTIVE'}
                </Text>
            </View>
            <View style={styles.actionButtons}>
                <Pressable
                    style={styles.actionBtn}
                    onPress={() => {
                        setSelectedItem(item);
                        setShowEditModal(true);
                    }}
                >
                    <Ionicons name="create-outline" size={20} color={COLORS.secondary} />
                </Pressable>
                <Pressable
                    style={[styles.actionBtn, { marginLeft: 10 }]}
                    onPress={() => handleDelete(item.id)}
                >
                    <Ionicons name="trash-outline" size={20} color={COLORS.coral} />
                </Pressable>
            </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />

      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
        </Pressable>
        <Text style={styles.headerTitle}>News Management</Text>
        <Pressable
            style={styles.addBtn}
            onPress={() => {
                setSelectedItem({ title: '', description: '', imageUrl: '', isActive: true });
                setShowEditModal(true);
            }}
        >
          <Ionicons name="add" size={24} color={COLORS.white} />
        </Pressable>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {newsList.length > 0 ? (
          newsList.map(renderNewsItem)
        ) : (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons name="newspaper-variant-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.emptyText}>No news items found</Text>
          </View>
        )}
      </ScrollView>

      {/* Edit Modal */}
      <Modal
        visible={showEditModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowEditModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{selectedItem?.id ? 'Edit News' : 'Add News'}</Text>
              <Pressable onPress={() => setShowEditModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.black2} />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Title</Text>
              <TextInput
                style={styles.input}
                value={selectedItem?.title}
                onChangeText={(text) => setSelectedItem(prev => ({ ...prev!, title: text }))}
                placeholder="News title"
              />

              <Text style={styles.inputLabel}>Description (Short snippet)</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={selectedItem?.description || ''}
                onChangeText={(text) => setSelectedItem(prev => ({ ...prev!, description: text }))}
                placeholder="Brief description..."
                multiline
              />

              <Text style={styles.inputLabel}>Image URL</Text>
              <TextInput
                style={styles.input}
                value={selectedItem?.imageUrl || ''}
                onChangeText={(text) => setSelectedItem(prev => ({ ...prev!, imageUrl: text }))}
                placeholder="https://..."
              />

              <Text style={styles.inputLabel}>Link (Optional redirect)</Text>
              <TextInput
                style={styles.input}
                value={selectedItem?.link || ''}
                onChangeText={(text) => setSelectedItem(prev => ({ ...prev!, link: text }))}
                placeholder="https://..."
              />

              <View style={styles.switchRow}>
                <Text style={styles.inputLabel}>Active</Text>
                <Switch
                  value={selectedItem?.isActive}
                  onValueChange={(val) => setSelectedItem(prev => ({ ...prev!, isActive: val }))}
                  trackColor={{ false: COLORS.lightGrey1, true: COLORS.secondary }}
                />
              </View>

              <Pressable style={styles.saveBtn} onPress={handleSave}>
                <Text style={styles.saveBtnText}>Save News Item</Text>
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={COLORS.secondary} />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey2,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.lightGrey2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: TAB_BAR_HEIGHT + 20,
  },
  itemCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  itemImage: {
    width: 100,
    height: '100%',
    backgroundColor: COLORS.lightGrey2,
  },
  itemInfo: {
    flex: 1,
    padding: 12,
  },
  itemTitle: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 4,
  },
  itemDesc: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    fontSize: 12,
    marginBottom: 8,
  },
  itemFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: FONTS.poppins.bold,
  },
  actionButtons: {
    flexDirection: 'row',
  },
  actionBtn: {
    padding: 6,
    backgroundColor: COLORS.lightGrey2,
    borderRadius: 8,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    ...TYPOGRAPHY.bodySmall,
    color: COLORS.textMuted,
    marginTop: 12,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  modalTitle: {
    ...TYPOGRAPHY.h6,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  inputLabel: {
    ...TYPOGRAPHY.bodySmall,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
    marginBottom: 8,
    marginTop: 12,
  },
  input: {
    backgroundColor: COLORS.lightGrey2,
    borderRadius: 12,
    padding: 12,
    ...TYPOGRAPHY.bodyMedium,
    color: COLORS.black2,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 15,
    marginBottom: 10,
  },
  saveBtn: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 30,
  },
  saveBtnText: {
    ...TYPOGRAPHY.bodyMedium,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.white,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
});
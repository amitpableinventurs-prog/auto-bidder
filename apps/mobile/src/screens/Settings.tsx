import { FONTS } from '../theme';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  Switch,
  Alert,
  Linking,
  Modal,
  FlatList,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from '../AuthContext';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { useSettingsStore } from '../store/useSettingsStore';
import * as api from '../api';
import ScreenWrapper from '../components/ScreenWrapper';

export default function Settings() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, logout } = useAuth();
  const insets = useSafeAreaInsets();
  const [seeding, setSeeding] = React.useState(false);

  const {
    notifications, setNotifications,
    marketing, setMarketing,
    biometrics, setBiometrics,
    language, setLanguage,
    theme, setTheme
  } = useSettingsStore();

  const [langModalVisible, setLangModalVisible] = React.useState(false);
  const [themeModalVisible, setThemeModalVisible] = React.useState(false);

  const handleDeleteAccount = () => {
    Alert.alert(
      "Delete Account",
      "Are you sure you want to delete your account? This action is permanent and cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: () => {
            Alert.alert("Request Submitted", "Your account deletion request has been submitted and will be processed within 30 days.");
            logout();
          }
        }
      ]
    );
  };

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const res = await api.seedRichData();
      Alert.alert("Success", res.message || "Demo data seeded successfully. Please restart the app or refresh lists to see changes.");
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to seed data");
    } finally {
      setSeeding(false);
    }
  };

  const SelectionModal = ({ visible, onClose, title, options, currentSelection, onSelect }: any) => {
    const modalInsets = useSafeAreaInsets();
    return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, {
            paddingBottom: Math.max(modalInsets.bottom, 24),
            paddingLeft: Math.max(modalInsets.left, 24),
            paddingRight: Math.max(modalInsets.right, 24)
          }]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{title}</Text>
              <Pressable onPress={onClose}>
                <Ionicons name="close" size={24} color="#1E293B" />
              </Pressable>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <Pressable
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={[styles.optionText, currentSelection === item && styles.optionTextActive]}>{item}</Text>
                  {currentSelection === item && <Ionicons name="checkmark-circle" size={20} color="#FFC107" />}
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    );
  };

  const SettingItem = ({ icon, iconLib = 'Ionicons', title, value, onValueChange, isSwitch = false, type = 'default', onPress, subtitle }: any) => {
    const IconComponent = iconLib === 'Ionicons' ? Ionicons : MaterialCommunityIcons;

    return (
      <Pressable
        style={styles.item}
        onPress={onPress}
        disabled={isSwitch}
      >
        <View style={[styles.iconBox, { backgroundColor: type === 'danger' ? 'rgba(239,68,68,0.1)' : 'rgba(255, 193, 7, 0.1)' }]}>
          <IconComponent name={icon} size={20} color={type === 'danger' ? '#ef4444' : '#FFC107'} />
        </View>
        <View style={styles.textContainer}>
          <Text style={[styles.itemTitle, type === 'danger' && { color: '#ef4444' }]}>{title}</Text>
          {subtitle && <Text style={styles.itemSubtitle}>{subtitle}</Text>}
        </View>
        {isSwitch ? (
          <Switch
            value={value}
            onValueChange={onValueChange}
            trackColor={{ false: '#E2E8F0', true: '#FFC107' }}
            thumbColor={value ? "#FFFFFF" : "#94A3B8"}
          />
        ) : (
          <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
        )}
      </Pressable>
    );
  };

  const SectionHeader = ({ title }: { title: string }) => (
    <Text style={styles.sectionLabel}>{title}</Text>
  );

  return (
    <ScreenWrapper style={styles.safe}>
      <View style={[styles.header, {
        paddingLeft: Math.max(insets.left, 20),
        paddingRight: Math.max(insets.right, 20)
      }]}>
        <Pressable onPress={() => navigation.goBack()} style={styles.headerBtn}>
          <Ionicons name="chevron-back" size={24} color="#1E293B" />
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 44 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>

        <SectionHeader title="PROFILE SETTINGS" />
        <View style={styles.section}>
          <SettingItem
            icon="person-outline"
            title="Personal Information"
            subtitle="Update your name, email, and location"
            onPress={() => navigation.navigate('EditProfile')}
          />
          <SettingItem
            icon="shield-check-outline"
            iconLib="MaterialCommunityIcons"
            title="KYC Verification"
            subtitle={user?.isVerified ? "Verified User" : "Action Required: Verify Identity"}
            onPress={() => navigation.navigate('Kyc' as any)}
          />
        </View>

        <SectionHeader title="NOTIFICATIONS" />
        <View style={styles.section}>
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            isSwitch
            value={notifications}
            onValueChange={setNotifications}
          />
          <SettingItem
            icon="mail-outline"
            title="Email Marketing"
            isSwitch
            value={marketing}
            onValueChange={setMarketing}
          />
        </View>

        <SectionHeader title="SECURITY & PRIVACY" />
        <View style={styles.section}>
          <SettingItem
            icon="finger-print-outline"
            title="Biometric Authentication"
            subtitle="Use FaceID or Fingerprint to login"
            isSwitch
            value={biometrics}
            onValueChange={setBiometrics}
          />
          <SettingItem
            icon="lock-closed-outline"
            title="Change Security PIN"
            onPress={() => Alert.alert("Security", "PIN management is currently handled via OTP verification during login.")}
          />
          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            type="danger"
            onPress={handleDeleteAccount}
          />
        </View>

        <SectionHeader title="APP PREFERENCES" />
        <View style={styles.section}>
          <SettingItem
            icon="language-outline"
            title="App Language"
            subtitle={language}
            onPress={() => setLangModalVisible(true)}
          />
          <SettingItem
            icon="color-palette-outline"
            title="Theme"
            subtitle={theme.charAt(0).toUpperCase() + theme.slice(1)}
            onPress={() => setThemeModalVisible(true)}
          />
        </View>

        <SectionHeader title="SUPPORT & ABOUT" />
        <View style={styles.section}>
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            onPress={() => Linking.openURL('https://api.autobidder.in/help')}
          />
          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            onPress={() => navigation.navigate('TermsOfService')}
          />
          <SettingItem
            icon="shield-outline"
            title="Privacy Policy"
            onPress={() => navigation.navigate('PrivacyPolicy')}
          />
        </View>

        <SectionHeader title="DEVELOPER TOOLS" />
        <View style={styles.section}>
          <SettingItem
            icon="database-sync"
            iconLib="MaterialCommunityIcons"
            title="Seed Demo Data"
            subtitle={seeding ? "Seeding..." : "Populate app with real-looking data"}
            onPress={handleSeedData}
            disabled={seeding}
          />
          <SettingItem
            icon="logout"
            iconLib="MaterialCommunityIcons"
            title="Logout"
            type="danger"
            onPress={logout}
          />
        </View>

        <View style={styles.footer}>
          <View style={styles.appInfoBox}>
            <Text style={styles.version}>Version 1.2.0 (Stable)</Text>
            <Text style={styles.copyright}>© 2024 Auto Bidder Technologies Pvt Ltd.</Text>
          </View>
        </View>
      </ScrollView>

      <SelectionModal
        visible={langModalVisible}
        onClose={() => setLangModalVisible(false)}
        title="Select Language"
        options={['English', 'Hindi', 'Marathi']}
        currentSelection={language}
        onSelect={setLanguage}
      />

      <SelectionModal
        visible={themeModalVisible}
        onClose={() => setThemeModalVisible(false)}
        title="Select Theme"
        options={['light', 'dark', 'system']}
        currentSelection={theme}
        onSelect={setTheme}
      />
    </ScreenWrapper>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#FFFFFF' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    justifyContent: 'space-between'
  },
  headerBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: FONTS.poppins.extraBold
  },
  content: { padding: 20 },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#94A3B8',
    letterSpacing: 1.2,
    marginBottom: 12,
    marginTop: 10,
    fontFamily: FONTS.poppins.extraBold,
    paddingLeft: 4
  },
  section: {
    backgroundColor: '#F8FAFC',
    borderRadius: 24,
    padding: 6,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0'
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 16,
  },
  iconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16
  },
  textContainer: {
    flex: 1,
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    fontFamily: FONTS.poppins.semiBold
  },
  itemSubtitle: {
    fontSize: 12,
    color: '#64748B',
    fontFamily: FONTS.poppins.regular,
    marginTop: 1,
  },
  footer: { alignItems: 'center', marginTop: 4, marginBottom: 20 },
  appInfoBox: {
    alignItems: 'center',
    marginTop: 20,
  },
  version: { fontSize: 14, color: '#94A3B8', fontFamily: FONTS.poppins.semiBold },
  copyright: { fontSize: 12, color: '#94A3B8', marginTop: 4, fontFamily: FONTS.poppins.regular },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    padding: 24,
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E293B',
    fontFamily: FONTS.poppins.extraBold,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  optionText: {
    fontSize: 16,
    color: '#1E293B',
    fontFamily: FONTS.poppins.medium,
  },
  optionTextActive: {
    color: '#FFC107',
    fontWeight: '700',
    fontFamily: FONTS.poppins.bold,
  },
});

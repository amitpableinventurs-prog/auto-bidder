import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { submitKyc, uploadFile } from '../api';
import { useAuth } from '../AuthContext';
import { COLORS, TYPOGRAPHY, FONTS } from '../theme';

const { width: SCREEN_W } = Dimensions.get('window');

type VerifCategory = 'IDENTITY' | 'BUSINESS' | 'VEHICLE';

interface DocType {
  id: string;
  name: string;
  icon: string;
  category: VerifCategory;
  description: string;
}

const DOCUMENT_TYPES: DocType[] = [
  // Identity
  { id: 'aadhaar', name: 'Aadhaar Card', icon: 'card-bulleted', category: 'IDENTITY', description: '12-digit unique identity' },
  { id: 'pan', name: 'PAN Card', icon: 'card-account-details', category: 'IDENTITY', description: 'Permanent Account Number' },
  { id: 'dl', name: 'Driving License', icon: 'id-card', category: 'IDENTITY', description: 'Valid Indian DL' },
  // Business
  { id: 'gst', name: 'GST Certificate', icon: 'file-certificate', category: 'BUSINESS', description: 'Goods & Service Tax Reg' },
  { id: 'shop_act', name: 'Shop Act License', icon: 'store', category: 'BUSINESS', description: 'Establishment license' },
  { id: 'trade_license', name: 'Trade License', icon: 'certificate', category: 'BUSINESS', description: 'Municipal trade permit' },
  // Vehicle
  { id: 'rc', name: 'RC (Reg. Certificate)', icon: 'car-info', category: 'VEHICLE', description: 'Vehicle registration proof' },
  { id: 'insurance', name: 'Insurance Policy', icon: 'shield-check', category: 'VEHICLE', description: 'Valid motor insurance' },
];

export default function KYCVerification() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { user, setUser } = useAuth();
  const userId = user?.id || '';

  const [currentStep, setCurrentStep] = useState<'DASHBOARD' | 'CATEGORY' | 'DOC_SELECT' | 'UPLOAD' | 'SUCCESS'>('DASHBOARD');
  const [selectedCategory, setSelectedCategory] = useState<VerifCategory | null>(null);
  const [selectedDoc, setSelectedDoc] = useState<DocType | null>(null);
  const [docUri, setDocUri] = useState<string | null>(null);
  const [docName, setDocName] = useState<string | null>(null);
  const [docMimeType, setDocMimeType] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Mocked verification status for the UI
  const verifStatus = {
    identity: user?.isVerified ? 'VERIFIED' : 'PENDING',
    business: user?.userType === 'DEALER' ? 'VERIFIED' : 'NOT_STARTED',
    vehicle: 'NOT_STARTED',
  };

  const handleCategorySelect = (cat: VerifCategory) => {
    setSelectedCategory(cat);
    setCurrentStep('DOC_SELECT');
  };

  const handleDocSelect = (doc: DocType) => {
    setSelectedDoc(doc);
    setCurrentStep('UPLOAD');
  };

  const pickImage = async (useCamera: boolean) => {
    let result;
    if (useCamera) {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera access is required.');
        return;
      }
      result = await ImagePicker.launchCameraAsync({ allowsEditing: true, quality: 0.7 });
    } else {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Gallery access is required.');
        return;
      }
      result = await ImagePicker.launchImageLibraryAsync({ allowsEditing: true, quality: 0.7 });
    }

    if (!result.canceled && result.assets[0].uri) {
      setDocUri(result.assets[0].uri);
      setDocName(result.assets[0].fileName || null);
      setDocMimeType(result.assets[0].mimeType || 'image/jpeg');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets[0].uri) {
        setDocUri(result.assets[0].uri);
        setDocName(result.assets[0].name || null);
        setDocMimeType(result.assets[0].mimeType || null);
      }
    } catch (err) {
      console.warn('Document picking failed', err);
    }
  };

  const handleSubmit = async () => {
    if (!docUri || !selectedDoc) {
      Alert.alert('Missing Info', 'Please provide the document image.');
      return;
    }
    setLoading(true);
    try {
      const { url } = await uploadFile(docUri, docMimeType || undefined, docName || undefined);
      await submitKyc(userId, selectedDoc.id, url);

      // Simulate verification for demo purposes
      if (user) {
        setUser({ ...user, isVerified: true });
      }

      setCurrentStep('SUCCESS');
    } catch (err: any) {
      console.warn('KYC Error:', err);
      Alert.alert('Error', err.message || 'Failed to submit verification.');
    } finally {
      setLoading(false);
    }
  };

  const onBack = () => {
    if (currentStep === 'CATEGORY') setCurrentStep('DASHBOARD');
    else if (currentStep === 'DOC_SELECT') setCurrentStep('CATEGORY');
    else if (currentStep === 'UPLOAD') {
      setDocUri(null);
      setCurrentStep('DOC_SELECT');
    }
    else navigation.goBack();
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <Pressable onPress={onBack} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color={COLORS.black2} />
      </Pressable>
      {currentStep !== 'DASHBOARD' && (
        <View style={styles.progressContainer}>
            <View style={[styles.progressDot, { backgroundColor: COLORS.secondary }]} />
            <View style={[styles.progressLine, { backgroundColor: (currentStep as string) !== 'CATEGORY' && (currentStep as string) !== 'DASHBOARD' ? COLORS.secondary : COLORS.lightGrey1 }]} />
            <View style={[styles.progressDot, { backgroundColor: (currentStep as string) !== 'CATEGORY' && (currentStep as string) !== 'DASHBOARD' ? COLORS.secondary : COLORS.lightGrey1 }]} />
            <View style={[styles.progressLine, { backgroundColor: currentStep === 'UPLOAD' || currentStep === 'SUCCESS' ? COLORS.secondary : COLORS.lightGrey1 }]} />
            <View style={[styles.progressDot, { backgroundColor: currentStep === 'UPLOAD' || currentStep === 'SUCCESS' ? COLORS.secondary : COLORS.lightGrey1 }]} />
        </View>
      )}
    </View>
  );

  const renderDashboard = () => (
    <View style={styles.content}>
      <View style={styles.badgeBanner}>
        <View style={styles.badgeCircle}>
            <MaterialCommunityIcons name="shield-check" size={40} color={user?.isVerified ? COLORS.success : COLORS.grey} />
        </View>
        <Text style={styles.badgeTitle}>{user?.isVerified ? 'Verified Account' : 'Verification Pending'}</Text>
        <Text style={styles.badgeSub}>
            {user?.isVerified
                ? 'Your account is fully verified. Enjoy higher limits!'
                : 'Complete the steps below to verify your identity & business.'}
        </Text>
      </View>

      <Text style={styles.sectionTitle}>Verification Checklist</Text>

      <View style={styles.checklist}>
        <ChecklistItem
            title="Identity Proof"
            status={verifStatus.identity}
            icon="person-outline"
            onPress={() => handleCategorySelect('IDENTITY')}
        />
        <ChecklistItem
            title="Business Verification"
            status={verifStatus.business}
            icon="briefcase-outline"
            onPress={() => handleCategorySelect('BUSINESS')}
        />
        <ChecklistItem
            title="Vehicle Documentation"
            status={verifStatus.vehicle}
            icon="car-outline"
            onPress={() => handleCategorySelect('VEHICLE')}
        />
      </View>

      <View style={styles.trustFooter}>
        <Ionicons name="lock-closed" size={16} color={COLORS.textMuted} />
        <Text style={styles.trustFooterText}>All documents are secured with 256-bit encryption.</Text>
      </View>

      <Pressable style={styles.startBtn} onPress={() => setCurrentStep('CATEGORY')}>
        <Text style={styles.startBtnText}>ADD NEW DOCUMENT</Text>
      </Pressable>
    </View>
  );

  const renderCategorySelect = () => (
    <View style={styles.content}>
      <Text style={styles.title}>What would you like to verify?</Text>
      <Text style={styles.subtitle}>Choose a category to start your verification process.</Text>

      <View style={styles.categoryGrid}>
        <CategoryCard
          title="Identity"
          desc="Verify your personal identity documents."
          icon="account-check"
          color={COLORS.secondary}
          onPress={() => handleCategorySelect('IDENTITY')}
        />
        <CategoryCard
          title="Business"
          desc="Verify your dealer or business license."
          icon="office-building"
          color="#8b5cf6"
          onPress={() => handleCategorySelect('BUSINESS')}
        />
        <CategoryCard
          title="Vehicle"
          desc="Verify RC, Insurance or Ownership."
          icon="car-cog"
          color={COLORS.coral}
          onPress={() => handleCategorySelect('VEHICLE')}
        />
      </View>

      <View style={styles.infoBox}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.textMuted} />
        <Text style={styles.infoText}>Verification helps in building trust and unlocking higher selling limits.</Text>
      </View>
    </View>
  );

  const renderDocSelect = () => {
    const filteredDocs = DOCUMENT_TYPES.filter(d => d.category === selectedCategory);
    return (
      <View style={styles.content}>
        <Text style={styles.title}>{(selectedCategory || '').charAt(0) + (selectedCategory || '').slice(1).toLowerCase()} Documents</Text>
        <Text style={styles.subtitle}>Select the document you want to upload.</Text>

        <View style={styles.docList}>
          {filteredDocs.map((doc) => (
            <Pressable key={doc.id} style={styles.docItem} onPress={() => handleDocSelect(doc)}>
              <View style={[styles.docIcon, { backgroundColor: COLORS.lightBlue1 }]}>
                <MaterialCommunityIcons name={doc.icon as any} size={24} color={COLORS.secondary} />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={styles.docName}>{doc.name}</Text>
                <Text style={styles.docDesc}>{doc.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
            </Pressable>
          ))}
        </View>
      </View>
    );
  };

  const renderUpload = () => (
    <View style={styles.content}>
      <Text style={styles.title}>Upload {selectedDoc?.name}</Text>
      <Text style={styles.subtitle}>Please ensure all details are clearly visible in the photo.</Text>

      <View style={styles.uploadBox}>
        {docUri ? (
          docUri.toLowerCase().endsWith('.pdf') ? (
            <View style={styles.uploadPrompt}>
                <MaterialCommunityIcons name="file-pdf-box" size={80} color={COLORS.coral} />
                <Text style={styles.uploadPromptText}>{docUri.split('/').pop()}</Text>
            </View>
          ) : (
            <Image source={{ uri: docUri }} style={styles.previewImg} />
          )
        ) : (
          <View style={styles.uploadPrompt}>
            <MaterialCommunityIcons name="file-upload-outline" size={60} color={COLORS.lightGrey1} />
            <Text style={styles.uploadPromptText}>Snap a clear photo of the document</Text>
          </View>
        )}
      </View>

      <View style={styles.uploadActions}>
        <Pressable style={styles.uploadBtn} onPress={() => pickImage(true)}>
          <Ionicons name="camera" size={20} color={COLORS.white} />
          <Text style={styles.uploadBtnText}>Camera</Text>
        </Pressable>
        <Pressable style={[styles.uploadBtn, { backgroundColor: COLORS.lightGrey2 }]} onPress={() => pickImage(false)}>
          <Ionicons name="image" size={20} color={COLORS.black2} />
          <Text style={[styles.uploadBtnText, { color: COLORS.black2 }]}>Gallery</Text>
        </Pressable>
        <Pressable style={[styles.uploadBtn, { backgroundColor: COLORS.lightBlue1 }]} onPress={pickDocument}>
          <Ionicons name="document" size={20} color={COLORS.secondary} />
          <Text style={[styles.uploadBtnText, { color: COLORS.secondary }]}>PDF/Doc</Text>
        </Pressable>
      </View>

      {docUri && (
        <Pressable
          style={[styles.primaryBtn, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? <ActivityIndicator color={COLORS.white} /> : <Text style={styles.primaryBtnText}>Submit Verification</Text>}
        </Pressable>
      )}

      <View style={styles.secureBox}>
        <Ionicons name="shield-checkmark" size={16} color={COLORS.success} />
        <Text style={styles.secureText}>Your documents are encrypted and stored securely.</Text>
      </View>
    </View>
  );

  const renderSuccess = () => (
    <View style={styles.successContent}>
      <View style={styles.successIconWrap}>
        <Ionicons name="checkmark-circle" size={100} color={COLORS.success} />
      </View>
      <Text style={styles.successTitle}>Verification Submitted!</Text>
      <Text style={styles.successSubtitle}>
        Our team will review your documents and verify your account within 24-48 hours.
      </Text>

      <Pressable style={styles.primaryBtn} onPress={() => navigation.reset({ index: 0, routes: [{ name: 'MainDrawer' as any }] })}>
        <Text style={styles.primaryBtnText}>Back to Home</Text>
      </Pressable>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="dark" />
      {currentStep !== 'SUCCESS' && renderHeader()}
      <ScrollView contentContainerStyle={styles.scroll}>
        {currentStep === 'DASHBOARD' && renderDashboard()}
        {currentStep === 'CATEGORY' && renderCategorySelect()}
        {currentStep === 'DOC_SELECT' && renderDocSelect()}
        {currentStep === 'UPLOAD' && renderUpload()}
        {currentStep === 'SUCCESS' && renderSuccess()}
      </ScrollView>
    </SafeAreaView>
  );
}

function ChecklistItem({ title, status, icon, onPress }: any) {
  const isVerified = status === 'VERIFIED';
  const isPending = status === 'PENDING';

  return (
    <Pressable style={styles.checkItem} onPress={onPress}>
        <View style={[styles.checkIconWrap, { backgroundColor: isVerified ? COLORS.success + '15' : COLORS.lightGrey2 }]}>
            <Ionicons name={icon} size={24} color={isVerified ? COLORS.success : COLORS.textMuted} />
        </View>
        <View style={{ flex: 1, marginLeft: 15 }}>
            <Text style={styles.checkTitle}>{title}</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Ionicons
                    name={isVerified ? "checkmark-circle" : isPending ? "time" : "alert-circle"}
                    size={12}
                    color={isVerified ? COLORS.success : isPending ? COLORS.accent : COLORS.grey}
                />
                <Text style={[styles.checkStatus, { color: isVerified ? COLORS.success : isPending ? COLORS.accent : COLORS.grey }]}>
                    {isVerified ? 'Verified' : isPending ? 'Under Review' : 'Action Required'}
                </Text>
            </View>
        </View>
        <Ionicons name="chevron-forward" size={18} color={COLORS.grey} />
    </Pressable>
  );
}

function CategoryCard({ title, desc, icon, color, onPress }: any) {
  return (
    <Pressable style={styles.catCard} onPress={onPress}>
      <View style={[styles.catIconWrap, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={32} color={color} />
      </View>
      <View style={{ flex: 1, marginLeft: 16 }}>
        <Text style={styles.catTitle}>{title}</Text>
        <Text style={styles.catDesc}>{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color={COLORS.grey} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.white },
  scroll: { flexGrow: 1, paddingBottom: 40 },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 30,
  },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  progressContainer: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingRight: 40 },
  progressDot: { width: 10, height: 10, borderRadius: 5 },
  progressLine: { flex: 1, height: 2, marginHorizontal: 4 },

  badgeBanner: {
    backgroundColor: COLORS.lightBlue1,
    padding: 30,
    borderRadius: 24,
    alignItems: 'center',
    marginBottom: 30,
  },
  badgeCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  badgeTitle: { ...TYPOGRAPHY.h6, color: COLORS.black2, fontSize: 18 },
  badgeSub: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center', marginTop: 8, lineHeight: 20 },

  sectionTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2, marginBottom: 15 },
  checklist: { gap: 12, marginBottom: 30 },
  checkItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  checkIconWrap: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  checkTitle: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  checkStatus: { fontSize: 12, fontFamily: FONTS.poppins.medium },

  trustFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, marginBottom: 20 },
  trustFooterText: { fontSize: 12, color: COLORS.textMuted, fontFamily: FONTS.poppins.medium },

  startBtn: {
    height: 50,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderStyle: 'dashed',
  },
  startBtnText: { color: COLORS.secondary, fontFamily: FONTS.poppins.bold, fontSize: 14 },

  content: { paddingHorizontal: 20, paddingTop: 10 },
  title: { ...TYPOGRAPHY.h5, color: COLORS.black2, fontSize: 24 },
  subtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, marginTop: 8, lineHeight: 22 },

  categoryGrid: { marginTop: 30, gap: 16 },
  catCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  catIconWrap: { width: 60, height: 60, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  catTitle: { ...TYPOGRAPHY.bodyMedium, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  catDesc: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted, marginTop: 4 },

  infoBox: {
    marginTop: 40,
    flexDirection: 'row',
    backgroundColor: COLORS.lightGrey2,
    padding: 16,
    borderRadius: 12,
    gap: 12,
    alignItems: 'center',
  },
  infoText: { flex: 1, ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted },

  docList: { marginTop: 25, gap: 12 },
  docItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.lightGrey2,
  },
  docIcon: { width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  docName: { ...TYPOGRAPHY.bodySmall, fontFamily: FONTS.poppins.bold, color: COLORS.black2 },
  docDesc: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.textMuted },

  uploadBox: {
    height: 250,
    backgroundColor: COLORS.lightGrey2,
    borderRadius: 24,
    marginTop: 30,
    borderWidth: 2,
    borderColor: COLORS.lightGrey1,
    borderStyle: 'dashed',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
  },
  previewImg: { width: '100%', height: '100%', resizeMode: 'cover' },
  uploadPrompt: { alignItems: 'center', gap: 15 },
  uploadPromptText: { ...TYPOGRAPHY.bodySmall, color: COLORS.grey, fontFamily: FONTS.poppins.medium },

  uploadActions: { flexDirection: 'row', gap: 15, marginTop: 20 },
  uploadBtn: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  uploadBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 16 },

  primaryBtn: {
    height: 50,
    backgroundColor: COLORS.secondary,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
  },
  primaryBtnText: { color: COLORS.white, fontFamily: FONTS.poppins.bold, fontSize: 16 },

  secureBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 25 },
  secureText: { ...TYPOGRAPHY.bodySmall, fontSize: 12, color: COLORS.success, fontFamily: FONTS.poppins.medium },

  successContent: { flex: 1, padding: 30, alignItems: 'center', justifyContent: 'center', paddingTop: 60 },
  successIconWrap: { marginBottom: 30 },
  successTitle: { ...TYPOGRAPHY.h4, color: COLORS.black2, textAlign: 'center' },
  successSubtitle: { ...TYPOGRAPHY.bodySmall, color: COLORS.textMuted, textAlign: 'center', marginTop: 15, lineHeight: 24 },
});

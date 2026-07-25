import React, { useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
  FlatList,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { uploadFile } from '../api';
import { ALL_RTO_CODES } from '../utils/rto-codes';
import CalendarModal from '../components/CalendarModal';

const TEXT_DARK = '#0b1020';
const MUTED = '#6b7280';
const BLUE_BTN = '#2873c3';
const BG_YELLOW = '#fffbeb';

const CNG_LPG_STATUS_OPTIONS = ['Not Applicable', 'Company Varient/Fitted', 'Removed', 'After Market Fitted'];
const VEHICLE_CONDITION_OPTIONS = ['Normal', 'Flood Affected', 'Fire Affected', 'Scrap', 'Post Flooding'];
const RC_AVAILABILITY_OPTIONS = ['Original OK', 'Original Damaged', 'Not Available', 'Finance RC'];
const OWNERSHIP_TYPE_OPTIONS = [
  'Individual & Family Use',
  'Firm & Commercial Use',
  'Taxi Use',
  'Self Drive Use',
  'Company Allotted Car',
];
const RTO_TAX_STATUS_OPTIONS = ['Onetime Tax Paid (OTT/LTT)', 'Dues', 'Quarterly', 'Yearly'];
const RTO_NOC_OPTIONS = ['No', 'Yes, Inter State', 'Yes, Within State'];
const LOAN_STATUS_OPTIONS = [
  'NOC Available',
  'Bank Amount Due',
  'Loan Cleared Awaiting NOC',
  'Unable to Provide NOC',
  'Bank Seized',
  'Bank Kit Available',
  'Will Clear The Loan with Sell Process',
];

function Label({ text }: { text: string }) {
  return <Text style={styles.label}>{text}</Text>;
}

function CustomSelectModal({ visible, title, data, selectedValue, onSelect, onClose }: { visible: boolean, title: string, data: string[], selectedValue: string, onSelect: (val: string) => void, onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{title}</Text>
            <Pressable onPress={onClose}><Ionicons name="close" size={24} color={TEXT_DARK} /></Pressable>
          </View>
          <FlatList
            data={data}
            keyExtractor={item => item}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.modalItem, selectedValue === item && styles.modalItemActive]}
                onPress={() => { onSelect(item); onClose(); }}
              >
                <Text style={[styles.modalItemText, selectedValue === item && styles.modalItemTextActive]}>{item}</Text>
                {selectedValue === item && <Ionicons name="checkmark-circle" size={20} color={BLUE_BTN} />}
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
}

function SelectInput({ placeholder, value, onPress, icon = "chevron-down" }: { placeholder: string; value?: string; onPress?: () => void; icon?: any }) {
  return (
    <Pressable style={styles.inputBox} onPress={onPress}>
      <Text style={[value ? styles.inputText : styles.inputTextMuted]}>
        {value || placeholder}
      </Text>
      <Ionicons name={icon} size={18} color={MUTED} />
    </Pressable>
  );
}

function TextInputBox({
  placeholder,
  multiline = false,
  value,
  onChangeText,
  keyboardType = 'default',
}: {
  placeholder: string;
  multiline?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
}) {
  return (
    <View style={[styles.inputBox, multiline && styles.inputBoxMulti]}>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={MUTED}
        style={[styles.textInput, multiline && styles.textInputMulti]}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function GridToggle({ options, value, onSelect, columns = 2 }: { options: string[]; value?: any; onSelect?: (val: any) => void, columns?: number }) {
  return (
    <View style={styles.toggleGrid}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          style={[
            styles.toggleItem,
            { width: `${100 / columns - 1.5}%` },
            value === opt && styles.toggleItemActive
          ]}
          onPress={() => onSelect?.(opt)}
        >
          <Text style={[styles.toggleText, value === opt && styles.toggleTextActive]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function UploadBox({ label = "Capture Image", icon = "camera", onPress, loading = false }: { label?: string; icon?: any; onPress?: () => void, loading?: boolean }) {
  return (
    <Pressable style={styles.uploadBox} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={BLUE_BTN} />
      ) : (
        <>
          <View style={styles.uploadIconCircle}>
            <Ionicons name={icon} size={20} color="#fff" />
          </View>
          <Text style={styles.uploadLabel}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function MoreInformation() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FillDetails'>>();
  const { listingData } = route.params as any;

  const [ownershipType, setOwnershipType] = useState('Individual');
  const [rcOwnerName, setRcOwnerName] = useState(listingData?.rcOwnerName || '');
  const [rcOwnerNumber, setRcOwnerNumber] = useState(listingData?.rcOwnerNumber || '');
  const [rcAvailability, setRcAvailability] = useState(listingData?.rcAvailability || 'Original');
  const [originalInvoice, setOriginalInvoice] = useState(listingData?.originalInvoice ?? true);
  const [bankHypo, setBankHypo] = useState(listingData?.bankHypothecation ?? false);
  const [loanStatus, setLoanStatus] = useState(listingData?.loanStatus || '');
  const [rtoTaxStatus, setRtoTaxStatus] = useState(listingData?.rtoTaxStatus || '');
  const [rtoIssues, setRtoIssues] = useState('');
  const [rtoNoc, setRtoNoc] = useState(listingData?.rtoNocIssued || 'No');
  const [rtoNocFor, setRtoNocFor] = useState('');
  const [rtoNocNumber, setRtoNocNumber] = useState(listingData?.rtoNocNumber || '');
  const [duplicateKeys, setDuplicateKeys] = useState(listingData?.duplicateKeys ?? false);
  const [cngLpgStatus, setCngLpgStatus] = useState('N/A');
  const [serviceBook, setServiceBook] = useState(listingData?.serviceBookAvailability ?? true);
  const [freeService, setFreeService] = useState(listingData?.remainingFreeService?.toString() || 'None');
  const [oemWarranty, setOemWarranty] = useState(listingData?.remainingOemWarranty || 'None');
  const [vehicleCondition, setVehicleCondition] = useState(listingData?.condition || '');
  const [accidentalHistory, setAccidentalHistory] = useState(listingData?.description || '');

  const [rcImages, setRcImages] = useState<string[]>([]);
  const [invoiceImages, setInvoiceImages] = useState<string[]>([]);
  const [bankNocImages, setBankNocImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [modalType, setModalType] = useState<string | null>(null);

  const launchCamera = async (type: 'rc' | 'invoice' | 'bankNoc') => {
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Camera permission is required.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(type);
        const { url } = await uploadFile(result.assets[0].uri, result.assets[0].mimeType || 'image/jpeg', result.assets[0].fileName || undefined);
        if (type === 'rc') setRcImages([...rcImages, url]);
        else if (type === 'invoice') setInvoiceImages([...invoiceImages, url]);
        else if (type === 'bankNoc') setBankNocImages([...bankNocImages, url]);
      }
    } catch (error) {
      Alert.alert('Error', 'Could not open camera or upload failed.');
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (url: string, type: 'rc' | 'invoice' | 'bankNoc') => {
    if (type === 'rc') setRcImages(rcImages.filter(img => img !== url));
    else if (type === 'invoice') setInvoiceImages(invoiceImages.filter(img => img !== url));
    else if (type === 'bankNoc') setBankNocImages(bankNocImages.filter(img => img !== url));
  };

  const handleFinish = (skip = false) => {
    if (!skip) {
        if (!rcOwnerName || !rcOwnerNumber || !rcAvailability || !rtoTaxStatus) {
            Alert.alert('Required Details', "Please provide RC owner's name, number, availability and RTO status.");
            return;
        }
    }

    const payload = skip ? listingData : {
      ...listingData,
      rcOwnerName,
      rcOwnerNumber,
      rcAvailability,
      originalInvoice,
      bankHypothecation: bankHypo,
      loanStatus: bankHypo ? loanStatus : undefined,
      rtoTaxStatus,
      rtoNocIssued: rtoNoc,
      rtoNocFor: rtoNoc === 'Yes, Inter State' ? rtoNocFor : undefined,
      rtoNocNumber: (rtoNoc === 'Yes, Inter State' || rtoNoc === 'Yes, Within State') ? rtoNocNumber : undefined,
      duplicateKeys,
      serviceBookAvailability: serviceBook,
      remainingFreeService: freeService === 'None' ? 0 : parseInt(freeService),
      remainingOemWarranty: oemWarranty,
      condition: vehicleCondition,
      description: accidentalHistory,
    };

    navigation.navigate('CameraGuidance', { listingData: payload });
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>More Information</Text>
        <Pressable onPress={() => handleFinish(true)}>
            <Text style={styles.skipText}>SKIP</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Label text="Ownership Type" />
        <SelectInput placeholder="Select" value={ownershipType} onPress={() => setModalType('ownershipType')} />

        <Label text="RC Owner's Name" />
        <TextInputBox placeholder="Enter Name" value={rcOwnerName} onChangeText={setRcOwnerName} />

        <Label text="RC Owner's Number" />
        <TextInputBox placeholder="Enter Number" value={rcOwnerNumber} onChangeText={setRcOwnerNumber} keyboardType="phone-pad" />

        <Label text="RC Availability" />
        <SelectInput placeholder="Select" value={rcAvailability} onPress={() => setModalType('rcAvail')} />

        <Label text="RC Photos" />
        <UploadBox
            label="Click RC Photo"
            icon="camera"
            onPress={() => launchCamera('rc')}
            loading={uploading === 'rc'}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
          {rcImages.map((img, idx) => (
            <View key={idx} style={styles.previewWrap}>
              <Image source={{ uri: img }} style={styles.previewImg} />
              <Pressable style={styles.previewCross} onPress={() => removeImage(img, 'rc')}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <Label text="Original Invoice" />
        <GridToggle options={['Yes, Available', 'No']} value={originalInvoice ? 'Yes, Available' : 'No'} onSelect={(v) => setOriginalInvoice(v === 'Yes, Available')} />

        <Label text="Invoice Photos" />
        <UploadBox
            label="Click Invoice Photo"
            icon="camera"
            onPress={() => launchCamera('invoice')}
            loading={uploading === 'invoice'}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
          {invoiceImages.map((img, idx) => (
            <View key={idx} style={styles.previewWrap}>
              <Image source={{ uri: img }} style={styles.previewImg} />
              <Pressable style={styles.previewCross} onPress={() => removeImage(img, 'invoice')}>
                <Ionicons name="close-circle" size={20} color="#ef4444" />
              </Pressable>
            </View>
          ))}
        </ScrollView>

        <Label text="Bank Hypothecation" />
        <GridToggle options={['Yes', 'No']} value={bankHypo ? 'Yes' : 'No'} onSelect={(v) => { setBankHypo(v === 'Yes'); if (v === 'No') setLoanStatus(''); }} />

        {bankHypo && (
            <>
                <Label text="Loan Status" />
                <SelectInput placeholder="Select" value={loanStatus} onPress={() => setModalType('loanStatus')} />

                <Label text="Bank NOC Photos" />
                <UploadBox
                    label="Click Bank NOC Photo"
                    icon="camera"
                    onPress={() => launchCamera('bankNoc')}
                    loading={uploading === 'bankNoc'}
                />
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
                  {bankNocImages.map((img, idx) => (
                    <View key={idx} style={styles.previewWrap}>
                      <Image source={{ uri: img }} style={styles.previewImg} />
                      <Pressable style={styles.previewCross} onPress={() => removeImage(img, 'bankNoc')}>
                        <Ionicons name="close-circle" size={20} color="#ef4444" />
                      </Pressable>
                    </View>
                  ))}
                </ScrollView>
            </>
        )}

        <Label text="RTO Tax Status" />
        <SelectInput placeholder="Select" value={rtoTaxStatus} onPress={() => setModalType('rtoTax')} />

        <Label text="Please Mention if any RTO Dues or Issues" />
        <TextInputBox placeholder="Type Here" value={rtoIssues} onChangeText={setRtoIssues} />

        <Label text="RTO NOC Issued" />
        <SelectInput placeholder="Select" value={rtoNoc} onPress={() => setModalType('rtoNoc')} />

        {rtoNoc === 'Yes, Inter State' && (
          <>
            <Label text="NOC for which RTO" />
            <TextInputBox placeholder="Type Here" value={rtoNocFor} onChangeText={setRtoNocFor} />
          </>
        )}

        {(rtoNoc === 'Yes, Inter State' || rtoNoc === 'Yes, Within State') && (
             <>
                <Label text="Select Issuing RTO Office" />
                <SelectInput placeholder="Select" value={rtoNocNumber} onPress={() => setModalType('rtoNocNumber')} />
             </>
        )}

        <Label text="Duplicate keys" />
        <GridToggle options={['Yes', 'No']} value={duplicateKeys ? 'Yes' : 'No'} onSelect={(v) => setDuplicateKeys(v === 'Yes')} />

        <Label text="CNG/LPG Status" />
        <SelectInput placeholder="Select" value={cngLpgStatus} onPress={() => setModalType('cngLpg')} />

        <Label text="Service Book Availability" />
        <GridToggle options={['Yes', 'No']} value={serviceBook ? 'Yes' : 'No'} onSelect={(v) => setServiceBook(v === 'Yes')} />

        <Label text="Remaining Free Service" />
        <GridToggle options={['None', '1', '2', '3']} columns={2} value={freeService} onSelect={setFreeService} />

        <Label text="Remaining OEM Warranty" />
        <SelectInput placeholder="Select" value={oemWarranty} onPress={() => setModalType('oemWarranty')} />

        <Label text="Vehicle Condition" />
        <SelectInput placeholder="Select" value={vehicleCondition} onPress={() => setModalType('condition')} />

        <Label text="Please mention if any accidental history or any other major issues" />
        <TextInputBox placeholder="Type Here" multiline value={accidentalHistory} onChangeText={setAccidentalHistory} />

        <Pressable style={styles.submitBtn} onPress={() => handleFinish(false)}>
          <Text style={styles.submitBtnText}>SUBMIT</Text>
          <MaterialCommunityIcons name="send" size={22} color="#fff" style={{ marginLeft: 8 }} />
        </Pressable>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}
      <CustomSelectModal
          visible={modalType === 'ownershipType'}
          title="Ownership Type"
          data={OWNERSHIP_TYPE_OPTIONS}
          selectedValue={ownershipType}
          onSelect={setOwnershipType}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'rcAvail'}
          title="RC Availability"
          data={RC_AVAILABILITY_OPTIONS}
          selectedValue={rcAvailability}
          onSelect={setRcAvailability}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'loanStatus'}
          title="Loan Status"
          data={LOAN_STATUS_OPTIONS}
          selectedValue={loanStatus}
          onSelect={setLoanStatus}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'rtoTax'}
          title="RTO Tax Status"
          data={RTO_TAX_STATUS_OPTIONS}
          selectedValue={rtoTaxStatus}
          onSelect={setRtoTaxStatus}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'rtoNoc'}
          title="RTO NOC Issued"
          data={RTO_NOC_OPTIONS}
          selectedValue={rtoNoc}
          onSelect={(v) => { setRtoNoc(v); if (v === 'No') setRtoNocNumber(''); }}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'rtoNocNumber'}
          title="Select RTO Office"
          data={ALL_RTO_CODES}
          selectedValue={rtoNocNumber}
          onSelect={setRtoNocNumber}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'cngLpg'}
          title="CNG/LPG Status"
          data={CNG_LPG_STATUS_OPTIONS}
          selectedValue={cngLpgStatus}
          onSelect={setCngLpgStatus}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'condition'}
          title="Vehicle Condition"
          data={VEHICLE_CONDITION_OPTIONS}
          selectedValue={vehicleCondition}
          onSelect={setVehicleCondition}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'oemWarranty'}
          title="Remaining OEM Warranty"
          data={[
            'None',
            '1 Year', '2 Years', '3 Years', '4 Years', '5 Years',
            '6 Years', '7 Years', '8 Years', '9 Years', '10 Years',
            '11 Years', '12 Years', '13 Years', '14 Years', '15 Years',
          ]}
          selectedValue={oemWarranty}
          onSelect={setOemWarranty}
          onClose={() => setModalType(null)}
      />
      <CustomSelectModal
          visible={modalType === 'ownershipType'}
          title="Ownership Type"
          data={OWNERSHIP_TYPE_OPTIONS}
          selectedValue={ownershipType}
          onSelect={setOwnershipType}
          onClose={() => setModalType(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  headerTitle: { fontSize: 17, fontWeight: '700', color: TEXT_DARK },
  skipText: { fontSize: 14, fontWeight: '700', color: BLUE_BTN },

  content: { paddingHorizontal: 15, paddingTop: 10 },
  label: { fontSize: 13, fontWeight: '600', color: TEXT_DARK, marginTop: 12, marginBottom: 6 },

  inputBox: { height: 44, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  inputBoxMulti: { height: 80, alignItems: 'flex-start', paddingTop: 10 },
  inputText: { fontSize: 14, color: TEXT_DARK },
  inputTextMuted: { fontSize: 14, color: MUTED },
  textInput: { flex: 1, fontSize: 14, color: TEXT_DARK },
  textInputMulti: { textAlignVertical: 'top' },

  toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'space-between' },
  toggleItem: { height: 42, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  toggleItemActive: { borderColor: BLUE_BTN, backgroundColor: '#eff6ff' },
  toggleText: { fontSize: 14, color: MUTED, fontWeight: '500' },
  toggleTextActive: { color: BLUE_BTN, fontWeight: '700' },

  uploadBox: { height: 85, backgroundColor: '#fffbeb', borderWidth: 1, borderColor: '#fde68a', borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  uploadIconCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#2873c3', alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  uploadLabel: { fontSize: 11, fontWeight: '700', color: TEXT_DARK },

  previewRow: { flexDirection: 'row', gap: 10, marginTop: 12 },
  previewWrap: { width: 90, height: 70, borderRadius: 8, overflow: 'hidden', position: 'relative' },
  previewImg: { width: '100%', height: '100%' },
  previewCross: { position: 'absolute', top: 2, right: 2 },

  submitBtn: { height: 52, backgroundColor: BLUE_BTN, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 30, flexDirection: 'row' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '900', letterSpacing: 0.5 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },
  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemActive: { backgroundColor: '#f8fafc' },
  modalItemText: { fontSize: 15, color: TEXT_DARK },
  modalItemTextActive: { color: BLUE_BTN, fontWeight: '700' },
});

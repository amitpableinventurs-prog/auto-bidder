import { StatusBar } from 'expo-status-bar';
import React, { useState, useEffect } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  ActivityIndicator,
  Alert,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsive, getResponsiveCardWidth } from '../utils/responsive';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute, RouteProp, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';
import { type CreateListingPayload, uploadFile, getBrands } from '../api';
import { ALL_BRANDS } from '../utils/brands';
import { ALL_RTO_CODES } from '../utils/rto-codes';
import CalendarModal from '../components/CalendarModal';
import BottomSelectModal from '../components/BottomSelectModal';
import { COLORS } from '../theme';

const TEXT_DARK = '#0b1020';
const MUTED = '#6b7280';
const BLUE_BTN = COLORS.secondary;
const BG_YELLOW = '#fffbeb';
const BORDER_YELLOW = '#fde68a';

const MODELS_BY_BRAND: Record<string, string[]> = {
  maruti: ['Alto', 'Baleno', 'Dzire', 'Ertiga', 'Swift', 'Wagon-R', 'Brezza', 'Grand Vitara'],
  hyundai: ['i10', 'i20', 'Creta', 'Verna', 'Venue', 'Alcazar', 'Tucson'],
  tata: ['Tiago', 'Altroz', 'Nexon', 'Harrier', 'Safari', 'Punch'],
  mahindra: ['Thar', 'Scorpio', 'XUV700', 'XUV300', 'Bolero'],
  kia: ['Seltos', 'Sonet', 'Carens', 'Carnival'],
  honda: ['City', 'Amaze', 'Civic', 'Jazz'],
  toyota: ['Fortuner', 'Innova', 'Glanza', 'Urban Cruiser', 'Camry'],
  volkswagen: ['Polo', 'Vento', 'Taigun', 'Virtus', 'Tiguan'],
  renault: ['Kwid', 'Triber', 'Kiger', 'Duster'],
  ford: ['EcoSport', 'Endeavour', 'Figo', 'Aspire'],
  skoda: ['Kushaq', 'Slavia', 'Octavia', 'Superb', 'Kodiaq'],
  nissan: ['Magnite', 'Kicks', 'Sunny', 'Terrano'],
  mg: ['Hector', 'Astor', 'ZS EV', 'Gloster'],
  jeep: ['Compass', 'Meridian', 'Wrangler'],
  citroen: ['C3', 'C3 Aircross', 'C5 Aircross'],
  fiat: ['Punto', 'Linea', 'Avventura'],
  isuzu: ['D-Max', 'MU-X'],
  mitsubishi: ['Pajero', 'Lancer', 'Outlander'],
  force: ['Gurkha', 'Trax'],
  datsun: ['Go', 'Go+', 'Redi-Go'],
  bmw: ['3 Series', '5 Series', 'X1', 'X3', 'X5'],
  mercedes: ['C-Class', 'E-Class', 'GLA', 'GLC', 'GLE'],
  audi: ['A4', 'A6', 'Q3', 'Q5', 'Q7'],
  jaguar: ['XE', 'XF', 'F-Pace'],
  volvo: ['XC40', 'XC60', 'XC90', 'S60'],
  landrover: ['Defender', 'Discovery', 'Range Rover Evoque', 'Range Rover Sport'],
  lexus: ['ES', 'RX', 'NX', 'LX'],
  porsche: ['911', 'Cayenne', 'Panamera', 'Macan'],
  lamborghini: ['Urus', 'Huracan', 'Aventador'],
  ferrari: ['Roma', '296 GTB', 'SF90'],
  maserati: ['Ghibli', 'Levante', 'Quattroporte'],
  bentley: ['Continental GT', 'Bentayga', 'Flying Spur'],
  rollsroyce: ['Phantom', 'Ghost', 'Cullinan'],
  mini: ['Cooper', 'Countryman', 'Clubman'],
};

const VARIANTS_BY_MODEL: Record<string, string[]> = {
  'Alto': ['LXi', 'VXi', 'VXi+', 'STD', 'LXi (O)'],
  'Baleno': ['Sigma', 'Delta', 'Zeta', 'Alpha'],
  'Swift': ['LXi', 'VXi', 'ZXi', 'ZXi+'],
  'Dzire': ['LXi', 'VXi', 'ZXi', 'ZXi+'],
  'Creta': ['E', 'EX', 'S', 'S+', 'SX', 'SX (O)'],
  'i20': ['Magna', 'Sportz', 'Asta', 'Asta (O)'],
  'Nexon': ['XE', 'XM', 'XT', 'XZ', 'XZ+'],
  'Punch': ['Pure', 'Adventure', 'Accomplished', 'Creative'],
  'Thar': ['AX (O)', 'LX'],
  'Scorpio': ['S3', 'S5', 'S7', 'S11'],
  'City': ['V', 'VX', 'ZX'],
  'Fortuner': ['Standard', 'GR Sport', 'Legender'],
  'Polo': ['Trendline', 'Comfortline', 'Highline Plus', 'GT'],
};

const PRIMARY_BRANDS = ['maruti', 'hyundai', 'tata', 'mahindra', 'kia', 'honda', 'toyota', 'volkswagen', 'renault', 'ford', 'skoda', 'nissan', 'mg', 'jeep', 'bmw', 'mercedes', 'audi', 'jaguar', 'volvo'];

const YEARS = Array.from({ length: 37 }, (_, i) => (2026 - i).toString());

const VARIANT_OPTIONS = [
  'Alto 800 2016-2019 Std Optional',
  'Alto 800 2016-2019 LX',
  'Alto 800 2016-2019 STD',
  'Alto 800 2016-2019 LX Optional',
  'Alto 800 2016-2019 Tour H',
  'LXi MS Dhoni Edition',
  'Alto 800 2016-2019 LXi Optional',
  'Alto 800 2016-2019 Utsav Edition',
  'Alto 800 2016-2019 VXi Optional',
  'Alto 800 2016-2019 LXi',
  'Alto 800 2016-2019 VXi',
  'Alto 800 2016-2019 CNG LXi',
  'Alto 800 2016-2019 CNG LXi Optional',
  'Not In The List Add Your Variant',
];

const FUEL_TYPES = ['Petrol', 'Diesel', 'Petrol + CNG', 'Petrol + LPG', 'Diesel + CNG', 'Electric', 'Electric Hybrid'];
const LISTED_BY_OPTIONS = [
  'RC In my Name',
  'RC Within Family',
  'Selling for a Friend',
  'Company\'s Car',
  'Bought But RC not in my name',
  'Showroom Staff',
  'Brokership',
  'AB Network Partner',
];
const CNG_LPG_STATUS_OPTIONS = ['Not Applicable', 'Company Varient/Fitted', 'Removed', 'After Market Fitted'];
const VEHICLE_CONDITION_OPTIONS = [
  'Normal',
  'Flood Affected',
  'Fire Affected',
  'Scrap',
  'Not Running',
  'Towing Required',
  'Jump Start Required',
];
const RC_AVAILABILITY_OPTIONS = ['Original Ok', 'Original Damaged', 'Not Available', 'Finance Kit'];
const OWNERSHIP_TYPE_OPTIONS = [
  'Individual & Family Use',
  'Firm & Commercial Use',
  'Taxi Use',
  'Self Drive Use',
  'Company Allotted Car',
  'Subscribe / Lease From Company',
  'Government Organization',
  'Imported Vehicle',
];
const RTO_TAX_STATUS_OPTIONS = ['OTT/LTT', 'Dues', 'Quarterly', 'Yearly'];
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

const CARD_BG = '#ffffff';
const BORDER_COLOR = '#e2e8f0';
const ACCENT_BG = '#f8fafc';
const SUCCESS = '#22c55e';
const ERROR = '#ef4444';

async function pickDocumentAsset() {
  const DocumentPicker = require('expo-document-picker');
  const result = await DocumentPicker.getDocumentAsync({ type: ['application/pdf', 'image/*'] });

  if (result.canceled || !result.assets?.[0]?.uri) {
    return null;
  }

  return result.assets[0];
}
const YELLOW_BG = '#fff9e6';
const YELLOW_BORDER = '#fbbf24';
const HORIZONTAL_PADDING = 20;
const GRID_GAP = 12;

/* Helper UI Components */

function Label({ text, dark = false }: { text: string, dark?: boolean }) {
  return <Text style={[styles.label, dark && { color: '#cbd5e1' }]}>{text}</Text>;
}

// BottomSelectModal imported from components

function SelectInput({ placeholder, value, onPress, icon = "chevron-down", dark = false, error = false }: { placeholder: string; value?: string; onPress?: () => void; icon?: any; dark?: boolean; error?: boolean }) {
  return (
    <Pressable style={[styles.inputBox, dark && styles.inputBoxDark, error && styles.inputBoxError]} onPress={onPress}>
      <Text style={[value ? styles.inputText : styles.inputTextMuted, dark && value && { color: '#fff' }]}>
        {value || placeholder}
      </Text>
      <Ionicons name={icon} size={18} color={error ? '#ef4444' : (dark ? '#94a3b8' : MUTED)} />
    </Pressable>
  );
}

function TextInputBox({
  placeholder,
  multiline = false,
  value,
  onChangeText,
  keyboardType = 'default',
  dark = false,
  error = false,
  inputRef,
}: {
  placeholder: string;
  multiline?: boolean;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'phone-pad';
  dark?: boolean;
  error?: boolean;
  inputRef?: React.RefObject<TextInput | null>;
}) {
  return (
    <View style={[styles.inputBox, multiline && styles.inputBoxMulti, dark && styles.inputBoxDark, error && styles.inputBoxError]}>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={dark ? '#64748b' : MUTED}
        style={[styles.textInput, multiline && styles.textInputMulti, dark && { color: '#fff' }]}
        multiline={multiline}
        keyboardType={keyboardType}
      />
    </View>
  );
}

function GridToggle({ options, value, onSelect, columns = 2, dark = false }: { options: string[]; value?: any; onSelect?: (val: any) => void, columns?: number, dark?: boolean }) {
  return (
    <View style={styles.toggleGrid}>
      {options.map((opt) => (
        <Pressable
          key={opt}
          style={[
            styles.toggleItem,
            { width: `${100 / columns - 1.5}%` },
            dark && styles.toggleItemDark,
            value === opt && styles.toggleItemActive
          ]}
          onPress={() => onSelect?.(opt)}
        >
          <Text style={[styles.toggleText, dark && { color: '#94a3b8' }, value === opt && styles.toggleTextActive]}>{opt}</Text>
        </Pressable>
      ))}
    </View>
  );
}

function UploadBox({ label = "Upload Image", icon = "car", dark = false, onPress, loading = false, error = false }: { label?: string; icon?: any; dark?: boolean, onPress?: () => void, loading?: boolean, error?: boolean }) {
  return (
    <Pressable style={[styles.uploadBox, dark && styles.uploadBoxDark, error && styles.uploadBoxError]} onPress={onPress} disabled={loading}>
      {loading ? (
        <ActivityIndicator color={BLUE_BTN} />
      ) : (
        <>
          <View style={[styles.uploadIconCircle, error && { backgroundColor: '#ef4444' }]}>
            <MaterialCommunityIcons name="car-cog" size={24} color="#fff" />
          </View>
          <Text style={[styles.uploadLabel, dark && { color: '#cbd5e1' }, error && { color: '#ef4444' }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

export default function FillCarDetails() {
  const { width, isTablet, isDesktop } = useResponsive();
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'FillDetails' | 'ListingDocuments'>>();
  const { listingToEdit, initialTab = 'basic', listingData, brand: passedBrand, carType } = (route.params as any) || {};
  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [errors, setErrors] = useState<Record<string, boolean>>({});
  const scrollRef = React.useRef<ScrollView>(null);
  const manualBrandRef = React.useRef<TextInput>(null);
  const manualModelRef = React.useRef<TextInput>(null);
  const manualVariantRef = React.useRef<TextInput>(null);
  const [showAllBrands, setShowAllBrands] = useState(false);

  const initialData = listingToEdit || listingData || {};

  // Basic Details State
  const [selectedBrand, setSelectedBrand] = useState(() => {
    const b = passedBrand || initialData?.brand?.toLowerCase();
    if (!b) return 'maruti';
    if (ALL_BRANDS.some(brand => brand.id === b)) return b;
    return 'other';
  });
  const [manualBrand, setManualBrand] = useState(() => {
    const b = initialData?.brand;
    if (!b || ALL_BRANDS.some(brand => brand.id === b.toLowerCase())) return '';
    return b;
  });
  const [brands, setBrands] = useState<any[]>(ALL_BRANDS);
  const [brandSearch, setBrandSearch] = useState('');
  const [carImages, setCarImages] = useState<string[]>([]);
  const [regNumber, setRegNumber] = useState(initialData?.plateNumber || initialData?.regNumber || '');

  useFocusEffect(
    React.useCallback(() => {
      fetchBrands();
    }, [])
  );

  const fetchBrands = async () => {
    try {
      const res = await getBrands();
      if (res?.brands) {
        setBrands(res.brands);
      }
    } catch (err) {
      console.warn("Failed to fetch brands in fill details", err);
    }
  };

  const getModels = (brandId: string) => {
    return [...(MODELS_BY_BRAND[brandId] || []), 'Other'];
  };

  const getVariants = (modelName: string) => {
    return [...(VARIANTS_BY_MODEL[modelName] || []), 'Other'];
  };

  const [selectedModel, setSelectedModel] = useState(() => {
    const m = initialData?.model;
    if (!m) return MODELS_BY_BRAND[selectedBrand] ? MODELS_BY_BRAND[selectedBrand][0] : 'Other';
    const models = MODELS_BY_BRAND[selectedBrand] || [];
    if (models.includes(m)) return m;
    return 'Other';
  });
  const [manualModel, setManualModel] = useState(() => {
    const m = initialData?.model;
    if (!m) return '';
    const models = MODELS_BY_BRAND[selectedBrand] || [];
    if (models.includes(m)) return '';
    return m;
  });
  const [variant, setVariant] = useState(() => {
    const v = initialData?.variant;
    if (!v) return '';
    if (VARIANT_OPTIONS.includes(v)) return v;
    return 'Not In The List Add Your Variant';
  });
  const [manualVariant, setManualVariant] = useState(() => {
    const v = initialData?.variant;
    if (!v || VARIANT_OPTIONS.includes(v)) return '';
    return v;
  });
  const [fuelType, setFuelType] = useState(initialData?.fuelType || 'Petrol');
  const [manufacturingYear, setManufacturingYear] = useState(initialData?.manufacturingYear?.toString() || '2021');
  const [regDate, setRegDate] = useState('');
  const [transmission, setTransmission] = useState(initialData?.transmission || 'Manual');
  const [colour, setColour] = useState(initialData?.color || '');
  const [ownership, setOwnership] = useState(initialData?.ownership || '1st Owner');
  const [kilometersDriven, setKilometersDriven] = useState(initialData?.kilometersDriven?.toString() || '');
  const [insuranceType, setInsuranceType] = useState(initialData?.insuranceType || 'Comprehensive');
  const [insuranceDate, setInsuranceDate] = useState('');
  const [city, setCity] = useState(initialData?.city || '');
  const [listedBy, setListedBy] = useState('Individual');
  const [listedByName, setListedByName] = useState('');
  const [listedByPhone, setListedByPhone] = useState('');
  const [demandPrice, setDemandPrice] = useState(initialData?.demandPrice?.toString() || '');

  // More Details State
  const [ownershipType, setOwnershipType] = useState('Individual');
  const [rcOwnerName, setRcOwnerName] = useState(initialData?.rcOwnerName || '');
  const [rcOwnerNumber, setRcOwnerNumber] = useState(initialData?.rcOwnerNumber || '');
  const [rcAvailability, setRcAvailability] = useState(initialData?.rcAvailability || 'Original');
  const [originalInvoice, setOriginalInvoice] = useState(initialData?.originalInvoice ?? true);
  const [bankHypo, setBankHypo] = useState(initialData?.bankHypothecation ?? false);
  const [loanStatus, setLoanStatus] = useState(initialData?.loanStatus || '');
  const [rtoTaxStatus, setRtoTaxStatus] = useState(initialData?.rtoTaxStatus || '');
  const [rtoIssues, setRtoIssues] = useState('');
  const [rtoNoc, setRtoNoc] = useState(initialData?.rtoNocIssued || 'No');
  const [rtoNocNumber, setRtoNocNumber] = useState(initialData?.rtoNocNumber || '');
  const [duplicateKeys, setDuplicateKeys] = useState(initialData?.duplicateKeys ?? false);
  const [cngLpgStatus, setCngLpgStatus] = useState('N/A');
  const [serviceBook, setServiceBook] = useState(initialData?.serviceBookAvailability ?? true);
  const [freeService, setFreeService] = useState(initialData?.remainingFreeService?.toString() || 'None');
  const [oemWarranty, setOemWarranty] = useState(initialData?.remainingOemWarranty || 'None');
  const [vehicleCondition, setVehicleCondition] = useState(initialData?.condition || '');
  const [accidentalHistory, setAccidentalHistory] = useState(initialData?.description || '');
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('distributor_referral_code').then(code => {
        if (code) setReferralCode(code);
    });
  }, []);

  // Document image states (car photos are captured separately in the photo step)
  const [rcImages, setRcImages] = useState<string[]>([]);
  const [invoiceImages, setInvoiceImages] = useState<string[]>([]);
  const [bankNocImages, setBankNocImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);

  const [modalType, setModalType] = useState<string | null>(null);

  useEffect(() => {
    if (selectedBrand === 'other') {
        setTimeout(() => manualBrandRef.current?.focus(), 100);
    }
  }, [selectedBrand]);

  useEffect(() => {
    if (selectedModel === 'Other') {
        setTimeout(() => manualModelRef.current?.focus(), 100);
    }
  }, [selectedModel]);

  useEffect(() => {
    if (variant === 'Not In The List Add Your Variant') {
        setTimeout(() => manualVariantRef.current?.focus(), 100);
    }
  }, [variant]);

  // Sync state with route params (important for returning from CarCamera)
  useEffect(() => {
    const data = listingData || initialData;
    if (data?.images && data.images.length > 0) {
      setCarImages(data.images);
    } else if (data?.imageUrl) {
      setCarImages([data.imageUrl]);
    }

    if (data?.rcImages) setRcImages(data.rcImages);
    if (data?.invoiceImages) setInvoiceImages(data.invoiceImages);
    if (data?.bankNocImages) setBankNocImages(data.bankNocImages);

    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [listingData, initialTab, initialData]);

  const formatDate = (date: Date) => {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const pickImage = async (type: 'rc' | 'invoice' | 'bankNoc') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
        handleImageResult(result.assets[0].uri, result.assets[0].mimeType ?? undefined, result.assets[0].fileName ?? undefined, type);
    }
  };

  const pickDocument = async (type: 'rc' | 'invoice' | 'bankNoc') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets[0].uri) {
        handleImageResult(result.assets[0].uri, result.assets[0].mimeType ?? undefined, result.assets[0].name ?? undefined, type);
      }
    } catch (err) {
      console.warn('Document picking failed', err);
      Alert.alert('Upload Failed', 'Failed to upload document. Please try again.');
    }
  };

  const pickDocument = async (type: 'rc' | 'invoice' | 'bankNoc') => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
      });

      if (!result.canceled && result.assets[0].uri) {
        setUploading(type);
        const { url } = await uploadFile(result.assets[0].uri, result.assets[0].mimeType, result.assets[0].name || undefined);
        if (type === 'rc') setRcImages([...rcImages, url]);
        else if (type === 'invoice') setInvoiceImages([...invoiceImages, url]);
        else if (type === 'bankNoc') setBankNocImages([...bankNocImages, url]);
      }
    } catch (err) {
      console.warn('Document picking failed', err);
      Alert.alert('Upload Failed', 'Failed to upload document. Please try again.');
    } finally {
      setUploading(null);
    }
  };

  const removeImage = (url: string, type: 'car' | 'rc' | 'invoice' | 'bankNoc') => {
    if (type === 'car') setCarImages(carImages.filter(img => img !== url));
    else if (type === 'rc') setRcImages(rcImages.filter(img => img !== url));
    else if (type === 'invoice') setInvoiceImages(invoiceImages.filter(img => img !== url));
    else if (type === 'bankNoc') setBankNocImages(bankNocImages.filter(img => img !== url));
  };

  const buildPayload = (): CreateListingPayload & { id?: string } => {
    const currentBrand = selectedBrand === 'other' ? manualBrand : (brands.find(b => b.id === selectedBrand)?.name || selectedBrand);
    const currentModel = selectedModel === 'Other' ? manualModel : selectedModel;
    const currentVariant = variant === 'Not In The List Add Your Variant' ? manualVariant : variant;
    const fullTitle = `${currentBrand.toUpperCase()} ${currentModel} ${currentVariant}`.trim();

    return {
        ...initialData,
        title: fullTitle,
        brand: selectedBrand === 'other' ? manualBrand : selectedBrand,
        model: currentModel,
        variant: currentVariant || undefined,
        fuelType,
        manufacturingYear: parseInt(manufacturingYear),
        transmission,
        color: colour.trim(),
        ownership,
        kilometersDriven: parseInt(kilometersDriven.replace(/,/g, '').match(/\d+/)?.[0] || '0'),
        demandPrice: parseInt(demandPrice.replace(/,/g, '')) || 0,
        imageUrl: carImages[0] || undefined,
        images: carImages,
        rcImages,
        invoiceImages,
        bankNocImages,
        insuranceType,
        insuranceExpiry: insuranceDate || undefined,
        registrationDate: regDate || undefined,
        plateNumber: regNumber || undefined,
        carType: carType || undefined,
        listedBy,
        sellerContactName: listedByName || undefined,
        sellerContactNumber: listedByPhone || undefined,
        rcOwnerName,
        rcOwnerNumber,
        rcAvailability,
        ownershipType,
        originalInvoice,
        bankHypothecation: bankHypo,
        loanStatus: bankHypo ? loanStatus : undefined,
        rtoTaxStatus,
        rtoIssues: rtoIssues || undefined,
        rtoNocIssued: rtoNoc,
        rtoNocFor: rtoNoc === 'Yes, Inter State' ? rtoNocFor : undefined,
        rtoNocNumber: (rtoNoc === 'Yes, Inter State' || rtoNoc === 'Yes, Within State') ? rtoNocNumber : undefined,
        duplicateKeys,
        cngLpgStatus,
        serviceBookAvailability: serviceBook,
        remainingFreeService: freeService === 'None' ? 0 : parseInt(freeService),
        remainingOemWarranty: oemWarranty,
        condition: vehicleCondition,
        description: accidentalHistory,
        referralCode: referralCode || undefined,
    };
  };

  const handleFinalSubmit = (skipMore = false) => {
    const newErrors: Record<string, boolean> = {};

    if (activeTab === 'basic') {
      if (!regNumber) newErrors.regNumber = true;
      if (!selectedModel || selectedModel === '') newErrors.selectedModel = true;
      if (!demandPrice) newErrors.demandPrice = true;
      if (selectedBrand === 'other' && !manualBrand) newErrors.manualBrand = true;
      if (selectedModel === 'Other' && !manualModel) newErrors.manualModel = true;
      if (variant === 'Not In The List Add Your Variant' && !manualVariant) newErrors.manualVariant = true;

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          Alert.alert('Missing Details', 'Please fill in the highlighted fields.');
          return;
      }
      setErrors({});

      const payload = buildPayload();
      if (skipMore) {
          navigation.navigate('AuctionSetup', { listingData: payload });
      } else {
          setActiveTab('more');
      }
    } else {
      // More details validation
      if (!rcOwnerName) newErrors.rcOwnerName = true;
      if (!rcOwnerNumber) newErrors.rcOwnerNumber = true;
      if (!rcAvailability) newErrors.rcAvailability = true;
      if (!rtoTaxStatus) newErrors.rtoTaxStatus = true;
      if (rcImages.length === 0) newErrors.rcImages = true;

      if (Object.keys(newErrors).length > 0) {
          setErrors(newErrors);
          Alert.alert('Required Details', "Please fill in the highlighted fields and upload mandatory documents.");
          return;
      }
      setErrors({});

      const payload = buildPayload();
      navigation.navigate('AuctionSetup', { listingData: payload });
    }
  };

  const renderFilePreview = (img: string, type: 'car' | 'rc' | 'invoice' | 'bankNoc') => {
    const lower = img.toLowerCase();
    const isPdf = lower.endsWith('.pdf');
    const isDoc = lower.endsWith('.doc') || lower.endsWith('.docx');

    return (
        <View key={img} style={styles.previewWrap}>
            {isPdf ? (
                <View style={[styles.previewImg, { backgroundColor: '#fef2f2', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="file-pdf-box" size={32} color="#ef4444" />
                </View>
            ) : isDoc ? (
                <View style={[styles.previewImg, { backgroundColor: '#eff6ff', alignItems: 'center', justifyContent: 'center' }]}>
                    <MaterialCommunityIcons name="file-word-box" size={32} color="#2873c3" />
                </View>
            ) : (
                <Image source={{ uri: img }} style={styles.previewImg} />
            )}
            <Pressable style={styles.previewCross} onPress={() => removeImage(img, type)}>
                <Ionicons name="close" size={14} color="#fff" />
            </Pressable>
        </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={TEXT_DARK} />
        </Pressable>
        <Text style={styles.headerTitle}>Fill Out the Car Details</Text>
      </View>

      <View style={styles.tabsRow}>
        <Pressable style={[styles.tab, activeTab === 'basic' && styles.tabActive]} onPress={() => setActiveTab('basic')}>
          <Text style={[styles.tabText, activeTab === 'basic' && styles.tabTextActive]}>Basic Details</Text>
        </Pressable>
        <Pressable style={[styles.tab, activeTab === 'more' && styles.tabActive]} onPress={() => setActiveTab('more')}>
          <Text style={[styles.tabText, activeTab === 'more' && styles.tabTextActive]}>More Details</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'basic' ? (
          <>
            <Label text="Registration Number" />
            <TextInputBox placeholder="DL 01 AB12XX" value={regNumber} onChangeText={setRegNumber} error={errors.regNumber} />

            <Label text="Select Car brand" />
            <View style={styles.searchBarContainer}>
              <Ionicons name="search-outline" size={20} color={MUTED} style={{ marginRight: 10 }} />
              <TextInput
                placeholder="Search Brands..."
                placeholderTextColor={MUTED}
                style={styles.searchInputModal}
                value={brandSearch}
                onChangeText={setBrandSearch}
              />
            </View>
            <View style={styles.brandGrid}>
              {(brandSearch
                ? ALL_BRANDS.filter(b => b.name.toLowerCase().includes(brandSearch.toLowerCase()))
                : (showAllBrands ? ALL_BRANDS : ALL_BRANDS.slice(0, 8))
              ).map((brand) => (
                <Pressable
                  key={brand.id}
                  style={[
                    styles.brandItem,
                    selectedBrand === brand.id && styles.brandItemActive,
                    errors.selectedBrand && styles.brandItemError,
                  ]}
                  onPress={() => {
                    setSelectedBrand(brand.id);
                    const models = getModels(brand.id);
                    setSelectedModel(models[0]);
                    const variants = getVariants(models[0]);
                    setVariant(variants[0]);
                  }}
                >
                  <Image source={brand.logo} style={styles.brandLogo} resizeMode="contain" />
                </Pressable>
              ))}

              {!brandSearch && (
                <Pressable
                  style={[styles.brandItem, selectedBrand === 'other' && styles.brandItemActive]}
                  onPress={() => {
                    setSelectedBrand('other');
                    setSelectedModel('Other');
                    setVariant('Other');
                  }}
                >
                  <Text style={styles.otherBrandText}>OTHER</Text>
                </Pressable>
              )}
            </View>
            {!showAllBrands && (
              <Pressable
                  style={styles.viewAllBtn}
                  onPress={() => setShowAllBrands(true)}
              >
                 <Text style={styles.viewAllText}>VIEW ALL BRANDS</Text>
              </Pressable>
            )}

            {selectedBrand === 'other' && (
              <View style={{ marginTop: 8 }}>
                <TextInputBox
                  inputRef={manualBrandRef}
                  placeholder="Enter Brand Name Manually"
                  value={manualBrand}
                  onChangeText={setManualBrand}
                  error={errors.manualBrand}
                />
              </View>
            )}

            <Label text="Select Car Model" />
            <View style={styles.chipGrid}>
              {getModels(selectedBrand).slice(0, 9).map((model) => (
                <Pressable
                  key={model}
                  style={[styles.chipItem, { width: getResponsiveCardWidth(width, isDesktop ? 4 : 3, 10, 24) }, selectedModel === model && styles.chipItemActive]}
                  onPress={() => {
                    setSelectedModel(model);
                    if (model !== 'Other') {
                      const variants = getVariants(model);
                      setVariant(variants[0]);
                    }
                  }}
                >
                  <Text style={[styles.chipText, selectedModel === model && styles.chipTextActive]}>{model}</Text>
                </Pressable>
              ))}
            </View>

            {selectedModel === 'Other' && (
              <View style={{ marginTop: 8 }}>
                <TextInputBox
                  inputRef={manualModelRef}
                  placeholder="Enter Model Name Manually"
                  value={manualModel}
                  onChangeText={setManualModel}
                  error={errors.manualModel}
                />
              </View>
            )}

            <Label text="Upload Car Images" />
            <UploadBox
                label="Upload Image"
                icon="car"
                onPress={() => {
                    const currentData = buildPayload();
                    navigation.navigate('CameraGuidance', { listingData: currentData });
                }}
                loading={uploading === 'car'}
            />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
              {carImages.map((img) => renderFilePreview(img, 'car'))}
            </ScrollView>

            <Label text="Car Variant" />
            <SelectInput
                placeholder="Select Variant"
                value={variant === 'Not In The List Add Your Variant' ? (manualVariant || 'Other') : variant}
                onPress={() => setModalType('variant')}
                error={errors.variant}
            />

            {variant === 'Not In The List Add Your Variant' && (
              <View style={{ marginTop: 8 }}>
                <TextInputBox
                  inputRef={manualVariantRef}
                  placeholder="Enter Variant Manually"
                  value={manualVariant}
                  onChangeText={setManualVariant}
                  error={errors.manualVariant}
                />
              </View>
            )}

            <Label text="Fuel Type" />
            <SelectInput placeholder="Select" value={fuelType} onPress={() => setModalType('fuel')} />

            <Label text="Manufacturing Year" />
            <SelectInput placeholder="Select Year" value={manufacturingYear} onPress={() => setModalType('year')} />

            <Label text="Select Registration Date" />
            <SelectInput placeholder="Select Date" value={regDate} icon="calendar-outline" onPress={() => setModalType('regDate')} />

            <Label text="Transmission" />
            <GridToggle options={['Manual', 'Automatic']} value={transmission} onSelect={setTransmission} />

            <Label text="Colour" />
            <TextInputBox placeholder="Enter Colour" value={colour} onChangeText={setColour} />

            <Label text="Select Car Ownership" />
            <GridToggle options={['1st Owner', '2nd Owner', '3rd Owner', '4th Owner']} value={ownership} onSelect={setOwnership} />

            <Label text="Kilometers Driven By Your Car" />
            <SelectInput placeholder="Select KM Driven" value={kilometersDriven} onPress={() => setModalType('kmDriven')} />

            <Label text="Car Insurance Type" />
            <GridToggle options={['Lapsed', 'Third-party insurance', 'Comprehensive', 'Zero Depth']} value={insuranceType} onSelect={setInsuranceType} />

            <Label text="Select Insurance date" />
            <SelectInput placeholder="Select Date" value={insuranceDate} icon="calendar-outline" onPress={() => setModalType('insDate')} />

            <Label text="Listed By" />
            <SelectInput placeholder="Select Listed By" value={listedBy} onPress={() => setModalType('listedBy')} />

            {(listedBy === 'Dealer' || listedBy === 'Broker' || listedBy === 'Showroom / Agency') && (
              <>
                <Label text={listedBy === 'Dealer' ? "Dealer Name" : listedBy === 'Broker' ? "Broker Name" : "Agency / Showroom Name"} />
                <TextInputBox placeholder="Enter name" value={listedByName} onChangeText={setListedByName} />
                <Label text="Contact Number" />
                <TextInputBox placeholder="Enter phone number" value={listedByPhone} onChangeText={setListedByPhone} keyboardType="phone-pad" />
                <View style={styles.disclaimerBox}>
                  <Ionicons name="information-circle-outline" size={16} color="#f97316" />
                  <Text style={styles.disclaimerText}>
                    Listing on behalf of a dealer or agency. Buyer will be informed this is a commercial listing.
                  </Text>
                </View>
              </>
            )}

            <Label text="City" />
            <TextInputBox placeholder="Enter city" value={city} onChangeText={setCity} />

            <Label text="Demand Price" />
            <View style={[styles.priceInputBox, errors.demandPrice && styles.inputBoxError]}>
               <MaterialCommunityIcons name="currency-inr" size={20} color="#fb923c" style={{ marginRight: 8 }} />
               <TextInput
                    placeholder="Enter Price"
                    placeholderTextColor={MUTED}
                    style={styles.textInput}
                    keyboardType="numeric"
                    value={demandPrice}
                    onChangeText={setDemandPrice}
                />
            </View>

            <View style={styles.footerRow}>
              <Pressable
                style={[styles.skipBtn]}
                onPress={() => handleFinalSubmit(true)}
              >
                <Text style={styles.skipBtnText}>SUBMIT</Text>
              </Pressable>

              <Pressable
                style={[styles.skipBtn]}
                onPress={() => {
                  setErrors({});
                  setActiveTab('more');
                }}
              >
                <Text style={styles.skipBtnText}>MORE DETAILS</Text>
              </Pressable>
            </View>
          </>
        ) : (
          <>
            <Label text="Ownership Type" />
            <SelectInput placeholder="Select" value={ownershipType} onPress={() => setModalType('ownershipType')} />

            <Label text="RC Owner's Name" />
            <TextInputBox placeholder="Enter Name" value={rcOwnerName} onChangeText={setRcOwnerName} error={errors.rcOwnerName} />

            <Label text="RC Owner's Number" />
            <TextInputBox placeholder="Enter Number" value={rcOwnerNumber} onChangeText={setRcOwnerNumber} keyboardType="phone-pad" error={errors.rcOwnerNumber} />

            <Label text="RC Availability" />
            <SelectInput placeholder="Select" value={rcAvailability} onPress={() => setModalType('rcAvail')} error={errors.rcAvailability} />

            <Label text="RC Photos (Mandatory)" />
            <View style={styles.uploadActionsRow}>
                <Pressable style={styles.miniUploadBtn} onPress={() => pickImage('rc')} disabled={!!uploading}>
                    <Ionicons name="camera" size={20} color={BLUE_BTN} />
                    <Text style={styles.miniUploadText}>Camera/Gallery</Text>
                </Pressable>
                <Pressable style={styles.miniUploadBtn} onPress={() => pickDocument('rc')} disabled={!!uploading}>
                    <Ionicons name="document-text" size={20} color={BLUE_BTN} />
                    <Text style={styles.miniUploadText}>PDF/Doc</Text>
                </Pressable>
                {uploading === 'rc' && <ActivityIndicator size="small" color={BLUE_BTN} />}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
              {rcImages.map((img) => renderFilePreview(img, 'rc'))}
            </ScrollView>

            <Label text="Original Invoice" />
            <GridToggle options={['Yes, Available', 'No']} value={originalInvoice ? 'Yes, Available' : 'No'} onSelect={(v) => setOriginalInvoice(v === 'Yes, Available')} />

            <Label text="Invoice Photos" />
            <View style={styles.uploadActionsRow}>
                <Pressable style={styles.miniUploadBtn} onPress={() => pickImage('invoice')} disabled={!!uploading}>
                    <Ionicons name="camera" size={20} color={BLUE_BTN} />
                    <Text style={styles.miniUploadText}>Camera/Gallery</Text>
                </Pressable>
                <Pressable style={styles.miniUploadBtn} onPress={() => pickDocument('invoice')} disabled={!!uploading}>
                    <Ionicons name="document-text" size={20} color={BLUE_BTN} />
                    <Text style={styles.miniUploadText}>PDF/Doc</Text>
                </Pressable>
                {uploading === 'invoice' && <ActivityIndicator size="small" color={BLUE_BTN} />}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
              {invoiceImages.map((img) => renderFilePreview(img, 'invoice'))}
            </ScrollView>

            <Label text="Bank Hypothecation" />
            <GridToggle options={['Yes', 'No']} value={bankHypo ? 'Yes' : 'No'} onSelect={(v) => { setBankHypo(v === 'Yes'); if (v === 'No') setLoanStatus(''); }} />

            {bankHypo && (
              <>
                <Label text="Loan Status" />
                <SelectInput placeholder="Select Loan Status" value={loanStatus} onPress={() => setModalType('loanStatus')} />
              </>
            )}

            <Label text="Bank NOC Photos" />
            <View style={styles.uploadActionsRow}>
                <Pressable style={styles.miniUploadBtn} onPress={() => pickImage('bankNoc')} disabled={!!uploading}>
                    <Ionicons name="camera" size={20} color={BLUE_BTN} />
                    <Text style={styles.miniUploadText}>Camera/Gallery</Text>
                </Pressable>
                <Pressable style={styles.miniUploadBtn} onPress={() => pickDocument('bankNoc')} disabled={!!uploading}>
                    <Ionicons name="document-text" size={20} color={BLUE_BTN} />
                    <Text style={styles.miniUploadText}>PDF/Doc</Text>
                </Pressable>
                {uploading === 'bankNoc' && <ActivityIndicator size="small" color={BLUE_BTN} />}
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.previewRow}>
              {bankNocImages.map((img) => renderFilePreview(img, 'bankNoc'))}
            </ScrollView>

            <Label text="RTO Tax Status" />
            <SelectInput placeholder="Select" value={rtoTaxStatus} onPress={() => setModalType('rtoTax')} error={errors.rtoTaxStatus} />

            <Label text="Please Mention if any RTO Dues or Issues" />
            <TextInputBox placeholder="Type Here" value={rtoIssues} onChangeText={setRtoIssues} multiline />

            <Label text="RTO NOC Issued" />
            <SelectInput placeholder="Select" value={rtoNoc} onPress={() => setModalType('rtoNoc')} />

            {rtoNoc === 'Yes' && (
              <>
                <Label text="Issuing RTO Office" />
                <SelectInput
                  placeholder="Select RTO Number"
                  value={rtoNocNumber}
                  onPress={() => setModalType('rtoNocNumber')}
                />
              </>
            )}

            <Label text="Duplicate keys" />
            <GridToggle options={['Yes', 'No']} value={duplicateKeys ? 'Yes' : 'No'} onSelect={(v) => setDuplicateKeys(v === 'Yes')} />

            <Label text="CNG/LPG Status" />
            <SelectInput placeholder="Select" value={cngLpgStatus} onPress={() => setModalType('cngLpg')} />

            <Label text="Service Book Availability" />
            <GridToggle options={['Yes', 'No']} value={serviceBook ? 'Yes' : 'No'} onSelect={(v) => setServiceBook(v === 'Yes')} />

            <Label text="Remaining Free Service" />
            <GridToggle options={['None', '1', '2', '3']} columns={4} value={freeService} onSelect={setFreeService} />

            <Label text="Remaining OEM Warranty" />
            <SelectInput placeholder="Select Warranty Period" value={oemWarranty} onPress={() => setModalType('oemWarranty')} />

            <Label text="Vehicle Condition" />
            <SelectInput placeholder="Select" value={vehicleCondition} onPress={() => setModalType('condition')} />

            <Label text="Please mention if any accidental history or any other major issues" />
            <TextInputBox placeholder="Type Here" multiline value={accidentalHistory} onChangeText={setAccidentalHistory} />

            <Pressable style={[styles.submitBtn, { marginBottom: 40, backgroundColor: BLUE_BTN }]} onPress={() => handleFinalSubmit(false)}>
              <Text style={styles.submitBtnText}>SUBMIT</Text>
              <MaterialCommunityIcons name="send" size={22} color="#fff" style={{ marginLeft: 8 }} />
            </Pressable>
          </>
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Modals */}

      <BottomSelectModal
          visible={modalType === 'variant'}
          title="Select Variant"
          data={['VXi', 'LXi', 'ZXi', 'Sportz', 'Asta', 'Alpha', 'Zeta', 'Sigma']}
          selectedValue={variant}
          onSelect={setVariant}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'fuel'}
          title="Fuel Type"
          data={['Petrol', 'Diesel', 'CNG', 'Electric', 'Hybrid (Petrol)', 'LPG', 'CNG + Petrol (Bi-Fuel)', 'Diesel + CNG']}
          selectedValue={fuelType}
          onSelect={setFuelType}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'year'}
          title="Manufacturing Year"
          data={YEARS}
          selectedValue={manufacturingYear}
          onSelect={setManufacturingYear}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'listedBy'}
          title="Listed By"
          data={['Individual', 'Dealer', 'Broker', 'Showroom / Agency']}
          selectedValue={listedBy}
          onSelect={setListedBy}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'rcAvail'}
          title="RC Availability"
          data={['Original RC Book', 'Smart Card RC', 'Duplicate RC', 'RC Not Available']}
          selectedValue={rcAvailability}
          onSelect={setRcAvailability}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'loanStatus'}
          title="Loan Status"
          data={['Active', 'Closed', 'Foreclosed', 'In Process']}
          selectedValue={loanStatus}
          onSelect={setLoanStatus}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'rtoTax'}
          title="RTO Tax Status"
          data={[
            'Lifetime Tax Paid',
            'Annual Tax Paid',
            'Half Yearly Tax Paid',
            'Quarterly Tax Paid',
            'Road Tax Due / Pending',
            'Exempted',
          ]}
          selectedValue={rtoTaxStatus}
          onSelect={setRtoTaxStatus}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'rtoNoc'}
          title="RTO NOC Issued"
          data={['Yes', 'No', 'In Process']}
          selectedValue={rtoNoc}
          onSelect={(v) => { setRtoNoc(v); if (v !== 'Yes') setRtoNocNumber(''); }}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'rtoNocNumber'}
          title="Select Issuing RTO Office"
          data={ALL_RTO_CODES}
          selectedValue={rtoNocNumber}
          onSelect={setRtoNocNumber}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'cngLpg'}
          title="CNG/LPG Status"
          data={[
            'N/A',
            'CNG Kit Fitted - RC Updated',
            'LPG Kit Fitted - RC Updated',
            'CNG Kit Fitted - RC Not Updated',
            'LPG Kit Fitted - RC Not Updated',
            'After Market Fitted - RC Not Updated',
            'Not Verified',
          ]}
          selectedValue={cngLpgStatus}
          onSelect={setCngLpgStatus}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'condition'}
          title="Vehicle Condition"
          data={['5 - Excellent', '4 - Very Good', '3 - Good', '2 - Fair', '1 - Poor / Needs Repair']}
          selectedValue={vehicleCondition}
          onSelect={setVehicleCondition}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
          visible={modalType === 'kmDriven'}
          title="Select KM Driven"
          data={[
            '0 - 10,000',
            '10,000 - 20,000',
            '20,000 - 30,000',
            '30,000 - 40,000',
            '40,000 - 50,000',
            '50,000 - 60,000',
            '60,000 - 70,000',
            '70,000 - 80,000',
            '80,000 - 90,000',
            '90,000 - 1,00,000',
            'Above 1,00,000',
          ]}
          selectedValue={kilometersDriven}
          onSelect={setKilometersDriven}
          onClose={() => setModalType(null)}
      />
      <BottomSelectModal
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
      <BottomSelectModal
          visible={modalType === 'ownershipType'}
          title="Ownership Type"
          data={['Individual', 'Company / Corporate', 'Taxi / Commercial', 'Leased']}
          selectedValue={ownershipType}
          onSelect={setOwnershipType}
          onClose={() => setModalType(null)}
      />

      <CalendarModal
          visible={modalType === 'regDate'}
          onClose={() => setModalType(null)}
          onSelectDate={(date) => {
              setRegDate(formatDate(date));
              setModalType(null);
          }}
          selectedDate={regDate ? new Date(regDate.split('/').reverse().join('-')) : null}
          title="Registration Date"
      />

      <CalendarModal
          visible={modalType === 'insDate'}
          onClose={() => setModalType(null)}
          onSelectDate={(date) => {
              setInsuranceDate(formatDate(date));
              setModalType(null);
          }}
          selectedDate={insuranceDate ? new Date(insuranceDate.split('/').reverse().join('-')) : null}
          title="Insurance Date"
          allowPastDates={true}
      />

      <StatusBar style="dark" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: TEXT_DARK,
    marginLeft: 16,
  },

  tabsRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: TEXT_DARK,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#94a3b8',
  },
  tabTextActive: {
    color: TEXT_DARK,
  },

  content: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 30,
    backgroundColor: '#fff',
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    color: TEXT_DARK,
    marginTop: 20,
    marginBottom: 8,
  },

  brandGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-start',
    gap: 8,
    marginTop: 8,
  },
  brandItem: {
    width: (Dimensions.get('window').width - 40 - 24) / 4,
    aspectRatio: 1,
    backgroundColor: '#eff6ff',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 8,
  },
  brandItemActive: {
    borderColor: BLUE_BTN,
    backgroundColor: '#eff6ff',
    borderWidth: 2,
  },
  viewAllBtn: { marginTop: 10, height: 40, borderRadius: 8, borderWidth: 1, borderColor: BLUE_BTN, alignItems: 'center', justifyContent: 'center' },
  viewAllText: { color: BLUE_BTN, fontSize: 14, fontWeight: '700' },
  brandItemError: {
    borderColor: '#ef4444',
    borderWidth: 1,
  },
  brandLogo: {
    width: '80%',
    height: '60%',
  },
  otherBrandText: {
    fontSize: 10,
    fontWeight: '700',
    color: TEXT_DARK,
  },

  chipGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  chipItem: {
    width: '31%',
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  chipItemActive: {
    borderColor: BLUE_BTN,
    backgroundColor: '#eff6ff',
  },
  chipText: {
    fontSize: 14,
    color: MUTED,
    fontWeight: '500',
  },
  chipTextActive: {
    color: BLUE_BTN,
    fontWeight: '600',
  },

  inputBox: {
    height: 52,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  inputBoxDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
  inputBoxError: { borderColor: '#ef4444', borderWidth: 1 },
  inputBoxMulti: { height: 100, alignItems: 'flex-start', paddingTop: 12 },
  inputText: { fontSize: 15, color: TEXT_DARK },
  inputTextMuted: { fontSize: 15, color: MUTED },
  textInput: { flex: 1, fontSize: 15, color: TEXT_DARK, fontWeight: '500' },
  textInputMulti: { textAlignVertical: 'top' },

  toggleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, justifyContent: 'space-between' },
  toggleItem: { height: 48, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff', width: '48.5%' },
  toggleItemDark: { backgroundColor: '#1e293b', borderColor: '#334155' },
  toggleItemActive: { borderColor: BLUE_BTN, backgroundColor: '#eff6ff' },
  toggleText: { fontSize: 14, color: MUTED, fontWeight: '500' },
  toggleTextActive: { color: BLUE_BTN, fontWeight: '600' },

  uploadBox: {
    height: 120,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
  },
  uploadBoxDark: { backgroundColor: '#f0f7ff', borderColor: '#bfdbfe' },
  uploadBoxError: { borderColor: '#ef4444', backgroundColor: '#fef2f2', borderWidth: 1 },
  uploadIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#246EB9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  uploadLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: TEXT_DARK,
  },

  uploadActionsRow: { flexDirection: 'row', gap: 12, marginTop: 4 },
  miniUploadBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#f0f7ff',
    borderWidth: 1,
    borderColor: '#bfdbfe',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  miniUploadText: { fontSize: 14, fontWeight: '700', color: BLUE_BTN },

  previewRow: { flexDirection: 'row', marginTop: 12, marginBottom: 8 },
  previewWrap: { marginRight: 12, position: 'relative', marginTop: 8 },
  previewImg: { width: 100, height: 80, borderRadius: 8 },
  previewCross: { position: 'absolute', top: -5, right: -5, backgroundColor: '#ef4444', borderRadius: 12, padding: 2, borderWidth: 1, borderColor: '#fff' },

  priceInputBox: {
    height: 56,
    backgroundColor: '#fffbeb',
    borderWidth: 1,
    borderColor: '#fde68a',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },

  footerRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 32,
    marginBottom: 40,
  },
  skipBtn: {
    flex: 1,
    height: 52,
    backgroundColor: BLUE_BTN,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skipBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  submitBtn: { height: 50, backgroundColor: BLUE_BTN, borderRadius: 5, alignItems: 'center', justifyContent: 'center', marginTop: 32 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  disclaimerBox: { flexDirection: 'row', gap: 8, backgroundColor: '#fff7ed', borderWidth: 1, borderColor: '#fed7aa', borderRadius: 8, padding: 12, marginTop: 8, alignItems: 'flex-start' },
  disclaimerText: { flex: 1, fontSize: 12, color: '#92400e', lineHeight: 18 },

  /* Modals */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 20, borderTopRightRadius: 20, maxHeight: '80%', paddingBottom: 40 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK },

  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    margin: 15,
    paddingHorizontal: 12,
    borderRadius: 10,
    height: 48,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  searchInputModal: {
    flex: 1,
    fontSize: 15,
    color: TEXT_DARK,
    height: '100%',
  },

  modalItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 18, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalItemActive: { backgroundColor: '#f8fafc' },
  modalItemText: { fontSize: 16, color: TEXT_DARK },
  modalItemTextActive: { color: BLUE_BTN, fontWeight: '700' },

  submitBtn: { height: 50, backgroundColor: BLUE_BTN, borderRadius: 8, alignItems: 'center', justifyContent: 'center', marginTop: 32, flexDirection: 'row' },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },

  calendarCard: { backgroundColor: '#fff', borderRadius: 16, margin: 20, padding: 20, width: '90%', alignSelf: 'center' },
  calendarTitle: { fontSize: 18, fontWeight: '700', color: TEXT_DARK, marginBottom: 20, textAlign: 'center' },
  calendarFooter: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 20, gap: 12 },
  calBtn: { paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  calBtnTextCancel: { color: MUTED, fontWeight: '600' },
  calBtnTextConfirm: { color: '#fff', fontWeight: '700' },
});

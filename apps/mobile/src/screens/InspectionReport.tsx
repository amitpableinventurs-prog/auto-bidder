import React from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/types';

const COLORS = {
  primary: '#2873c3',
  text: '#0b1020',
  muted: '#6b7280',
  success: '#22c55e',
  bg: '#f8fafc',
  white: '#ffffff',
  border: '#e2e8f0',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#3b82f6',
};

const INSPECTION_POINTS = {
  Exterior: [
    { id: 'front', label: 'Front' },
    { id: 'frontLeft45', label: 'Front Left 45°' },
    { id: 'leftSide', label: 'Left Side' },
    { id: 'rearLeft45', label: 'Rear Left 45°' },
    { id: 'rear', label: 'Rear' },
    { id: 'rearRight45', label: 'Rear Right 45°' },
    { id: 'rightSide', label: 'Right Side' },
    { id: 'frontRight45', label: 'Front Right 45°' },
  ],
  Interior: [
    { id: 'odometer', label: 'Dashboard/Odometer' },
    { id: 'steering', label: 'Steering Wheel' },
    { id: 'console', label: 'Center Console' },
    { id: 'frontSeats', label: 'Front Seats' },
    { id: 'rearSeats', label: 'Rear Seats' },
    { id: 'roof', label: 'Roof/Sunroof' },
    { id: 'doorPads', label: 'Door Pads' },
    { id: 'bootSpace', label: 'Boot/Trunk Space' },
  ],
  Detail: [
    { id: 'engineBay', label: 'Engine Bay' },
    { id: 'frontLeftTyre', label: 'Front Left Tyre' },
    { id: 'frontRightTyre', label: 'Front Right Tyre' },
    { id: 'rearLeftTyre', label: 'Rear Left Tyre' },
    { id: 'rearRightTyre', label: 'Rear Right Tyre' },
    { id: 'spareTyre', label: 'Spare Tyre' },
    { id: 'batteryVIN', label: 'Battery/VIN' },
    { id: 'undercarriage', label: 'Undercarriage' },
  ],
  Custom: [
    { id: 'custom', label: 'Custom' },
  ]
};

function ReportCard({ title, icon, children }: { title: string, icon?: any, children: React.ReactNode }) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        {icon && <MaterialCommunityIcons name={icon} size={20} color={COLORS.primary} style={{ marginRight: 8 }} />}
        <Text style={styles.cardTitle}>{title}</Text>
      </View>
      <View style={styles.cardBody}>
        {children}
      </View>
    </View>
  );
}

function DetailItem({ label, value, fullWidth = false, color = COLORS.text }: { label: string, value: any, fullWidth?: boolean, color?: string }) {
  return (
    <View style={[styles.detailItem, fullWidth && { width: '100%' }]}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, { color }]}>{value || 'N/A'}</Text>
    </View>
  );
}

export default function InspectionReport() {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<RootStackParamList, 'InspectionReport'>>();
  const { listingData } = (route.params as any) || {};

  const handleFinish = () => {
      navigation.navigate('AuctionSetup', { listingData });
  };

  const formatCurrency = (val: any) => {
    if (!val) return '₹0';
    const num = val.toString().replace(/\D/g, '');
    return '₹' + Number(num).toLocaleString('en-IN');
  };

  const isCaptured = (category: string, id: string) => {
      if (!listingData?.capturedImagesStatus) return true; // Default to check if no status passed
      return listingData.capturedImagesStatus[`${category}_${id}`]?.length > 0;
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()} hitSlop={15}>
          <Ionicons name="arrow-back" size={24} color={COLORS.text} />
        </Pressable>
        <Text style={styles.headerTitle}>Full Inspection Report</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Main Vehicle Summary Header */}
        <View style={styles.vehicleHeader}>
            <View style={styles.titleArea}>
                <Text style={styles.carTitle}>{listingData?.title || 'Vehicle Report'}</Text>
                <View style={styles.tagRow}>
                    <View style={styles.regTag}>
                        <Text style={styles.regText}>{listingData?.plateNumber || listingData?.regNumber || 'N/A'}</Text>
                    </View>
                    <Text style={styles.metaText}>{listingData?.manufacturingYear || ''} • {listingData?.fuelType || ''} • {listingData?.transmission || ''}</Text>
                </View>
            </View>
            <View style={styles.priceTag}>
                <Text style={styles.priceLabel}>Demand Price</Text>
                <Text style={styles.priceValue}>{formatCurrency(listingData?.demandPrice)}</Text>
            </View>
        </View>

        {/* Basic Information */}
        <ReportCard title="Basic Details" icon="car-info">
            <View style={styles.detailGrid}>
                <DetailItem label="Brand" value={listingData?.brand?.toUpperCase()} />
                <DetailItem label="Model" value={listingData?.model} />
                <DetailItem label="Variant" value={listingData?.variant} />
                <DetailItem label="Year" value={listingData?.manufacturingYear} />
                <DetailItem label="Fuel" value={listingData?.fuelType} />
                <DetailItem label="Transmission" value={listingData?.transmission} />
                <DetailItem label="Color" value={listingData?.color} />
                <DetailItem label="KM Driven" value={listingData?.kilometersDriven?.toLocaleString()} />
                <DetailItem label="Registration Date" value={listingData?.registrationDate} />
                <DetailItem label="Ownership" value={listingData?.ownership} />
            </View>
        </ReportCard>

        {/* Registration & Ownership */}
        <ReportCard title="Registration & Ownership" icon="card-account-details-outline">
            <View style={styles.detailGrid}>
                <DetailItem label="RC Owner Name" value={listingData?.rcOwnerName} fullWidth />
                <DetailItem label="RC Owner Number" value={listingData?.rcOwnerNumber} />
                <DetailItem label="Ownership Type" value={listingData?.ownershipType} />
                <DetailItem label="RC Availability" value={listingData?.rcAvailability} color={listingData?.rcAvailability === 'Original Ok' ? COLORS.success : COLORS.warning} />
                <DetailItem label="Original Invoice" value={listingData?.originalInvoice ? 'Available' : 'Not Available'} />
                <DetailItem label="RTO Tax Status" value={listingData?.rtoTaxStatus} />
                <DetailItem label="Service Book" value={listingData?.serviceBookAvailability ? 'Available' : 'Not Available'} />
            </View>
        </ReportCard>

        {/* Condition & History */}
        <ReportCard title="Vehicle Condition & History" icon="shield-check-outline">
            <View style={styles.detailGrid}>
                <DetailItem label="Overall Condition" value={listingData?.condition} color={listingData?.condition === 'Normal' ? COLORS.success : COLORS.warning} />
                <DetailItem label="Duplicate Keys" value={listingData?.duplicateKeys ? 'Yes' : 'No'} />
                <DetailItem label="CNG/LPG Status" value={listingData?.cngLpgStatus} />
                <DetailItem label="OEM Warranty" value={listingData?.remainingOemWarranty} />
                <DetailItem label="Free Services" value={listingData?.remainingFreeService} />
                <DetailItem label="Accidental History" value={listingData?.description || 'No major issues mentioned'} fullWidth color={listingData?.description ? COLORS.danger : COLORS.muted} />
            </View>
        </ReportCard>

        {/* Finance & RTO Details */}
        <ReportCard title="Finance & RTO Details" icon="bank-outline">
            <View style={styles.detailGrid}>
                <DetailItem label="Bank Hypothecation" value={listingData?.bankHypothecation ? 'Yes' : 'No'} />
                {listingData?.bankHypothecation && (
                    <DetailItem label="Loan Status" value={listingData?.loanStatus} color={COLORS.info} />
                )}
                <DetailItem label="RTO NOC Issued" value={listingData?.rtoNocIssued} />
                {listingData?.rtoNocNumber && (
                    <DetailItem label="NOC Number" value={listingData?.rtoNocNumber} />
                )}
                {listingData?.rtoNocFor && (
                    <DetailItem label="NOC For RTO" value={listingData?.rtoNocFor} />
                )}
                <DetailItem label="RTO Issues/Dues" value={listingData?.rtoIssues || 'None'} fullWidth color={listingData?.rtoIssues ? COLORS.danger : COLORS.muted} />
            </View>
        </ReportCard>

        {/* Seller Info */}
        <ReportCard title="Listing & Contact Info" icon="account-tie-outline">
            <View style={styles.detailGrid}>
                <DetailItem label="Listed By" value={listingData?.listedBy} />
                {listingData?.sellerContactName && (
                    <DetailItem label="Contact Name" value={listingData?.sellerContactName} />
                )}
                {listingData?.sellerContactNumber && (
                    <DetailItem label="Contact Number" value={listingData?.sellerContactNumber} />
                )}
            </View>
        </ReportCard>

        {/* Documents Summary */}
        <View style={styles.docCard}>
            <Text style={styles.cardTitleMain}>Documents Status</Text>
            <View style={styles.docRow}>
                <DocStatus label="RC Copy" uploaded={listingData?.rcImages?.length > 0} />
                <DocStatus label="Invoice" uploaded={listingData?.invoiceImages?.length > 0} />
                <DocStatus label="Bank NOC" uploaded={listingData?.bankNocImages?.length > 0} />
                <DocStatus label="Insurance" uploaded={!!listingData?.insuranceExpiry} />
            </View>
        </View>

        {/* Photo Checklist */}
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitleMain}>Photo Inspection Checklist</Text>
            <Text style={styles.sectionDesc}>
                {listingData?.images?.length || 0} / 25 photos verified in total
            </Text>
        </View>

        {Object.entries(INSPECTION_POINTS).map(([category, points]) => (
            <View key={category} style={styles.section}>
                <Text style={styles.categoryTitle}>{category}</Text>
                <View style={styles.grid}>
                    {points.map((point) => {
                        const captured = isCaptured(category, point.id);
                        return (
                            <View key={point.id} style={[styles.pointItem, !captured && styles.pointItemMuted]}>
                                <View style={[styles.checkCircle, !captured && styles.checkCircleMuted]}>
                                    <Ionicons
                                        name={captured ? "checkmark" : "close"}
                                        size={14}
                                        color={COLORS.white}
                                    />
                                </View>
                                <Text style={[styles.pointLabel, !captured && styles.pointLabelMuted]}>
                                    {point.label}
                                </Text>
                            </View>
                        );
                    })}
                </View>
            </View>
        ))}

        <Pressable style={styles.finishBtn} onPress={handleFinish}>
          <Text style={styles.finishBtnText}>FINISH & PROCEED TO AUCTION</Text>
          <Ionicons name="arrow-forward" size={20} color={COLORS.white} style={{ marginLeft: 8 }} />
        </Pressable>
        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function DocStatus({ label, uploaded }: { label: string, uploaded: boolean }) {
    return (
        <View style={styles.docItem}>
            <View style={[styles.docCircle, { backgroundColor: uploaded ? COLORS.success : '#f1f5f9' }]}>
                <MaterialCommunityIcons
                    name={uploaded ? "file-check" : "file-remove-outline"}
                    size={20}
                    color={uploaded ? COLORS.white : COLORS.muted}
                />
            </View>
            <Text style={[styles.docLabel, !uploaded && { color: COLORS.muted }]}>{label}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.bg },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 15, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  headerTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },

  content: { padding: 16 },

  vehicleHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: COLORS.white,
      padding: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      marginBottom: 16
  },
  titleArea: { flex: 1 },
  carTitle: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginTop: 8, flexWrap: 'wrap', gap: 8 },
  regTag: { backgroundColor: '#eff6ff', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4, borderWidth: 1, borderColor: '#bfdbfe' },
  regText: { fontSize: 11, fontWeight: '800', color: COLORS.primary },
  metaText: { fontSize: 12, color: COLORS.muted, fontWeight: '500' },
  priceTag: { alignItems: 'flex-end', marginLeft: 10 },
  priceLabel: { fontSize: 10, color: COLORS.muted, fontWeight: '700', textTransform: 'uppercase' },
  priceValue: { fontSize: 18, fontWeight: '900', color: COLORS.warning, marginTop: 2 },

  card: { backgroundColor: COLORS.white, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 16, overflow: 'hidden' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', padding: 12, borderBottomWidth: 1, borderBottomColor: COLORS.border, backgroundColor: '#fdfdfd' },
  cardTitle: { fontSize: 14, fontWeight: '800', color: COLORS.text, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitleMain: { fontSize: 14, fontWeight: '800', color: COLORS.text, marginBottom: 15, textTransform: 'uppercase', letterSpacing: 0.5 },
  cardBody: { padding: 12 },

  detailGrid: { flexDirection: 'row', flexWrap: 'wrap' },
  detailItem: { width: '50%', marginBottom: 12, paddingRight: 8 },
  detailLabel: { fontSize: 11, color: COLORS.muted, marginBottom: 2, fontWeight: '600' },
  detailValue: { fontSize: 13, color: COLORS.text, fontWeight: '700' },

  docCard: { backgroundColor: COLORS.white, padding: 16, borderRadius: 12, borderWidth: 1, borderColor: COLORS.border, marginBottom: 24 },
  docRow: { flexDirection: 'row', justifyContent: 'space-between' },
  docItem: { alignItems: 'center', flex: 1 },
  docCircle: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center', marginBottom: 6 },
  docLabel: { fontSize: 11, fontWeight: '700', color: COLORS.text },

  sectionHeader: { marginBottom: 16 },
  sectionTitleMain: { fontSize: 18, fontWeight: '800', color: COLORS.text },
  sectionDesc: { fontSize: 13, color: COLORS.muted, marginTop: 2 },

  section: { marginBottom: 20 },
  categoryTitle: { fontSize: 14, fontWeight: '700', color: COLORS.muted, marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pointItem: { width: '48.5%', backgroundColor: COLORS.white, borderRadius: 8, padding: 10, flexDirection: 'row', alignItems: 'center', gap: 8, borderWidth: 1, borderColor: COLORS.border },
  pointItemMuted: { backgroundColor: '#f8fafc', borderColor: '#f1f5f9' },
  checkCircle: { width: 22, height: 22, borderRadius: 11, backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center' },
  checkCircleMuted: { backgroundColor: '#cbd5e1' },
  pointLabel: { fontSize: 12, color: COLORS.text, fontWeight: '600', flex: 1 },
  pointLabelMuted: { color: COLORS.muted },

  finishBtn: { backgroundColor: COLORS.primary, height: 56, borderRadius: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 10, elevation: 2 },
  finishBtnText: { color: COLORS.white, fontSize: 16, fontWeight: '800' },
});

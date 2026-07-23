import React, { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

interface BidPopupProps {
  visible: boolean;
  onClose: () => void;
  onSubmit: (finalOffer: number) => void;
  initialOffer: number;
}

export default function BidPopup({ visible, onClose, onSubmit, initialOffer }: BidPopupProps) {
  const stepRate = 10000;
  const [offer, setOffer] = useState(initialOffer + stepRate);

  const incrementOffer = () => setOffer((prev) => prev + stepRate);
  const decrementOffer = () => setOffer((prev) => Math.max(initialOffer, prev - stepRate));

  const addAmount = (amount: number) => setOffer((prev) => prev + amount);

  const formatPrice = (num: number) => {
    return '₹ ' + num.toLocaleString('en-IN');
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      {/* Dimmed Background */}
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />

        {/* Popup Container */}
        <View style={styles.popup}>
          
          <View style={styles.header}>
            <Text style={styles.title}>Update your offer</Text>
            <View style={styles.timerBox}>
              <Text style={styles.clockIcon}>🕒</Text>
              <Text style={styles.timerText}>Time Left: <Text style={styles.timerHighlight}>11M:20Sec</Text></Text>
            </View>
          </View>

          <View style={styles.offerSummary}>
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>You Offered</Text>
              <Text style={styles.summaryValue}>{formatPrice(initialOffer)}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryCol}>
              <Text style={styles.summaryLabel}>Step Rate</Text>
              <Text style={styles.summaryValue}>{formatPrice(stepRate)}</Text>
            </View>
          </View>

          <Text style={styles.newOfferLabel}>Your New Offer:</Text>

          <View style={styles.stepperContainer}>
            <Pressable style={styles.stepBtnRed} onPress={decrementOffer}>
              <Text style={styles.stepBtnTextRed}>−</Text>
            </Pressable>
            <Text style={styles.newOfferValue}>{formatPrice(offer)}</Text>
            <Pressable style={styles.stepBtnGreen} onPress={incrementOffer}>
              <Text style={styles.stepBtnTextGreen}>+</Text>
            </Pressable>
          </View>

          <View style={styles.hDivider} />

          <View style={styles.quickAddRow}>
            {[5000, 10000, 15000].map((amount) => (
              <Pressable
                key={amount}
                style={styles.quickAddBtn}
                onPress={() => addAmount(amount)}
              >
                <Text style={styles.quickAddText}>+ {formatPrice(amount).replace(' ', '')}</Text>
              </Pressable>
            ))}
          </View>

          <Pressable
            style={styles.submitBtn}
            onPress={() => {
              onSubmit(offer);
              onClose();
            }}
          >
            <Text style={styles.submitBtnText}>
              SUBMIT YOUR OFFER AT {formatPrice(offer)}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  popup: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#111827',
  },
  timerBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  timerText: {
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#374151',
  },
  timerHighlight: {
    color: '#ef4444',
    fontFamily: 'OpenSans_600SemiBold',
  },
  offerSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    paddingVertical: 16,
    marginBottom: 24,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  divider: {
    width: 1,
    height: '100%',
    backgroundColor: '#e5e7eb',
  },
  summaryLabel: {
    fontSize: 13,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#6b7280',
    marginBottom: 6,
  },
  summaryValue: {
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#111827',
  },
  newOfferLabel: {
    fontSize: 16,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#111827',
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  stepBtnRed: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnTextRed: {
    fontSize: 24,
    color: '#ef4444',
    lineHeight: 26,
    fontFamily: 'OpenSans_600SemiBold',
  },
  newOfferValue: {
    fontSize: 28,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#111827',
  },
  stepBtnGreen: {
    width: 48,
    height: 48,
    borderWidth: 1,
    borderColor: '#22c55e',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnTextGreen: {
    fontSize: 24,
    color: '#22c55e',
    lineHeight: 26,
    fontFamily: 'OpenSans_600SemiBold',
  },
  hDivider: {
    height: 1,
    backgroundColor: '#f3f4f6',
    marginVertical: 20,
  },
  quickAddRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickAddBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 4,
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  quickAddText: {
    fontSize: 14,
    fontFamily: 'OpenSans_600SemiBold',
    color: '#111827',
  },
  submitBtn: {
    backgroundColor: '#2563eb',
    borderRadius: 6,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#ffffff',
    fontFamily: 'OpenSans_600SemiBold',
    fontSize: 14,
    letterSpacing: 0.5,
  },
});

<<<<<<< HEAD
import React from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  Pressable,
  FlatList,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface BottomSelectModalProps {
=======
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  FlatList,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, FONTS } from '../theme';

const { height: SCREEN_H } = Dimensions.get('window');

interface Props {
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  visible: boolean;
  title: string;
  data: string[];
  selectedValue: string;
  onSelect: (val: string) => void;
  onClose: () => void;
}

<<<<<<< HEAD
const BottomSelectModal: React.FC<BottomSelectModalProps> = ({
=======
export default function BottomSelectModal({
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
  visible,
  title,
  data,
  selectedValue,
  onSelect,
  onClose,
<<<<<<< HEAD
}) => {
  return (
    <Modal visible={visible} transparent animationType="slide" statusBarTranslucent={true}>
      <View style={styles.overlay}>
        <Pressable style={styles.dismissArea} onPress={onClose} />
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={24} color="#000" />
            </Pressable>
          </View>
          <FlatList
            data={data}
            keyExtractor={(item) => item}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.listContent}
            renderItem={({ item }) => (
              <Pressable
                style={[styles.item, selectedValue === item && styles.itemActive]}
                onPress={() => {
                  onSelect(item);
                  onClose();
                }}
              >
                <Text style={[styles.itemText, selectedValue === item && styles.itemTextActive]}>
                  {item}
                </Text>
                {selectedValue === item && (
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.secondary} />
                )}
              </Pressable>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  dismissArea: {
    flex: 1,
  },
  content: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_H * 0.8,
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  closeBtn: {
    padding: 4,
  },
  listContent: {
    paddingBottom: 20,
  },
  item: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#f8fafc',
  },
  itemActive: {
    backgroundColor: '#eff6ff',
  },
  itemText: {
    fontSize: 16,
=======
}: Props) {
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const slideY = useRef(new Animated.Value(SCREEN_H)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
        Animated.spring(slideY, {
          toValue: 0,
          useNativeDriver: true,
          bounciness: 1,
          speed: 16,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(slideY, {
          toValue: SCREEN_H,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.root}>
        {/* Dimmed backdrop — tappable to dismiss */}
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={onClose} />
        </Animated.View>

        {/* Sliding sheet */}
        <Animated.View style={[styles.sheet, { transform: [{ translateY: slideY }] }]}>
          {/* Drag handle */}
          <View style={styles.handle} />

          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <Pressable onPress={onClose} hitSlop={10} style={styles.closeBtn}>
              <Ionicons name="close" size={18} color={COLORS.black2} />
            </Pressable>
          </View>

          {/* Options list */}
          <FlatList
            data={data}
            keyExtractor={item => item}
            showsVerticalScrollIndicator={false}
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = selectedValue === item;
              return (
                <Pressable
                  style={({ pressed }) => [
                    styles.item,
                    isSelected && styles.itemActive,
                    pressed && styles.itemPressed,
                  ]}
                  onPress={() => {
                    onSelect(item);
                    onClose();
                  }}
                >
                  <Text style={[styles.itemText, isSelected && styles.itemTextActive]}>
                    {item}
                  </Text>
                  {isSelected && (
                    <View style={styles.checkCircle}>
                      <Ionicons name="checkmark" size={13} color="#fff" />
                    </View>
                  )}
                </Pressable>
              );
            }}
          />
          <View style={{ height: 24 }} />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.52)',
  },
  sheet: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    maxHeight: SCREEN_H * 0.72,
    elevation: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -6 },
    shadowOpacity: 0.14,
    shadowRadius: 20,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 2,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.black2,
  },
  closeBtn: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingTop: 4,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  itemActive: {
    backgroundColor: '#EFF6FF',
  },
  itemPressed: {
    backgroundColor: '#F8FAFC',
  },
  itemText: {
    flex: 1,
    fontSize: 15,
    fontFamily: FONTS.poppins.medium,
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b
    color: '#334155',
  },
  itemTextActive: {
    color: COLORS.secondary,
<<<<<<< HEAD
    fontWeight: 'bold',
  },
});

export default BottomSelectModal;
=======
    fontFamily: FONTS.poppins.bold,
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
});
>>>>>>> c89a25ad7a2d764f99f5102b91ee091f0c85127b

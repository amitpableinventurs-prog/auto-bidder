import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Pressable,
  Image,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { COLORS, FONTS } from '../theme';
import Logo from './Logo';
import { useAuth } from '../AuthContext';
import { useAppStore } from '../store/useAppStore';

interface MainHeaderProps {
  navigation: any;
  options?: any;
  route?: any;
  showSearch?: boolean;
}

const MainHeader = ({ navigation, options, route, showSearch = false }: MainHeaderProps) => {
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { selectedCity } = useAppStore();

  const title = options?.headerTitle || options?.title || route?.name;
  const showBack = navigation.canGoBack();
  const isHome = route?.name === 'Home';
  const rootScreens = ['Home', 'BuyCar', 'SellCar', 'Activity', 'DNP', 'MainTabs', 'MainDrawer'];
  const isRoot = rootScreens.includes(route?.name);

  const handleMenuPress = () => {
    navigation.dispatch(DrawerActions.openDrawer());
  };

  const handleNotificationPress = () => {
    navigation.navigate('MainDrawer', {
      screen: 'MainTabs',
      params: {
        screen: 'Activity',
        params: { initialTab: 'Notifications' },
      },
    } as any);
  };

  return (
    <View style={[styles.container, {
      paddingTop: insets.top,
      paddingLeft: insets.left,
      paddingRight: insets.right
    }]}>
      {/* Top Row: Logo and Icons */}
      <View style={styles.headerContent}>
        <View style={styles.leftSection}>
          {showBack && !isRoot ? (
            <View style={styles.backContainer}>
              <Pressable
                onPress={() => navigation.goBack()}
                style={styles.backBtn}
              >
                <Ionicons name="chevron-back" size={28} color={COLORS.black1} />
              </Pressable>
              <Text style={styles.headerTitle} numberOfLines={1}>{title}</Text>
            </View>
          ) : (
            <View style={styles.homeLeft}>
              {!showSearch && (
                <Pressable style={styles.menuBtn} onPress={handleMenuPress}>
                  <Ionicons name="menu-outline" size={28} color={COLORS.black1} />
                </Pressable>
              )}
              <Logo height={38} width={150} />
            </View>
          )}
        </View>

        <View style={styles.rightSection}>
          <Pressable style={styles.locationHeader} onPress={() => navigation.navigate('Location', {})}>
            <Ionicons name="location-outline" size={16} color={COLORS.black2} />
          </Pressable>

          <Pressable
            style={styles.iconBtn}
            onPress={handleNotificationPress}
          >
            <View style={styles.notifWrapper}>
              <Ionicons name="notifications-outline" size={24} color={COLORS.black1} />
              <View style={styles.notifDot} />
            </View>
          </Pressable>

          <Pressable
            style={styles.avatarBtn}
            onPress={() => navigation.navigate('Profile')}
          >
            <View style={styles.avatarWrapper}>
              <Image
                source={{ uri: user?.avatarUrl || "https://i.pravatar.cc/100" }}
                style={styles.avatar}
              />
            </View>
          </Pressable>
        </View>
      </View>

      {/* Bottom Row: Menu and Search (Optional) */}
      {showSearch && (
        <View style={styles.searchSection}>
          <View style={styles.searchRow}>
            <Pressable style={styles.menuBtnDark} onPress={handleMenuPress}>
              <Ionicons name="menu-outline" size={32} color={COLORS.white} />
            </Pressable>
            <Pressable style={styles.searchBarContainer} onPress={() => navigation.navigate('CarFilter')}>
              <View style={styles.searchInputWrapper}>
                <Ionicons name="search-outline" size={22} color={COLORS.textDim} />
                <View style={styles.searchPlaceholderBox}>
                  <Text style={styles.searchPlaceholderText}>Search for </Text>
                  <Text style={styles.placeholderHighlight}>"New Cars"</Text>
                </View>
              </View>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    zIndex: 1000,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  headerContent: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
  },
  leftSection: {
    flex: 1,
    justifyContent: 'center',
  },
  homeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuBtn: {
    padding: 4,
    marginLeft: -4,
  },
  menuBtnDark: {
    padding: 4,
    marginLeft: -4,
  },
  backContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  locationHeader: {
    padding: 4,
  },
  notifWrapper: {
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 1,
    right: 1,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: COLORS.coral,
    borderWidth: 1,
    borderColor: COLORS.white,
  },
  backBtn: {
    padding: 4,
    marginLeft: -4,
    marginRight: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.text,
  },
  iconBtn: {
    padding: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarBtn: {
    marginLeft: 2,
  },
  avatarWrapper: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: COLORS.secondary,
    padding: 2,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 18,
    backgroundColor: COLORS.lightGrey2,
  },
  searchSection: {
    backgroundColor: COLORS.darkNavy,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  searchBarContainer: {
    flex: 1,
    height: 48,
    backgroundColor: COLORS.white,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },
  searchInputWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
  },
  searchPlaceholderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  searchPlaceholderText: {
    fontSize: 15,
    color: COLORS.textDim,
    fontFamily: FONTS.openSans.regular,
  },
  placeholderHighlight: {
    color: COLORS.secondary,
    fontSize: 15,
    fontFamily: FONTS.poppins.bold,
  },
});

export default MainHeader;

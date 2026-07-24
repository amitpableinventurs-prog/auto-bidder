import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Pressable,
  ScrollView,
  Alert,
} from 'react-native';
import {
  DrawerContentComponentProps,
  DrawerContentScrollView,
} from '@react-navigation/drawer';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons, MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useAuth } from '../AuthContext';
import { COLORS, FONTS } from '../theme';
import { RootStackParamList } from '../navigation/types';

interface DrawerItemProps {
  label: string;
  icon: any;
  IconComponent?: any;
  onPress: () => void;
  color?: string;
}

const DrawerItem = ({ label, icon, IconComponent = Ionicons, onPress, color = COLORS.text }: DrawerItemProps) => (
  <Pressable style={styles.drawerItem} onPress={onPress}>
    <IconComponent name={icon} size={22} color={color} style={styles.itemIcon} />
    <Text style={[styles.itemLabel, { color }]}>{label}</Text>
  </Pressable>
);

const SectionHeader = ({ title }: { title: string }) => (
  <View style={styles.sectionHeader}>
    <Text style={styles.sectionTitle}>{title}</Text>
  </View>
);

export default function CustomDrawerContent(props: DrawerContentComponentProps) {
  const { user, logout } = useAuth();
  const { navigation } = props;

  // Root stack navigation — required for screens not registered in the drawer
  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();

  const goTo = (screen: keyof RootStackParamList, params?: any) => {
    navigation.closeDrawer();
    rootNav?.navigate(screen as any, params);
  };

  const goToTab = (tab: string) => {
    navigation.closeDrawer();
    navigation.navigate('MainTabs' as any, { screen: tab });
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          onPress: () => {
            logout();
            navigation.closeDrawer();
            rootNav?.reset({ index: 0, routes: [{ name: 'Login' }] });
          },
          style: 'destructive',
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image
          source={{ uri: user?.avatarUrl || 'https://i.pravatar.cc/150' }}
          style={styles.avatar}
        />
        <View style={styles.headerInfo}>
          <Text style={styles.userName}>{user?.name || 'Guest User'}</Text>
          <Text style={styles.userPhone}>{user?.phone || 'No phone number'}</Text>
        </View>
        <Pressable onPress={() => goTo('Profile')}>
          <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
        </Pressable>
      </View>

      <DrawerContentScrollView {...props} contentContainerStyle={styles.scrollViewContent}>

        <SectionHeader title="📱 Main Navigation" />
        <DrawerItem
          label="New Cars"
          icon="car-sport-outline"
          onPress={() => goToTab('BuyCar')}
        />
        <DrawerItem
          label="Browse Your Next Pre-Loved Car"
          icon="search-outline"
          onPress={() => goToTab('BuyCar')}
        />
        <DrawerItem
          label="Favourite"
          icon="heart-outline"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Activity', params: { initialTab: 'Saved Cars' } } as any)}
        />
        <DrawerItem
          label="Seller Dashboard"
          icon="speedometer-outline"
          onPress={() => goTo('SellerDashboard')}
        />
        <DrawerItem
          label="Offers & Activity"
          icon="time-outline"
          onPress={() => navigation.navigate('MainTabs', { screen: 'Activity', params: { initialTab: 'Bids Placed' } } as any)}
        />

        <View style={styles.divider} />

        <SectionHeader title="🚗 Business & Partners" />
        <DrawerItem
          label="Direct Network Partners"
          icon="people-outline"
          onPress={() => goToTab('DNP')}
        />
        <DrawerItem
          label="Dealer"
          icon="business-outline"
          onPress={() => goTo('PlaceholderScreen', { title: 'Dealer' })}
        />

        <View style={styles.divider} />

        <SectionHeader title="💰 Financial Services" />
        <DrawerItem
          label="Loans"
          icon="cash-outline"
          onPress={() => goTo('PlaceholderScreen', { title: 'Loans' })}
        />
        <DrawerItem
          label="Insurance"
          icon="shield-checkmark-outline"
          onPress={() => goTo('PlaceholderScreen', { title: 'Insurance' })}
        />

        <View style={styles.divider} />

        <SectionHeader title="📄 Vehicle Services" />
        <DrawerItem
          label="RTO Services"
          icon="document-text-outline"
          onPress={() => goTo('RtoServices')}
        />
        <DrawerItem
          label="Challans"
          icon="receipt-outline"
          onPress={() => goTo('Challans')}
        />

        <View style={styles.divider} />

        <SectionHeader title="⚙️ Account" />
        <DrawerItem
          label="Help & Support"
          icon="help-circle-outline"
          onPress={() => goTo('HelpCenter')}
        />
        <DrawerItem
          label="Settings"
          icon="settings-outline"
          onPress={() => goTo('Settings')}
        />
        <DrawerItem
          label="Privacy Policy"
          icon="lock-closed-outline"
          onPress={() => goTo('PrivacyPolicy')}
        />
        <DrawerItem
          label="Logout"
          icon="log-out-outline"
          onPress={handleLogout}
          color={COLORS.coral}
        />

      </DrawerContentScrollView>

      {/* Footer Version */}
      <View style={styles.footer}>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: COLORS.lightBlue1,
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGrey1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  headerInfo: {
    flex: 1,
    marginLeft: 15,
  },
  userName: {
    fontSize: 16,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.text,
  },
  userPhone: {
    fontSize: 12,
    fontFamily: FONTS.openSans.regular,
    color: COLORS.textMuted,
  },
  scrollViewContent: {
    paddingTop: 10,
  },
  sectionHeader: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 5,
  },
  sectionTitle: {
    fontSize: 12,
    fontFamily: FONTS.poppins.bold,
    color: COLORS.secondary,
    textTransform: 'uppercase',
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  itemIcon: {
    width: 30,
  },
  itemLabel: {
    fontSize: 14,
    fontFamily: FONTS.openSans.semiBold,
    marginLeft: 10,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.lightGrey1,
    marginHorizontal: 20,
    marginVertical: 10,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGrey1,
  },
  versionText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});

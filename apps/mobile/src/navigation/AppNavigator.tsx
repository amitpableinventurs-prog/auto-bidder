import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { RootStackParamList, MainTabParamList, DrawerParamList } from './types';
import { useAuth } from '../AuthContext';
import { View, Text, Pressable, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import CustomDrawerContent from '../components/CustomDrawerContent';
import { TAB_BAR_HEIGHT } from '../theme';

// Helper to handle default exports more robustly
const resolve = (m: any) => m.default || m;

import * as LocationSearchMod from "../screens/LocationSearch";
import * as OtpVerificationMod from "../screens/OtpVerification";
import * as CompleteProfileMod from "../screens/CompleteProfile";
import * as KYCVerificationMod from "../screens/KYCVerification";
import * as PhoneLoginOnboardingMod from "../screens/PhoneLoginOnboarding";
import * as RegisterMod from "../screens/Register";
import * as MainHomeMod from "../screens/MainHome";
import * as FillCarDetailsMod from "../screens/FillCarDetails";
import * as BuyCarListMod from "../screens/BuyCarList";
import * as SellerMeetingOptionsMod from "../screens/SellerMeetingOptions";
import * as RtoNocModuleMod from "../screens/RtoNocModule";
import * as CarSearchFilterMod from "../screens/CarSearchFilter";
import * as SellCarMod from "../screens/SellCar";
import * as PlaceBidMod from "../screens/PlaceBid";
import * as UpdateOfferMod from "../screens/UpdateOffer";
import * as NotificationsMod from "../screens/Notifications";
import * as CameraGuidanceMod from "../screens/CameraGuidance";
import * as CarCameraMod from "../screens/CarCamera";
import * as SplashScreenMod from "../screens/SplashScreen";
import * as CarDetailsMod from "../screens/CarDetails";
import * as LiveAuctionMod from "../screens/LiveAuction";
import * as ProfileMod from "../screens/Profile";
import * as EditProfileMod from "../screens/EditProfile";
import * as WalletMod from "../screens/Wallet";
import * as SettingsMod from "../screens/Settings";
import * as PlaceholderScreenMod from "../screens/PlaceholderScreen";
import * as SellerDashboardMod from "../screens/SellerDashboard";
import * as AuctionSetupMod from "../screens/AuctionSetup";
import * as InspectionReportMod from "../screens/InspectionReport";
import * as ListingManagementMod from "../screens/ListingManagement";
import * as EarningsDashboardMod from "../screens/EarningsDashboard";
import * as SoldVehiclesMod from "../screens/SoldVehicles";
import * as PurchaseHistoryMod from "../screens/PurchaseHistory";
import * as ActivityMod from "../screens/Activity";
import * as DNPScreenMod from "../screens/DNP";
import * as DNPOnboardingMod from "../screens/DNPOnboarding";
import * as DNPActivationMod from "../screens/DNPActivation";
import * as DNPDashboardMod from "../screens/DNPDashboard";
import * as DNPLeadsMod from "../screens/DNPLeads";
import * as DNPListingsMod from "../screens/DNPListings";
import * as DNPWalletMod from "../screens/DNPWallet";
import * as DNPWithdrawMod from "../screens/DNPWithdraw";
import * as DNPVehicleAcquisitionMod from "../screens/DNPVehicleAcquisition";
import * as DNPShareListingMod from "../screens/DNPShareListing";
import * as TermsOfServiceMod from "../screens/TermsOfService";
import * as PrivacyPolicyMod from "../screens/PrivacyPolicy";
import * as BrandDetailsMod from "../screens/BrandDetails";

// Admin Screens
import * as AdminDashboardMod from "../screens/admin/AdminDashboard";
import * as AdminUserManagementMod from "../screens/admin/AdminUserManagement";
import * as AdminSellerVerificationMod from "../screens/admin/AdminSellerVerification";
import * as AdminVehicleVerificationMod from "../screens/admin/AdminVehicleVerification";
import * as AdminRevenueAnalyticsMod from "../screens/admin/AdminRevenueAnalytics";
import * as AdminNewsManagementMod from "../screens/admin/AdminNewsManagement";

const LocationSearch = resolve(LocationSearchMod);
const OtpVerification = resolve(OtpVerificationMod);
const CompleteProfile = resolve(CompleteProfileMod);
const KYCVerification = resolve(KYCVerificationMod);
const PhoneLoginOnboarding = resolve(PhoneLoginOnboardingMod);
const Register = resolve(RegisterMod);
const MainHome = resolve(MainHomeMod);
const FillCarDetails = resolve(FillCarDetailsMod);
const BuyCarList = resolve(BuyCarListMod);
const SellerMeetingOptions = resolve(SellerMeetingOptionsMod);
const RtoNocModule = resolve(RtoNocModuleMod);
const CarSearchFilter = resolve(CarSearchFilterMod);
const SellCar = resolve(SellCarMod);
const PlaceBid = resolve(PlaceBidMod);
const UpdateOffer = resolve(UpdateOfferMod);
const Notifications = resolve(NotificationsMod);
const CameraGuidance = resolve(CameraGuidanceMod);
const CarCamera = resolve(CarCameraMod);
const SplashScreen = resolve(SplashScreenMod);
const CarDetails = resolve(CarDetailsMod);
const LiveAuction = resolve(LiveAuctionMod);
const Profile = resolve(ProfileMod);
const EditProfile = resolve(EditProfileMod);
const Wallet = resolve(WalletMod);
const Settings = resolve(SettingsMod);
const PlaceholderScreen = resolve(PlaceholderScreenMod);
const SellerDashboard = resolve(SellerDashboardMod);
const AuctionSetup = resolve(AuctionSetupMod);
const InspectionReport = resolve(InspectionReportMod);
const ListingManagement = resolve(ListingManagementMod);
const EarningsDashboard = resolve(EarningsDashboardMod);
const SoldVehicles = resolve(SoldVehiclesMod);
const PurchaseHistory = resolve(PurchaseHistoryMod);
const Activity = resolve(ActivityMod);
const DNPScreen = resolve(DNPScreenMod);
const DNPOnboarding = resolve(DNPOnboardingMod);
const DNPActivation = resolve(DNPActivationMod);
const DNPDashboard = resolve(DNPDashboardMod);
const DNPLeads = resolve(DNPLeadsMod);
const DNPListings = resolve(DNPListingsMod);
const DNPWallet = resolve(DNPWalletMod);
const DNPWithdraw = resolve(DNPWithdrawMod);
const DNPVehicleAcquisition = resolve(DNPVehicleAcquisitionMod);
const DNPShareListing = resolve(DNPShareListingMod);
const TermsOfService = resolve(TermsOfServiceMod);
const PrivacyPolicy = resolve(PrivacyPolicyMod);
const BrandDetails = resolve(BrandDetailsMod);

const AdminDashboard = resolve(AdminDashboardMod);
const AdminUserManagement = resolve(AdminUserManagementMod);
const AdminSellerVerification = resolve(AdminSellerVerificationMod);
const AdminVehicleVerification = resolve(AdminVehicleVerificationMod);
const AdminRevenueAnalytics = resolve(AdminRevenueAnalyticsMod);
const AdminNewsManagement = resolve(AdminNewsManagementMod);

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();
const Drawer = createDrawerNavigator<DrawerParamList>();

function TabBar({ state, descriptors, navigation }: any) {
  const insets = useSafeAreaInsets();
  const ACTIVE_COLOR = "#FFC307";
  const INACTIVE_COLOR = "rgba(255,255,255,0.7)";

  return (
    <View style={[styles.tabRoot, {
      paddingBottom: insets.bottom,
      paddingLeft: insets.left,
      paddingRight: insets.right,
      height: TAB_BAR_HEIGHT + insets.bottom
    }]}>
      {state.routes.map((route: any, index: number) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        if (route.name === 'SellCar') {
          return (
            <View key={route.name} style={styles.sellTabContainer}>
              <Pressable onPress={onPress} style={styles.sellTabCircle}>
                 <View style={styles.shutterIcon}>
                    <MaterialCommunityIcons name="camera-iris" size={42} color="#fff" />
                    <View style={styles.innerCarIcon}>
                       <MaterialCommunityIcons name="car" size={18} color="#fff" />
                    </View>
                 </View>
              </Pressable>
              <Text style={[styles.tabLabel, { marginTop: 4 }, isFocused && styles.tabLabelActive]}>Sell Car</Text>
            </View>
          );
        }

        let iconName: any;
        let IconComponent: any = Ionicons;
        let label = route.name;

        if (route.name === 'Home') {
          iconName = isFocused ? "home" : "home-outline";
          label = "Home";
        } else if (route.name === 'BuyCar') {
          iconName = isFocused ? "car" : "car-outline";
          IconComponent = MaterialCommunityIcons;
          label = "Buy Car";
        } else if (route.name === 'Activity') {
          iconName = "steering";
          IconComponent = MaterialCommunityIcons;
          label = "Activity";
        } else if (route.name === 'DNP') {
          iconName = "google-circles-extended";
          IconComponent = MaterialCommunityIcons;
          label = "DNP";
        }

        return (
          <React.Fragment key={route.name}>
            {index > 0 && route.name !== 'SellCar' && state.routes[index-1].name !== 'SellCar' && <View style={styles.divider} />}
            <Pressable onPress={onPress} style={styles.tabItem}>
              {route.name === 'DNP' ? (
                <Image
                  source={require('../../assets/DNP (2).png')}
                  style={{
                    width: 24,
                    height: 24
                  }}
                  tintColor={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                  resizeMode="contain"
                />
              ) : (
                <IconComponent
                  name={iconName}
                  size={24}
                  color={isFocused ? ACTIVE_COLOR : INACTIVE_COLOR}
                />
              )}
              <Text style={[styles.tabLabel, isFocused && styles.tabLabelActive]}>{label}</Text>
            </Pressable>
          </React.Fragment>
        );
      })}
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      id="MainTabNavigator"
      tabBar={props => <TabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home" component={MainHome} />
      <Tab.Screen name="BuyCar" component={BuyCarList} />
      <Tab.Screen name="SellCar" component={SellCar} />
      <Tab.Screen name="Activity" component={Activity} />
      <Tab.Screen name="DNP" component={DNPScreen} />
    </Tab.Navigator>
  );
}

function MainDrawer() {
  const insets = useSafeAreaInsets();
  return (
    <Drawer.Navigator
      id="MainDrawerNavigator"
      drawerContent={(props) => <CustomDrawerContent {...props} />}
      screenOptions={{
        headerShown: false,
        drawerType: 'front',
        drawerStyle: {
          width: 300,
          marginBottom: TAB_BAR_HEIGHT + insets.bottom,
          borderBottomRightRadius: 24,
        },
        overlayColor: 'rgba(0,0,0,0.5)',
      }}
    >
      <Drawer.Screen name="MainTabs" component={MainTabs} />
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const { user } = useAuth();

  return (
    <Stack.Navigator id="RootStackNavigator" screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Splash" component={SplashScreen} />

      {/* Auth Stack */}
      <Stack.Group>
        <Stack.Screen name="Login" component={PhoneLoginOnboarding} />
        <Stack.Screen name="Register" component={Register} />
        <Stack.Screen name="Otp" component={OtpVerification} />
        <Stack.Screen name="CompleteProfile" component={CompleteProfile} />
        <Stack.Screen name="Kyc" component={KYCVerification} />
      </Stack.Group>

      <Stack.Screen name="Location" component={LocationSearch} />

      {/* Main Flow */}
      <Stack.Screen name="MainDrawer" component={MainDrawer} />

      {/* Details & Other Screens */}
      <Stack.Screen name="CarDetails" component={CarDetails} />
      <Stack.Screen name="BrandDetails" component={BrandDetails} />
      <Stack.Screen name="LiveAuction" component={LiveAuction} />
      <Stack.Screen name="PlaceBid" component={PlaceBid} />
      <Stack.Screen name="UpdateOffer" component={UpdateOffer} />
      <Stack.Screen name="Notifications" component={Notifications} />
      <Stack.Screen name="CarFilter" component={CarSearchFilter} />
      <Stack.Screen name="SellerMeetingOptions" component={SellerMeetingOptions} />
      <Stack.Screen name="PlaceholderScreen" component={PlaceholderScreen} />

      {/* DNP Flow */}
      <Stack.Group>
        <Stack.Screen name="DNPOnboarding" component={DNPOnboarding} />
        <Stack.Screen name="DNPActivation" component={DNPActivation} />
        <Stack.Screen name="DNPDashboard" component={DNPDashboard} />
        <Stack.Screen name="DNPLeads" component={DNPLeads} />
        <Stack.Screen name="DNPListings" component={DNPListings} />
        <Stack.Screen name="DNPWallet" component={DNPWallet} />
        <Stack.Screen name="DNPWithdraw" component={DNPWithdraw} />
        <Stack.Screen name="DNPVehicleAcquisition" component={DNPVehicleAcquisition} />
        <Stack.Screen name="DNPShareListing" component={DNPShareListing} />
      </Stack.Group>

      {/* Seller Screens */}
      <Stack.Group>
        <Stack.Screen name="SellerDashboard" component={SellerDashboard} />
        <Stack.Screen name="SellCarNew" component={SellCar} />
        <Stack.Screen name="FillDetails" component={FillCarDetails} />
        <Stack.Screen name="CameraGuidance" component={CameraGuidance} />
        <Stack.Screen name="CarCamera" component={CarCamera} />
        <Stack.Screen name="ListingDocuments" component={FillCarDetails} initialParams={{ initialTab: 'basic' }} />
        <Stack.Screen name="InspectionReport" component={InspectionReport} />
        <Stack.Screen name="AuctionSetup" component={AuctionSetup} />
        <Stack.Screen name="ListingManagement" component={ListingManagement} />
        <Stack.Screen name="Earnings" component={EarningsDashboard} />
        <Stack.Screen name="SoldVehicles" component={SoldVehicles} />
      </Stack.Group>

      {/* Profile & Settings */}
      <Stack.Group>
        <Stack.Screen name="Profile" component={Profile} />
        <Stack.Screen name="EditProfile" component={EditProfile} />
        <Stack.Screen name="Wallet" component={Wallet} />
        <Stack.Screen name="History" component={PurchaseHistory} />
        <Stack.Screen name="Settings" component={Settings} />
        <Stack.Screen name="TermsOfService" component={TermsOfService} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicy} />
      </Stack.Group>

      {/* Admin Flow */}
      <Stack.Group>
        <Stack.Screen name="AdminDashboard" component={AdminDashboard} />
        <Stack.Screen name="AdminUsers" component={AdminUserManagement} />
        <Stack.Screen name="AdminSellerVerif" component={AdminSellerVerification} />
        <Stack.Screen name="AdminVehicleVerif" component={AdminVehicleVerification} />
        <Stack.Screen name="AdminRevenue" component={AdminRevenueAnalytics} />
        <Stack.Screen name="AdminNews" component={AdminNewsManagement} />
      </Stack.Group>
    </Stack.Navigator>
  );
}

const styles = StyleSheet.create({
  tabRoot: {
    flexDirection: "row",
    backgroundColor: "#0d1121",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "space-around",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 30,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1, gap: 4 },
  divider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
  },
  tabLabel: { fontSize: 12, color: "rgba(255,255,255,0.7)", fontWeight: '600' },
  tabLabelActive: { color: "#FFC307" },
  sellTabContainer: { flex: 1.2, alignItems: "center", marginTop: -40 },
  sellTabCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: "#2668E8",
    alignItems: "center",
    justifyContent: "center",
    elevation: 10,
    borderWidth: 6,
    borderColor: "#0a0d14",
  },
  shutterIcon: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCarIcon: {
    position: 'absolute',
  },
});

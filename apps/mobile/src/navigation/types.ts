import { ApiListing } from "../api";

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Register: undefined;
  Otp: {
    phoneNumber: string;
    registrationData?: {
      name: string;
      email: string;
      userType: 'OWNER' | 'DEALER';
    }
  };
  CompleteProfile: undefined;
  Kyc: undefined;
  Location: { onBack?: () => void } | undefined;
  MainDrawer: { screen?: string; params?: any } | undefined;
  CarDetails: { listingId: string };
  LiveAuction: { listingId: string };
  PlaceBid: { listingId: string };
  UpdateOffer: { listingId: string };
  SellCarNew: undefined;
  SellerDashboard: undefined;
  FillDetails: { listingToEdit?: ApiListing | null; initialTab?: string; carType?: string; brand?: string; listingData?: any };
  ChooseCarType: { brand?: string; listingData?: any } | undefined;
  CameraGuidance: { listingData: any };
  CarCamera: { listingData: any };
  ListingDocuments: { listingData: any; initialTab?: string };
  AuctionSetup: { listingData: any };
  ListingManagement: undefined;
  Earnings: undefined;
  ActiveAuctions: undefined;
  SoldVehicles: undefined;
  Chat: undefined;
  Dnp: undefined;
  Profile: undefined;
  EditProfile: undefined;
  Wallet: undefined;
  History: undefined;
  Settings: undefined;
  AdminDashboard: undefined;
  AdminUsers: undefined;
  AdminSellerVerif: undefined;
  AdminVehicleVerif: undefined;
  AdminRevenue: undefined;
  AdminAuctions: undefined;
  AdminFraud: undefined;
  AdminPayments: undefined;
  AdminReports: undefined;
  AdminNotifs: undefined;
  CarFilter: undefined;
  BuyCar: { filters?: any };
  BrandDetails: { brand: any };
  SellerMeetingOptions: { listingId: string; userId: string };
  TermsOfService: undefined;
  PrivacyPolicy: undefined;
  PlaceholderScreen: { title: string };
  HelpCenter: undefined;
  ChooseCarType: { brand?: string; listingData?: any };
  Notifications: undefined;
  Wishlist: undefined;
};

export type MainTabParamList = {
  Home: undefined;
  BuyCar: { filters?: any };
  SellCar: undefined;
  Activity: { initialTab?: 'Bids Placed' | 'Won Auctions' | 'Lost Auctions' | 'Viewed Cars' | 'Saved Cars' | 'Notifications' };
  DNP: undefined;
};

export type DrawerParamList = {
  MainTabs: undefined;
  NewCars: undefined;
  BrowseCars: undefined;
  Favourite: undefined;
  SellerDashboard: undefined;
  OffersActivity: undefined;
  DirectNetwork: undefined;
  Dealer: undefined;
  Loans: undefined;
  Insurance: undefined;
  RtoServices: undefined;
  Challans: undefined;
  HelpSupport: undefined;
  FAQ: undefined;
  Settings: undefined;
  PrivacyPolicy: undefined;
};

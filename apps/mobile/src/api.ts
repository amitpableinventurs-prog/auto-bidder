import { Platform } from 'react-native';
import Constants from 'expo-constants';

const getApiBaseUrl = () => {
  // 1. Check for environment variable
  if (typeof process !== 'undefined' && process.env && process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }

  // Development-only convenience. A release build must be configured with HTTPS.
  if (!__DEV__) {
    throw new Error('EXPO_PUBLIC_API_BASE_URL must be configured for release builds');
  }

  // 2. Try to detect computer IP in Expo Go
  const debuggerHost = Constants.expoConfig?.hostUri;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:4000`;
  }

  // 3. Fallback to emulator loopback
  return 'http://10.0.2.2:4000';
};

const API_BASE_URL = getApiBaseUrl();

export { API_BASE_URL };

export type ApiUser = {
  id: string;
  email: string;
  phone?: string | null;
  name?: string | null;
  isVerified?: boolean;
  userType?: 'OWNER' | 'DEALER';
  role?: 'BUYER' | 'SELLER' | 'ADMIN';
  businessName?: string;
  avatarUrl?: string;
  address?: string;
  city?: string;
  zipCode?: string;
  isDistributor?: boolean;
  distributorCode?: string | null;
  distributorStatus?: string | null;
  referralEarnings?: number;
};

export type ApiListing = {
  id: string;
  title: string;
  brand?: string | null;
  model?: string | null;
  variant?: string | null;
  manufacturingYear?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  ownership?: string | null;
  kilometersDriven?: number | null;
  city?: string | null;
  plateNumber?: string | null;
  condition?: string | null;
  description?: string | null;
  demandPrice?: number | null;
  startingBid: number;
  imageUrl?: string | null;
  images?: string[];
  status: string;
  sellerId: string;
  ownerId?: string;
  insuranceType?: string;
  color?: string;
  rcAvailability?: string;
  rtoTaxStatus?: string;
  rtoNocIssued?: string;
  rtoNocNumber?: string;
  bankHypothecation?: boolean;
  loanStatus?: string;
  originalInvoice?: boolean;
  duplicateKeys?: boolean;
  serviceBookAvailability?: boolean;
  remainingOemWarranty?: string;
  sellingTimeline?: string;
  seller?: ApiUser;
  owner?: ApiUser;
  referredByDistributorCode?: string;
  referredByUserId?: string;
  referralCapturedAt?: string;
  referralAttributionExpiresAt?: string;
  distributorCommissionAmount?: number;
  distributorCommissionStatus?: string;
  bids?: { id: string; amount: number; status: string; userId: string; user?: ApiUser }[];
};

export type CreateListingPayload = {
  title?: string;
  brand?: string;
  model?: string;
  variant?: string;
  manufacturingYear?: number;
  fuelType?: string;
  transmission?: string;
  ownership?: string;
  kilometersDriven?: number;
  color?: string;
  city?: string;
  demandPrice?: number;
  condition?: string;
  description?: string;
  status?: 'DRAFT' | 'PENDING_INSPECTION' | 'ACTIVE';
  imageUrl?: string;
  images?: string[];
  // Professional details from image 3
  rcOwnerName?: string;
  rcOwnerNumber?: string;
  rcAvailability?: string;
  originalInvoice?: boolean;
  bankHypothecation?: boolean;
  loanStatus?: string;
  rtoTaxStatus?: string;
  rtoNocIssued?: string;
  rtoNocNumber?: string;
  duplicateKeys?: boolean;
  serviceBookAvailability?: boolean;
  remainingFreeService?: number;
  remainingOemWarranty?: string;
  accidentalHistory?: string;
  insuranceType?: string;
  insuranceExpiry?: string;
  listedBy?: string;
  startingBid?: number;
  carType?: string;
  plateNumber?: string;
  registrationDate?: string;
  regNumber?: string;
  sellingTimeline?: string;
  referralCode?: string;
  referredByDistributorCode?: string;
  referredByUserId?: string;
};

let authToken: string | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options?.headers as any),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
    const text = await response.text();
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      if (text.trim().startsWith('<')) {
        console.warn(`API returned HTML instead of JSON at ${path}. This usually means a 404 or 500 error.`);
        throw new Error(`Server returned HTML instead of JSON. Path: ${path}`);
      }
      console.error('JSON Parse error:', e, 'at path:', path);
    }

    if (!response.ok) {
      const errorMsg = json.error ?? json.message ?? `API request failed: ${response.status}`;
      console.warn(`API Error [${response.status}] ${path}:`, errorMsg);
      throw new Error(errorMsg);
    }
    return json as T;
  } catch (err: any) {
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        console.warn(`NETWORK ERROR: Cannot reach ${API_BASE_URL}${path}. Check if server is running, CORS is allowed, and the URL is reachable.`);
        throw new Error('Could not connect to the server. Please check your internet connection.');
    }
    if (err.message === 'Network request failed') {
        console.warn(`NETWORK ERROR: Cannot reach ${API_BASE_URL}${path}. Check if server is running and reachable.`);
    }
    throw err;
  }
}

// AUTH
export function requestOtp(phone: string) {
  return request<{ ok: boolean; demoOtp: string }>('/api/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export function verifyOtp(phone: string, otp: string, name?: string, userType?: string) {
  return request<{ user: ApiUser; token: string }>('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, name, userType }),
  });
}

export function register(phone: string, name: string, email: string, userType: string) {
  return request<{ user: ApiUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, name, email, userType }),
  });
}

export function googleAuth(email: string, name?: string, avatarUrl?: string, googleId?: string, phone?: string) {
  return request<{ user: ApiUser; token: string }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify({ email, name, avatarUrl, googleId, phone }),
  });
}

export function getUser(userId: string) {
  if (!userId) {
    console.warn('getUser called with empty userId');
    return Promise.reject(new Error('User ID is required'));
  }
  return request<{ user: ApiUser }>(`/api/users/${userId}`, {
    method: 'GET',
  });
}

export function updateUser(userId: string, payload: Partial<ApiUser> & { address?: string, city?: string, zipCode?: string }) {
  if (!userId) {
    console.warn('updateUser called with empty userId');
    return Promise.reject(new Error('User ID is required'));
  }
  return request<{ user: ApiUser }>(`/api/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function submitKyc(userId: string, documentType: string, documentImage: string) {
  return request<{ ok: boolean }>('/api/kyc/submit', {
    method: 'POST',
    body: JSON.stringify({ userId, documentType, documentImage }),
  });
}

// LISTINGS
export function getCities() {
  return request<{ cities: string[] }>('/api/cities');
}

export function getListings(params?: {
  city?: string;
  brand?: string;
  status?: string;
  q?: string;
  fuelType?: string;
  transmission?: string;
  minPrice?: number;
  maxPrice?: number;
  sellerId?: string;
  carType?: string;
}) {
  const query = params ? '?' + new URLSearchParams(params as any).toString() : '';
  return request<{ listings: ApiListing[] }>(`/api/listings${query}`);
}

export function getListing(id: string) {
  return request<{ listing: ApiListing }>(`/api/listings/${id}`);
}

export function updateListingStatus(listingId: string, status: string) {
  return request<{ listing: ApiListing }>(`/api/admin/listings/${listingId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createListing(sellerId: string, payload: CreateListingPayload) {
  return request<{ listing: ApiListing }>('/api/listings', {
    method: 'POST',
    body: JSON.stringify({
      sellerId,
      ...payload,
      startingBid: payload.startingBid ?? (payload.demandPrice ? Math.floor(payload.demandPrice * 0.9) : undefined),
    }),
  });
}

export function updateListing(listingId: string, payload: Partial<CreateListingPayload>) {
  return request<{ listing: ApiListing }>(`/api/listings/${listingId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteListing(listingId: string) {
  return request<{ ok: boolean }>(`/api/listings/${listingId}`, {
    method: 'DELETE',
  });
}

export function getSellerListings(sellerId: string) {
  return request<{ listings: ApiListing[] }>(`/api/listings?sellerId=${sellerId}`);
}

// BIDS
export function getUserBids(userId: string) {
  return request<{ bids: any[] }>(`/api/bids?userId=${userId}`);
}

export function placeBid(listingId: string, userId: string, amount: number) {
  return request<{ bid: { id: string; amount: number; status: string } }>(
    `/api/listings/${listingId}/bids`,
    {
      method: 'POST',
      body: JSON.stringify({ userId, amount }),
    },
  );
}

// AUTO-BIDS
export function setupAutoBid(userId: string, listingId: string, maxLimit: number, increment: number = 5000) {
  return request<{ autoBidConfig: any }>('/api/auto-bids', {
    method: 'POST',
    body: JSON.stringify({ userId, listingId, maxLimit, increment }),
  });
}

export function cancelAutoBid(configId: string) {
  return request<{ ok: boolean }>(`/api/auto-bids/${configId}`, {
    method: 'DELETE',
  });
}

export function getAutoBids(userId?: string) {
  const query = userId ? `?userId=${userId}` : '';
  return request<{ autoBids: any[] }>(`/api/auto-bids${query}`);
}

// APPOINTMENTS
export function createAppointment(listingId: string, userId: string, type: string = 'BUYER_INSPECTION', scheduledAt?: string) {
  return request<{ appointment: { id: string; status: string } }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify({
      listingId,
      userId,
      type,
      scheduledAt: scheduledAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      location: 'AutoBidder inspection hub',
    }),
  });
}

// WALLET / PAYMENTS
export function getWalletBalance(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  // In a real app this would be an endpoint
  return request<{ balance: number; transactions: any[] }>(`/api/users/${userId}/wallet`);
}

export function getUserPayments(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{ payments: any[] }>(`/api/users/${userId}/payments`);
}

export function createPayment(amount: number, currency: string = 'INR', bidId?: string, listingId?: string) {
  return request<{ payment: any; clientSecret?: string }>('/api/payments', {
    method: 'POST',
    body: JSON.stringify({ amount, currency, bidId, listingId }),
  });
}

// SELLER
export function getSellerStats(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{
    totalEarnings: number;
    activeListings: number;
    liveBids: number;
    soldCars: number;
    bidsPlaced?: number;
    carsWon?: number;
    savings?: number;
  }>(`/api/seller/${userId}/stats`);
}

export function getFavorites(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{ favorites: ApiListing[] }>(`/api/favorites?userId=${userId}`);
}

export function toggleFavorite(userId: string, listingId: string) {
  return request<{ isFavorite: boolean }>('/api/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ userId, listingId }),
  });
}

export function getLeads(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{ leads: any[] }>(`/api/seller/${userId}/leads`);
}

export function getSellerActivity(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{ activities: any[] }>(`/api/seller/${userId}/activity`);
}

export function getDistributorDashboard(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{
    distributor: ApiUser;
    stats: {
      totalReferrals: number;
      activeListings: number;
      soldListings: number;
      totalEarnings: number;
      pendingEarnings: number;
      paidEarnings: number;
    };
    referralLink: string;
    referrals: Array<{
      listingId: string;
      listingTitle: string;
      sellerName?: string | null;
      sellerPhone?: string | null;
      status: string;
      commissionAmount: number;
      commissionStatus: string;
      createdAt?: string;
    }>;
    shareTemplates: {
      appInvite: string;
      listingInvite: string;
    };
  }>(`/api/distributor/${userId}/dashboard`);
}

export function activateDistributor(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{ user: ApiUser; referralLink: string }>(`/api/distributor/${userId}/activate`, {
    method: 'POST',
  });
}

// Push tokens
export function registerPushToken(token: string, platform: string = 'android') {
  return request<{ ok: boolean }>('/api/push-tokens', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

// Sliders
export function getSliders(type?: 'ONBOARDING' | 'HOME' | 'BUY_CAR' | 'SELL_CAR') {
  const query = type ? `?type=${type}` : '';
  return request<{ sliders: ApiSlider[] }>(`/api/sliders${query}`).catch(() => {
    // Fallback for demo/offline
    return { sliders: [] };
  });
}

// Brands
export function getBrands() {
  return request<{ brands: ApiBrand[] }>('/api/brands').catch(() => {
    // Fallback to static list if API fails
    return {
        brands: [
          { id: 'maruti', name: 'Maruti Suzuki', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/suzuki.png', count: '2.5k+ Cars', isActive: true },
          { id: 'hyundai', name: 'Hyundai', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/hyundai.png', count: '1.8k+ Cars', isActive: true },
          { id: 'tata', name: 'Tata Motors', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/tata.png', count: '1.2k+ Cars', isActive: true },
          { id: 'mahindra', name: 'Mahindra', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/mahindra.png', count: '950+ Cars', isActive: true },
          { id: 'kia', name: 'Kia', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/kia.png', count: '600+ Cars', isActive: true },
          { id: 'honda', name: 'Honda', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/honda.png', count: '850+ Cars', isActive: true },
          { id: 'toyota', name: 'Toyota', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/toyota.png', count: '700+ Cars', isActive: true },
          { id: 'volkswagen', name: 'Volkswagen', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/volkswagen.png', count: '520+ Cars', isActive: true },
          { id: 'renault', name: 'Renault', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/renault.png', count: '410+ Cars', isActive: true },
          { id: 'ford', name: 'Ford', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/ford.png', count: '360+ Cars', isActive: true },
          { id: 'skoda', name: 'Skoda', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/skoda.png', count: '340+ Cars', isActive: true },
          { id: 'nissan', name: 'Nissan', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/nissan.png', count: '300+ Cars', isActive: true },
          { id: 'mg', name: 'MG Motors', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/mg.png', count: '420+ Cars', isActive: true },
          { id: 'jeep', name: 'Jeep', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/jeep.png', count: '180+ Cars', isActive: true },
          { id: 'bmw', name: 'BMW', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/bmw.png', count: '240+ Cars', isActive: true },
          { id: 'mercedes', name: 'Mercedes', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/mercedes-benz.png', count: '260+ Cars', isActive: true },
          { id: 'audi', name: 'Audi', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/audi.png', count: '220+ Cars', isActive: true },
          { id: 'jaguar', name: 'Jaguar', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/jaguar.png', count: '90+ Cars', isActive: true },
          { id: 'volvo', name: 'Volvo', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/volvo.png', count: '110+ Cars', isActive: true },
          { id: 'landrover', name: 'Land Rover', logo: 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized/land-rover.png', count: '95+ Cars', isActive: true },
        ]
    };
  });
}

// Notifications for a user
export function getUserNotifications(userId: string) {
  if (!userId) return Promise.reject(new Error('User ID is required'));
  return request<{ notifications: any[] }>(`/api/notifications?userId=${userId}`);
}

// App bootstrap
export function getAppBootstrap(city?: string) {
  const query = city ? `?city=${city}` : '';
  return request<{
    listings: ApiListing[];
    stats: {
      activeListings: number;
      pendingAppointments: number;
      submittedBids: number;
    };
  }>(`/api/app/bootstrap${query}`);
}

// FILE UPLOAD
export async function uploadFile(uri: string, mimeType?: string, name?: string): Promise<{ url: string; filename: string }> {
  if (!uri) throw new Error('No URI provided for upload');

  console.log('uploadFile starting. URI:', uri, 'mimeType:', mimeType, 'name:', name);

  const formData = new FormData();

  // Extract filename from URI if name not provided
  let filename = name;
  if (!filename) {
    const parts = uri.split('/');
    filename = parts[parts.length - 1];
  }

  if (!filename || filename.length < 3) {
    filename = 'upload-' + Date.now();
  }

  // Determine extension
  const dotIndex = filename.lastIndexOf('.');
  let ext = dotIndex !== -1 ? filename.substring(dotIndex + 1).toLowerCase() : '';

  let type = mimeType;
  if (!type) {
    if (ext === 'pdf') type = 'application/pdf';
    else if (['jpg', 'jpeg', 'png', 'webp'].includes(ext)) type = `image/${ext === 'jpg' ? 'jpeg' : ext}`;
    else if (ext === 'doc') type = 'application/msword';
    else if (ext === 'docx') type = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    else type = 'application/octet-stream';
  }

  // If filename has no extension, try to add it from type
  if (!ext && type) {
    if (type === 'application/pdf') {
      filename += '.pdf';
    } else if (type.startsWith('image/')) {
      let imageExt = type.split('/')[1];
      if (imageExt === 'jpeg') imageExt = 'jpg';
      // Handle cases like image/png; charset=utf-8
      imageExt = imageExt.split(';')[0];
      filename += '.' + imageExt;
    }
  }

  // Clean filename for multipart form data (keep dots and hyphens)
  const cleanFilename = filename.replace(/[^a-zA-Z0-9.-]/g, '_');

  console.log('Determined type:', type, 'filename:', cleanFilename);

  // Handle Web
  if (Platform.OS === 'web') {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      formData.append('file', blob, cleanFilename);
    } catch (e) {
      console.error('Failed to fetch blob for web upload:', e);
      throw new Error('Failed to process file for upload');
    }
  } else {
    // React Native
    // Ensure uri has file:// prefix on Android if it's a local path and not content://
    let uploadUri = uri;
    if (Platform.OS === 'android' && !uploadUri.startsWith('file://') && !uploadUri.startsWith('content://')) {
      // If it starts with / assume it's a local path
      if (uploadUri.startsWith('/')) {
        uploadUri = 'file://' + uploadUri;
      }
    }

    const fileToUpload = {
      uri: uploadUri,
      name: cleanFilename,
      type: type || 'application/octet-stream',
    };

    formData.append('file', fileToUpload as any);
  }

  console.log('Sending POST to:', `${API_BASE_URL}/api/upload`);

  const headers: Record<string, string> = {
    'Accept': 'application/json',
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers,
    });

    if (!response.ok) {
      const status = response.status;
      const text = await response.text();
      console.warn(`Upload failed. Status: ${status}, Response:`, text);

      let errorMsg = `Upload failed (${status})`;
      try {
        const json = JSON.parse(text);
        errorMsg = json.error ?? json.message ?? errorMsg;
      } catch (e) {
        if (text.includes('<html>')) {
          errorMsg = `Server error (HTTP ${status}). Please check server logs.`;
        }
      }
      throw new Error(errorMsg);
    }

    const result = await response.json();
    console.log('Upload success:', result);
    return result;
  } catch (err: any) {
    console.error('uploadFile network/fetch error:', err);
    if (err.message === 'Network request failed') {
      throw new Error('Network error: Unable to connect to server. Check your internet and API URL.');
    }
    throw err;
  }
}

// ADMIN
export function getAdminDashboard() {
  return request<{
    stats: {
      users: number;
      listings: number;
      activeListings: number;
      pendingListings: number;
      submittedBids: number;
      pendingAppointments: number;
      totalRevenue: number;
    };
    recentListings: ApiListing[];
    recentBids: any[];
    recentAppointments: any[];
  }>('/api/admin/dashboard');
}

export function getAllListings() {
  return request<{ listings: ApiListing[] }>('/api/admin/listings/all');
}

export function getAllBids() {
  return request<{ bids: any[] }>('/api/admin/bids/all');
}

export function getAllPayments() {
  return request<{ payments: any[]; stats: any }>('/api/admin/payments/all');
}

export function getAllNotifications() {
  return request<{ notifications: any[] }>('/api/admin/notifications/all');
}

export function getAllUsers() {
  return request<{ users: ApiUser[] }>('/api/admin/users/all');
}

export function verifyUser(userId: string, isVerified: boolean) {
  return request<{ user: ApiUser }>(`/api/admin/users/${userId}/verify`, {
    method: 'PATCH',
    body: JSON.stringify({ isVerified }),
  });
}

export function getAllAppointments() {
  return request<{ appointments: any[] }>('/api/admin/appointments/all');
}

export function getUserAppointments(userId: string) {
  return request<{ appointments: any[] }>(`/api/appointments?userId=${userId}`);
}

export function seedRichData() {
  return request<{ ok: boolean; message: string }>('/api/admin/seed-rich', {
    method: 'POST',
  });
}

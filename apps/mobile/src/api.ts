import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from './config';
import { logger } from './utils/logger';
import { compressImage } from './utils/image-utils';
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
  rcImages?: string[];
  invoiceImages?: string[];
  bankNocImages?: string[];
  status: string;
  sellerId: string;
  ownerId?: string;
  insuranceType?: string;
  color?: string;
  rcAvailability?: string;
  rtoTaxStatus?: string;
  rtoNocIssued?: string;
  rtoNocNumber?: string;
  rtoIssues?: string;
  ownershipType?: string;
  bankHypothecation?: boolean;
  loanStatus?: string;
  originalInvoice?: boolean;
  duplicateKeys?: boolean;
  serviceBookAvailability?: boolean;
  remainingOemWarranty?: string;
  sellingTimeline?: string;
  seller?: ApiUser;
  owner?: ApiUser;
  bids?: { id: string; amount: number; status: string; userId: string; user?: ApiUser }[];
  createdAt?: string;
  updatedAt?: string;
};

export type ApiSlider = {
  id: string;
  type: 'ONBOARDING' | 'HOME' | 'BUY_CAR' | 'SELL_CAR';
  title: string;
  subtitle?: string | null;
  imageUrl: string;
  link?: string | null;
  order: number;
  isActive: boolean;
};

export type ApiBrand = {
  id: string;
  name: string;
  logo: string;
  count: string;
  description?: string | null;
  isActive: boolean;
};

export type ApiCollection = {
  id: string;
  name: string;
  imageUrl: string;
  order: number;
  isActive: boolean;
};

export type ApiNews = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  content?: string | null;
  link?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type CreateListingPayload = {
  sellerId: string;
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
  rcImages?: string[];
  invoiceImages?: string[];
  bankNocImages?: string[];
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
  rtoIssues?: string;
  ownershipType?: string;
  cngLpgStatus?: string;
  duplicateKeys?: boolean;
  serviceBookAvailability?: boolean;
  remainingFreeService?: number;
  remainingOemWarranty?: string;
  accidentalHistory?: string;
  insuranceType?: string;
  insuranceExpiry?: string;
  listedBy?: string;
  sellerContactName?: string;
  sellerContactNumber?: string;
  rtoNocFor?: string;
  startingBid?: number;
  carType?: string;
  plateNumber?: string;
  registrationDate?: string;
  regNumber?: string;
  sellingTimeline?: string;
};

let authToken: string | null = null;
let onUnauthorizedCallback: (() => void) | null = null;

export function setAuthToken(token: string | null) {
  authToken = token;
}

export function setOnUnauthorized(callback: () => void) {
  onUnauthorizedCallback = callback;
}

async function ensureAuthToken(): Promise<string | null> {
  if (authToken && authToken !== 'null' && authToken !== 'undefined' && authToken.trim() !== '') {
    return authToken;
  }

  try {
    let savedToken = null;

    // Attempt 1: SecureStore (Primary for Native)
    if (Platform.OS !== 'web') {
      try {
        savedToken = await SecureStore.getItemAsync('auth_token');
        if (savedToken) {
          logger.log('[API] Re-hydrated token from SecureStore');
          authToken = savedToken;
          return savedToken;
        }
      } catch (e) {
        logger.warn('[API] SecureStore retrieval failed, falling back to AsyncStorage');
      }
    }

    // Attempt 2: AsyncStorage (Fallback for Native, Primary for Web)
    savedToken = await AsyncStorage.getItem('auth_token');
    if (savedToken) {
      logger.log(`[API] Re-hydrated token from AsyncStorage (${Platform.OS})`);
      authToken = savedToken;
      return savedToken;
    }
  } catch (e) {
    logger.warn('[API] Token re-hydration failed completely');
  }

  return null;
}

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const startTime = Date.now();
  const token = await ensureAuthToken();

  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'Accept': 'application/json',
    ...(options?.headers as any),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    const duration = Date.now() - startTime;
    if (duration > 1000) {
      logger.perf(`Slow API Response: ${path}`, duration);
    }

    if (response.status === 401) {
      if (onUnauthorizedCallback) {
        onUnauthorizedCallback();
      }
    }

    const text = await response.text();
    let json: any = {};
    try {
      json = text ? JSON.parse(text) : {};
    } catch (e) {
      if (text.trim().startsWith('<')) {
        throw new Error(`Server error (HTML returned). Please try again later.`);
      }
      const snippet = text.length > 50 ? text.substring(0, 50) + '...' : text;
      logger.error(`[API] JSON Parse Error for ${path}: "${snippet}"`);
      throw new Error(`Invalid server response. Error near: ${snippet}`);
    }

    if (!response.ok) {
      const errorMsg = json.error ?? json.message ?? `Request failed with status ${response.status}`;
      throw new Error(errorMsg);
    }

    // Support standard { success: true, data: ... } wrapper if backend uses it
    return (json.success && json.data !== undefined) ? json.data : json as T;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
        throw new Error('Request timed out. Please check your internet connection.');
    }
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
        throw new Error('Unable to connect to the server. Please check your internet connection.');
    }
    throw err;
  }
}

// AUTH
export function requestOtp(phone: string) {
  return request<{ ok: boolean }>('/api/auth/otp/request', {
    method: 'POST',
    body: JSON.stringify({ phone }),
  });
}

export const requestOTP = requestOtp;

export function verifyOTP(phone: string, otp: string, name?: string, userType?: string) {
  return request<{ user: ApiUser; token: string }>('/api/auth/otp/verify', {
    method: 'POST',
    body: JSON.stringify({ phone, otp, name, userType }),
  });
}

export function googleLogin(payload: { email: string; name?: string; avatarUrl?: string; googleId?: string; userType?: string }) {
  return request<{ user: ApiUser; token: string }>('/api/auth/google', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function register(phone: string, name: string, email: string, userType: string) {
  return request<{ user: ApiUser; token: string }>('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify({ phone, name, email, userType }),
  });
}

export function registerPushToken(token: string, platform: string) {
  return request<{ ok: boolean }>('/api/push-tokens', {
    method: 'POST',
    body: JSON.stringify({ token, platform }),
  });
}

export function getCurrentUser(userId: string) {
  return request<{ user: ApiUser }>(`/api/users/${userId}`);
}

export function updateUser(userId: string, payload: Partial<ApiUser>) {
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

// SLIDERS
export function getSliders(type: string = 'HOME') {
  return request<{ sliders: ApiSlider[] }>(`/api/sliders?type=${type}`);
}

// BRANDS & COLLECTIONS
export function getBrands() {
  return request<{ brands: ApiBrand[] }>('/api/brands');
}

export function getCollections() {
  return request<{ collections: ApiCollection[] }>('/api/collections');
}

// NEWS
export function getNews() {
  return request<{ news: ApiNews[] }>('/api/news');
}

export function getAdminNews() {
  return request<{ news: ApiNews[] }>('/api/admin/news/all');
}

export function createNews(payload: Partial<ApiNews>) {
  return request<{ news: ApiNews }>('/api/admin/news', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateNews(id: string, payload: Partial<ApiNews>) {
  return request<{ news: ApiNews }>(`/api/admin/news/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export function deleteNews(id: string) {
  return request<{ ok: boolean }>(`/api/admin/news/${id}`, {
    method: 'DELETE',
  });
}

// LISTINGS
export function getListings(params: Record<string, string> = {}) {
  const query = new URLSearchParams(params).toString();
  return request<{ listings: ApiListing[] }>(`/api/listings?${query}`);
}

export function getListing(id: string) {
  return request<{ listing: ApiListing }>(`/api/listings/${id}`);
}

export function createListing(payload: CreateListingPayload) {
  return request<{ listing: ApiListing }>('/api/listings', {
    method: 'POST',
    body: JSON.stringify(payload),
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

export function getSellerStats(userId: string) {
  return request<any>(`/api/users/${userId}/seller-stats`);
}

export function getSellerActivity(userId: string) {
  return request<any>(`/api/users/${userId}/seller-activities`);
}

export function getUserPayments(userId: string) {
  return request<any>(`/api/payments?userId=${userId}`);
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

// FAVORITES
export function getFavorites(userId: string) {
  return request<{ favorites: any[] }>(`/api/favorites?userId=${userId}`);
}

export function addFavorite(userId: string, listingId: string) {
  return request<{ ok: boolean }>('/api/favorites', {
    method: 'POST',
    body: JSON.stringify({ userId, listingId }),
  });
}

export function removeFavorite(userId: string, listingId: string) {
  return request<{ ok: boolean }>(`/api/favorites?userId=${userId}&listingId=${listingId}`, {
    method: 'DELETE',
  });
}

export function toggleFavorite(userId: string, listingId: string) {
  return request<{ ok: boolean; action: 'added' | 'removed' }>('/api/favorites/toggle', {
    method: 'POST',
    body: JSON.stringify({ userId, listingId }),
  });
}

// APPOINTMENTS
export function getAppointments(userId?: string) {
  const query = userId ? `?userId=${userId}` : '';
  return request<{ appointments: any[] }>(`/api/appointments${query}`);
}

export function getUserAppointments(userId: string) {
  return request<{ appointments: any[] }>(`/api/appointments?userId=${userId}`);
}

export function scheduleAppointment(payload: { listingId: string; userId: string; type: string; scheduledAt: string; location?: string; notes?: string }) {
  return request<{ appointment: any }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createAppointment(payload: any) {
  return request<{ appointment: any }>('/api/appointments', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

// NOTIFICATIONS
export function getNotifications(userId: string) {
  return request<{ notifications: any[] }>(`/api/notifications?userId=${userId}`);
}

export function markNotificationAsRead(id: string) {
  return request<{ ok: boolean }>(`/api/notifications/${id}/read`, {
    method: 'PATCH',
  });
}

// UPLOADS
export async function uploadFile(
  fileUri: string,
  type: string = 'image/jpeg',
  customName?: string,
  retries = 3
): Promise<{ url: string }> {
  // Enhanced token validation to catch race conditions or corrupted storage
  const token = await ensureAuthToken();
  const isInvalidToken = !token;

  if (isInvalidToken) {
    logger.error('[UPLOAD] No valid auth token found. Session might be expired or not initialized.');
    if (onUnauthorizedCallback) onUnauthorizedCallback();
    throw new Error('Unauthorized: No valid session found');
  }

  const filename = customName || fileUri.split('/').pop() || 'upload.jpg';

  // Automatically compress images before upload to avoid 413 errors
  let finalUri = fileUri;
  if (type && type.startsWith('image/')) {
    try {
      finalUri = await compressImage(fileUri);
    } catch (e) {
      logger.warn('Image compression failed, using original:', e);
      finalUri = fileUri;
    }
  }

  // Mobile URIs from ImagePicker/Manipulator should be used as-is.
  // Aggressive decoding can break Expo cache paths that contain encoded slugs.
  // Previously we used decodeURIComponent which corrupted paths like %40vs0%2Fauto-bidder.

  // Create FormData for robust cross-platform upload
  const formData = new FormData();

  if (Platform.OS === 'web') {
    try {
      const response = await fetch(finalUri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    } catch (e) {
      console.error('Web upload blob conversion failed', e);
      throw new Error('Failed to process image for upload');
    }
  } else {
    // Native (Android/iOS) FormData requirement
    // @ts-ignore
    formData.append('file', {
      uri: finalUri,
      name: filename,
      type: type || 'image/jpeg'
    });
  }

  const performUpload = (): Promise<{ url: string }> => {
    return new Promise((resolve, reject) => {
      if (Platform.OS === 'web') {
        // Fetch is reliable on Web
        fetch(`${API_BASE_URL}/api/upload`, {
          method: 'POST',
          body: formData,
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
          },
        })
          .then(async (res) => {
            if (res.status === 401) {
              if (onUnauthorizedCallback) onUnauthorizedCallback();
            }
            if (!res.ok) {
              const err = await res.json().catch(() => ({}));
              throw new Error(err.error || `Upload failed: ${res.status}`);
            }
            return res.json();
          })
          .then(resolve)
          .catch(reject);
      } else {
        // XMLHttpRequest is MUCH more robust for FormData uploads on Native Android/iOS
        // It bypasses the "Unsupported FormDataPart implementation" error in the fetch polyfill.
        const xhr = new XMLHttpRequest();
        xhr.open('POST', `${API_BASE_URL}/api/upload`);

        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
        xhr.setRequestHeader('Accept', 'application/json');

        xhr.onload = () => {
          if (xhr.status === 401) {
            if (onUnauthorizedCallback) onUnauthorizedCallback();
          }
          try {
            const response = JSON.parse(xhr.responseText);
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve(response);
            } else {
              reject(new Error(response.error || `Upload failed with status ${xhr.status}`));
            }
          } catch (e) {
            reject(new Error(`Invalid server response: ${xhr.status}`));
          }
        };

        xhr.onerror = () => reject(new Error('Network request failed'));
        xhr.ontimeout = () => reject(new Error('Request timed out'));

        xhr.send(formData);
      }
    });
  };

  for (let i = 0; i < retries; i++) {
    try {
      const endpoint = `${API_BASE_URL}/api/upload`;
      logger.log(`[UPLOAD] Attempt ${i + 1} | File: ${filename} | URI: ${finalUri} | Endpoint: ${endpoint}`);
      return await performUpload();
    } catch (error: any) {
      logger.warn(`[UPLOAD] Attempt ${i + 1} failed:`, error.message);

      // Don't retry on unauthorized errors
      if (error.message.includes('Unauthorized') || error.message.includes('401')) {
        throw error;
      }

      if (i === retries - 1) throw error;
      // Exponential backoff
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }

  throw new Error('Upload failed after multiple attempts');
}

// ADMIN (Used by Admin screens in mobile if any)
export function getAdminBids() {
  return request<{ bids: any[] }>('/api/admin/bids/all');
}

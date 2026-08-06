import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system/legacy';
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

export async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const startTime = Date.now();
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    'Accept': 'application/json',
    ...(options?.headers as any),
  };

  if (authToken) {
    headers['Authorization'] = `Bearer ${authToken}`;
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
      throw new Error(`Invalid server response (JSON parse error).`);
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

  if (Platform.OS === 'web') {
    const formData = new FormData();
    try {
      const response = await fetch(finalUri);
      const blob = await response.blob();
      formData.append('file', blob, filename);
    } catch (e) {
      console.error('Web upload blob conversion failed', e);
      throw new Error('Failed to process image for upload');
    }

    const response = await fetch(`${API_BASE_URL}/api/upload`, {
      method: 'POST',
      body: formData,
      headers: {
        'Authorization': `Bearer ${authToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Upload failed with status ${response.status}`);
    }
    return response.json();
  }

  // Native Platform (Android/iOS) - Use FileSystem.uploadAsync for maximum reliability
  let safeUri = finalUri;
  // Sanitize filename: replace spaces and special chars with underscores to prevent URI parsing errors
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.]/g, '_');
  const tempFileUri = `${FileSystem.cacheDirectory}upload_temp_${sanitizedFilename}`;

  try {
    // Copy to app's own cache to ensure readability and fix java.io.IOException "isn't readable" on Android
    if (Platform.OS !== 'web') {
      try {
        // Skip copy if already in a "safe" cache location (like DocumentPicker cache)
        // This avoids redundant copies and potential permission issues with double copying in scoped storage
        const uriLower = finalUri.toLowerCase();
        const isAlreadyInCache = uriLower.includes('/cache/documentpicker/') || uriLower.includes('/cache/experiencedata/');

        if (isAlreadyInCache) {
          logger.log(`[UPLOAD] URI already in cache, skipping redundant copy: ${finalUri}`);
          safeUri = finalUri;
        } else {
          // Verify source exists and is readable before copying
          const info = await FileSystem.getInfoAsync(finalUri);
          if (!info.exists) {
            logger.error('Source file does not exist:', finalUri);
            // Try adding file:// prefix if it's missing and it looks like a path
            if (!finalUri.startsWith('file://') && !finalUri.startsWith('content://')) {
               const prefixed = `file://${finalUri}`;
               const info2 = await FileSystem.getInfoAsync(prefixed);
               if (info2.exists) {
                  finalUri = prefixed;
               }
            }
          }

          logger.log(`[UPLOAD] Copying ${finalUri} to ${tempFileUri}`);
          await FileSystem.copyAsync({ from: finalUri, to: tempFileUri });
          safeUri = tempFileUri;
        }
      } catch (copyErr: any) {
        logger.warn('copyAsync failed, attempting Base64 fallback:', copyErr.message);

        // Fallback: Try reading as Base64 and writing to temp file
        // This can bypass "isn't readable" errors in some scoped storage scenarios
        try {
          const base64 = await FileSystem.readAsStringAsync(finalUri, { encoding: FileSystem.EncodingType.Base64 });
          await FileSystem.writeAsStringAsync(tempFileUri, base64, { encoding: FileSystem.EncodingType.Base64 });
          logger.log('[UPLOAD] Base64 fallback success');
          safeUri = tempFileUri;
        } catch (fallbackErr: any) {
          logger.error('[UPLOAD] Base64 fallback failed:', fallbackErr.message);
          safeUri = finalUri;
        }
      }
    }

    // Ensure URI has a proper scheme for uploadAsync
    if (!safeUri.startsWith('file://') && !safeUri.startsWith('content://') && Platform.OS !== 'web') {
      safeUri = `file://${safeUri}`;
    }

    for (let i = 0; i < retries; i++) {
      try {
        logger.log(`Starting upload attempt ${i + 1} for: ${sanitizedFilename} (URI: ${safeUri})`);

        const response = await FileSystem.uploadAsync(`${API_BASE_URL}/api/upload`, safeUri, {
          httpMethod: 'POST',
          uploadType: FileSystem.FileSystemUploadType.MULTIPART,
          fieldName: 'file',
          headers: {
            'Authorization': `Bearer ${authToken}`,
            'Accept': 'application/json',
          },
        });

        if (response.status < 200 || response.status >= 300) {
          throw new Error(`Upload failed with status ${response.status}: ${response.body}`);
        }

        const data = JSON.parse(response.body);
        logger.log('[UPLOAD] Success:', data.url);
        return data;
      } catch (error: any) {
        logger.warn(`[UPLOAD] Attempt ${i + 1} failed:`, error.message);
        if (i === retries - 1) throw error;
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      }
    }
  } finally {
    // Cleanup temporary file only if we actually created one
    if (Platform.OS !== 'web' && safeUri === tempFileUri) {
       FileSystem.deleteAsync(safeUri, { idempotent: true }).catch(e => {
         logger.warn('Failed to delete temp upload file', e.message);
       });
    }
  }

  throw new Error('Upload failed after multiple attempts');
}

// ADMIN (Used by Admin screens in mobile if any)
export function getAdminBids() {
  return request<{ bids: any[] }>('/api/admin/bids/all');
}

import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const fallbackBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackBaseUrl;

class SocketService {
  private socket: Socket | null = null;

  connect() {
    if (!this.socket) {
      console.log('Connecting to socket at:', API_BASE_URL);
      this.socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'], // Added polling as fallback
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket connection error details:', error.message, error.name);
      });
    }
    return this.socket;
  }

  getSocket() {
    return this.socket || this.connect();
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  joinListing(listingId: string) {
    this.getSocket().emit('listing:join', { listingId });
  }

  leaveListing(listingId: string) {
    this.getSocket().emit('listing:leave', { listingId });
  }

  placeBid(listingId: string, userId: string, amount: number) {
    return new Promise((resolve, reject) => {
      this.getSocket().emit('bid:place', { listingId, userId, amount }, (response: any) => {
        if (response.ok) {
          resolve(response.bid);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  onBidCreated(callback: (data: { bid: any }) => void) {
    this.getSocket().on('bid:created', callback);
  }

  offBidCreated() {
    this.getSocket().off('bid:created');
  }

  subscribeToNotifications(userId: string) {
    this.getSocket().emit('notifications:subscribe', { userId });
  }

  onNotificationNew(callback: (data: { notification: any }) => void) {
    this.getSocket().on('notification:new', callback);
  }

  offNotificationNew() {
    this.getSocket().off('notification:new');
  }
}

export const socketService = new SocketService();

import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

const fallbackBaseUrl = Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL ?? fallbackBaseUrl;

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;

  /**
   * Initializes the socket connection with the provided JWT token.
   */
  connect(token?: string) {
    if (token) this.token = token;

    if (!this.socket) {
      console.log('Connecting to socket at:', API_BASE_URL);
      this.socket = io(API_BASE_URL, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity, // Production ready: keep trying
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        auth: {
          token: this.token,
        },
      });

      this.socket.on('connect', () => {
        console.log('Socket connected successfully');
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
      });

      this.socket.on('connect_error', (error) => {
        console.warn('Socket connection error:', error.message);
      });
    } else if (token && this.socket.connected) {
        // If already connected but token changed, we might need to reconnect
        // For simplicity, we just update the auth object for next connection
        this.socket.auth = { token };
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
      this.token = null;
    }
  }

  // --- Auction Events ---

  joinAuction(auctionId: string) {
    this.getSocket().emit('joinAuction', { auctionId });
  }

  leaveAuction(auctionId: string) {
    this.getSocket().emit('leaveAuction', { auctionId });
  }

  placeBid(auctionId: string, amount: number) {
    return new Promise((resolve, reject) => {
      this.getSocket().emit('placeBid', { auctionId, amount }, (response: any) => {
        if (response.ok) {
          resolve(response.bid);
        } else {
          reject(new Error(response.error));
        }
      });
    });
  }

  // --- Listeners ---

  onBidUpdated(callback: (data: { bid: any }) => void) {
    this.getSocket().on('bidUpdated', callback);
  }

  offBidUpdated() {
    this.getSocket().off('bidUpdated');
  }

  onAuctionStarted(callback: (data: any) => void) {
    this.getSocket().on('auctionStarted', callback);
  }

  offAuctionStarted() {
    this.getSocket().off('auctionStarted');
  }

  onAuctionEnded(callback: (data: any) => void) {
    this.getSocket().on('auctionEnded', callback);
  }

  offAuctionEnded() {
    this.getSocket().off('auctionEnded');
  }

  onUserConnected(callback: (data: any) => void) {
    this.getSocket().on('userConnected', callback);
  }

  onUserDisconnected(callback: (data: any) => void) {
    this.getSocket().on('userDisconnected', callback);
  }

  // --- Notifications (Keeping existing functionality) ---

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

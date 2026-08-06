import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';
import { SOCKET_URL } from '../config';

class SocketService {
  private socket: Socket | null = null;
  private token: string | null = null;
  private reconnectionAttempts = 0;

  /**
   * Initializes the socket connection with the provided JWT token.
   */
  connect(token?: string) {
    if (token) this.token = token;

    if (!this.socket) {
      this.socket = io(SOCKET_URL, {
        path: '/api/socket.io',
        transports: ['websocket'], // Force websocket for stability on Web and Mobile
        upgrade: false, // Prevent switching to polling
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: 10, // Increase attempts
        reconnectionDelay: 2000,
        reconnectionDelayMax: 10000,
        timeout: 20000,
        forceNew: true,
        jsonp: false,
        auth: {
          token: this.token,
        },
      });

      this.socket.on('connect', () => {
        this.reconnectionAttempts = 0;
      });

      this.socket.on('disconnect', (reason) => {
        if (reason === 'io server disconnect') {
          this.socket?.connect();
        }
      });

      this.socket.on('connect_error', (error) => {
        this.reconnectionAttempts++;
      });
    } else if (token && this.socket.connected) {
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
    return () => this.getSocket().off('bidUpdated', callback);
  }

  offBidUpdated(callback?: (data: { bid: any }) => void) {
    if (callback) {
      this.getSocket().off('bidUpdated', callback);
    } else {
      this.getSocket().off('bidUpdated');
    }
  }

  onAuctionStarted(callback: (data: any) => void) {
    this.getSocket().on('auctionStarted', callback);
    return () => this.getSocket().off('auctionStarted', callback);
  }

  offAuctionStarted(callback?: (data: any) => void) {
    if (callback) {
      this.getSocket().off('auctionStarted', callback);
    } else {
      this.getSocket().off('auctionStarted');
    }
  }

  onAuctionEnded(callback: (data: any) => void) {
    this.getSocket().on('auctionEnded', callback);
    return () => this.getSocket().off('auctionEnded', callback);
  }

  offAuctionEnded(callback?: (data: any) => void) {
    if (callback) {
      this.getSocket().off('auctionEnded', callback);
    } else {
      this.getSocket().off('auctionEnded');
    }
  }

  // --- Notifications ---

  subscribeToNotifications(userId: string) {
    this.getSocket().emit('notifications:subscribe', { userId });
  }

  onNotificationNew(callback: (data: { notification: any }) => void) {
    this.getSocket().on('notification:new', callback);
    return () => this.getSocket().off('notification:new', callback);
  }

  offNotificationNew(callback?: (data: { notification: any }) => void) {
    if (callback) {
      this.getSocket().off('notification:new', callback);
    } else {
      this.getSocket().off('notification:new');
    }
  }
}

export const socketService = new SocketService();

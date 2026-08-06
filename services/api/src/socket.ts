import type { Server as HttpServer } from 'node:http';
import { Server, Socket } from 'socket.io';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { env, corsOrigins } from './env.js';
import { prisma } from './prisma.js';
import { devStore, type PaymentStatus } from './devStore.js';
import { logger } from './utils/logger.js';

const useMemoryStore = env.AUTO_BIDDER_STORE === 'memory';

// Schemas
const joinSchema = z.object({ auctionId: z.string().min(1) });
const bidSchema = z.object({
  auctionId: z.string().min(1),
  amount: z.number().int().positive(),
});

// Global Socket.IO instance
let io: Server | null = null;

export function getIo() {
  return io;
}

/**
 * Attaches Socket.IO to the HTTP server and sets up event handlers.
 */
export function attachSocketServer(httpServer: HttpServer) {
  io = new Server(httpServer, {
    path: '/api/socket.io',
    cors: {
      origin: (origin, callback) => {
        // Allow mobile apps (no origin), whitelisted domains, and common development origins
        if (
          !origin ||
          corsOrigins.includes('*') ||
          corsOrigins.includes(origin) ||
          origin.includes('localhost:') ||
          origin.includes('127.0.0.1:') ||
          origin.endsWith('.autobidder.in')
        ) {
          callback(null, true);
        } else {
          console.warn(`[SOCKET CORS REJECTED] Origin: ${origin}`);
          callback(new Error('Not allowed by CORS'));
        }
      },
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Reliability settings
    allowEIO3: true,
    pingTimeout: 60000,
    pingInterval: 25000,
    connectTimeout: 45000,
    transports: ['websocket', 'polling'], // Support both, but client is now forced to websocket
  });

  // Authentication Middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization?.split(' ')[1];

    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
      (socket as any).userId = decoded.userId;
      (socket as any).userRole = decoded.role;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket: Socket) => {
    const userId = (socket as any).userId;
    logger.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Broadcast userConnected to specific user's private room if needed,
    // or just acknowledge connection.
    socket.emit('userConnected', { userId, socketId: socket.id });

    // Join auction-specific room
    socket.on('joinAuction', async (payload, ack) => {
      try {
        const { auctionId } = joinSchema.parse(payload);
        await socket.join(`auction:${auctionId}`);

        logger.log(`User ${userId} joined auction room: ${auctionId}`);

        // Fetch current auction state
        let highestBid = null;
        let bidHistory = [];

        if (useMemoryStore) {
          bidHistory = devStore.listBids().filter((b) => b.listing.id === auctionId).slice(0, 20);
          highestBid = bidHistory[0] ?? null;
        } else {
          bidHistory = await prisma.bid.findMany({
            where: { listingId: auctionId },
            orderBy: { amount: 'desc' },
            take: 20,
            include: { user: { select: { id: true, name: true } } },
          });
          highestBid = bidHistory[0] ?? null;
        }

        ack?.({ ok: true, bidHistory, highestBid });
      } catch (e: any) {
        logger.error('joinAuction error:', e.message);
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'Invalid payload' });
      }
    });

    // Leave auction room
    socket.on('leaveAuction', async (payload, ack) => {
      try {
        const { auctionId } = joinSchema.parse(payload);
        await socket.leave(`auction:${auctionId}`);
        logger.log(`User ${userId} left auction room: ${auctionId}`);
        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'Invalid payload' });
      }
    });

    // Place a bid with race condition prevention
    socket.on('placeBid', async (payload, ack) => {
      try {
        const { auctionId, amount } = bidSchema.parse(payload);
        const bidderId = (socket as any).userId;

        let result;
        if (useMemoryStore) {
          // Memory store simple implementation (race conditions possible but okay for devStore)
          result = devStore.createBid(auctionId, bidderId, amount);
        } else {
          // Database transaction to prevent race conditions
          result = await prisma.$transaction(async (tx: any) => {
            // 1. Get current listing and lock for update to prevent concurrent bids
            // Note: SQLite doesn't support SELECT FOR UPDATE well, but we use transactions.
            // For Postgres, we would use: await tx.$executeRaw`SELECT * FROM "Listing" WHERE id = ${auctionId} FOR UPDATE`;

            const listing = await tx.listing.findUnique({
              where: { id: auctionId },
              include: { bids: { orderBy: { amount: 'desc' }, take: 1 } }
            });

            if (!listing) throw new Error('Auction listing not found');
            if (listing.status !== 'ACTIVE') throw new Error('Auction is not active');

            const currentHighest = listing.bids[0]?.amount ?? listing.startingBid;

            // 2. Validate bid amount
            if (amount <= currentHighest) {
              throw new Error(`Bid must be higher than ₹${currentHighest.toLocaleString('en-IN')}`);
            }

            // 3. Create the bid
            return await tx.bid.create({
              data: { listingId: auctionId, userId: bidderId, amount },
              include: { user: { select: { id: true, name: true } } },
            });
          });
        }

        // Broadcast updated bid to everyone in the auction room
        io?.to(`auction:${auctionId}`).emit('bidUpdated', { bid: result });

        // Helper: Notify other bidders and process auto-bids
        await notifyOutbid(auctionId, bidderId, amount);
        await processAutoBids(auctionId, bidderId);

        ack?.({ ok: true, bid: result });
      } catch (e: any) {
        logger.error('placeBid error:', e.message);
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'Invalid bid request' });
      }
    });

    socket.on('disconnect', () => {
      logger.log(`User disconnected: ${userId} (Socket: ${socket.id})`);
      io?.emit('userDisconnected', { userId, socketId: socket.id });
    });
  });

  return io;
}

/**
 * Utility to notify users when they are outbid
 */
async function notifyOutbid(listingId: string, currentUserId: string, amount: number) {
  try {
    const io = getIo();
    if (!io) return;

    if (useMemoryStore) {
      const listing = devStore.listListings({}).find((l) => l.id === listingId);
      const outbidUsers = devStore
        .listBids()
        .filter((b) => b.listing.id === listingId && b.userId !== currentUserId)
        .map((b) => b.userId);

      const uniqueUsers = [...new Set(outbidUsers)];
      for (const userId of uniqueUsers) {
        const notification = devStore.createNotification(
          userId,
          'OUTBID',
          'You have been outbid!',
          `A new bid of ₹${amount.toLocaleString('en-IN')} was placed on ${listing?.title ?? 'a listing'}`
        );
        // Using private user room for notifications
        io.to(`user:${userId}`).emit('notification:new', { notification });
      }
    } else {
      const listing = await prisma.listing.findUnique({ where: { id: listingId } });
      const outbidBids = await prisma.bid.findMany({
        where: { listingId, userId: { not: currentUserId } },
        select: { userId: true },
        distinct: ['userId'],
      });

      for (const bid of outbidBids) {
        const notification = await prisma.notification.create({
          data: {
            userId: bid.userId,
            type: 'OUTBID',
            title: 'You have been outbid!',
            message: `A new bid of ₹${amount.toLocaleString('en-IN')} was placed on ${listing?.title ?? 'a listing'}`,
          },
        });
        io.to(`user:${bid.userId}`).emit('notification:new', { notification });
      }
    }
  } catch (error) {
    console.error('Error sending outbid notifications:', error);
  }
}

/**
 * Automatically handle auto-bids if configured
 */
async function processAutoBids(listingId: string, currentUserId: string) {
  try {
    const io = getIo();
    if (!io) return;

    if (useMemoryStore) {
      devStore.processAutoBids(listingId);
    } else {
      const currentHighest = await prisma.bid.findFirst({
        where: { listingId },
        orderBy: { amount: 'desc' },
      });

      if (!currentHighest) return;

      const autoBidConfigs = await prisma.autoBidConfig.findMany({
        where: {
          listingId,
          isActive: true,
          userId: { not: currentUserId },
        },
      });

      for (const config of autoBidConfigs) {
        const newAmount = currentHighest.amount + config.increment;
        if (newAmount <= config.maxLimit) {
          const bid = await prisma.bid.create({
            data: {
              listingId,
              userId: config.userId,
              amount: newAmount,
              autoBidConfigId: config.id,
            },
            include: { user: { select: { id: true, name: true } } },
          });

          io.to(`auction:${listingId}`).emit('bidUpdated', { bid });

          await prisma.notification.create({
            data: {
              userId: config.userId,
              type: 'AUTO_BID_TRIGGERED',
              title: 'Auto-bid Triggered',
              message: `Your auto-bid placed ₹${newAmount.toLocaleString('en-IN')}`,
            },
          });
        } else {
          await prisma.autoBidConfig.update({
            where: { id: config.id },
            data: { isActive: false },
          });

          await prisma.notification.create({
            data: {
              userId: config.userId,
              type: 'OUTBID',
              title: 'Auto-bid Limit Reached',
              message: `Your auto-bid limit has been reached on ${listingId}`,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing auto-bids:', error);
  }
}

/**
 * Public functions to emit auction status events from routes
 */
export function emitAuctionStarted(auctionId: string) {
  io?.to(`auction:${auctionId}`).emit('auctionStarted', { auctionId, timestamp: new Date() });
}

export function emitAuctionEnded(auctionId: string, winnerId?: string) {
  io?.to(`auction:${auctionId}`).emit('auctionEnded', { auctionId, winnerId, timestamp: new Date() });
}

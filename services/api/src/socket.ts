import type { Server as HttpServer } from 'node:http';
import { Server } from 'socket.io';
import { z } from 'zod';
import { env } from './env.js';
import { prisma } from './prisma.js';
import { devStore, type PaymentStatus, type NotificationType } from './devStore.js';

const useMemoryStore = process.env.AUTO_BIDDER_STORE !== 'database';

// Schemas
const joinSchema = z.object({ listingId: z.string().min(1) });
const bidSchema = z.object({
  listingId: z.string().min(1),
  userId: z.string().min(1),
  amount: z.number().int().positive(),
});
const autoBidSchema = z.object({
  listingId: z.string().min(1),
  userId: z.string().min(1),
  maxLimit: z.number().int().positive(),
  increment: z.number().int().positive().default(5000),
});
const pushTokenSchema = z.object({
  userId: z.string().min(1),
  token: z.string().min(1),
  platform: z.string().default('android'),
});

export function attachSocketServer(httpServer: HttpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: env.CORS_ORIGIN,
      credentials: true,
    },
  });

  io.on('connection', (socket) => {
    console.log(`Socket connected: ${socket.id}`);

    // Join listing room for real-time updates
    socket.on('listing:join', async (payload, ack) => {
      try {
        const { listingId } = joinSchema.parse(payload);
        await socket.join(`listing:${listingId}`);
        
        // Send current bid history
        const bidHistory = useMemoryStore
          ? devStore.listBids().filter((b) => b.listing.id === listingId).slice(0, 20)
          : await prisma.bid.findMany({
              where: { listingId },
              orderBy: { amount: 'desc' },
              take: 20,
              include: { user: { select: { id: true, name: true, phone: true } } },
            });

        // Send current highest bid
        const highestBid = bidHistory[0] ?? null;

        socket.emit('listing:state', { bidHistory, highestBid });
        ack?.({ ok: true, bidHistory, highestBid });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Leave listing room
    socket.on('listing:leave', async (payload, ack) => {
      try {
        const { listingId } = joinSchema.parse(payload);
        await socket.leave(`listing:${listingId}`);
        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Place a bid
    socket.on('bid:place', async (payload, ack) => {
      try {
        const { listingId, userId, amount } = bidSchema.parse(payload);

        let result;
        if (useMemoryStore) {
          result = devStore.createBid(listingId, userId, amount);
        } else {
          const listing = await prisma.listing.findUnique({ where: { id: listingId } });
          if (!listing) {
            ack?.({ ok: false, error: 'Listing not found' });
            return;
          }

          const highest = await prisma.bid.findFirst({
            where: { listingId },
            orderBy: { amount: 'desc' },
            select: { amount: true },
          });

          const min = highest?.amount ?? listing.startingBid;
          if (amount <= min) {
            ack?.({ ok: false, error: `Bid must be > ${min}` });
            return;
          }

          result = await prisma.bid.create({
            data: { listingId, userId, amount },
            include: { user: { select: { id: true, email: true, phone: true, name: true } } },
          });
        }

        // Broadcast to all users in the listing room
        io.to(`listing:${listingId}`).emit('bid:created', { bid: result });

        // Send outbid notifications to other bidders
        await notifyOutbid(io, listingId, userId, amount);

        // Process auto-bids
        await processAutoBids(io, listingId, userId);

        ack?.({ ok: true, bid: result });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Set up auto-bid
    socket.on('autobid:setup', async (payload, ack) => {
      try {
        const { listingId, userId, maxLimit, increment } = autoBidSchema.parse(payload);

        let result;
        if (useMemoryStore) {
          result = devStore.createAutoBidConfig(userId, listingId, maxLimit, increment);
        } else {
          result = await prisma.autoBidConfig.upsert({
            where: {
              userId_listingId: { userId, listingId },
            },
            create: { userId, listingId, maxLimit, increment, isActive: true },
            update: { maxLimit, increment, isActive: true },
          });
        }

        socket.join(`autobid:${userId}`);
        ack?.({ ok: true, autoBidConfig: result });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Cancel auto-bid
    socket.on('autobid:cancel', async (payload, ack) => {
      try {
        const { configId } = z.object({ configId: z.string().min(1) }).parse(payload);

        if (useMemoryStore) {
          devStore.deleteAutoBidConfig(configId);
        } else {
          await prisma.autoBidConfig.update({
            where: { id: configId },
            data: { isActive: false },
          });
        }

        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Register push token
    socket.on('push:register', async (payload, ack) => {
      try {
        const { userId, token, platform } = pushTokenSchema.parse(payload);

        if (useMemoryStore) {
          devStore.registerPushToken(userId, token, platform);
        } else {
          await prisma.pushToken.upsert({
            where: { token },
            create: { userId, token, platform },
            update: { userId, isActive: true },
          });
        }

        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Subscribe to notifications
    socket.on('notifications:subscribe', async (payload, ack) => {
      try {
        const { userId } = z.object({ userId: z.string().min(1) }).parse(payload);
        await socket.join(`user:${userId}`);
        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Mark notification as read
    socket.on('notification:read', async (payload, ack) => {
      try {
        const { notificationId } = z.object({ notificationId: z.string().min(1) }).parse(payload);

        if (useMemoryStore) {
          devStore.markNotificationRead(notificationId);
        } else {
          await prisma.notification.update({
            where: { id: notificationId },
            data: { read: true },
          });
        }

        ack?.({ ok: true });
      } catch (e) {
        ack?.({ ok: false, error: e instanceof Error ? e.message : 'invalid payload' });
      }
    });

    // Payment status update (from client after Stripe confirmation)
    socket.on('payment:confirm', async (payload, ack) => {
      try {
        const { paymentIntentId, status } = z.object({
          paymentIntentId: z.string().min(1),
          status: z.enum(['succeeded', 'failed', 'canceled']),
        }).parse(payload);

        let paymentStatus: PaymentStatus;
        if (status === 'succeeded') {
          paymentStatus = 'SUCCEEDED';
        } else if (status === 'canceled') {
          paymentStatus = 'CANCELLED';
        } else {
          paymentStatus = 'FAILED';
        }

        let payment;
        if (useMemoryStore) {
          const pay = devStore.listPayments({}).find((p) => p.stripePaymentIntentId === paymentIntentId);
          if (pay) {
            payment = devStore.updatePaymentStatus(pay.id, paymentStatus);
          }
        } else {
          payment = await prisma.payment.update({
            where: { stripePaymentIntentId: paymentIntentId },
            data: { status: paymentStatus },
          });
        }

        if (payment) {
          io.emit('payment:updated', { payment });
        }

        ack?.({ ok: true, payment });
      } catch (e) {
        const errorMessage = e instanceof Error ? e.message : 'invalid payload';
        ack?.({ ok: false, error: errorMessage });
      }
    });

    socket.on('disconnect', () => {
      console.log(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

// Helper functions
async function notifyOutbid(io: any, listingId: string, currentUserId: string, amount: number) {
  try {
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

async function processAutoBids(io: any, listingId: string, currentUserId: string) {
  try {
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
          });

          io.to(`listing:${listingId}`).emit('bid:created', { bid });

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
              message: `Your auto-bid limit has been reached`,
            },
          });
        }
      }
    }
  } catch (error) {
    console.error('Error processing auto-bids:', error);
  }
}

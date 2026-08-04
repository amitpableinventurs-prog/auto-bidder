import { Router } from 'express';
import type { NextFunction, Request, RequestHandler, Response } from 'express';
import { z } from 'zod';
import Stripe from 'stripe';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import crypto from 'node:crypto';
import bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import { fileURLToPath } from 'node:url';
import { devStore } from '../devStore.js';
import { env } from '../env.js';
import { prisma } from '../prisma.js';
import { emitAuctionStarted, emitAuctionEnded } from '../socket.js';
import { EmailService } from '../services/emailService.js';
import { createDnpRouter } from './dnp.js';
import { createAdminDnpRouter } from './admin/dnp.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../..');
const uploadsDir = path.join(rootDir, 'uploads');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 1 },
  fileFilter: (_req, file, cb) => {
    const allowedTypes = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf']);
    if (!allowedTypes.has(file.mimetype)) return cb(new Error('Only JPEG, PNG, WebP, and PDF uploads are allowed'));
    cb(null, true);
  },
});

const stripe = new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-02-24.acacia' });
const useMemoryStore = env.AUTO_BIDDER_STORE === 'memory';

type AsyncHandler = (req: Request, res: Response, next: NextFunction) => any | Promise<any>;

function wrap(handler: AsyncHandler): RequestHandler {
  return (req, res, next) => {
    Promise.resolve(handler(req, res, next)).catch((err) => {
      // If it's a Zod error, pass it to the global handler which knows how to format it
      if (err instanceof z.ZodError) return next(err);

      // Log for debugging but pass to global handler
      console.error(`[API ERROR] ${req.method} ${req.path}:`, err);
      next(err);
    });
  };
}

function errorResponse(res: Response, status: number, message: string, details?: any) {
  return res.status(status).json({ error: message, details });
}

// DNP Helper Functions
function generateReferralCode(): string {
  const prefix = 'AB';
  const random = Math.floor(1000 + Math.random() * 9000);
  return `${prefix}-DNP-${random}`;
}

function generateReferralLink(referralCode: string): string {
  return `https://autobidder.in?ref=${referralCode}`;
}

function generateShareLink(listingId: string, dnpCode: string): string {
  return `https://autobidder.in/car/${listingId}?dnp=${dnpCode}`;
}

function phoneEmail(phone: string) {
  return `${phone.replaceAll(/\D/g, '')}@phone.autobidder.local`;
}

function userSelect() {
  return {
    id: true,
    email: true,
    phone: true,
    name: true,
    avatarUrl: true,
    address: true,
    city: true,
    zipCode: true,
    isVerified: true,
    userType: true,
    businessName: true,
    role: true,
    kycStatus: true,
    isFeatured: true,
  };
}

const otpRateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5,
  message: { error: 'Too many OTP requests. Please try again after an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
  validate: { xForwardedForHeader: false, default: false },
  keyGenerator: (req) => req.body.email || req.ip || '',
});

function generateOTP(): string {
  if (env.NODE_ENV !== 'production') return '0000';
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function listingInclude() {
  return {
    seller: { select: { id: true, email: true, phone: true, name: true } },
    bids: {
      take: 1,
      orderBy: { amount: 'desc' as const },
      select: { id: true, amount: true, status: true, createdAt: true, userId: true },
    },
    appointments: {
      take: 1,
      orderBy: { createdAt: 'desc' as const },
      select: { id: true, type: true, status: true, scheduledAt: true, location: true },
    },
    rtoNoc: true,
  };
}

const listingStatusSchema = z.enum(['DRAFT', 'PENDING_INSPECTION', 'ACTIVE', 'SOLD', 'REJECTED']);
const bidStatusSchema = z.enum(['SUBMITTED', 'ACCEPTED', 'REJECTED', 'SUPERSEDED']);
const appointmentStatusSchema = z.enum(['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED']);
const appointmentTypeSchema = z.enum([
  'BUYER_INSPECTION',
  'AUTOBIDDER_INSPECTION',
  'AUTHORIZED_CENTER',
]);
const nocStatusSchema = z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']);
const paymentStatusSchema = z.enum(['PENDING', 'SUCCEEDED', 'REQUIRES_ACTION', 'FAILED', 'CANCELLED']);

export function createApiRouter() {
  const router = Router();
  const get = (path: string, ...handlers: any[]) =>
    router.get(path, ...handlers.map((h, i) => i === handlers.length - 1 ? wrap(h) : h));
  const post = (path: string, ...handlers: any[]) =>
    router.post(path, ...handlers.map((h, i) => i === handlers.length - 1 ? wrap(h) : h));
  const patch = (path: string, ...handlers: any[]) =>
    router.patch(path, ...handlers.map((h, i) => i === handlers.length - 1 ? wrap(h) : h));
  const put = (path: string, ...handlers: any[]) =>
    router.put(path, ...handlers.map((h, i) => i === handlers.length - 1 ? wrap(h) : h));
  const del = (path: string, ...handlers: any[]) =>
    router.delete(path, ...handlers.map((h, i) => i === handlers.length - 1 ? wrap(h) : h));

  /**
   * Middleware to protect routes and verify JWT
   */
  const authenticate: RequestHandler = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; role: string };
      (req as any).user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
    }
  };

  /**
   * Middleware to check user roles
   */
  const authorize = (roles: string[]): RequestHandler => {
    return (req, res, next) => {
      const user = (req as any).user;
      if (!user || !roles.includes(user.role)) {
        return res.status(403).json({ error: 'Forbidden: Insufficient permissions' });
      }
      next();
    };
  };

  // Health check for admin panel and monitoring
  get('/health', (_req, res) => res.json({ ok: true, service: 'api', time: new Date().toISOString() }));

  // Admin credentials are configured through environment variables. Keeping this
  // endpoint before the guard lets the panel obtain its initial JWT.
  post('/admin/login', async (req: Request, res: Response) => {
    const body = z.object({ email: z.string().email(), password: z.string().min(1) }).parse(req.body);
    const validEmail = body.email.trim().toLowerCase() === env.ADMIN_EMAIL.toLowerCase();
    const supplied = Buffer.from(body.password);
    const expected = Buffer.from(env.ADMIN_PASSWORD);

    // Check lengths before timingSafeEqual to avoid errors
    const validPassword = supplied.length === expected.length && crypto.timingSafeEqual(supplied, expected);

    if (!validEmail || !validPassword) {
      return errorResponse(res, 401, 'Invalid admin email or password');
    }

    const token = jwt.sign(
      { userId: 'admin', role: 'ADMIN', email: env.ADMIN_EMAIL },
      env.JWT_SECRET,
      { expiresIn: '12h' }
    );
    return res.json({ token, admin: { name: 'Administrator', email: env.ADMIN_EMAIL, role: 'ADMIN' } });
  });

  // Every remaining /admin API endpoint requires an authenticated admin token.
  router.use('/admin', authenticate, authorize(['ADMIN']));

  // DNP routes
  router.use('/dnp', authenticate, createDnpRouter());
  router.use('/admin/dnp', authenticate, authorize(['ADMIN']), createAdminDnpRouter());

  // Email Auth endpoints
  post('/auth/send-otp', otpRateLimiter, async (req: Request, res: Response) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    // Prevent duplicate OTP requests within 60 seconds
    const existingOtp = await prisma.oTP.findUnique({ where: { email } });
    if (existingOtp && Date.now() - existingOtp.lastResentAt.getTime() < 60000) {
      return res.status(429).json({ error: 'Please wait 60 seconds before requesting another OTP.' });
    }

    const otp = generateOTP();
    const hashedCode = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    await prisma.oTP.upsert({
      where: { email },
      update: { hashedCode, expiresAt, attempts: 0, lastResentAt: new Date() },
      create: { email, hashedCode, expiresAt },
    });

    // Logging for debugging (should be removed or masked in production)
    console.log(`[AUTH] OTP generated for ${email}: ${otp}`);

    const result = await EmailService.sendOtp(email, otp);
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to send OTP email.' });
    }

    res.json({ ok: true, message: 'OTP sent successfully.' });
  });

  post('/auth/verify-otp', async (req: Request, res: Response) => {
    const { email, otp } = z.object({
      email: z.string().email(),
      otp: z.string().min(4).max(6)
    }).parse(req.body);

    // Bypass for dev
    if (env.NODE_ENV !== 'production' && otp === '0000') {
      await prisma.oTP.delete({ where: { email } }).catch(() => {});
      return res.json({ ok: true, message: 'OTP verified successfully (Dev Bypass).' });
    }

    const record = await prisma.oTP.findUnique({ where: { email } });

    if (!record) {
      return res.status(404).json({ error: 'No OTP record found for this email.' });
    }

    if (Date.now() > record.expiresAt.getTime()) {
      await prisma.oTP.delete({ where: { email } });
      return res.status(401).json({ error: 'OTP has expired.' });
    }

    if (record.attempts >= 3) {
      await prisma.oTP.delete({ where: { email } });
      return res.status(401).json({ error: 'Maximum verification attempts exceeded. Please request a new OTP.' });
    }

    const isValid = await bcrypt.compare(otp, record.hashedCode);

    if (!isValid) {
      await prisma.oTP.update({
        where: { email },
        data: { attempts: { increment: 1 } },
      });
      return res.status(401).json({ error: 'Invalid OTP.' });
    }

    // Success: delete OTP
    await prisma.oTP.delete({ where: { email } });

    res.json({ ok: true, message: 'OTP verified successfully.' });
  });

  post('/auth/resend-otp', otpRateLimiter, async (req: Request, res: Response) => {
    const { email } = z.object({ email: z.string().email() }).parse(req.body);

    const existingOtp = await prisma.oTP.findUnique({ where: { email } });

    if (existingOtp && Date.now() - existingOtp.lastResentAt.getTime() < 60000) {
      return res.status(429).json({ error: 'Please wait 60 seconds before resending OTP.' });
    }

    const otp = generateOTP();
    const hashedCode = await bcrypt.hash(otp, 10);
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

    await prisma.oTP.upsert({
      where: { email },
      update: { hashedCode, expiresAt, attempts: 0, lastResentAt: new Date() },
      create: { email, hashedCode, expiresAt },
    });

    console.log(`[AUTH] OTP resent for ${email}: ${otp}`);

    const result = await EmailService.sendOtp(email, otp);
    if (!result.success) {
      return res.status(500).json({ error: 'Failed to resend OTP email.' });
    }

    res.json({ ok: true, message: 'OTP resent successfully.' });
  });

  // Auth endpoints
  post('/auth/otp/request', async (_req: Request, res: Response) => {
    const body = z.object({ phone: z.string().min(8).max(20) }).parse(_req.body);

    // Always allow demo OTP for now as per user request
    return res.json({
      ok: true,
      phone: body.phone,
      demoOtp: '0000',
      message: 'OTP sent. Demo OTP is 0000.',
    });
  });

  post('/auth/register', async (req: Request, res: Response) => {
    const body = z
      .object({
        phone: z.string().min(8).max(20),
        name: z.string().min(1),
        email: z.string().email().optional(),
        userType: z.enum(['OWNER', 'DEALER']).optional(),
      })
      .parse(req.body);

    const role = body.userType === 'DEALER' ? 'SELLER' : 'BUYER';

    if (useMemoryStore) {
      const user = devStore.upsertPhoneUser(body.phone, body.name);
      if (body.email) devStore.updateUser(user.id, { email: body.email });
      if (body.userType) devStore.updateUser(user.id, { userType: body.userType });

      const token = jwt.sign(
        { userId: user.id, role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ user, token });
    }

    const user = await prisma.user.upsert({
      where: { phone: body.phone },
      create: {
        phone: body.phone,
        email: body.email ?? phoneEmail(body.phone),
        name: body.name,
        role,
        userType: body.userType ?? 'OWNER',
      },
      update: {
        name: body.name,
        email: body.email,
        userType: body.userType,
        role,
      },
      select: userSelect(),
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ user, token });
  });

  post('/auth/otp/verify', async (req: Request, res: Response) => {
    const body = z
      .object({
        phone: z.string().min(8).max(20),
        otp: z.string().min(4).max(8),
        name: z.string().min(1).optional(),
        userType: z.enum(['OWNER', 'DEALER']).optional(),
      })
      .parse(req.body);

    if (body.otp !== '0000') {
      return res.status(401).json({ error: 'Invalid OTP for demo environment' });
    }

    const role = body.userType === 'DEALER' ? 'SELLER' : 'BUYER';

    if (useMemoryStore) {
      const user = devStore.upsertPhoneUser(body.phone, body.name ?? 'Mobile User');
      const token = jwt.sign(
        { userId: user.id, role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ user, token });
    }

    const user = await prisma.user.upsert({
      where: { phone: body.phone },
      create: {
        phone: body.phone,
        email: phoneEmail(body.phone),
        name: body.name ?? 'Mobile User',
        role,
        userType: body.userType ?? 'OWNER',
      },
      update: {
        name: body.name,
        userType: body.userType,
        role,
      },
      select: userSelect(),
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ user, token });
  });

  post('/auth/google', async (req: Request, res: Response) => {
    const body = z
      .object({
        email: z.string().email(),
        name: z.string().optional(),
        avatarUrl: z.string().optional(),
        googleId: z.string().optional(),
        phone: z.string().optional(),
      })
      .parse(req.body);

    if (useMemoryStore) {
      const user = devStore.upsertEmailUser(body.email, body.name);
      if (body.avatarUrl) devStore.updateUser(user.id, { avatarUrl: body.avatarUrl });
      if (body.phone) devStore.updateUser(user.id, { phone: body.phone });

      const token = jwt.sign(
        { userId: user.id, role: user.role },
        env.JWT_SECRET,
        { expiresIn: '7d' }
      );
      return res.json({ user, token });
    }

    const user = await prisma.user.upsert({
      where: { email: body.email },
      create: {
        email: body.email,
        name: body.name ?? 'Google User',
        avatarUrl: body.avatarUrl,
        phone: body.phone,
        role: 'BUYER',
        isVerified: true, // Google accounts are considered verified
      },
      update: {
        name: body.name,
        avatarUrl: body.avatarUrl,
        phone: body.phone ?? undefined,
      },
      select: userSelect(),
    });

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({ user, token });
  });

  patch('/users/:userId', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const body = z.object({
      name: z.string().optional(),
      email: z.string().email().optional(),
      avatarUrl: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      zipCode: z.string().optional(),
      userType: z.string().optional(),
      businessName: z.string().optional(),
    }).parse(req.body);

    if (useMemoryStore) {
      const user = devStore.updateUser(userId, body);
      return res.json({ user });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: body,
      select: userSelect(),
    });

    res.json({ user });
  });

  get('/users/:userId', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (useMemoryStore) {
      return res.json({ user: devStore.getUser(userId) });
    }
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: userSelect(),
    });
    res.json({ user });
  });

  get('/brands', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ brands: devStore.getBrands() });
    }

    const brands = await prisma.brand.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({ brands: brands.length > 0 ? brands : devStore.getBrands() });
  });

  get('/collections', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ collections: devStore.getCollections() });
    }

    const collections = await prisma.collection.findMany({
        where: { isActive: true },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }]
    });

    res.json({ collections: collections.length > 0 ? collections : devStore.getCollections() });
  });

  // Admin Brands
  get('/admin/brands/all', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ brands: devStore.listBrands() });
    }
    const brands = await prisma.brand.findMany({ orderBy: { order: 'asc' } });
    res.json({ brands });
  });

  post('/admin/brands', async (req: Request, res: Response) => {
    const body = z.object({
      name: z.string(),
      logo: z.string(),
      count: z.string().optional().default('0 Cars'),
      description: z.string().optional(),
      order: z.number().int().default(0),
      isActive: z.boolean().default(true),
    }).parse(req.body);

    if (useMemoryStore) {
      const brand = devStore.createBrand({
        name: body.name,
        logo: body.logo,
        count: body.count,
        description: body.description ?? null,
        order: body.order,
        isActive: body.isActive,
      });
      return res.status(201).json({ brand });
    }
    const brand = await prisma.brand.create({ data: body });
    res.status(201).json({ brand });
  });

  patch('/admin/brands/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const body = z.object({
      name: z.string().optional(),
      logo: z.string().optional(),
      count: z.string().optional(),
      description: z.string().optional(),
      order: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);

    if (useMemoryStore) {
      const brand = devStore.updateBrand(id, body);
      return res.json({ brand });
    }
    const brand = await prisma.brand.update({ where: { id }, data: body });
    res.json({ brand });
  });

  del('/admin/brands/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.deleteBrand(id);
      return res.json({ ok: true });
    }
    await prisma.brand.delete({ where: { id } });
    res.json({ ok: true });
  });

  // Admin Collections
  get('/admin/collections/all', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ collections: devStore.listCollections() });
    }
    const collections = await prisma.collection.findMany({ orderBy: { order: 'asc' } });
    res.json({ collections });
  });

  post('/admin/collections', async (req: Request, res: Response) => {
    const body = z.object({
      name: z.string(),
      imageUrl: z.string(),
      order: z.number().int().default(0),
      isActive: z.boolean().default(true),
    }).parse(req.body);

    if (useMemoryStore) {
      const collection = devStore.createCollection({
        name: body.name,
        imageUrl: body.imageUrl,
        order: body.order,
        isActive: body.isActive,
      });
      return res.status(201).json({ collection });
    }
    const collection = await prisma.collection.create({ data: body });
    res.status(201).json({ collection });
  });

  patch('/admin/collections/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const body = z.object({
      name: z.string().optional(),
      imageUrl: z.string().optional(),
      order: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);

    if (useMemoryStore) {
      const collection = devStore.updateCollection(id, body);
      return res.json({ collection });
    }
    const collection = await prisma.collection.update({ where: { id }, data: body });
    res.json({ collection });
  });

  del('/admin/collections/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.deleteCollection(id);
      return res.json({ ok: true });
    }
    await prisma.collection.delete({ where: { id } });
    res.json({ ok: true });
  });

  get('/seller/:userId/leads', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    // In a real app, leads would be tracked in a separate table.
    // For now, we'll return some mock leads based on bids on the seller's listings.
    const listings = await prisma.listing.findMany({
        where: { sellerId: userId },
        include: { bids: { include: { user: { select: { name: true, phone: true } } } } }
    });

    const leads = listings.flatMap(l => (l.bids || []).map(b => ({
        id: b.id,
        name: b.user.name,
        phone: b.user.phone,
        listingTitle: l.title,
        timeAgo: 'Just now',
    })));

    res.json({ leads });
  });

  post('/kyc/submit', authenticate, async (req: Request, res: Response) => {
    const body = z.object({
      userId: z.string(),
      documentType: z.string(),
      documentImage: z.string(),
    }).parse(req.body);

    const authUser = (req as any).user;
    if (authUser.userId !== body.userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (useMemoryStore) {
      devStore.updateUser(body.userId, { isVerified: true, kycStatus: 'VERIFIED' });
      return res.json({ ok: true });
    }

    await prisma.user.update({
      where: { id: body.userId },
      data: {
        isVerified: false, // Set to false initially, admin will verify
        kycStatus: 'PENDING',
        kycImageUrl: body.documentImage
      },
    });

    res.json({ ok: true });
  });

  post('/auth/demo-login', async (req: Request, res: Response) => {
    const body = z
      .object({
        email: z.string().email(),
        name: z.string().min(1).optional(),
      })
      .parse(req.body);

    if (useMemoryStore) {
      const user = devStore.upsertEmailUser(body.email, body.name);
      return res.json({ user });
    }

    const user = await prisma.user.upsert({
      where: { email: body.email },
      create: { email: body.email, name: body.name },
      update: { name: body.name },
      select: userSelect(),
    });

    res.json({ user });
  });

  // File Upload
  post('/upload', authenticate, upload.single('file'), async (req: Request, res: Response) => {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename });
  });

  // App bootstrap
  get('/app/bootstrap', async (req: Request, res: Response) => {
    const city = z.string().optional().parse(req.query.city);

    if (useMemoryStore) {
      return res.json(devStore.bootstrap(city));
    }

    const [activeListings, pendingAppointments, submittedBids] = await Promise.all([
      prisma.listing.findMany({
        where: {
          status: { in: ['ACTIVE', 'PENDING_INSPECTION'] },
          ...(city ? { city } : {}),
        },
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: listingInclude(),
      }),
      prisma.appointment.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.bid.count({ where: { status: 'SUBMITTED' } }),
    ]);

    res.json({
      listings: activeListings,
      stats: {
        activeListings: activeListings.length,
        pendingAppointments,
        submittedBids,
      },
    });
  });

  get('/cities', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.getCities());
    }

    const cities = await prisma.listing.findMany({
      select: { city: true },
      distinct: ['city'],
      where: { city: { not: null } },
    });

    const popular = ['Mumbai', 'Delhi', 'Bangalore', 'Hyderabad', 'Ahmedabad', 'Chennai', 'Kolkata', 'Pune', 'Jaipur', 'Lucknow'];
    const allCities = Array.from(new Set([...popular, ...cities.map(c => c.city as string)]))
      .filter(Boolean)
      .sort();

    res.json({ cities: allCities });
  });

  get('/sliders', async (req: Request, res: Response) => {
    const type = req.query.type as string;
    if (useMemoryStore) {
      return res.json({ sliders: devStore.listSliders({ type: type as any, isActive: true }) });
    }
    const sliders = await prisma.slider.findMany({
      where: {
        isActive: true,
        ...(type ? { type } : {}),
      },
      orderBy: { order: 'asc' },
    });
    res.json({ sliders });
  });



  // Listings
  get('/listings', async (req: Request, res: Response) => {
    const query = z
      .object({
        status: listingStatusSchema.optional(),
        city: z.string().optional(),
        sellerId: z.string().optional(),
        brand: z.string().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        minPrice: z.coerce.number().optional(),
        maxPrice: z.coerce.number().optional(),
        q: z.string().optional(),
        carType: z.string().optional(),
        lat: z.coerce.number().optional(),
        lng: z.coerce.number().optional(),
        radius: z.coerce.number().default(50),
        page: z.coerce.number().int().positive().default(1),
        limit: z.coerce.number().int().positive().default(20),
        sortBy: z.enum(['createdAt', 'demandPrice', 'manufacturingYear']).default('createdAt'),
        sortOrder: z.enum(['asc', 'desc']).default('desc'),
      })
      .parse(req.query);

    const q = query.q?.trim();
    const skip = (query.page - 1) * query.limit;

    if (useMemoryStore) {
      return res.json({ listings: devStore.listListings({ ...query, q }) });
    }

    const where = {
      ...(query.status ? { status: query.status } : {}),
      ...(query.city ? { city: query.city } : {}),
      ...(query.sellerId ? { sellerId: query.sellerId } : {}),
      ...(query.brand ? { brand: { contains: query.brand } } : {}),
      ...(query.fuelType ? { fuelType: query.fuelType } : {}),
      ...(query.transmission ? { transmission: query.transmission } : {}),
      ...(query.carType ? { carType: query.carType } : {}),
      ...(query.minPrice || query.maxPrice ? {
          demandPrice: {
              ...(query.minPrice ? { gte: query.minPrice } : {}),
              ...(query.maxPrice ? { lte: query.maxPrice } : {}),
          }
      } : {}),
      ...(q
        ? {
            OR: [
              { title: { contains: q } },
              { brand: { contains: q } },
              { model: { contains: q } },
              { city: { contains: q } },
              { plateNumber: { contains: q } },
            ],
          }
        : {}),
    };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        orderBy: { [query.sortBy]: query.sortOrder },
        include: listingInclude(),
        skip,
        take: query.limit,
      }),
      prisma.listing.count({ where }),
    ]);

    res.json({
      listings,
      pagination: {
        total,
        page: query.page,
        limit: query.limit,
        pages: Math.ceil(total / query.limit),
      }
    });
  });

  router.post('/listings', authenticate, authorize(['BUYER', 'SELLER', 'ADMIN']), wrap(async (req, res) => {
    const body = z
      .object({
        sellerId: z.string().min(1),
        title: z.string().min(1).optional(),
        description: z.string().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        variant: z.string().optional(),
        manufacturingYear: z.number().int().min(1980).max(2035).optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        color: z.string().optional(),
        city: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        plateNumber: z.string().optional(),
        ownership: z.string().optional(),
        kilometersDriven: z.number().int().nonnegative().optional(),
        condition: z.string().optional(),
        demandPrice: z.number().int().nonnegative().optional(),
        startingBid: z.number().int().nonnegative().optional(),
        imageUrl: z.string().optional(),
        status: listingStatusSchema.default('PENDING_INSPECTION'),
        // New fields
        rcOwnerName: z.string().optional(),
        rcOwnerNumber: z.string().optional(),
        rcAvailability: z.string().optional(),
        originalInvoice: z.boolean().optional(),
        bankHypothecation: z.boolean().optional(),
        rtoTaxStatus: z.string().optional(),
        rtoNocIssued: z.string().optional(),
        duplicateKeys: z.boolean().optional(),
        serviceBookAvailability: z.boolean().optional(),
        remainingFreeService: z.number().optional(),
        remainingOemWarranty: z.string().optional(),
        insuranceType: z.string().optional(),
        insuranceExpiry: z.string().optional(),
        listedBy: z.string().optional(),
        sellingTimeline: z.string().optional(),
        commission: z.string().optional(),
        images: z.array(z.string()).optional(),
        rcImages: z.array(z.string()).optional(),
        invoiceImages: z.array(z.string()).optional(),
        bankNocImages: z.array(z.string()).optional(),
        loanStatus: z.string().optional(),
        rtoNocNumber: z.string().optional(),
        rtoIssues: z.string().optional(),
        ownershipType: z.string().optional(),
        cngLpgStatus: z.string().optional(),
        carType: z.string().optional(),
        registrationDate: z.string().optional(),
        rtoNocFor: z.string().optional(),
        accidentalHistory: z.string().optional(),
        inspectionReportUrl: z.string().optional(),
        inspectionReportStatus: z.string().optional(),
      })
      .parse(req.body);

    const title = body.title ?? [body.brand, body.model, body.variant].filter(Boolean).join(' ');
    if (!title) return res.status(400).json({ error: 'title or brand/model is required' });

    if (useMemoryStore) {
      const listing = devStore.createListing({
        ...body,
        title,
        sellerId: body.sellerId || (req as any).user?.id || 'admin',
        startingBid: body.startingBid ?? Math.max(Math.floor((body.demandPrice ?? 0) * 0.9), 0),
      } as any);
      return res.status(201).json({ listing });
    }

    const listing = await prisma.listing.create({
      data: {
        ...body,
        title,
        sellerId: body.sellerId || (req as any).user?.id || 'admin',
        startingBid: body.startingBid ?? Math.max(Math.floor((body.demandPrice ?? 0) * 0.9), 0),
      },
      include: listingInclude(),
    });

    res.status(201).json({ listing });
  }));

  get('/listings/:listingId', wrap(async (req, res) => {
    const listingId = z.string().parse(req.params.listingId);

    if (useMemoryStore) {
      const listing = devStore.getListing(listingId);
      if (!listing) return res.status(404).json({ error: 'Listing not found' });
      return res.json({ listing });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      include: {
        ...listingInclude(),
        bids: {
          orderBy: { amount: 'desc' },
          take: 20,
          include: { user: { select: { id: true, email: true, phone: true, name: true } } },
        },
        appointments: {
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, email: true, phone: true, name: true } } },
        },
      },
    });

    if (!listing) return res.status(404).json({ error: 'Listing not found' });
    res.json({ listing });
  }));

  del('/listings/:listingId', authenticate, wrap(async (req, res) => {
    const listingId = z.string().parse(req.params.listingId);
    const authUser = (req as any).user;

    if (useMemoryStore) {
      devStore.deleteListing(listingId);
      return res.json({ ok: true });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    if (listing.sellerId !== authUser.userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: You do not own this listing' });
    }

    await prisma.listing.delete({ where: { id: listingId } });
    res.json({ ok: true });
  }));

  patch('/listings/:listingId', authenticate, wrap(async (req, res) => {
    const listingId = z.string().parse(req.params.listingId);
    const authUser = (req as any).user;
    const body = z
      .object({
        status: listingStatusSchema.optional(),
        demandPrice: z.number().int().nonnegative().optional(),
        startingBid: z.number().int().nonnegative().optional(),
        city: z.string().optional(),
        condition: z.string().optional(),
        description: z.string().optional(),
        latitude: z.number().optional(),
        longitude: z.number().optional(),
        title: z.string().optional(),
        brand: z.string().optional(),
        model: z.string().optional(),
        variant: z.string().optional(),
        manufacturingYear: z.number().int().optional(),
        fuelType: z.string().optional(),
        transmission: z.string().optional(),
        color: z.string().optional(),
        imageUrl: z.string().optional(),
        images: z.array(z.string()).optional(),
        rcOwnerName: z.string().optional(),
        rcOwnerNumber: z.string().optional(),
        rcAvailability: z.string().optional(),
        originalInvoice: z.boolean().optional(),
        bankHypothecation: z.boolean().optional(),
        loanStatus: z.string().optional(),
        rtoTaxStatus: z.string().optional(),
        rtoNocIssued: z.string().optional(),
        rtoNocNumber: z.string().optional(),
        duplicateKeys: z.boolean().optional(),
        serviceBookAvailability: z.boolean().optional(),
        remainingFreeService: z.number().optional(),
        remainingOemWarranty: z.string().optional(),
        insuranceType: z.string().optional(),
        insuranceExpiry: z.string().optional(),
        listedBy: z.string().optional(),
        sellingTimeline: z.string().optional(),
        commission: z.string().optional(),
        inspectionReportUrl: z.string().optional(),
        inspectionReportStatus: z.string().optional(),
      })
      .parse(req.body);

    if (useMemoryStore) {
      const listing = devStore.updateListing(listingId, body);
      return res.json({ listing });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    if (listing.sellerId !== authUser.userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden: You do not own this listing' });
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: body,
      include: listingInclude(),
    });

    res.json({ listing: updated });
  }));

  // Bids
  post('/listings/:listingId/bids', authenticate, authorize(['BUYER', 'ADMIN']), wrap(async (req, res) => {
    const listingId = z.string().parse(req.params.listingId);
    const body = z
      .object({
        userId: z.string().min(1),
        amount: z.number().int().positive(),
      })
      .parse(req.body);

    if (useMemoryStore) {
      const bid = devStore.createBid(listingId, body.userId, body.amount);
      return res.status(201).json({ bid });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) return res.status(404).json({ error: 'Listing not found' });

    const highest = await prisma.bid.findFirst({
      where: { listingId },
      orderBy: { amount: 'desc' },
      select: { amount: true },
    });

    const min = highest?.amount ?? listing.startingBid;
    if (body.amount <= min) {
      return res.status(400).json({ error: `Bid must be > ${min}` });
    }

    const bid = await prisma.bid.create({
      data: {
        listingId,
        userId: body.userId,
        amount: body.amount,
      },
      include: { user: { select: { id: true, email: true, phone: true, name: true } } },
    });

    res.status(201).json({ bid });
  }));

  get('/bids', async (req: Request, res: Response) => {
    const query = z.object({ userId: z.string().optional() }).parse(req.query);

    if (useMemoryStore) {
      return res.json({ bids: devStore.listBids(query.userId) });
    }

    const bids = await prisma.bid.findMany({
      where: query.userId ? { userId: query.userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: true,
        user: { select: { id: true, email: true, phone: true, name: true } },
      },
    });

    res.json({ bids });
  });

  patch('/bids/:bidId/status', async (req: Request, res: Response) => {
    const bidId = z.string().parse(req.params.bidId);
    const body = z.object({ status: bidStatusSchema }).parse(req.body);

    if (useMemoryStore) {
      const bid = devStore.updateBidStatus(bidId, body.status);
      return res.json({ bid });
    }

     const bid = await prisma.bid.update({
       where: { id: bidId },
       data: { status: body.status },
       include: { listing: true, user: { select: { id: true, email: true, phone: true, name: true } } },
     });

     res.json({ bid });
   });

  // Auto-bid endpoints
  post('/auto-bids', authenticate, async (req: Request, res: Response) => {
    const body = z.object({
      userId: z.string().min(1),
      listingId: z.string().min(1),
      maxLimit: z.number().int().positive(),
      increment: z.number().int().positive().default(5000),
    }).parse(req.body);

    const authUser = (req as any).user;
    if (authUser.userId !== body.userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (useMemoryStore) {
      const config = devStore.createAutoBidConfig(body.userId, body.listingId, body.maxLimit, body.increment);
      return res.status(201).json({ autoBidConfig: config });
    }

    const config = await prisma.autoBidConfig.upsert({
      where: {
        userId_listingId: { userId: body.userId, listingId: body.listingId }
      },
      create: body,
      update: {
        maxLimit: body.maxLimit,
        increment: body.increment,
        isActive: true
      }
    });

    res.status(201).json({ autoBidConfig: config });
  });

  del('/auto-bids/:configId', async (req: Request, res: Response) => {
    const configId = z.string().parse(req.params.configId);

    if (useMemoryStore) {
      devStore.deleteAutoBidConfig(configId);
      return res.json({ ok: true });
    }

    await prisma.autoBidConfig.update({
      where: { id: configId },
      data: { isActive: false }
    });
    res.json({ ok: true });
  });

  get('/auto-bids', async (req: Request, res: Response) => {
    const query = z.object({ userId: z.string().optional() }).parse(req.query);

    if (useMemoryStore) {
      return res.json({ autoBids: devStore.getAutoBidConfigs(query.userId) });
    }

    const autoBids = await prisma.autoBidConfig.findMany({
      where: query.userId ? { userId: query.userId } : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        listing: true,
        user: { select: { id: true, name: true } }
      }
    });
    res.json({ autoBids });
  });

  post('/appointments', authenticate, async (req: Request, res: Response) => {
    const body = z
      .object({
        listingId: z.string().min(1),
        userId: z.string().min(1),
        type: appointmentTypeSchema,
        scheduledAt: z.string().datetime().optional(),
        location: z.string().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    const authUser = (req as any).user;
    if (authUser.userId !== body.userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (useMemoryStore) {
      const appointment = devStore.createAppointment({
        listingId: body.listingId || '',
        userId: body.userId || '',
        type: body.type as any,
        scheduledAt: body.scheduledAt,
        location: body.location,
        notes: body.notes,
      });
      return res.status(201).json({ appointment });
    }

    const appointment = await prisma.appointment.create({
      data: {
        listingId: body.listingId,
        userId: body.userId,
        type: body.type,
        scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
        location: body.location,
        notes: body.notes,
      },
      include: {
        listing: true,
        user: { select: { id: true, email: true, phone: true, name: true } },
      },
    });

    await prisma.listing.update({
      where: { id: body.listingId },
      data: { status: 'PENDING_INSPECTION' },
    });

    res.status(201).json({ appointment });
  });

  get('/appointments', async (req: Request, res: Response) => {
    const userId = z.string().optional().parse(req.query.userId);
    if (useMemoryStore) {
        return res.json({ appointments: [] });
    }
    const appointments = await prisma.appointment.findMany({
        where: userId ? { userId } : undefined,
        orderBy: { scheduledAt: 'desc' },
        include: { listing: true, user: { select: { id: true, name: true, phone: true } } }
    });
    res.json({ appointments });
  });

  patch('/appointments/:appointmentId/status', async (req: Request, res: Response) => {
    const appointmentId = z.string().parse(req.params.appointmentId);
    const body = z.object({ status: appointmentStatusSchema }).parse(req.body);

    if (useMemoryStore) {
      const appointment = devStore.updateAppointmentStatus(appointmentId, body.status);
      return res.json({ appointment });
    }

    const appointment = await prisma.appointment.update({
      where: { id: appointmentId },
      data: { status: body.status },
      include: { listing: true, user: { select: { id: true, email: true, phone: true, name: true } } },
    });

    res.json({ appointment });
  });

  get('/listings/:listingId/rto-noc', async (req: Request, res: Response) => {
    const listingId = z.string().parse(req.params.listingId);
    if (useMemoryStore) {
      return res.json({ rtoNoc: devStore.getRtoNoc(listingId) });
    }
    const rtoNoc = await prisma.rtoNoc.findUnique({ where: { listingId } });
    res.json({ rtoNoc });
  });

  put('/listings/:listingId/rto-noc', async (req: Request, res: Response) => {
    const listingId = z.string().parse(req.params.listingId);
    const body = z
      .object({
        rtoTaxStatus: z.string().optional(),
        rtoDues: z.string().optional(),
        rtoNocIssued: z.string().optional(),
        bankNocStatus: nocStatusSchema.optional(),
        rtoNocStatus: nocStatusSchema.optional(),
        invoiceStatus: nocStatusSchema.optional(),
        ownerIdStatus: nocStatusSchema.optional(),
        uploadedCount: z.number().int().nonnegative().optional(),
        notes: z.string().optional(),
      })
      .parse(req.body);

    if (useMemoryStore) {
      const rtoNoc = devStore.upsertRtoNoc(listingId, body);
      return res.json({ rtoNoc });
    }

    const rtoNoc = await prisma.rtoNoc.upsert({
      where: { listingId },
      create: { listingId, ...body },
      update: body,
    });

    res.json({ rtoNoc });
  });

  // Favorites
  get('/favorites', async (req: Request, res: Response) => {
    const userId = z.string().parse(req.query.userId);
    if (useMemoryStore) {
      return res.json({ favorites: devStore.listFavorites(userId) });
    }
    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: { listing: { include: listingInclude() } },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ favorites: favorites.map(f => f.listing) });
  });

  post('/favorites/toggle', authenticate, async (req: Request, res: Response) => {
    const { userId, listingId } = z.object({ userId: z.string(), listingId: z.string() }).parse(req.body);

    const authUser = (req as any).user;
    if (authUser.userId !== userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }
    if (useMemoryStore) {
      return res.json(devStore.toggleFavorite(userId, listingId));
    }

    // Verify user and listing exist to avoid foreign key violations
    const [userExists, listingExists] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.listing.findUnique({ where: { id: listingId } })
    ]);

    if (!userExists) {
      return res.status(404).json({ error: 'User not found in database' });
    }

    if (!listingExists) {
      // If it's a mock ID from the frontend, handle it gracefully
      if (listingId.startsWith('mock')) {
        return res.json({ isFavorite: true, note: 'Mock listing simulated' });
      }
      return res.status(404).json({ error: 'Listing not found in database' });
    }

    const existing = await prisma.favorite.findUnique({
      where: { userId_listingId: { userId, listingId } }
    });
    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return res.json({ isFavorite: false });
    }
    await prisma.favorite.create({ data: { userId, listingId } });
    res.json({ isFavorite: true });
  });

  // Seller stats
  get('/seller/:userId/stats', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (useMemoryStore) {
      const stats = devStore.dashboard().stats;
      return res.json({
        totalEarnings: stats.totalRevenue / 10,
        activeListings: stats.activeListings,
        liveBids: stats.submittedBids,
        soldCars: Math.floor(stats.listings / 5),
        // User specific stats for profile
        bidsPlaced: 12,
        carsWon: 2,
        savings: 45000,
      });
    }
    const [activeListings, soldCars, listings, totalEarningsResult, bidsPlaced, carsWon] = await Promise.all([
      prisma.listing.count({ where: { sellerId: userId, status: 'ACTIVE' } }),
      prisma.listing.count({ where: { sellerId: userId, status: 'SOLD' } }),
      prisma.listing.findMany({ where: { sellerId: userId }, select: { id: true } }),
      prisma.payment.aggregate({
        where: { listing: { sellerId: userId }, status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
      prisma.bid.count({ where: { userId } }),
      prisma.listing.count({ where: { bids: { some: { userId, status: 'ACCEPTED' } } } }),
    ]);
    const listingIds = listings.map(l => l.id);
    const liveBids = await prisma.bid.count({ where: { listingId: { in: listingIds }, status: 'SUBMITTED' } });
    res.json({
      totalEarnings: totalEarningsResult._sum.amount || 0,
      activeListings,
      liveBids,
      soldCars,
      bidsPlaced,
      carsWon,
      savings: carsWon * 15000
    });
  });

  get('/seller/:userId/activity', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const activities = await prisma.bid.findMany({
        where: { listing: { sellerId: userId } },
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } }, listing: { select: { title: true } } }
    });
    res.json({ activities });
  });

  // User wallet
  get('/users/:userId/wallet', authenticate, async (req: Request, res: Response) => {
    const userId = req.params.userId;
    const authUser = (req as any).user;

    if (authUser.userId !== userId && authUser.role !== 'ADMIN') {
        return res.status(403).json({ error: 'Forbidden' });
    }

    if (useMemoryStore) {
        return res.json({
            balance: 25000,
            transactions: [
              { id: 'tx1', type: 'CREDIT', amount: 5000, title: 'Initial Deposit', date: new Date(), status: 'SUCCEEDED' },
              { id: 'tx2', type: 'DEBIT', amount: 2000, title: 'Bid Security Deposit', date: new Date(), status: 'SUCCEEDED' },
            ]
        });
    }

    const payments = await prisma.payment.findMany({
        where: {
            OR: [
                { bid: { userId } },
                { listing: { sellerId: userId } }
            ],
            status: 'SUCCEEDED'
        },
        include: { listing: true, bid: true },
        orderBy: { createdAt: 'desc' }
    });

    // In a real app, balance would be tracked in a separate ledger.
    // Here we'll sum up payments as a simplified example.
    const totalPayments = payments.reduce((acc, p) => acc + p.amount, 0);
    const balance = 100000 + totalPayments; // Mock starting balance + activity

    const transactions = payments.map(p => ({
        id: p.id,
        title: p.listing?.title || (p.bid ? 'Bid Payment' : 'Payment'),
        amount: p.amount,
        type: p.bid ? 'DEBIT' : 'CREDIT',
        date: p.createdAt,
        status: p.status
    }));

    res.json({ balance, transactions });
  });

  get('/users/:userId/payments', async (req: Request, res: Response) => {
    const userId = req.params.userId;
    if (useMemoryStore) {
        return res.json({ payments: [] });
    }
    const payments = await prisma.payment.findMany({
      where: {
        OR: [
          { bid: { userId } },
          { listing: { sellerId: userId } }
        ]
      },
      include: { listing: true, bid: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ payments });
  });

  get('/admin/dashboard', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.dashboard());
    }

    const [
      users,
      dealers,
      listings,
      activeListings,
      pendingListings,
      submittedBids,
      pendingAppointments,
      fraudAlerts,
      pendingLeads,
      recentListings,
      recentBids,
      recentAppointments,
      totalRevenueResult,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { userType: 'DEALER' } }),
      prisma.listing.count(),
      prisma.listing.count({ where: { status: 'ACTIVE' } }),
      prisma.listing.count({ where: { status: 'PENDING_INSPECTION' } }),
      prisma.bid.count({ where: { status: 'SUBMITTED' } }),
      prisma.appointment.count({ where: { status: { in: ['PENDING', 'CONFIRMED'] } } }),
      prisma.fraudAlert.count(),
      // Mocking leads count for now as there is no Lead model yet
      Promise.resolve(2),
      prisma.listing.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: listingInclude(),
      }),
      prisma.bid.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: true,
          user: { select: { id: true, email: true, phone: true, name: true } },
        },
      }),
      prisma.appointment.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          listing: true,
          user: { select: { id: true, email: true, phone: true, name: true } },
        },
      }),
      prisma.payment.aggregate({
        where: { status: 'SUCCEEDED' },
        _sum: { amount: true },
      }),
    ]);

    res.json({
      stats: {
        users,
        dealers,
        listings,
        activeListings,
        pendingListings,
        submittedBids,
        pendingAppointments,
        fraudAlerts,
        pendingLeads,
        totalRevenue: totalRevenueResult._sum.amount || 0,
      },
      recentListings,
      recentBids,
      recentAppointments,
    });
  });

  post('/admin/seed-demo', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.status(201).json(devStore.seedDemo());
    }

    const seller = await prisma.user.upsert({
      where: { email: 'seller@autobidder.demo' },
      create: {
        email: 'seller@autobidder.demo',
        phone: '9999900001',
        name: 'Demo Seller',
      },
      update: { name: 'Demo Seller' },
    });

    const buyer = await prisma.user.upsert({
      where: { email: 'buyer@autobidder.demo' },
      create: {
        email: 'buyer@autobidder.demo',
        phone: '9999900002',
        name: 'Demo Buyer',
      },
      update: { name: 'Demo Buyer' },
    });

    const listing = await prisma.listing.create({
      data: {
        sellerId: seller.id,
        title: 'Mahindra Thar 2019 - AX (O) D 2WD HT',
        description: 'Demo active listing for admin and mobile testing.',
        brand: 'Mahindra',
        model: 'Thar',
        variant: 'AX (O) D 2WD HT',
        manufacturingYear: 2019,
        fuelType: 'Diesel',
        transmission: 'Manual',
        color: 'Black',
        city: 'Indore',
        plateNumber: 'MP20CC****',
        ownership: '1st Owner',
        kilometersDriven: 42000,
        condition: 'New like',
        demandPrice: 884000,
        startingBid: 804000,
        imageUrl:
          'https://images.unsplash.com/photo-1629897048514-3860bb441113?auto=format&fit=crop&w=800&q=80',
        status: 'ACTIVE',
        rtoNoc: {
          create: {
            rtoTaxStatus: 'Paid',
            rtoNocIssued: 'No',
            invoiceStatus: 'IN_PROGRESS',
            ownerIdStatus: 'COMPLETED',
          },
        },
      },
    });

    const bid = await prisma.bid.create({
      data: {
        listingId: listing.id,
        userId: buyer.id,
        amount: 825000,
      },
    });

    const appointment = await prisma.appointment.create({
      data: {
        listingId: listing.id,
        userId: buyer.id,
        type: 'BUYER_INSPECTION',
        status: 'PENDING',
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
        location: 'AutoBidder Indore Hub',
      },
    });

    res.status(201).json({ seller, buyer, listing, bid, appointment });
  });

  get('/admin/users', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminUsers());
    }

    const [count, recent] = await Promise.all([
      prisma.user.count(),
      prisma.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: { id: true, email: true, phone: true, name: true, createdAt: true },
      }),
    ]);

    res.json({ stats: { users: count }, recentUsers: recent });
  });

  get('/admin/rto', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminRto());
    }

    const rtoData = await prisma.rtoNoc.findMany({
      take: 20,
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: {
          select: { id: true, title: true, seller: { select: { name: true } } },
        },
      },
    });

    res.json({ rtoNocs: rtoData });
  });

  // Payments (create payment intent)
  post('/payments', authenticate, async (req: Request, res: Response) => {
    const body = z.object({
      amount: z.number().int().positive(),
      currency: z.string().default('INR'),
      bidId: z.string().optional(),
      listingId: z.string().optional(),
    }).parse(req.body);

    const authUser = (req as any).user;
    // For payments, we usually check if the bid belongs to the user
    if (body.bidId && !useMemoryStore) {
        const bid = await prisma.bid.findUnique({ where: { id: body.bidId } });
        if (bid && bid.userId !== authUser.userId && authUser.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Forbidden: This is not your bid' });
        }
    }

    if (useMemoryStore) {
      const payment = devStore.createPayment({
        amount: body.amount,
        currency: body.currency,
        bidId: body.bidId,
        listingId: body.listingId,
        stripePaymentIntentId: 'pi_demo_' + Date.now(),
        stripeClientSecret: 'pi_demo_secret_' + Date.now(),
      });
      return res.status(201).json({ payment });
    }

    // Create a Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: body.amount,
      currency: body.currency || 'inr',
      metadata: {
        bidId: body.bidId ?? '',
        listingId: body.listingId ?? '',
      },
    });

    const payment = await prisma.payment.create({
      data: {
        amount: body.amount,
        currency: body.currency || 'INR',
        stripePaymentIntentId: paymentIntent.id,
        stripeClientSecret: paymentIntent.client_secret,
        bidId: body.bidId,
        listingId: body.listingId,
      },
      include: {
        bid: true,
        listing: true,
      },
    });

    res.status(201).json({ payment, clientSecret: paymentIntent.client_secret });
  });

  // Push tokens
  post('/push-tokens', authenticate, async (req: Request, res: Response) => {
    const { token, platform } = z.object({
      token: z.string(),
      platform: z.string().default('android'),
    }).parse(req.body);

    const authUser = (req as any).user;

    if (useMemoryStore) {
      return res.json({ ok: true });
    }

    await prisma.pushToken.upsert({
      where: { token },
      create: {
        token,
        platform,
        userId: authUser.userId,
      },
      update: {
        userId: authUser.userId,
        isActive: true,
      },
    });

    res.json({ ok: true });
  });

  // Notifications for a user
  get('/notifications', async (req: Request, res: Response) => {
    const { userId } = z.object({ userId: z.string() }).parse(req.query);

    if (useMemoryStore) {
      return res.json({ notifications: devStore.listNotifications(userId) });
    }

    const notifications = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ notifications });
  });

  // Sliders
  get('/sliders', async (req: Request, res: Response) => {
    const query = z.object({
      type: z.enum(['ONBOARDING', 'HOME', 'BUY_CAR', 'SELL_CAR']).optional(),
    }).parse(req.query);

    if (useMemoryStore) {
      return res.json({ sliders: devStore.listSliders({ ...query, isActive: true }) });
    }

    const sliders = await prisma.slider.findMany({
      where: {
        ...(query.type ? { type: query.type } : {}),
        isActive: true,
      },
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    });

    res.json({ sliders });
  });

  // Admin Sliders
  get('/admin/sliders/all', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ sliders: devStore.listSliders({}) });
    }

    const sliders = await prisma.slider.findMany({
      orderBy: [{ type: 'asc' }, { order: 'asc' }],
    });
    res.json({ sliders });
  });

  post('/admin/sliders', async (req: Request, res: Response) => {
    const body = z.object({
      type: z.enum(['ONBOARDING', 'HOME', 'BUY_CAR', 'SELL_CAR']),
      title: z.string(),
      subtitle: z.string().optional(),
      imageUrl: z.string(),
      link: z.string().optional(),
      order: z.number().int().default(0),
      isActive: z.boolean().default(true),
    }).parse(req.body);

    if (useMemoryStore) {
      const slider = devStore.createSlider({
        title: body.title,
        type: body.type as any,
        imageUrl: body.imageUrl,
        link: body.link,
        subtitle: body.subtitle,
        order: body.order,
        isActive: body.isActive,
      });
      return res.status(201).json({ slider });
    }

    const slider = await prisma.slider.create({ data: body });
    res.status(201).json({ slider });
  });

  patch('/admin/sliders/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const body = z.object({
      type: z.enum(['ONBOARDING', 'HOME', 'BUY_CAR', 'SELL_CAR']).optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      imageUrl: z.string().optional(),
      link: z.string().optional(),
      order: z.number().int().optional(),
      isActive: z.boolean().optional(),
    }).parse(req.body);

    if (useMemoryStore) {
      const slider = devStore.updateSlider(id, body);
      return res.json({ slider });
    }

    const slider = await prisma.slider.update({
      where: { id },
      data: body,
    });
    res.json({ slider });
  });

  del('/admin/sliders/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.deleteSlider(id);
      return res.json({ ok: true });
    }

    await prisma.slider.delete({ where: { id } });
    res.json({ ok: true });
  });

  // ─── ADMIN FULL CRUD ENDPOINTS ───────────────────────────────────────────

  // Admin: Toggle user verification
  patch('/admin/users/:id/verify', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { isVerified } = z.object({ isVerified: z.boolean() }).parse(req.body);
    if (useMemoryStore) {
      return res.json({ user: devStore.updateUser(id, { isVerified, kycStatus: isVerified ? 'VERIFIED' : 'REJECTED' }) });
    }
    const user = await prisma.user.update({
      where: { id },
      data: {
        isVerified,
        kycStatus: isVerified ? 'VERIFIED' : 'REJECTED'
      }
    });
    res.json({ user });
  });

  // Admin: All users with counts
  get('/admin/users/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminAllUsers());
    }
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { listings: true, bids: true, appointments: true, notifications: true } },
      },
    });
    res.json({ users });
  });

  // Admin: All listings with relations
  get('/admin/listings/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ listings: devStore.listListings({}) });
    }
    const listings = await prisma.listing.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        seller: { select: { id: true, name: true, email: true, phone: true } },
        bids: { orderBy: { amount: 'desc' }, take: 1 },
        appointments: { orderBy: { createdAt: 'desc' }, take: 1 },
        rtoNoc: true,
        _count: { select: { bids: true, appointments: true } },
      },
    });
    res.json({ listings });
  });

  // Admin: All bids with relations
  get('/admin/bids/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ bids: devStore.listBids() });
    }
    const bids = await prisma.bid.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { id: true, title: true, brand: true, model: true, city: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    res.json({ bids });
  });

  // Admin: All appointments with relations
  get('/admin/appointments/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ appointments: devStore.listAppointments({}) });
    }
    const appointments = await prisma.appointment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        listing: { select: { id: true, title: true, brand: true, model: true, city: true } },
        user: { select: { id: true, name: true, email: true, phone: true } },
      },
    });
    res.json({ appointments });
  });

  // Admin: All RTO/NOC with listing
  get('/admin/rto-noc/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminRto());
    }
    const rtoNocs = await prisma.rtoNoc.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        listing: { select: { id: true, title: true, brand: true, model: true, city: true, seller: { select: { name: true } } } },
      },
    });
    res.json({ rtoNocs });
  });

  // Admin: All payments with relations
  get('/admin/payments/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminPayments());
    }
    const payments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        bid: { include: { user: { select: { id: true, name: true } } } },
        listing: { select: { id: true, title: true, brand: true, model: true } },
      },
    });
    const stats = {
      total: payments.length,
      succeeded: payments.filter((p: any) => p.status === 'SUCCEEDED').length,
      pending: payments.filter((p: any) => p.status === 'PENDING').length,
      failed: payments.filter((p: any) => p.status === 'FAILED').length,
      totalRevenue: payments.filter((p: any) => p.status === 'SUCCEEDED').reduce((s: number, p: any) => s + p.amount, 0),
    };
    res.json({ payments, stats });
  });

  // Admin: All auto-bid configs
  get('/admin/auto-bids/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminAutoBids());
    }
    const autoBidConfigs = await prisma.autoBidConfig.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        listing: { select: { id: true, title: true, brand: true, model: true } },
        _count: { select: { bids: true } },
      },
    });
    res.json({ autoBidConfigs, stats: { total: autoBidConfigs.length, active: autoBidConfigs.filter((c: any) => c.isActive).length } });
  });

  // Admin: All notifications
  get('/admin/notifications/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminNotifications());
    }
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ notifications, stats: { total: notifications.length, unread: notifications.filter((n: any) => !n.read).length } });
  });

  // Admin: Send notification
  post('/admin/notifications/send', async (req: Request, res: Response) => {
    const { userId, title, message } = z.object({
      userId: z.string().optional(),
      title: z.string(),
      message: z.string(),
    }).parse(req.body);

    if (useMemoryStore) {
      return res.json({ ok: true });
    }

    if (userId) {
      await prisma.notification.create({
        data: { userId, title, message, type: 'SYSTEM' }
      });
    } else {
      const users = await prisma.user.findMany({ select: { id: true } });
      await prisma.notification.createMany({
        data: users.map(u => ({ userId: u.id, title, message, type: 'SYSTEM' }))
      });
    }

    res.json({ ok: true });
  });

  // Admin: All push tokens
  get('/admin/push-tokens/all', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json(devStore.adminPushTokens());
    }
    const pushTokens = await prisma.pushToken.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });
    res.json({ pushTokens });
  });

  // Admin: Analytics
  get('/admin/analytics', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({
        stats: { revenue: 2450000, avgSalePrice: 850000, successRate: 78, pendingPayouts: 120000 },
        monthly: [450, 520, 480, 610, 750, 690, 820, 910, 880]
      });
    }
    const payments = await prisma.payment.findMany({ where: { status: 'SUCCEEDED' } });
    const revenue = payments.reduce((acc, p) => acc + p.amount, 0);
    const listingsCount = await prisma.listing.count({ where: { status: 'SOLD' } });
    const totalListings = await prisma.listing.count();

    res.json({
      stats: {
        revenue,
        avgSalePrice: listingsCount > 0 ? Math.floor(revenue / listingsCount) : 0,
        successRate: totalListings > 0 ? Math.floor((listingsCount / totalListings) * 100) : 0,
        pendingPayouts: Math.floor(revenue * 0.15) // Placeholder logic
      },
      monthly: [120, 150, 180, 220, 300, 280, 350, 400, 450] // Monthly revenue in k
    });
  });

  // Admin: Fraud alerts
  get('/admin/fraud/alerts', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ alerts: devStore.getFraudAlerts() });
    }
    const alerts = await prisma.fraudAlert.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ alerts });
  });

  // Admin: Audit logs
  get('/admin/logs', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ logs: devStore.getAuditLogs() });
    }
    const logs = await prisma.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 50 });
    res.json({ logs });
  });

  // Admin: Dealers
  get('/admin/dealers', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      const dealers = devStore.adminAllUsers().users.filter(u => u.userType === 'DEALER');
      return res.json({ dealers });
    }
    const dealers = await prisma.user.findMany({
      where: { userType: 'DEALER' },
      orderBy: { createdAt: 'desc' },
      include: {
        _count: { select: { listings: true, bids: true } }
      }
    });
    res.json({ dealers });
  });

  get('/admin/dealers/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      return res.json({ dealer: devStore.getUser(id) });
    }
    const dealer = await prisma.user.findUnique({
      where: { id },
      include: {
        _count: { select: { listings: true, bids: true } }
      }
    });
    res.json({ dealer });
  });

  post('/admin/dealers', async (req: Request, res: Response) => {
    const body = z.object({
      name: z.string(),
      email: z.string().email(),
      phone: z.string().optional(),
      businessName: z.string().optional(),
      city: z.string().optional(),
      address: z.string().optional(),
    }).parse(req.body);

    if (useMemoryStore) {
      const user = devStore.upsertEmailUser(body.email, body.name);
      devStore.updateUser(user.id, { ...body, userType: 'DEALER', role: 'SELLER' });
      return res.status(201).json({ dealer: devStore.getUser(user.id) });
    }

    const dealer = await prisma.user.create({
      data: {
        ...body,
        userType: 'DEALER',
        role: 'SELLER',
      }
    });
    res.status(201).json({ dealer });
  });

  patch('/admin/dealers/:id/status', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { status } = z.object({ status: z.string() }).parse(req.body);
    // status mapping to isVerified for simplicity
    const isVerified = status === 'ACTIVE';
    if (useMemoryStore) {
      return res.json({ dealer: devStore.updateUser(id, { isVerified }) });
    }
    const dealer = await prisma.user.update({
      where: { id },
      data: { isVerified }
    });
    res.json({ dealer });
  });

  patch('/admin/dealers/:id/promote', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { isFeatured } = z.object({ isFeatured: z.boolean() }).parse(req.body);
    if (useMemoryStore) {
      return res.json({ dealer: devStore.updateUser(id, { isFeatured }) });
    }
    const dealer = await prisma.user.update({
      where: { id },
      data: { isFeatured }
    });
    res.json({ dealer });
  });

  del('/admin/dealers/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      // Logic to delete or disable user
      return res.json({ ok: true });
    }
    await prisma.user.delete({ where: { id } });
    res.json({ ok: true });
  });

  // Admin: Leads
  get('/admin/leads', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ leads: devStore.getLeads() });
    }
    // Leads are mocked for now as there is no Lead table
    const listings = await prisma.listing.findMany({ take: 5 });
    const mockLeads = [
      { id: 'L1', name: 'Rahul Khanna', email: 'rahul@example.com', phone: '9876543210', listingId: listings[0]?.id || 'LST1', createdAt: new Date(), listing: listings[0] },
      { id: 'L2', name: 'Sonal Mittal', email: 'sonal@example.com', phone: '9876543211', listingId: listings[1]?.id || 'LST2', createdAt: new Date(Date.now() - 86400000), listing: listings[1] }
    ];
    res.json({ leads: mockLeads });
  });

  // Admin: Payouts
  get('/admin/payouts', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ payouts: devStore.getPayouts() });
    }
    const sellers = await prisma.user.findMany({ where: { role: 'SELLER' }, take: 5 });
    const mockPayouts = sellers.map((s, i) => ({
      id: `P${i}`,
      userId: s.id,
      amount: 50000 + (i * 10000),
      status: i === 0 ? 'PENDING' : 'PROCESSED',
      createdAt: new Date(Date.now() - (i * 86400000)),
      user: s
    }));
    res.json({ payouts: mockPayouts });
  });

  post('/admin/payouts/:id/process', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      return res.json({ payout: devStore.processPayout(id) });
    }
    res.json({ ok: true });
  });

  // Admin: Commissions
  get('/admin/commissions', async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ commissions: devStore.getCommissions() });
    }
    const payments = await prisma.payment.findMany({ where: { status: 'SUCCEEDED' }, take: 10 });
    const mockCommissions = payments.map((p, i) => ({
      id: `C${i}`,
      amount: Math.floor(p.amount * 0.05),
      paymentId: p.id,
      listingId: p.listingId,
      createdAt: p.createdAt
    }));
    res.json({ commissions: mockCommissions });
  });

  // Admin: Refunds
  post('/admin/payments/:id/refund', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.updatePaymentStatus(id, 'CANCELLED');
      return res.json({ ok: true });
    }
    res.json({ ok: true });
  });

  // Admin: Listing specialized actions
  patch('/admin/listings/:id/extend', async (req: Request, res: Response) => {
    const id = req.params.id;
    const { minutes } = z.object({ minutes: z.number() }).parse(req.body);
    if (useMemoryStore) {
      // Mocking extension logic
      return res.json({ ok: true });
    }
    res.json({ ok: true });
  });

  patch('/admin/listings/:id/delivered', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.updateListing(id, { status: 'SOLD' });
      emitAuctionEnded(id);
      return res.json({ ok: true });
    }
    await prisma.listing.update({ where: { id }, data: { status: 'SOLD' } });
    emitAuctionEnded(id);
    res.json({ ok: true });
  });

  // Admin: Auto-bid terminate
  patch('/admin/auto-bids/:id/terminate', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.deleteAutoBidConfig(id);
      return res.json({ ok: true });
    }
    await prisma.autoBidConfig.update({ where: { id }, data: { isActive: false } });
    res.json({ ok: true });
  });

  // Admin: User block
  patch('/admin/users/:id/block', async (req: Request, res: Response) => {
    const id = req.params.id;
    if (useMemoryStore) {
      devStore.updateUser(id, { role: 'BUYER', isVerified: false }); // Mock block
      return res.json({ ok: true });
    }
    res.json({ ok: true });
  });

  // Admin: Update listing status
patch('/admin/listings/:id/status', async (req: Request, res: Response) => {
    const id = req.params.id;
    const status = listingStatusSchema.parse(req.body.status);
    if (useMemoryStore) {
      const listing = devStore.updateListing(id, { status });
      if (status === 'ACTIVE') emitAuctionStarted(id);
      if (status === 'SOLD') emitAuctionEnded(id);
      return res.json({ listing });
    }
    const listing = await prisma.listing.update({ where: { id }, data: { status }, include: listingInclude() });

    if (status === 'ACTIVE') emitAuctionStarted(id);
    if (status === 'SOLD') emitAuctionEnded(id);

    res.json({ listing });
  });

  // Admin: Update bid status
  patch('/admin/bids/:id/status', async (req: Request, res: Response) => {
    const id = req.params.id;
    const status = bidStatusSchema.parse(req.body.status);
    if (useMemoryStore) {
      return res.json({ bid: devStore.updateBidStatus(id, status) });
    }
    const bid = await prisma.bid.update({ where: { id }, data: { status } });
    res.json({ bid });
  });


  return router;
}

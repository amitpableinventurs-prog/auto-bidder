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
  keyGenerator: (req) => req.body.email || req.ip, // Rate limit by email if provided
});

function generateOTP(): string {
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
    const { email, otp } = z.object({ email: z.string().email(), otp: z.string().length(6) }).parse(req.body);

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
    if (env.NODE_ENV === 'production') {
      return res.status(501).json({ error: 'OTP delivery is not configured' });
    }
    res.json({
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

    if (env.NODE_ENV === 'production') {
      return res.status(501).json({ error: 'OTP verification is not configured' });
    }
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

  get('/brands', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ brands: devStore.listBrands({ isActive: true }) });
    }
    const brands = await prisma.brand.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json({ brands });
  });

  get('/collections', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ collections: devStore.listCollections({ isActive: true }) });
    }
    const collections = await prisma.collection.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' },
    });
    res.json({ collections });
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

  // ==================== DNP (Distributor Network Partner) Routes ====================

  // DNP: Get profile status
  get('/dnp/profile', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    if (useMemoryStore) {
      return res.json({ hasProfile: false, profile: null });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
      include: {
        user: { select: userSelect() },
      },
    });
    
    if (!profile) {
      return res.json({ hasProfile: false, profile: null });
    }
    
    return res.json({ hasProfile: true, profile });
  });

  // DNP: Activate DNP profile
  post('/dnp/activate', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const body = z.object({
      agreementAccepted: z.boolean(),
      termsVersion: z.string(),
    }).parse(req.body);
    
    if (!body.agreementAccepted) {
      return errorResponse(res, 400, 'Agreement must be accepted to activate DNP');
    }
    
    if (useMemoryStore) {
      return res.json({ 
        profile: { 
          id: 'demo-dnp-id',
          referralCode: 'AB-DNP-1234',
          referralLink: 'https://autobidder.in?ref=AB-DNP-1234',
          membershipStatus: 'ACTIVE',
          activationDate: new Date().toISOString(),
          agreementAccepted: true,
          agreementAcceptedAt: new Date().toISOString(),
        } 
      });
    }
    
    // Check if profile already exists
    const existingProfile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (existingProfile) {
      return errorResponse(res, 400, 'DNP profile already exists');
    }
    
    const referralCode = generateReferralCode();
    const referralLink = generateReferralLink(referralCode);
    
    const profile = await (prisma as any).dNPProfile.create({
      data: {
        userId,
        referralCode,
        referralLink,
        activationDate: new Date(),
        agreementAccepted: true,
        agreementAcceptedAt: new Date(),
        membershipStatus: 'ACTIVE',
      },
      include: {
        user: { select: userSelect() },
      },
    });
    
    // Create agreement record
    await (prisma as any).dNPAgreement.create({
      data: {
        dnpProfileId: profile.id,
        version: body.termsVersion,
        terms: 'DNP Terms and Conditions - Pay After You Earn Program',
        acceptedAt: new Date(),
        ipAddress: req.ip,
        userAgent: req.headers['user-agent'],
      },
    });
    
    // Create audit log
    await (prisma as any).auditLog.create({
      data: {
        action: 'DNP_ACTIVATED',
        adminName: profile.user.name || 'User',
        target: profile.referralCode,
        details: { userId, profileId: profile.id },
      },
    });
    
    res.json({ profile });
  });

  // DNP: Get dashboard data
  get('/dnp/dashboard', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    if (useMemoryStore) {
      return res.json({
        stats: {
          totalEarnings: 15000,
          pendingEarnings: 5000,
          paidEarnings: 10000,
          availableBalance: 8000,
          totalReferrals: 12,
          activeListings: 8,
          sharedListingsCount: 25,
          soldVehicles: 5,
          conversionRate: 20,
        },
        recentActivity: [],
      });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
      include: {
        referrals: { take: 5, orderBy: { createdAt: 'desc' } },
        sharedListings: { 
          take: 5, 
          orderBy: { createdAt: 'desc' },
          include: { listing: { select: { title: true, imageUrl: true } } },
        },
        commissions: { 
          take: 5, 
          orderBy: { calculatedAt: 'desc' },
          where: { status: 'PAID' },
        },
        // Adding buyer leads to recent activity
        referralsAsBuyer: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: {
            sharedListing: {
              include: { listing: { select: { title: true } } }
            }
          }
        }
      },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }

    // Fetch buyer leads directly if the relation doesn't cover everything needed
    const recentLeads = await (prisma as any).buyerLead.findMany({
      where: { sharedListing: { dnpProfileId: profile.id } },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { sharedListing: { include: { listing: { select: { title: true } } } } }
    });

    res.json({
      stats: {
        totalEarnings: profile.totalEarnings,
        pendingEarnings: profile.pendingEarnings,
        paidEarnings: profile.paidEarnings,
        availableBalance: profile.availableBalance,
        totalReferrals: profile.totalReferrals,
        activeListings: profile.activeListings,
        sharedListingsCount: profile.sharedListingsCount,
        soldVehicles: profile.soldVehicles,
        conversionRate: profile.totalReferrals > 0 
          ? Math.round((profile.soldVehicles / profile.totalReferrals) * 100) 
          : 0,
      },
      recentActivity: {
        referrals: profile.referrals,
        sharedListings: profile.sharedListings,
        commissions: profile.commissions,
        leads: recentLeads,
      },
    });
  });

  // DNP: Get referrals
  get('/dnp/referrals', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { status, limit = 20, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({ referrals: [], total: 0 });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const where: any = { dnpProfileId: profile.id };
    if (status) where.status = status;
    
    const [referrals, total] = await Promise.all([
      (prisma as any).referral.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          referredUser: { select: userSelect() },
          listing: { select: { title: true, imageUrl: true, status: true } },
        },
      }),
      (prisma as any).referral.count({ where }),
    ]);
    
    res.json({ referrals, total });
  });

  // DNP: Share listing
  post('/dnp/share-listing', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const body = z.object({
      listingId: z.string(),
      shareSource: z.enum(['WHATSAPP', 'FACEBOOK', 'TELEGRAM', 'SMS', 'COPY_LINK', 'QR_CODE', 'DIRECT']),
      buyerName: z.string().optional(),
      buyerPhone: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({
        shareLink: `https://autobidder.in/car/${body.listingId}?dnp=AB-DNP-1234`,
        sharedListing: { id: 'demo-id', listingId: body.listingId },
      });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const shareLink = generateShareLink(body.listingId, profile.referralCode);
    
    const sharedListing = await (prisma as any).sharedListing.create({
      data: {
        dnpProfileId: profile.id,
        listingId: body.listingId,
        shareLink,
        shareSource: body.shareSource,
      },
    });

    // Create a buyer lead if details provided
    if (body.buyerName || body.buyerPhone) {
      await (prisma as any).buyerLead.create({
        data: {
          sharedListingId: sharedListing.id,
          buyerName: body.buyerName,
          buyerPhone: body.buyerPhone,
          status: 'SHARED',
        }
      });

      // Update shared listing lead counter
      await (prisma as any).sharedListing.update({
        where: { id: sharedListing.id },
        data: { totalLeads: { increment: 1 } },
      });
    }

    // Update profile counter
    await (prisma as any).dNPProfile.update({
      where: { id: profile.id },
      data: { sharedListingsCount: { increment: 1 } },
    });
    
    res.json({ shareLink, sharedListing });
  });

  // DNP: Get shared listings
  get('/dnp/shared-listings', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { limit = 20, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({ sharedListings: [], total: 0 });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const [sharedListings, total] = await Promise.all([
      (prisma as any).sharedListing.findMany({
        where: { dnpProfileId: profile.id },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          listing: { select: { title: true, imageUrl: true, status: true, demandPrice: true } },
          buyerLeads: { take: 5, orderBy: { createdAt: 'desc' } },
        },
      }),
      (prisma as any).sharedListing.count({ where: { dnpProfileId: profile.id } }),
    ]);
    
    res.json({ sharedListings, total });
  });

  // DNP: Get buyer leads
  get('/dnp/leads', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { status, limit = 20, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({ leads: [], total: 0 });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const where: any = {
      sharedListing: { dnpProfileId: profile.id },
    };
    if (status) where.status = status;
    
    const [leads, total] = await Promise.all([
      (prisma as any).buyerLead.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          sharedListing: {
            include: {
              listing: { select: { title: true, imageUrl: true } },
            },
          },
        },
      }),
      (prisma as any).buyerLead.count({ where }),
    ]);
    
    res.json({ leads, total });
  });

  // DNP: Update lead status
  patch('/dnp/leads/:id/status', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { id } = req.params;
    const body = z.object({
      status: z.enum(['SHARED', 'VIEWED', 'CONTACTED', 'TEST_DRIVE_SCHEDULED', 'NEGOTIATION', 'BOOKING', 'SOLD', 'CLOSED', 'LOST']),
      notes: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ lead: { id, status: body.status } });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const lead = await (prisma as any).buyerLead.update({
      where: { id },
      data: {
        status: body.status,
        lastActivity: new Date(),
        lastActivityType: body.status,
        notes: body.notes,
      },
    });
    
    res.json({ lead });
  });

  // DNP: Get commissions
  get('/dnp/commissions', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { status, limit = 20, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({ commissions: [], total: 0 });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const where: any = { dnpProfileId: profile.id };
    if (status) where.status = status;
    
    const [commissions, total] = await Promise.all([
      (prisma as any).commission.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { calculatedAt: 'desc' },
        include: {
          listing: { select: { title: true } },
          referral: { select: { referralCode: true } },
          sharedListing: { 
            include: { 
              listing: { select: { title: true } },
            },
          },
        },
      }),
      (prisma as any).commission.count({ where }),
    ]);
    
    res.json({ commissions, total });
  });

  // DNP: Get wallet transactions
  get('/dnp/wallet', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { limit = 20, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({
        balance: { available: 8000, pending: 5000, lifetime: 15000 },
        transactions: [],
        total: 0,
      });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const [transactions, total] = await Promise.all([
      (prisma as any).dNPWalletTransaction.findMany({
        where: { dnpProfileId: profile.id },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).dNPWalletTransaction.count({ where: { dnpProfileId: profile.id } }),
    ]);
    
    res.json({
      balance: {
        available: profile.availableBalance,
        pending: profile.pendingEarnings,
        lifetime: profile.totalEarnings,
      },
      transactions,
      total,
    });
  });

  // DNP: Request withdrawal
  post('/dnp/withdraw', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const body = z.object({
      amount: z.number().min(1000),
      bankAccountNumber: z.string().optional(),
      bankIfsc: z.string().optional(),
      bankName: z.string().optional(),
      accountHolderName: z.string().optional(),
      upiId: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ withdrawalRequest: { id: 'demo-withdrawal-id', status: 'PENDING' } });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    if (profile.availableBalance < body.amount) {
      return errorResponse(res, 400, 'Insufficient balance');
    }
    
    const withdrawalRequest = await (prisma as any).withdrawalRequest.create({
      data: {
        dnpProfileId: profile.id,
        amount: body.amount,
        bankAccountNumber: body.bankAccountNumber,
        bankIfsc: body.bankIfsc,
        bankName: body.bankName,
        accountHolderName: body.accountHolderName,
        upiId: body.upiId,
      },
    });
    
    // Deduct from available balance
    await (prisma as any).dNPProfile.update({
      where: { id: profile.id },
      data: { availableBalance: { decrement: body.amount } },
    });
    
    // Create wallet transaction
    await (prisma as any).dNPWalletTransaction.create({
      data: {
        dnpProfileId: profile.id,
        type: 'WITHDRAWAL',
        amount: body.amount,
        balanceBefore: profile.availableBalance,
        balanceAfter: profile.availableBalance - body.amount,
        description: 'Withdrawal request',
        referenceId: withdrawalRequest.id,
        referenceType: 'WITHDRAWAL',
      },
    });
    
    // Create audit log
    await (prisma as any).auditLog.create({
      data: {
        action: 'DNP_WITHDRAWAL_REQUESTED',
        adminName: profile.user?.name || 'User',
        target: `₹${body.amount}`,
        details: { withdrawalRequestId: withdrawalRequest.id, amount: body.amount },
      },
    });
    
    res.json({ withdrawalRequest });
  });

  // DNP: Get withdrawal requests
  get('/dnp/withdrawals', authenticate, async (req: Request, res: Response) => {
    const userId = (req as any).user.userId;
    const { limit = 20, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({ withdrawals: [], total: 0 });
    }
    
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });
    
    if (!profile) {
      return errorResponse(res, 404, 'DNP profile not found');
    }
    
    const [withdrawals, total] = await Promise.all([
      (prisma as any).withdrawalRequest.findMany({
        where: { dnpProfileId: profile.id },
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
      }),
      (prisma as any).withdrawalRequest.count({ where: { dnpProfileId: profile.id } }),
    ]);
    
    res.json({ withdrawals, total });
  });

  // ==================== Admin DNP Management Routes ====================

  // Admin: Get all DNP profiles
  get('/admin/dnp/profiles', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    const { status, limit = 50, offset = 0 } = req.query;
    
    if (useMemoryStore) {
      return res.json({ profiles: [], total: 0 });
    }
    
    const where: any = {};
    if (status) where.membershipStatus = status;
    
    const [profiles, total] = await Promise.all([
      (prisma as any).dNPProfile.findMany({
        where,
        take: Number(limit),
        skip: Number(offset),
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: userSelect() },
        },
      }),
      (prisma as any).dNPProfile.count({ where }),
    ]);
    
    res.json({ profiles, total });
  });

  // Admin: Update DNP profile status
  patch('/admin/dnp/profiles/:id/status', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = z.object({
      membershipStatus: z.enum(['PENDING', 'ACTIVE', 'SUSPENDED', 'TERMINATED']),
      suspendedReason: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ profile: { id, membershipStatus: body.membershipStatus } });
    }
    
    const data: any = { membershipStatus: body.membershipStatus };
    if (body.membershipStatus === 'SUSPENDED') {
      data.isSuspended = true;
      data.suspendedReason = body.suspendedReason;
      data.suspendedAt = new Date();
    } else {
      data.isSuspended = false;
    }
    
    const profile = await (prisma as any).dNPProfile.update({
      where: { id },
      data,
      include: { user: { select: userSelect() } },
    });
    
    // Create audit log
    await (prisma as any).auditLog.create({
      data: {
        action: 'DNP_STATUS_UPDATED',
        adminName: 'Admin',
        target: profile.referralCode,
        details: { profileId: id, newStatus: body.membershipStatus },
      },
    });
    
    res.json({ profile });
  });

  // Admin: Get commission rules
  get('/admin/dnp/commission-rules', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({ 
        rules: [
          { id: '1', type: 'LISTING_APPROVAL', name: 'Listing Approval Reward', flatAmount: 300, isActive: true },
          { id: '2', type: 'VEHICLE_SOLD', name: 'Vehicle Sale Commission', percentage: 3, isActive: true },
        ] 
      });
    }
    
    const rules = await (prisma as any).commissionRule.findMany({
      orderBy: { priority: 'desc' },
    });
    
    res.json({ rules });
  });

  // Admin: Create commission rule
  post('/admin/dnp/commission-rules', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    const body = z.object({
      type: z.enum(['LISTING_APPROVAL', 'VEHICLE_SOLD', 'BONUS', 'REFERRAL_BONUS']),
      name: z.string(),
      description: z.string().optional(),
      flatAmount: z.number().optional(),
      percentage: z.number().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      priority: z.number().default(0),
      conditions: z.any().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ rule: { id: 'demo-rule-id', ...body } });
    }
    
    const rule = await (prisma as any).commissionRule.create({
      data: body,
    });
    
    res.json({ rule });
  });

  // Admin: Update commission rule
  patch('/admin/dnp/commission-rules/:id', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = z.object({
      name: z.string().optional(),
      description: z.string().optional(),
      flatAmount: z.number().optional(),
      percentage: z.number().optional(),
      minAmount: z.number().optional(),
      maxAmount: z.number().optional(),
      isActive: z.boolean().optional(),
      priority: z.number().optional(),
      conditions: z.any().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ rule: { id, ...body } });
    }
    
    const rule = await (prisma as any).commissionRule.update({
      where: { id },
      data: body,
    });
    
    res.json({ rule });
  });

  // Admin: Get DNP analytics
  get('/admin/dnp/analytics', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.json({
        totalDNPs: 50,
        activeDNPs: 35,
        listingsGenerated: 120,
        buyerLeads: 450,
        conversionRate: 15,
        totalCommissionPaid: 250000,
        pendingCommission: 75000,
        topPerformers: [],
      });
    }
    
    const [
      totalDNPs,
      activeDNPs,
      listingsGenerated,
      buyerLeads,
      totalCommissionPaid,
      pendingCommission,
      topPerformers,
    ] = await Promise.all([
      (prisma as any).dNPProfile.count(),
      (prisma as any).dNPProfile.count({ where: { membershipStatus: 'ACTIVE' } }),
      (prisma as any).referral.count({ where: { status: { in: ['LISTING_CREATED', 'LISTING_APPROVED', 'COMPLETED'] } } }),
      (prisma as any).buyerLead.count(),
      (prisma as any).commission.aggregate({ where: { status: 'PAID' }, _sum: { amount: true } }),
      (prisma as any).commission.aggregate({ where: { status: 'PENDING' }, _sum: { amount: true } }),
      (prisma as any).dNPProfile.findMany({
        where: { membershipStatus: 'ACTIVE' },
        orderBy: { totalEarnings: 'desc' },
        take: 10,
        include: { user: { select: userSelect() } },
      }),
    ]);
    
    const conversionRate = listingsGenerated > 0 
      ? Math.round((Number(totalCommissionPaid._sum?.amount || 0) / listingsGenerated) * 100) 
      : 0;
    
    res.json({
      totalDNPs,
      activeDNPs,
      listingsGenerated,
      buyerLeads,
      conversionRate,
      totalCommissionPaid: Number(totalCommissionPaid._sum?.amount || 0),
      pendingCommission: Number(pendingCommission._sum?.amount || 0),
      topPerformers,
    });
  });

  // Admin: Process withdrawal
  patch('/admin/dnp/withdrawals/:id/process', authenticate, authorize(['ADMIN']), async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = z.object({
      status: z.enum(['APPROVED', 'REJECTED', 'COMPLETED']),
      rejectionReason: z.string().optional(),
      paymentReference: z.string().optional(),
      fraudCheckStatus: z.enum(['PASSED', 'FAILED']).optional(),
      fraudCheckNotes: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ withdrawal: { id, status: body.status } });
    }
    
    const data: any = {
      status: body.status,
      reviewedBy: 'Admin',
      reviewedAt: new Date(),
    };
    
    if (body.status === 'APPROVED') {
      data.approvedAt = new Date();
    }
    if (body.status === 'REJECTED') {
      data.rejectedAt = new Date();
      data.rejectionReason = body.rejectionReason;
    }
    if (body.status === 'COMPLETED') {
      data.paidAt = new Date();
      data.paymentReference = body.paymentReference;
    }
    if (body.fraudCheckStatus) {
      data.fraudCheckStatus = body.fraudCheckStatus;
      data.fraudCheckNotes = body.fraudCheckNotes;
    }
    
    const withdrawal = await (prisma as any).withdrawalRequest.update({
      where: { id },
      data,
    });
    
    // Create audit log
    await (prisma as any).auditLog.create({
      data: {
        action: 'DNP_WITHDRAWAL_PROCESSED',
        adminName: 'Admin',
        target: `₹${withdrawal.amount}`,
        details: { withdrawalId: id, status: body.status },
      },
    });
    
    res.json({ withdrawal });
  });

  // ==================== Referral Tracking ====================

  // Track referral click (public endpoint)
  post('/track/referral', async (req: Request, res: Response) => {
    const body = z.object({
      referralCode: z.string(),
      ipAddress: z.string().optional(),
      userAgent: z.string().optional(),
      deviceFingerprint: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ tracked: true });
    }
    
    const referral = await (prisma as any).referral.findFirst({
      where: { 
        referralCode: body.referralCode,
        attributionExpiry: { gte: new Date() },
      },
    });
    
    if (!referral) {
      return errorResponse(res, 404, 'Invalid or expired referral code');
    }
    
    await (prisma as any).referralClick.create({
      data: {
        referralId: referral.id,
        ipAddress: body.ipAddress,
        userAgent: body.userAgent,
        deviceFingerprint: body.deviceFingerprint,
      },
    });
    
    res.json({ tracked: true, referralCode: referral.referralCode });
  });

  // Track listing view (public endpoint)
  post('/track/listing-view', async (req: Request, res: Response) => {
    const body = z.object({
      listingId: z.string(),
      dnpCode: z.string(),
      ipAddress: z.string().optional(),
    }).parse(req.body);
    
    if (useMemoryStore) {
      return res.json({ tracked: true });
    }
    
    const sharedListing = await (prisma as any).sharedListing.findFirst({
      where: {
        listingId: body.listingId,
        dnpProfile: { referralCode: body.dnpCode },
      },
    });
    
    if (sharedListing) {
      await (prisma as any).sharedListing.update({
        where: { id: sharedListing.id },
        data: { totalViews: { increment: 1 } },
      });
    }
    
    res.json({ tracked: true });
  });

  // Admin: Update appointment status
  patch('/admin/appointments/:id/status', async (req: Request, res: Response) => {
    const id = req.params.id;
    const status = appointmentStatusSchema.parse(req.body.status);
    if (useMemoryStore) {
      return res.json({ appointment: devStore.updateAppointmentStatus(id, status) });
    }
    const appointment = await prisma.appointment.update({ where: { id }, data: { status } });
    res.json({ appointment });
  });

  // Admin: Rich seed with 10+ diverse records
  post('/admin/seed-rich', async (_req: Request, res: Response) => {
    if (useMemoryStore) {
      return res.status(201).json(devStore.seedRich());
    }

    const carData = [
      { brand: 'Maruti Suzuki', model: 'Swift', variant: 'VXi AMT', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Pearl Red', city: 'Mumbai', km: 18000, demand: 750000, plate: 'MH01AB1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Hyundai', model: 'Creta', variant: 'SX(O)', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Typhoon Silver', city: 'Bangalore', km: 9500, demand: 1450000, plate: 'KA01BB5678', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Tata Motors', model: 'Nexon EV', variant: 'Max XZ+', year: 2023, fuel: 'Electric', transmission: 'Automatic', color: 'Pristine White', city: 'Pune', km: 22000, demand: 1680000, plate: 'MH12CC9012', ownership: '1st Owner', status: 'PENDING_INSPECTION' as const },
      { brand: 'Honda', model: 'City', variant: 'ZX CVT', year: 2021, fuel: 'Petrol', transmission: 'Automatic', color: 'Platinum White', city: 'Delhi', km: 34000, demand: 1150000, plate: 'DL7CX3456', ownership: '2nd Owner', status: 'ACTIVE' as const },
      { brand: 'Kia', model: 'Seltos', variant: 'HTX+', year: 2022, fuel: 'Diesel', transmission: 'Manual', color: 'Glacier White', city: 'Hyderabad', km: 28000, demand: 1320000, plate: 'TS09DD7890', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Mahindra', model: 'Thar', variant: 'LX Hard Top', year: 2023, fuel: 'Diesel', transmission: 'Automatic', color: 'Everest White', city: 'Indore', km: 12000, demand: 1850000, plate: 'MP09EE2345', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Toyota', model: 'Innova Crysta', variant: '2.4 VX MT', year: 2020, fuel: 'Diesel', transmission: 'Manual', color: 'Silver Metallic', city: 'Chennai', km: 65000, demand: 2100000, plate: 'TN22FF6789', ownership: '1st Owner', status: 'PENDING_INSPECTION' as const },
      { brand: 'MG Motors', model: 'Hector', variant: 'Sharp Pro', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Candy White', city: 'Ahmedabad', km: 31000, demand: 1580000, plate: 'GJ01GG1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Volkswagen', model: 'Virtus', variant: 'GT Plus', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Wild Cherry Red', city: 'Mumbai', km: 5000, demand: 1750000, plate: 'MH01HH1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Skoda', model: 'Slavia', variant: '1.5 TSI Style', year: 2022, fuel: 'Petrol', transmission: 'Manual', color: 'Crystal Blue', city: 'Delhi', km: 15000, demand: 1600000, plate: 'DL8JJ5678', ownership: '1st Owner', status: 'SOLD' as const },
      { brand: 'Jeep', model: 'Compass', variant: 'Model S', year: 2021, fuel: 'Diesel', transmission: 'Automatic', color: 'Minimal Grey', city: 'Bangalore', km: 25000, demand: 2800000, plate: 'KA01KK9012', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'BMW', model: '3 Series', variant: '330i M Sport', year: 2020, fuel: 'Petrol', transmission: 'Automatic', color: 'Portimao Blue', city: 'Mumbai', km: 45000, demand: 4200000, plate: 'MH01LL3456', ownership: '2nd Owner', status: 'ACTIVE' as const },
      { brand: 'Audi', model: 'Q3', variant: 'Premium Plus', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Mythos Black', city: 'Gurgaon', km: 12000, demand: 4800000, plate: 'HR26MM7890', ownership: '1st Owner', status: 'PENDING_INSPECTION' as const },
      { brand: 'Mercedes', model: 'C-Class', variant: 'C200', year: 2021, fuel: 'Petrol', transmission: 'Automatic', color: 'Mojave Silver', city: 'Delhi', km: 20000, demand: 5200000, plate: 'DL3NN1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Land Rover', model: 'Range Rover Velar', variant: 'Dynamic HSE', year: 2023, fuel: 'Diesel', transmission: 'Automatic', color: 'Santorini Black', city: 'Mumbai', km: 12000, demand: 9500000, plate: 'MH01RR5678', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Renault', model: 'Kwid', variant: 'RXT', year: 2021, fuel: 'Petrol', transmission: 'Manual', color: 'Ice Cool White', city: 'Indore', km: 22000, demand: 420000, plate: 'MP09RN1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Ford', model: 'EcoSport', variant: 'Titanium S', year: 2019, fuel: 'Diesel', transmission: 'Manual', color: 'Canyon Ridge', city: 'Ahmedabad', km: 48000, demand: 850000, plate: 'GJ01FR5678', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Nissan', model: 'Magnite', variant: 'XV Premium', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Flare Garnet Red', city: 'Jaipur', km: 15000, demand: 980000, plate: 'RJ14NS9012', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Citroen', model: 'C3', variant: 'Feel', year: 2023, fuel: 'Petrol', transmission: 'Manual', color: 'Zesty Orange', city: 'Lucknow', km: 8000, demand: 720000, plate: 'UP32CT3456', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Fiat', model: 'Punto', variant: 'Abarth', year: 2018, fuel: 'Petrol', transmission: 'Manual', color: 'Black', city: 'Pune', km: 35000, demand: 650000, plate: 'MH12FT7890', ownership: '2nd Owner', status: 'ACTIVE' as const },
      { brand: 'Isuzu', model: 'D-Max V-Cross', variant: 'Z', year: 2021, fuel: 'Diesel', transmission: 'Automatic', color: 'Silky White Pearl', city: 'Guwahati', km: 25000, demand: 2800000, plate: 'AS01IS1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Mitsubishi', model: 'Pajero Sport', variant: 'Select Plus', year: 2018, fuel: 'Diesel', transmission: 'Automatic', color: 'Deep Blue', city: 'Kochi', km: 75000, demand: 2200000, plate: 'KL07MB5678', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Force Motors', model: 'Gurkha', variant: '4x4', year: 2022, fuel: 'Diesel', transmission: 'Manual', color: 'Red', city: 'Shimla', km: 12000, demand: 1550000, plate: 'HP01FM9012', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Datsun', model: 'GO+', variant: 'T(O)', year: 2020, fuel: 'Petrol', transmission: 'Manual', color: 'Silver', city: 'Chandigarh', km: 28000, demand: 450000, plate: 'CH01DS3456', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Jaguar', model: 'XF', variant: 'Prestige', year: 2021, fuel: 'Diesel', transmission: 'Automatic', color: 'Fuji White', city: 'Mumbai', km: 18000, demand: 5800000, plate: 'MH01JG7890', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Volvo', model: 'XC40 Recharge', variant: 'Ultimate', year: 2023, fuel: 'Electric', transmission: 'Automatic', color: 'Crystal White', city: 'Bangalore', km: 5000, demand: 5500000, plate: 'KA01VL1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Lexus', model: 'ES', variant: '300h Exquisite', year: 2022, fuel: 'Hybrid', transmission: 'Automatic', color: 'Sonic Quartz', city: 'Delhi', km: 12000, demand: 6200000, plate: 'DL1LX5678', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Porsche', model: '911 Carrera', variant: 'S', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Guards Red', city: 'Mumbai', km: 3000, demand: 18500000, plate: 'MH01PS9012', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Lamborghini', model: 'Urus', variant: 'V8', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Giallo Auge', city: 'Delhi', km: 2000, demand: 42000000, plate: 'DL1LB3456', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Ferrari', model: 'F8 Tributo', variant: 'V8', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Rosso Corsa', city: 'Mumbai', km: 1500, demand: 48000000, plate: 'MH01FR7890', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Maserati', model: 'Ghibli', variant: 'Trofeo', year: 2021, fuel: 'Petrol', transmission: 'Automatic', color: 'Blu Emozione', city: 'Bangalore', km: 8000, demand: 14500000, plate: 'KA01MS1234', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Bentley', model: 'Continental GT', variant: 'V8', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Sequin Blue', city: 'Delhi', km: 1000, demand: 45000000, plate: 'DL1BT5678', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Rolls Royce', model: 'Ghost', variant: 'V12', year: 2022, fuel: 'Petrol', transmission: 'Automatic', color: 'Arctic White', city: 'Mumbai', km: 2500, demand: 75000000, plate: 'MH01RR9012', ownership: '1st Owner', status: 'ACTIVE' as const },
      { brand: 'Mini Cooper', model: 'Cooper S', variant: '3-Door', year: 2023, fuel: 'Petrol', transmission: 'Automatic', color: 'Chili Red', city: 'Pune', km: 4000, demand: 4500000, plate: 'MH12MC3456', ownership: '1st Owner', status: 'ACTIVE' as const },
    ];

    const users = await Promise.all([
      prisma.user.upsert({ where: { email: 'seller1@autobidder.demo' }, create: { email: 'seller1@autobidder.demo', phone: '9999900001', name: 'Rajesh Kumar' }, update: {} }),
      prisma.user.upsert({ where: { email: 'seller2@autobidder.demo' }, create: { email: 'seller2@autobidder.demo', phone: '9999900002', name: 'Priya Sharma' }, update: {} }),
      prisma.user.upsert({ where: { email: 'seller3@autobidder.demo' }, create: { email: 'seller3@autobidder.demo', phone: '9999900006', name: 'Vikram Singh' }, update: {} }),
      prisma.user.upsert({ where: { email: 'buyer1@autobidder.demo' }, create: { email: 'buyer1@autobidder.demo', phone: '9999900003', name: 'Amit Patel' }, update: {} }),
      prisma.user.upsert({ where: { email: 'buyer2@autobidder.demo' }, create: { email: 'buyer2@autobidder.demo', phone: '9999900004', name: 'Sneha Verma' }, update: {} }),
      prisma.user.upsert({ where: { email: 'buyer3@autobidder.demo' }, create: { email: 'buyer3@autobidder.demo', phone: '9999900005', name: 'Arjun Reddy' }, update: {} }),
      prisma.user.upsert({ where: { email: 'buyer4@autobidder.demo' }, create: { email: 'buyer4@autobidder.demo', phone: '9999900007', name: 'Kavita Iyer' }, update: {} }),
    ]);

    const [seller1, seller2, seller3, buyer1, buyer2, buyer3, buyer4] = users;

    const listings = await Promise.all(carData.map((car, i) =>
      prisma.listing.create({
        data: {
          sellerId: i % 3 === 0 ? seller1.id : (i % 3 === 1 ? seller2.id : seller3.id),
          title: `${car.brand} ${car.model} ${car.variant}`,
          brand: car.brand, model: car.model, variant: car.variant,
          manufacturingYear: car.year, fuelType: car.fuel, transmission: car.transmission,
          color: car.color, city: car.city, plateNumber: car.plate,
          ownership: car.ownership, kilometersDriven: car.km,
          demandPrice: car.demand, startingBid: Math.floor(car.demand * 0.9),
          status: car.status,
          imageUrl: `https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=800&q=60&sig=${i}`,
          inspectionReportUrl: i % 2 === 0 ? 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf' : null,
          inspectionReportStatus: i % 2 === 0 ? 'COMPLETED' : 'PENDING',
          rtoNoc: { create: { rtoTaxStatus: 'Paid', rtoNocIssued: i % 3 === 0 ? 'Yes' : 'No', bankNocStatus: i % 2 === 0 ? 'COMPLETED' : 'IN_PROGRESS', rtoNocStatus: i % 3 === 0 ? 'COMPLETED' : 'NOT_STARTED', invoiceStatus: 'IN_PROGRESS', ownerIdStatus: 'COMPLETED', uploadedCount: (i % 5) + 1 } },
        },
      })
    ));

    const buyers = [buyer1, buyer2, buyer3, buyer4];
    const bidData: any[] = [];
    listings.forEach((listing, i) => {
      if (listing.status === 'ACTIVE' || listing.status === 'SOLD') {
        const numBids = Math.floor(Math.random() * 5) + 1;
        let lastAmount = listing.startingBid;
        for (let j = 0; j < numBids; j++) {
          lastAmount += Math.floor(Math.random() * 20000) + 5000;
          bidData.push({ listingId: listing.id, user: buyers[Math.floor(Math.random() * buyers.length)], amount: lastAmount });
        }
      }
    });

    const bids = await Promise.all(bidData.map(b =>
      prisma.bid.create({ data: { listingId: b.listingId, userId: b.user.id, amount: b.amount, status: 'SUBMITTED' } })
    ));

    await Promise.all([
      prisma.appointment.create({ data: { listingId: listings[0].id, userId: buyer1.id, type: 'BUYER_INSPECTION', status: 'CONFIRMED', scheduledAt: new Date(Date.now() + 86400000), location: 'AutoBidder Mumbai Hub' } }),
      prisma.appointment.create({ data: { listingId: listings[1].id, userId: buyer3.id, type: 'AUTOBIDDER_INSPECTION', status: 'PENDING', scheduledAt: new Date(Date.now() + 172800000), location: 'AutoBidder Bangalore Center' } }),
      prisma.appointment.create({ data: { listingId: listings[2].id, userId: buyer2.id, type: 'AUTHORIZED_CENTER', status: 'PENDING', scheduledAt: new Date(Date.now() + 259200000), location: 'Tata Authorized - Pune' } }),
      prisma.appointment.create({ data: { listingId: listings[3].id, userId: buyer1.id, type: 'BUYER_INSPECTION', status: 'COMPLETED', scheduledAt: new Date(Date.now() - 86400000), location: 'AutoBidder Delhi Hub' } }),
    ]);

    const b0 = bids.find(b => b.listingId === listings[0].id) || bids[0];

    await prisma.payment.create({
      data: {
        amount: b0.amount,
        currency: 'INR',
        status: 'SUCCEEDED',
        stripePaymentIntentId: `pi_rich_demo_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        bidId: b0.id,
        listingId: listings[0].id
      },
    });

    await Promise.all([
      prisma.autoBidConfig.create({ data: { userId: buyer1.id, listingId: listings[1].id, maxLimit: Math.floor(carData[1].demand * 0.98), increment: 10000, isActive: true } }),
      prisma.autoBidConfig.create({ data: { userId: buyer2.id, listingId: listings[2].id, maxLimit: Math.floor(carData[2].demand * 0.97), increment: 15000, isActive: true } }),
      prisma.autoBidConfig.create({ data: { userId: buyer3.id, listingId: listings[4].id, maxLimit: Math.floor(carData[4].demand * 0.96), increment: 8000, isActive: false } }),
    ]);

    await Promise.all([
      prisma.notification.create({ data: { userId: buyer1.id, type: 'BID_ACCEPTED', title: 'Bid Accepted!', message: `Your bid of ₹${b0.amount.toLocaleString('en-IN')} on ${listings[0].title} was accepted.`, read: false } }),
      prisma.notification.create({ data: { userId: buyer2.id, type: 'OUTBID', title: 'You have been outbid', message: `Someone placed a higher bid on ${listings[0].title}`, read: false } }),
      prisma.notification.create({ data: { userId: buyer3.id, type: 'PAYMENT_CONFIRMED', title: 'Payment Confirmed', message: 'Your payment has been successfully processed.', read: true } }),
      prisma.notification.create({ data: { userId: buyer1.id, type: 'APPOINTMENT_CONFIRMED', title: 'Appointment Confirmed', message: `Your inspection at AutoBidder Mumbai Hub is confirmed.`, read: false } }),
      prisma.notification.create({ data: { userId: seller1.id, type: 'LISTING_SOLD', title: 'Congratulations! Car Sold', message: `${listings[0].title} has been sold!`, read: false } }),
    ]);

    // Seed Fraud Alerts
    await prisma.fraudAlert.createMany({
      data: [
        { severity: 'HIGH', type: 'SUSPICIOUS_BIDDING', description: 'User placed 5 bids in 2 seconds on Mahindra Thar', userName: 'Amit Patel' },
        { severity: 'MEDIUM', type: 'MULTIPLE_ACCOUNTS', description: 'Same IP address detected for 3 different seller accounts', userName: 'Rajesh Kumar' },
        { severity: 'LOW', type: 'PRICE_MANIPULATION', description: 'Rapid bid withdrawal and re-entry detected', userName: 'Sneha Verma' },
      ]
    });

    // Seed Audit Logs
    await prisma.auditLog.createMany({
      data: [
        { action: 'USER_VERIFIED', adminName: 'SuperAdmin', target: 'Rajesh Kumar', details: { userId: seller1.id } },
        { action: 'LISTING_PUBLISHED', adminName: 'SuperAdmin', target: 'Mahindra Thar', details: { listingId: listings[0].id } },
        { action: 'PAYMENT_APPROVED', adminName: 'System', target: 'Payment:pi_rich_001', details: { amount: 825000 } },
        { action: 'BID_REJECTED', adminName: 'Moderator_1', target: 'Bid on Hyundai Creta', details: { reason: 'Policy violation' } },
      ]
    });

    // Seed Sliders
    if ((prisma as any).slider) {
      await prisma.slider.deleteMany({});
      await prisma.slider.createMany({
        data: [
          { type: 'ONBOARDING', title: 'Precision Bidding', subtitle: 'Real-time auctions with transparent bidding history.', imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=400&q=80', order: 1 },
          { type: 'ONBOARDING', title: 'Verified Inventory', subtitle: 'Every car undergoes a multi-point inspection.', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=400&q=80', order: 2 },
          { type: 'HOME', title: 'Find Your Dream Car With The Best Bids', subtitle: 'START BIDDING >', imageUrl: "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80", link: '/BuyCar', order: 1 },
          { type: 'HOME', title: 'Feature Your Listing And Sell Faster!', subtitle: 'FOR BEST OFFERS', imageUrl: "https://images.unsplash.com/photo-1494976388531-d1058494cdd8?auto=format&fit=crop&w=1200&q=80", link: '/SellCar', order: 2 },
          { type: 'BUY_CAR', title: 'Own your car today! Easy and fast loans await.', imageUrl: 'https://images.unsplash.com/photo-1554224155-1696413565d3?auto=format&fit=crop&w=600&q=80', order: 1 },
          { type: 'BUY_CAR', title: 'Get the best value for your old car.', imageUrl: 'https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&w=600&q=80', order: 2 },
          { type: 'SELL_CAR', title: 'Get The Best Price For Your Car!', imageUrl: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1200&q=80', order: 1 },
        ]
      });
    }

    // Seed Brands
    if ((prisma as any).brand) {
        await prisma.brand.deleteMany({});
        const LOGO_BASE_URL = 'https://cdn.jsdelivr.net/gh/filippofilip95/car-logos-dataset@master/logos/optimized';
        await prisma.brand.createMany({
            data: [
                { name: 'Maruti Suzuki', logo: `${LOGO_BASE_URL}/suzuki.png`, count: '2.5k+ Cars', order: 1, description: 'India\'s favorite car brand.' },
                { name: 'Hyundai', logo: `${LOGO_BASE_URL}/hyundai.png`, count: '1.8k+ Cars', order: 2, description: 'Premium features and reliability.' },
                { name: 'Tata Motors', logo: `${LOGO_BASE_URL}/tata.png`, count: '1.2k+ Cars', order: 3, description: 'Safest cars in India.' },
                { name: 'Mahindra', logo: `${LOGO_BASE_URL}/mahindra.png`, count: '950+ Cars', order: 4, description: 'King of SUVs.' },
                { name: 'Kia', logo: `${LOGO_BASE_URL}/kia.png`, count: '600+ Cars', order: 5, description: 'Modern design and tech.' },
                { name: 'Honda', logo: `${LOGO_BASE_URL}/honda.png`, count: '850+ Cars', order: 6, description: 'VTEC just kicked in.' },
                { name: 'Toyota', logo: `${LOGO_BASE_URL}/toyota.png`, count: '700+ Cars', order: 7, description: 'Legendary durability.' },
                { name: 'Volkswagen', logo: `${LOGO_BASE_URL}/volkswagen.png`, count: '450+ Cars', order: 8, description: 'German engineering.' },
                { name: 'Renault', logo: `${LOGO_BASE_URL}/renault.png`, count: '320+ Cars', order: 9, description: 'Passion for life.' },
                { name: 'Ford', logo: `${LOGO_BASE_URL}/ford.png`, count: '410+ Cars', order: 10, description: 'Go Further.' },
                { name: 'Skoda', logo: `${LOGO_BASE_URL}/skoda.png`, count: '280+ Cars', order: 11, description: 'Simply Clever.' },
                { name: 'Nissan', logo: `${LOGO_BASE_URL}/nissan.png`, count: '350+ Cars', order: 12, description: 'Innovation that excites.' },
                { name: 'MG Motors', logo: `${LOGO_BASE_URL}/mg.png`, count: '190+ Cars', order: 13, description: 'Morris Garages.' },
                { name: 'Jeep', logo: `${LOGO_BASE_URL}/jeep.png`, count: '150+ Cars', order: 14, description: 'There\'s only one.' },
                { name: 'BMW', logo: `${LOGO_BASE_URL}/bmw.png`, count: '240+ Cars', order: 15, description: 'The Ultimate Driving Machine.' },
                { name: 'Mercedes', logo: `${LOGO_BASE_URL}/mercedes.png`, count: '210+ Cars', order: 16, description: 'The Best or Nothing.' },
                { name: 'Audi', logo: `${LOGO_BASE_URL}/audi.png`, count: '180+ Cars', order: 17, description: 'Vorsprung durch Technik.' },
                { name: 'Jaguar', logo: `${LOGO_BASE_URL}/jaguar.png`, count: '90+ Cars', order: 18, description: 'The Art of Performance.' },
                { name: 'Volvo', logo: `${LOGO_BASE_URL}/volvo.png`, count: '110+ Cars', order: 19, description: 'For Life.' },
                { name: 'Land Rover', logo: `${LOGO_BASE_URL}/landrover.png`, count: '130+ Cars', order: 20, description: 'Above and Beyond.' },
            ]
        });
    }

    // Seed Collections
    if ((prisma as any).collection) {
        await (prisma as any).collection.deleteMany({});
        await (prisma as any).collection.createMany({
            data: [
                { name: 'Budget Cars', imageUrl: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c15d?auto=format&fit=crop&w=400&q=80', order: 1 },
                { name: 'SUV Cars', imageUrl: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=400&q=80', order: 2 },
                { name: 'CNG Cars', imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80', order: 3 },
            ]
        });
    }

    res.status(201).json({ ok: true, message: 'Rich demo data seeded successfully', counts: { users: users.length, listings: listings.length, bids: bids.length } });
  });

  return router;
}

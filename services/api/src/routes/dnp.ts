import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../prisma.js';
import crypto from 'node:crypto';
import { DNPService } from '../services/dnpService.js';

export function createDnpRouter() {
  const router = Router();

  function generateShareToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  // GET /api/dnp/profile (legacy/alias for status)
  router.get('/profile', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
    });

    res.json({
      hasProfile: !!profile,
      profile,
    });
  });

  // GET /api/dnp/status
  router.get('/status', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
      include: {
        agreementAcceptances: { orderBy: { createdAt: 'desc' }, take: 1 }
      }
    });

    res.json({
      status: profile?.status || 'INACTIVE',
      profile,
      needsAgreement: profile && profile.status === 'PENDING_AGREEMENT'
    });
  });

  // GET /api/dnp/agreement
  router.get('/agreement', async (req, res) => {
    res.json({
      version: '1.2',
      termsVersion: '1.2',
      membershipFee: 5000,
      content: `DNP Agreement Content...` // In production this would come from a CMS or DB
    });
  });

  // POST /api/dnp/activate
  router.post('/activate', async (req, res) => {
    const userId = (req as any).user.userId;
    const body = z.object({
      agreementAccepted: z.literal(true),
      agreementVersion: z.string(),
      termsVersion: z.string(),
    }).parse(req.body);

    const existing = await (prisma as any).dNPProfile.findUnique({ where: { userId } });
    if (existing && existing.status !== 'INACTIVE' && existing.status !== 'ELIGIBLE') {
      return res.status(400).json({ error: 'DNP program already activated for this user.' });
    }

    const referralCode = `AB-DNP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    const profile = await prisma.$transaction(async (tx) => {
      const p = await (tx as any).dNPProfile.upsert({
        where: { userId },
        create: {
          userId,
          referralCode,
          referralLink: `https://autobidder.in/dnp/${referralCode}`,
          status: 'ACTIVE',
          activationDate: new Date(),
        },
        update: {
          status: 'ACTIVE',
          activationDate: new Date(),
        }
      });

      await (tx as any).dNPAgreementAcceptance.create({
        data: {
          dnpProfileId: p.id,
          agreementVersion: body.agreementVersion,
          termsVersion: body.termsVersion,
          ipAddress: req.ip,
        }
      });

      await (tx as any).dNPMembershipRecovery.create({
        data: {
          dnpProfileId: p.id,
          membershipYear: new Date().getFullYear(),
          totalFee: 5000,
        }
      });

      await (tx as any).dNPAuditLog.create({
        data: {
          dnpProfileId: p.id,
          action: 'DNP_ACTIVATED',
          details: JSON.stringify({ agreementVersion: body.agreementVersion }),
          ipAddress: req.ip,
        }
      });

      // Send Welcome Notification
      await tx.notification.create({
        data: {
          userId,
          type: 'DNP_ACTIVATED',
          title: 'DNP Program Activated!',
          message: 'Congratulations! Your DNP profile is now active. You can start bringing vehicles and sharing listings to earn commissions.',
        }
      });

      return p;
    });

    res.json({ profile });
  });

  // GET /api/dnp/dashboard
  router.get('/dashboard', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
      include: {
        membershipRecoveries: { where: { status: { not: 'FULLY_RECOVERED' } }, orderBy: { membershipYear: 'asc' } }
      }
    });

    if (!profile) return res.status(404).json({ error: 'DNP Profile not found' });

    const [vCount, sCount, bCount, conversions] = await Promise.all([
      (prisma as any).dNPVehicleLead.count({ where: { dnpProfileId: profile.id } }),
      (prisma as any).dNPListingShare.count({ where: { dnpProfileId: profile.id } }),
      (prisma as any).dNPBuyerLead.count({ where: { listingShare: { dnpProfileId: profile.id } } }),
      (prisma as any).dNPBuyerLead.count({ where: { listingShare: { dnpProfileId: profile.id }, status: 'CONVERTED' } }),
    ]);

    const activeRecovery = profile.membershipRecoveries[0];

    res.json({
      profileId: profile.id,
      referralCode: profile.referralCode,
      status: profile.status,
      activationDate: profile.activationDate,
      financials: {
        totalEarnings: profile.totalEarnings,
        pendingEarnings: profile.pendingEarnings,
        approvedEarnings: profile.approvedEarnings,
        recoveredFee: activeRecovery?.recoveredAmount || 0,
        remainingFee: (activeRecovery?.totalFee || 5000) - (activeRecovery?.recoveredAmount || 0),
        availableBalance: profile.availableBalance,
      },
      activity: {
        vehicleLeadsSubmitted: vCount,
        listingsShared: sCount,
        buyerLeads: bCount,
        conversions: conversions,
      }
    });
  });

  // GET /api/dnp/vehicle-leads
  router.get('/vehicle-leads', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'DNP Profile not found' });

    const leads = await (prisma as any).dNPVehicleLead.findMany({
      where: { dnpProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      include: {
        statusHistory: { orderBy: { createdAt: 'desc' } },
        listing: true
      }
    });
    res.json({ leads });
  });

  // POST /api/dnp/vehicle-leads
  router.post('/vehicle-leads', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({ where: { userId } });
    if (!profile || profile.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'DNP profile is not active.' });
    }

    const body = z.object({
      sellerName: z.string().min(2),
      sellerPhone: z.string().regex(/^[0-9]{10}$/, 'Invalid mobile number'),
      sellerEmail: z.string().email().optional().or(z.literal('')),
      sellerCity: z.string(),
      brand: z.string(),
      model: z.string(),
      variant: z.string(),
      year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
      regNumber: z.string().toUpperCase(),
      fuelType: z.string(),
      transmission: z.string(),
      kmsDriven: z.number().nonnegative(),
      expectedPrice: z.number().positive(),
      location: z.string(),
      images: z.array(z.string()).optional(),
      notes: z.string().optional(),
    }).parse(req.body);

    // Fraud/Duplicate checks
    if (await DNPService.isDuplicateVehicle(body.regNumber)) {
      return res.status(400).json({ error: 'This vehicle is already listed or has a pending lead.' });
    }

    if (await DNPService.isDuplicateSeller(body.sellerPhone)) {
      return res.status(400).json({ error: 'This seller already has a pending lead.' });
    }

    // Prevent self-attribution (DNP cannot refer their own car)
    // In a real app, we'd check if the sellerPhone matches the DNP's own phone
    const dnpUser = await prisma.user.findUnique({ where: { id: userId } });
    if (dnpUser?.phone === body.sellerPhone) {
      return res.status(400).json({ error: 'You cannot refer your own vehicle as a DNP lead.' });
    }

    const lead = await (prisma as any).dNPVehicleLead.create({
      data: {
        dnpProfileId: profile.id,
        ...body,
        sellerEmail: body.sellerEmail || null,
        images: body.images ? JSON.stringify(body.images) : null,
      }
    });

    await DNPService.logStatusHistory(lead.id, 'VEHICLE', 'SUBMITTED', 'Initial DNP submission');

    // Security: Velocity check
    await DNPService.trackSuspiciousActivity(profile.id);

    res.json({ lead });
  });

  // GET /api/dnp/eligible-listings
  router.get('/eligible-listings', async (req, res) => {
    const { search, brand, city } = req.query;

    const where: any = { status: 'ACTIVE' };
    if (search) {
      where.OR = [
        { brand: { contains: String(search) } },
        { model: { contains: String(search) } }
      ];
    }
    if (brand) where.brand = String(brand);
    if (city) where.city = String(city);

    const listings = await prisma.listing.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    res.json({ listings });
  });

  // POST /api/dnp/listing-shares
  router.post('/listing-shares', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({ where: { userId } });
    if (!profile || profile.status !== 'ACTIVE') {
      return res.status(403).json({ error: 'DNP profile is not active.' });
    }

    const body = z.object({
      listingId: z.string(),
      buyerName: z.string().min(2),
      buyerPhone: z.string().regex(/^[0-9]{10}$/, 'Invalid mobile number'),
      buyerEmail: z.string().email().optional().or(z.literal('')),
      city: z.string().optional(),
      budget: z.number().optional(),
      notes: z.string().optional(),
      shareMethod: z.string().optional(),
    }).parse(req.body);

    // Check if listing is still active
    const listing = await prisma.listing.findUnique({ where: { id: body.listingId } });
    if (!listing || listing.status !== 'ACTIVE') {
      return res.status(400).json({ error: 'This vehicle is no longer available for sharing.' });
    }

    // Prevent self-attribution
    const dnpUser = await prisma.user.findUnique({ where: { id: userId } });
    if (dnpUser?.phone === body.buyerPhone) {
       return res.status(400).json({ error: 'You cannot refer yourself as a buyer for a listing share.' });
    }

    // Duplicate buyer check
    if (await DNPService.isDuplicateBuyer(body.buyerPhone, body.listingId)) {
      return res.status(400).json({ error: 'You have already shared this listing with this buyer.' });
    }

    const share = await (prisma as any).dNPListingShare.create({
      data: {
        dnpProfileId: profile.id,
        listingId: body.listingId,
        shareToken: generateShareToken(),
        shareMethod: body.shareMethod || 'OTHER',
        expiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days expiry
      }
    });

    const lead = await (prisma as any).dNPBuyerLead.create({
      data: {
        listingShareId: share.id,
        buyerName: body.buyerName,
        buyerPhone: body.buyerPhone,
        buyerEmail: body.buyerEmail || null,
        city: body.city,
        budget: body.budget,
        notes: body.notes,
        status: 'SHARED'
      }
    });

    await DNPService.logStatusHistory(lead.id, 'BUYER', 'SHARED', 'Listing shared with buyer');

    // Security: Velocity check
    await DNPService.trackSuspiciousActivity(profile.id);

    res.json({
      share,
      lead,
      shareLink: `https://autobidder.in/car/${listing.id}?ref=${share.shareToken}`
    });
  });

  // GET /api/dnp/listing-shares
  router.get('/listing-shares', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({ where: { userId } });
    if (!profile) return res.status(404).json({ error: 'DNP Profile not found' });

    const shares = await (prisma as any).dNPListingShare.findMany({
      where: { dnpProfileId: profile.id },
      include: {
        listing: true,
        buyerLeads: {
          include: {
            statusHistory: { orderBy: { createdAt: 'desc' } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ shares });
  });

  // GET /api/dnp/wallet
  router.get('/wallet', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({
      where: { userId },
      include: {
        membershipRecoveries: { orderBy: { membershipYear: 'desc' }, take: 1 }
      }
    });
    if (!profile) return res.status(404).json({ error: 'DNP Profile not found' });

    const ledger = await (prisma as any).dNPWalletLedger.findMany({
      where: { dnpProfileId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const activeRecovery = profile.membershipRecoveries[0];

    res.json({
      summary: {
        availableBalance: profile.availableBalance,
        pendingEarnings: profile.pendingEarnings,
        approvedEarnings: profile.approvedEarnings,
        totalEarnings: profile.totalEarnings,
        recoveredFee: activeRecovery?.recoveredAmount || 0,
        remainingFee: (activeRecovery?.totalFee || 5000) - (activeRecovery?.recoveredAmount || 0),
      },
      ledger
    });
  });

  // POST /api/dnp/withdrawals
  router.post('/withdrawals', async (req, res) => {
    const userId = (req as any).user.userId;
    const profile = await (prisma as any).dNPProfile.findUnique({ where: { userId } });
    if (!profile || profile.status !== 'ACTIVE') return res.status(403).json({ error: 'DNP profile is not active.' });

    const { amount } = z.object({ amount: z.number().min(1000, 'Minimum withdrawal is ₹1,000') }).parse(req.body);
    if (amount > profile.availableBalance) return res.status(400).json({ error: 'Insufficient available balance.' });

    const withdrawal = await prisma.$transaction(async (tx) => {
      const w = await (tx as any).dNPWithdrawalRequest.create({
        data: {
          dnpProfileId: profile.id,
          amount,
          status: 'PENDING'
        }
      });

      await (tx as any).dNPProfile.update({
        where: { id: profile.id },
        data: { availableBalance: { decrement: amount } }
      });

      await (tx as any).dNPWalletLedger.create({
        data: {
          dnpProfileId: profile.id,
          type: 'WITHDRAWAL_REQUESTED',
          amount: -amount,
          balanceAfter: profile.availableBalance - amount,
          description: `Withdrawal request for ₹${amount.toLocaleString('en-IN')}`,
          referenceId: w.id
        }
      });

      return w;
    });

    res.json({ withdrawal });
  });

  return router;
}

import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../../prisma.js';
import { DNPService } from '../../services/dnpService.js';

export function createAdminDnpRouter() {
  const router = Router();

  // GET /api/admin/dnp/dashboard
  router.get('/dashboard', async (req, res) => {
    const [totalDNPs, activeDNPs, pendingLeads, conversions, totalEarnings, totalRecovered] = await Promise.all([
      (prisma as any).dNPProfile.count(),
      (prisma as any).dNPProfile.count({ where: { status: 'ACTIVE' } }),
      (prisma as any).dNPVehicleLead.count({ where: { status: 'SUBMITTED' } }),
      (prisma as any).dNPBuyerLead.count({ where: { status: 'CONVERTED' } }),
      (prisma as any).dNPProfile.aggregate({ _sum: { totalEarnings: true } }),
      (prisma as any).dNPMembershipRecovery.aggregate({ _sum: { recoveredAmount: true } }),
    ]);

    res.json({
      stats: {
        totalDNPs,
        activeDNPs,
        pendingLeads,
        conversions,
        totalEarnings: totalEarnings._sum.totalEarnings || 0,
        totalRecovered: totalRecovered._sum.recoveredAmount || 0,
      }
    });
  });

  // GET /api/admin/dnp/partners
  router.get('/partners', async (req, res) => {
    const partners = await (prisma as any).dNPProfile.findMany({
      include: {
        user: true,
        membershipRecoveries: { orderBy: { membershipYear: 'desc' }, take: 1 }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ partners });
  });

  // PATCH /api/admin/dnp/partners/:id/status
  router.patch('/partners/:id/status', async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = z.object({
      status: z.enum(['ACTIVE', 'SUSPENDED', 'DEACTIVATED', 'REJECTED', 'ELIGIBLE', 'PENDING_AGREEMENT']),
      adminNotes: z.string().optional()
    }).parse(req.body);

    const partner = await (prisma as any).dNPProfile.update({
      where: { id },
      data: { status }
    });

    await (prisma as any).dNPAuditLog.create({
      data: {
        dnpProfileId: id,
        action: 'PARTNER_STATUS_CHANGED',
        details: JSON.stringify({ status, adminNotes }),
      }
    });

    res.json({ partner });
  });

  // GET /api/admin/dnp/vehicle-leads
  router.get('/vehicle-leads', async (req, res) => {
    const leads = await (prisma as any).dNPVehicleLead.findMany({
      include: {
        dnpProfile: { include: { user: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
        listing: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ leads });
  });

  // PATCH /api/admin/dnp/vehicle-leads/:id
  router.patch('/vehicle-leads/:id', async (req, res) => {
    const { id } = req.params;
    const body = z.object({
      status: z.string(),
      adminNotes: z.string().optional(),
      listingId: z.string().optional(),
    }).parse(req.body);

    const lead = await (prisma as any).dNPVehicleLead.update({
      where: { id },
      data: {
        status: body.status,
        listingId: body.listingId || undefined
      }
    });

    await DNPService.logStatusHistory(id, 'VEHICLE', body.status, body.adminNotes, 'ADMIN');

    // Handle commission trigger
    if (body.status === 'ELIGIBLE' || body.status === 'APPROVED') {
      const existingComm = await (prisma as any).dNPCommission.findFirst({ where: { vehicleLeadId: id } });
      if (!existingComm) {
        const amount = await DNPService.calculateCommission('ACQUISITION', lead.expectedPrice);
        await DNPService.recordCommission(lead.dnpProfileId, amount, id, 'VEHICLE', body.listingId);
      }
    }

    res.json({ lead });
  });

  // GET /api/admin/dnp/buyer-leads
  router.get('/buyer-leads', async (req, res) => {
    const leads = await (prisma as any).dNPBuyerLead.findMany({
      include: {
        listingShare: {
          include: {
            dnpProfile: { include: { user: true } },
            listing: true
          }
        },
        statusHistory: { orderBy: { createdAt: 'desc' } }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ leads });
  });

  // PATCH /api/admin/dnp/buyer-leads/:id/status
  router.patch('/buyer-leads/:id/status', async (req, res) => {
    const { id } = req.params;
    const body = z.object({
      status: z.string(),
      adminNotes: z.string().optional(),
    }).parse(req.body);

    const lead = await (prisma as any).dNPBuyerLead.update({
      where: { id },
      data: { status: body.status }
    });

    await DNPService.logStatusHistory(id, 'BUYER', body.status, body.adminNotes, 'ADMIN');

    // If CONVERTED, trigger commission
    if (body.status === 'CONVERTED') {
      const existingComm = await (prisma as any).dNPCommission.findFirst({ where: { buyerLeadId: id } });
      if (!existingComm) {
        const share = await (prisma as any).dNPListingShare.findUnique({ where: { id: lead.listingShareId }, include: { listing: true } });
        const amount = await DNPService.calculateCommission('MATCHMAKING', share.listing.demandPrice);
        await DNPService.recordCommission(share.dnpProfileId, amount, id, 'BUYER', share.listingId);
      }
    }

    res.json({ lead });
  });

  // GET /api/admin/dnp/commissions
  router.get('/commissions', async (req, res) => {
    const commissions = await (prisma as any).dNPCommission.findMany({
      include: {
        dnpProfile: { include: { user: true } },
        vehicleLead: true,
        buyerLead: true,
        listing: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ commissions });
  });

  // PATCH /api/admin/dnp/commissions/:id
  router.patch('/commissions/:id', async (req, res) => {
    const { id } = req.params;
    const { action, adminNotes } = z.object({
      action: z.enum(['APPROVE', 'REJECT', 'PAY']),
      adminNotes: z.string().optional()
    }).parse(req.body);

    const comm = await (prisma as any).dNPCommission.findUnique({ where: { id } });
    if (!comm) return res.status(404).json({ error: 'Commission not found' });

    if (action === 'APPROVE') {
      const commission = await DNPService.approveCommission(id);
      res.json({ commission });
    } else if (action === 'PAY') {
      const commission = await prisma.$transaction(async (tx: any) => {
        const c = await (tx as any).dNPCommission.update({
          where: { id },
          data: { status: 'PAID' }
        });

        // Update paid earnings in profile
        await (tx as any).dNPProfile.update({
          where: { id: comm.dnpProfileId },
          data: { paidEarnings: { increment: comm.amount } }
        });

        return c;
      });

      res.json({ commission });
    }
  });

  // GET /api/admin/dnp/withdrawals
  router.get('/withdrawals', async (req, res) => {
    const withdrawals = await (prisma as any).dNPWithdrawalRequest.findMany({
      include: { dnpProfile: { include: { user: true } } },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ withdrawals });
  });

  // PATCH /api/admin/dnp/withdrawals/:id
  router.patch('/withdrawals/:id', async (req, res) => {
    const { id } = req.params;
    const { status, adminNotes } = z.object({
      status: z.enum(['APPROVED', 'REJECTED', 'PAID', 'CANCELLED']),
      adminNotes: z.string().optional()
    }).parse(req.body);

    const withdrawal = await (prisma as any).dNPWithdrawalRequest.findUnique({ where: { id } });
    if (!withdrawal) return res.status(404).json({ error: 'Withdrawal not found' });

    const updated = await prisma.$transaction(async (tx: any) => {
      const w = await (tx as any).dNPWithdrawalRequest.update({
        where: { id },
        data: { status, adminNotes, processedAt: (status === 'PAID' || status === 'APPROVED') ? new Date() : null }
      });

      if (status === 'REJECTED' || status === 'CANCELLED') {
        // Refund balance to available balance
        await (tx as any).dNPProfile.update({
          where: { id: withdrawal.dnpProfileId },
          data: { availableBalance: { increment: withdrawal.amount } }
        });

        await (tx as any).dNPWalletLedger.create({
          data: {
            dnpProfileId: withdrawal.dnpProfileId,
            type: status === 'REJECTED' ? 'WITHDRAWAL_REJECTED' : 'REVERSAL',
            amount: withdrawal.amount,
            balanceAfter: 0, // Transactional update handles this
            description: `Withdrawal ${status.toLowerCase()}${adminNotes ? `: ${adminNotes}` : ''}`,
            referenceId: id
          }
        });
      } else if (status === 'PAID') {
         await (tx as any).dNPWalletLedger.create({
          data: {
            dnpProfileId: withdrawal.dnpProfileId,
            type: 'WITHDRAWAL_PAID',
            amount: 0, // Balance already deducted during request
            balanceAfter: 0,
            description: `Withdrawal paid successfully`,
            referenceId: id
          }
        });
      }

      // Notify User
      await tx.notification.create({
        data: {
          userId: withdrawal.dnpProfile.userId,
          type: 'DNP_WITHDRAWAL' as any,
          title: `Withdrawal ${status}`,
          message: `Your withdrawal request for ₹${withdrawal.amount.toLocaleString('en-IN')} has been ${status.toLowerCase()}. ${adminNotes ? `Note: ${adminNotes}` : ''}`,
          data: { withdrawalId: id, status }
        }
      });

      return w;
    });

    res.json({ withdrawal: updated });
  });

  // Rules & Settings
  router.get('/rules', async (req, res) => {
    const rules = await (prisma as any).dNPCommissionRule.findMany();
    res.json({ rules });
  });

  router.post('/rules', async (req, res) => {
    const body = z.object({
      name: z.string(),
      type: z.enum(['ACQUISITION', 'MATCHMAKING']),
      flatAmount: z.number().optional(),
      percentage: z.number().optional(),
      isActive: z.boolean().default(true)
    }).parse(req.body);

    const rule = await (prisma as any).dNPCommissionRule.create({ data: body });
    res.json({ rule });
  });

  // GET /api/admin/dnp/config
  router.get('/config', async (req, res) => {
    const config = await (prisma as any).dNPConfig.findUnique({ where: { id: 'default' } });
    res.json({ config: config || { membershipFee: 5000, recoveryPercentage: 100, minEarningThreshold: 0 } });
  });

  // PATCH /api/admin/dnp/config
  router.patch('/config', async (req, res) => {
    const body = z.object({
      membershipFee: z.number().optional(),
      recoveryPercentage: z.number().min(0).max(100).optional(),
      minEarningThreshold: z.number().optional(),
      maxDeductionPerEarning: z.number().optional().nullable(),
    }).parse(req.body);

    const config = await (prisma as any).dNPConfig.upsert({
      where: { id: 'default' },
      create: { id: 'default', ...body },
      update: body
    });

    res.json({ config });
  });

  // GET /api/admin/dnp/audit-logs
  router.get('/audit-logs', async (req, res) => {
    const logs = await (prisma as any).dNPAuditLog.findMany({
      include: { dnpProfile: { include: { user: true } } },
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    res.json({ logs });
  });

  // GET /api/admin/dnp/analytics
  router.get('/analytics', async (req, res) => {
    const [topPartners, dailyLeads] = await Promise.all([
      (prisma as any).dNPProfile.findMany({
        orderBy: { totalEarnings: 'desc' },
        take: 5,
        include: { user: true }
      }),
      (prisma as any).dNPVehicleLead.groupBy({
        by: ['createdAt'],
        _count: { id: true },
        where: { createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      })
    ]);
    res.json({ topPartners, dailyLeads });
  });

  return router;
}

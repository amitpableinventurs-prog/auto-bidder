import { prisma } from '../prisma.js';
/*
import {
  DNPStatus,
  VehicleLeadStatus,
  BuyerLeadStatus,
  CommissionStatus,
  WalletTransactionType,
  NotificationType
} from '@prisma/client';
*/
type DNPStatus = any;
type VehicleLeadStatus = any;
type BuyerLeadStatus = any;
type CommissionStatus = any;
type WalletTransactionType = any;
type NotificationType = any;

export class DNPService {
  /**
   * Calculate commission based on rules
   */
  static async calculateCommission(type: 'ACQUISITION' | 'MATCHMAKING', price: number) {
    const activeRule = await (prisma as any).dNPCommissionRule.findFirst({
      where: { type, isActive: true }
    });

    if (activeRule) {
      if (activeRule.flatAmount) return activeRule.flatAmount;
      if (activeRule.percentage) return Math.round(price * (activeRule.percentage / 100));
    }

    // Fallbacks
    if (type === 'ACQUISITION') return 1000;
    return Math.round(price * 0.02);
  }

  /**
   * Record a new commission in PENDING state
   */
  static async recordCommission(
    dnpProfileId: string,
    amount: number,
    leadId: string,
    leadType: 'VEHICLE' | 'BUYER',
    listingId?: string
  ) {
    return await prisma.$transaction(async (tx: any) => {
      const commission = await (tx as any).dNPCommission.create({
        data: {
          dnpProfileId,
          amount,
          status: 'PENDING' as CommissionStatus,
          [leadType === 'VEHICLE' ? 'vehicleLeadId' : 'buyerLeadId']: leadId,
          listingId
        }
      });

      await (tx as any).dNPProfile.update({
        where: { id: dnpProfileId },
        data: {
          pendingEarnings: { increment: amount },
          totalEarnings: { increment: amount },
        }
      });

      await (tx as any).dNPWalletLedger.create({
        data: {
          dnpProfileId,
          type: 'COMMISSION_PENDING' as WalletTransactionType,
          amount,
          balanceAfter: 0, // Pending doesn't affect available balance
          description: `Pending commission for ${leadType.toLowerCase()} lead`,
          referenceId: commission.id,
        }
      });

      // Notify User
      const profile = await (tx as any).dNPProfile.findUnique({ where: { id: dnpProfileId } });
      await tx.notification.create({
        data: {
          userId: profile.userId,
          type: 'DNP_COMMISSION' as NotificationType,
          title: 'New Pending Commission',
          message: `You have earned a pending commission of ₹${amount.toLocaleString('en-IN')}.`,
          data: { commissionId: commission.id }
        }
      });

      await this.createAuditLog(tx, dnpProfileId, 'COMMISSION_RECORDED', { amount, leadType, leadId });

      return commission;
    });
  }

  /**
   * Approve a pending commission and handle membership fee recovery
   */
  static async approveCommission(commissionId: string) {
    return await prisma.$transaction(async (tx: any) => {
      const commission = await (tx as any).dNPCommission.findUnique({
        where: { id: commissionId },
        include: { dnpProfile: true }
      });

      if (!commission || commission.status !== 'PENDING') {
        throw new Error('Invalid commission state for approval');
      }

      const dnpProfileId = commission.dnpProfileId;
      const amount = commission.amount;

      // Fetch DNP Config
      const config = await (tx as any).dNPConfig.findUnique({ where: { id: 'default' } }) || {
        recoveryPercentage: 100,
        minEarningThreshold: 0
      };

      // Find active membership recovery
      const activeRecovery = await (tx as any).dNPMembershipRecovery.findFirst({
        where: { dnpProfileId, status: { in: ['NOT_STARTED', 'PARTIALLY_RECOVERED'] } },
        orderBy: { membershipYear: 'asc' }
      });

      let recoveryDeduction = 0;
      if (activeRecovery && amount >= config.minEarningThreshold) {
        const remaining = activeRecovery.totalFee - activeRecovery.recoveredAmount;
        const potentialDeduction = Math.round(amount * (config.recoveryPercentage / 100));
        recoveryDeduction = Math.min(potentialDeduction, remaining);
      }

      const netAmount = amount - recoveryDeduction;

      // Update commission status
      await (tx as any).dNPCommission.update({
        where: { id: commissionId },
        data: { status: 'APPROVED' as CommissionStatus }
      });

      // Update Profile balances
      const updatedProfile = await (tx as any).dNPProfile.update({
        where: { id: dnpProfileId },
        data: {
          pendingEarnings: { decrement: amount },
          approvedEarnings: { increment: amount },
          availableBalance: { increment: netAmount },
        }
      });

      // Ledger: Commission Approved (Full Amount)
      await (tx as any).dNPWalletLedger.create({
        data: {
          dnpProfileId,
          type: 'COMMISSION_APPROVED' as WalletTransactionType,
          amount,
          balanceAfter: updatedProfile.availableBalance - netAmount + amount,
          description: `Commission approved for ${commission.vehicleLeadId ? 'vehicle acquisition' : 'buyer matchmaking'}`,
          referenceId: commissionId,
        }
      });

      // Ledger: Recovery Deduction if applicable
      if (recoveryDeduction > 0) {
        await (tx as any).dNPWalletLedger.create({
          data: {
            dnpProfileId,
            type: 'MEMBERSHIP_FEE_RECOVERY' as WalletTransactionType,
            amount: -recoveryDeduction,
            balanceAfter: updatedProfile.availableBalance,
            description: `DNP Membership fee recovery deduction`,
            membershipRecoveryId: activeRecovery!.id,
          }
        });

        const newRecovered = activeRecovery!.recoveredAmount + recoveryDeduction;
        await (tx as any).dNPMembershipRecovery.update({
          where: { id: activeRecovery!.id },
          data: {
            recoveredAmount: newRecovered,
            status: newRecovered >= activeRecovery!.totalFee ? 'FULLY_RECOVERED' : 'PARTIALLY_RECOVERED'
          }
        });
      }

      // Notify User
      await tx.notification.create({
        data: {
          userId: commission.dnpProfile.userId,
          type: 'DNP_COMMISSION' as NotificationType,
          title: 'Commission Approved',
          message: `Your commission of ₹${amount.toLocaleString('en-IN')} has been approved. ${recoveryDeduction > 0 ? `₹${recoveryDeduction.toLocaleString('en-IN')} was recovered towards membership fee.` : ''}`,
          data: { commissionId }
        }
      });

      await this.createAuditLog(tx, dnpProfileId, 'COMMISSION_APPROVED', { commissionId, amount, recoveryDeduction });

      return commission;
    });
  }

  /**
   * Log status change for a lead and send notifications
   */
  static async logStatusHistory(leadId: string, type: 'VEHICLE' | 'BUYER', status: string, notes?: string, changedBy?: string) {
    const history = await (prisma as any).dNPLeadStatusHistory.create({
      data: {
        [type === 'VEHICLE' ? 'vehicleLeadId' : 'buyerLeadId']: leadId,
        status,
        notes,
        changedBy
      }
    });

    // Fetch lead details for notification
    const lead = type === 'VEHICLE'
      ? await (prisma as any).dNPVehicleLead.findUnique({ where: { id: leadId }, include: { dnpProfile: true } })
      : await (prisma as any).dNPBuyerLead.findUnique({ where: { id: leadId }, include: { listingShare: { include: { dnpProfile: true } } } });

    const userId = type === 'VEHICLE' ? lead.dnpProfile.userId : lead.listingShare.dnpProfile.userId;
    const title = type === 'VEHICLE' ? `${lead.brand} ${lead.model} Update` : `Buyer Lead: ${lead.buyerName} Update`;

    await prisma.notification.create({
      data: {
        userId,
        type: 'DNP_LEAD_UPDATE' as NotificationType,
        title,
        message: `Your lead status has been updated to: ${status}. ${notes ? `Note: ${notes}` : ''}`,
        data: { leadId, type }
      }
    });

    return history;
  }

  /**
   * Track suspicious activity based on velocity
   */
  static async trackSuspiciousActivity(dnpProfileId: string) {
    const time24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const [vCount, bCount] = await Promise.all([
      (prisma as any).dNPVehicleLead.count({ where: { dnpProfileId, createdAt: { gte: time24HoursAgo } } }),
      (prisma as any).dNPListingShare.count({ where: { dnpProfileId, createdAt: { gte: time24HoursAgo } } })
    ]);

    if (vCount + bCount > 10) {
      await (prisma as any).dNPProfile.update({
        where: { id: dnpProfileId },
        data: {
          isSuspicious: true,
          suspiciousReason: `High velocity detected: ${vCount} vehicle leads and ${bCount} listing shares in 24 hours.`
        }
      });

      // Notify Admin (System Audit Log)
      await (prisma as any).auditLog.create({
        data: {
          action: 'SUSPICIOUS_DNP_VELOCITY',
          target: dnpProfileId,
          details: { vCount, bCount }
        }
      });
    }
  }

  /**
   * Create DNP Audit Log
   */
  static async createAuditLog(tx: any, dnpProfileId: string, action: string, details: any, ipAddress?: string) {
    return await tx.dNPAuditLog.create({
      data: {
        dnpProfileId,
        action,
        details: JSON.stringify(details),
        ipAddress
      }
    });
  }

  /**
   * Check for duplicate vehicle lead (by registration number)
   */
  static async isDuplicateVehicle(regNumber: string) {
    const existingLead = await (prisma as any).dNPVehicleLead.findFirst({
      where: {
        regNumber,
        status: { notIn: ['REJECTED', 'CANCELLED', 'EXPIRED'] }
      }
    });
    if (existingLead) return true;

    const existingListing = await prisma.listing.findFirst({
      where: { plateNumber: regNumber }
    });
    return !!existingListing;
  }

  /**
   * Check for duplicate seller lead (by phone)
   */
  static async isDuplicateSeller(phone: string) {
    const existingLead = await (prisma as any).dNPVehicleLead.findFirst({
      where: {
        sellerPhone: phone,
        status: { notIn: ['REJECTED', 'CANCELLED', 'EXPIRED'] }
      }
    });
    return !!existingLead;
  }

  /**
   * Check for duplicate buyer lead (by phone and listing)
   */
  static async isDuplicateBuyer(phone: string, listingId: string) {
    const existingLead = await (prisma as any).dNPBuyerLead.findFirst({
      where: {
        buyerPhone: phone,
        listingShare: {
          listingId,
          expiresAt: { gt: new Date() } // Only active attributions
        },
        status: { notIn: ['LOST', 'CANCELLED', 'EXPIRED'] }
      }
    });
    return !!existingLead;
  }
}

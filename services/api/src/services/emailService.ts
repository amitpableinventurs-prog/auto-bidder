import { Resend } from 'resend';
import { env } from '../env.js';
import { emailTemplates } from './emailTemplates.js';

const resend = env.RESEND_API_KEY ? new Resend(env.RESEND_API_KEY) : null;

export class EmailService {
  /**
   * Generic method to send emails
   */
  private static async sendEmail(to: string, subject: string, html: string) {
    if (!resend) {
      console.warn(`[EmailService] Skipping email to ${to} because RESEND_API_KEY is not configured.`);
      console.log(`[Email DEV LOG] Subject: ${subject}`);
      return { success: true, dummy: true };
    }
    try {
      const { data, error } = await resend.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: [to],
        subject,
        html,
      });

      if (error) {
        console.error(`[EmailService] Error sending email to ${to}:`, error);
        return { success: false, error };
      }

      console.log(`[EmailService] Email sent successfully to ${to}. ID: ${data?.id}`);
      return { success: true, data };
    } catch (err) {
      console.error(`[EmailService] Unexpected error sending email to ${to}:`, err);
      return { success: false, error: err };
    }
  }

  static async sendOtp(email: string, otp: string, purpose: 'registration' | 'verification' | 'forgotPassword' = 'verification') {
    let subject = 'Verification Code';
    let html = '';

    switch (purpose) {
      case 'registration':
        subject = 'Welcome to Auto Bidder - Verification Code';
        html = emailTemplates.registrationOtp(otp);
        break;
      case 'forgotPassword':
        subject = 'Auto Bidder - Password Reset Code';
        html = emailTemplates.forgotPasswordOtp(otp);
        break;
      default:
        subject = 'Auto Bidder - Email Verification Code';
        html = emailTemplates.emailVerification(otp);
    }

    return this.sendEmail(email, subject, html);
  }

  static async sendAuctionWon(email: string, listingTitle: string, amount: number) {
    const subject = `Congratulations! You won the auction for ${listingTitle}`;
    const html = emailTemplates.auctionWon(listingTitle, amount);
    return this.sendEmail(email, subject, html);
  }

  static async sendOutbid(email: string, listingTitle: string, newHighestBid: number) {
    const subject = `You've been outbid on ${listingTitle}`;
    const html = emailTemplates.outbid(listingTitle, newHighestBid);
    return this.sendEmail(email, subject, html);
  }

  static async sendBidConfirmation(email: string, listingTitle: string, amount: number) {
    const subject = `Bid Placed: ${listingTitle}`;
    const html = emailTemplates.bidConfirmation(listingTitle, amount);
    return this.sendEmail(email, subject, html);
  }

  static async sendPaymentReceipt(email: string, amount: number, transactionId: string) {
    const subject = 'Payment Receipt - Auto Bidder';
    const html = emailTemplates.paymentReceipt(amount, transactionId);
    return this.sendEmail(email, subject, html);
  }

  static async sendKycStatus(email: string, status: 'APPROVED' | 'REJECTED', reason?: string) {
    const subject = status === 'APPROVED' ? 'KYC Approved - Auto Bidder' : 'KYC Verification Update - Auto Bidder';
    const html = status === 'APPROVED' ? emailTemplates.kycApproved() : emailTemplates.kycRejected(reason || 'Incorrect document details');
    return this.sendEmail(email, subject, html);
  }

  static async sendPasswordResetConfirmation(email: string) {
    const subject = 'Password Successfully Reset - Auto Bidder';
    const html = emailTemplates.passwordResetConfirmation();
    return this.sendEmail(email, subject, html);
  }
}

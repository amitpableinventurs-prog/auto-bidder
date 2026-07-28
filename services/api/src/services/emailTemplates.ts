/**
 * Email templates for Auto Bidder system
 */

const APP_NAME = 'Auto Bidder';
const PRIMARY_COLOR = '#007bff';

const baseTemplate = (content: string) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 20px auto; border: 1px solid #eee; border-radius: 10px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
    .header { background-color: ${PRIMARY_COLOR}; color: white; padding: 20px; text-align: center; }
    .content { padding: 30px; }
    .footer { background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #777; }
    .otp-code { font-size: 32px; font-weight: bold; letter-spacing: 5px; color: ${PRIMARY_COLOR}; text-align: center; margin: 20px 0; }
    .button { display: inline-block; padding: 12px 25px; background-color: ${PRIMARY_COLOR}; color: white; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>${APP_NAME}</h1>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>&copy; ${new Date().getFullYear()} ${APP_NAME}. All rights reserved.</p>
      <p>This is an automated message, please do not reply.</p>
    </div>
  </div>
</body>
</html>
`;

export const emailTemplates = {
  registrationOtp: (otp: string) => baseTemplate(`
    <h2>Welcome to ${APP_NAME}!</h2>
    <p>Thank you for registering. Use the following OTP to verify your account:</p>
    <div class="otp-code">${otp}</div>
    <p>This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
  `),

  emailVerification: (otp: string) => baseTemplate(`
    <h2>Verify Your Email</h2>
    <p>Please use the following OTP to verify your email address:</p>
    <div class="otp-code">${otp}</div>
    <p>This code is valid for 5 minutes. If you did not request this, please ignore this email.</p>
  `),

  forgotPasswordOtp: (otp: string) => baseTemplate(`
    <h2>Password Reset Request</h2>
    <p>We received a request to reset your password. Use the following OTP to proceed:</p>
    <div class="otp-code">${otp}</div>
    <p>This code is valid for 5 minutes. If you did not request this, your password will remain unchanged.</p>
  `),

  passwordResetConfirmation: () => baseTemplate(`
    <h2>Password Reset Successful</h2>
    <p>Your password has been successfully reset. You can now log in with your new password.</p>
    <p>If you did not perform this action, please contact our support team immediately.</p>
  `),

  auctionWon: (listingTitle: string, amount: number) => baseTemplate(`
    <h2>Congratulations! You Won!</h2>
    <p>You have successfully won the auction for <strong>${listingTitle}</strong> with a bid of <strong>₹${amount.toLocaleString('en-IN')}</strong>.</p>
    <p>Please proceed to the app to complete the payment and documentation process.</p>
    <a href="#" class="button">View Listing</a>
  `),

  outbid: (listingTitle: string, newHighestBid: number) => baseTemplate(`
    <h2>You've Been Outbid</h2>
    <p>Someone placed a higher bid on <strong>${listingTitle}</strong>. The current highest bid is <strong>₹${newHighestBid.toLocaleString('en-IN')}</strong>.</p>
    <p>Don't miss out! Place a higher bid to stay in the lead.</p>
    <a href="#" class="button">Place New Bid</a>
  `),

  bidConfirmation: (listingTitle: string, amount: number) => baseTemplate(`
    <h2>Bid Confirmed</h2>
    <p>Your bid of <strong>₹${amount.toLocaleString('en-IN')}</strong> for <strong>${listingTitle}</strong> has been successfully placed.</p>
    <p>We will notify you if you are outbid or if you win the auction.</p>
  `),

  paymentReceipt: (amount: number, transactionId: string) => baseTemplate(`
    <h2>Payment Receipt</h2>
    <p>Thank you for your payment. We have received <strong>₹${amount.toLocaleString('en-IN')}</strong>.</p>
    <p><strong>Transaction ID:</strong> ${transactionId}</p>
    <p>You can find the details of this transaction in your wallet.</p>
  `),

  kycApproved: () => baseTemplate(`
    <h2>KYC Verification Approved</h2>
    <p>Great news! Your KYC documentation has been reviewed and approved. You now have full access to all features of ${APP_NAME}.</p>
    <p>Happy bidding!</p>
  `),

  kycRejected: (reason: string) => baseTemplate(`
    <h2>KYC Verification Rejected</h2>
    <p>We're sorry, but your KYC documentation was rejected for the following reason:</p>
    <p style="color: #d9534f; font-weight: bold;">${reason}</p>
    <p>Please re-submit your documents with the correct information in the app.</p>
    <a href="#" class="button">Re-submit KYC</a>
  `),
};

# auto-bidder

Car sale / second-hand auto bidding app.

## Features

### A. Buyer Module
- **User Registration**: Create accounts with ease.
- **Login & OTP Verification**: Secure phone-based authentication.
- **Car Browsing**: Explore a wide range of verified used cars.
- **Search & Filters**: Find cars by brand, city, price, and fuel type.
- **Live Auctions**: Real-time bidding on active car listings.
- **Auto Bidding**: Set max limits and let the system bid for you.
- **Wishlist**: Save your favorite cars for later.
- **Notifications**: Instant updates on bids, wins, and new listings.
- **Wallet & Payments**: Secure wallet system for deposits and transactions.
- **Bid History**: Track all your past and active bids.
- **Purchase History**: View records of your successful car purchases.
- **Profile Management**: Manage personal info and verification status.

### B. Seller Module
- **Add Car Listing**: Step-by-step vehicle submission.
- **Upload Car Photos & Videos**: Showcase your vehicle with high-quality media.
- **Set Auction Timing**: Choose custom durations (1h, 2h, 24h, etc.).
- **Set Base Price**: Define the starting point for your auction.
- **Manage Active Auctions**: Monitor real-time interest in your cars.
- **View Bid Activity**: See detailed bid history for your listings.
- **Earnings Dashboard**: Track total earnings and pending payouts.
- **Car Status Tracking**: Follow your vehicle from inspection to sale.

### C. Admin Module
- **Dashboard Analytics**: Real-time platform health and growth metrics.
- **User Management**: Monitor and manage buyer and seller accounts.
- **Seller Verification**: Review KYC documents and approve sellers.
- **Vehicle Verification**: Manage inspections and approve listings for auction.
- **Auction Monitoring**: Live view of all active platform auctions.
- **Fraud Detection**: System alerts for suspicious bidding behavior.
- **Commission Management**: Configure platform fees and commissions.
- **Reports & Logs**: Audit trails for all critical system events.
- **Payment Management**: Oversee wallet top-ups and payouts.
- **Notification Control**: Send and manage platform-wide announcements.

---

## Status

Baseline scaffolding and UI screens are implemented across Buyer, Seller, and Admin modules.

- `apps/mobile`: Expo (React Native) app with 30+ functional screens.
- `services/api`: Node.js (Express) REST API + Socket.IO realtime + Prisma (PostgreSQL).

## Run locally

### Install dependencies
From the repo root:
`npm install`

### Start the API
The API reads env from `services/api/.env`.
`npm run dev:api`

### Start the mobile app
`npm run dev:mobile`

Configure the API base URL via `apps/mobile/.env`.

### Production build
- Build the API:
  `npm run build`
- Run the API in production mode:
  `npm run start:api`
- Build the web admin app by serving `apps/admin` as static files from the same origin as your API.
- Build the mobile app for web export:
  `cd apps/mobile && npm run build:web`

> For mobile native release builds, set `EXPO_PUBLIC_API_BASE_URL` before running the Expo production command.

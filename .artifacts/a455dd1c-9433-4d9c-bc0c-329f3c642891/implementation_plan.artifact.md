# API Integration and Database Connection Plan

The goal is to ensure the backend service is correctly connected to the SQLite database, the schema is applied, and the mobile app can successfully fetch data.

## Proposed Changes

### [Backend Service](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api)

#### [MODIFY] [seed-direct.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/seed-direct.ts)
- Enhance the seed script to include `Brand` and `Slider` data, matching the rich data used in the UI.
- Ensure it cleans existing data before seeding to avoid duplicates.

### [Mobile App](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile)

#### [MODIFY] [api.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/api.ts)
- Ensure the `API_BASE_URL` logic is robust for both emulator and physical device testing.

## Execution Steps

1. **Initialize Database**:
   - Run `npx prisma db push` in the `services/api` directory to ensure the SQLite database schema is up to date.
2. **Update Seed Script**:
   - Update `seed-direct.ts` with comprehensive data (Brands, Sliders, Listings, Users).
3. **Seed Data**:
   - Run `npm run seed` in `services/api`.
4. **Verify Backend**:
   - Verify the `.env` file and `prisma.ts` configuration.
5. **Verify Mobile Connection**:
   - Confirm the API base URL logic in the mobile app.

## Verification Plan

### Automated Tests
- Run `npm run seed` and check if it completes without errors.
- (Manual) Check the `dev.db` content if possible or use Prisma Studio.

### Manual Verification
- Start the backend server (`npm run dev`).
- Open the mobile app and verify that "All Brands" and "Featured Cars" are populated with data from the database instead of falling back to static/mock data.

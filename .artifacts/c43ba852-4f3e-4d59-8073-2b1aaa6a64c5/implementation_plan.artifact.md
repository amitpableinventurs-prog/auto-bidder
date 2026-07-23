# Backend Connection and API Integration Plan

The goal is to ensure the backend is fully connected to a persistent database, all features are working correctly, and the mobile app is integrated seamlessly with the API.

## User Review Required

> [!IMPORTANT]
> This plan assumes a Postgres database is available at the `DATABASE_URL` specified in `services/api/.env`. If you are using Docker, please ensure the containers are running with `docker-compose up -d`.

> [!WARNING]
> We will be running Prisma migrations which will modify your database schema.

## Proposed Changes

### [Backend API]

We need to transition from "in-memory" mode to "database" mode and ensure the schema is fully applied.

#### [MODIFY] [index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)
- Clean up `(prisma as any)` casts after regenerating types.
- Remove redundant "model exists" checks once the database is migrated.
- Ensure all endpoints correctly use Prisma for persistence.

#### [MODIFY] [.env](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/.env)
- Ensure `AUTO_BIDDER_STORE="database"` is set.

### [Mobile App]

Ensure the mobile app points to the correct API endpoint and handles connectivity gracefully.

#### [NEW] [.env](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/.env)
- Explicitly set `EXPO_PUBLIC_API_BASE_URL` to avoid detection issues.

## Verification Plan

### Automated Steps
1. Run `npx prisma generate` in `services/api` to update types.
2. Run `npx prisma db push` to apply the schema to the database (since no migrations exist yet).
3. Run the `seed-rich` endpoint to populate the database.
4. Verify the API health check endpoint: `GET /health`.

### Manual Verification
1. Open the mobile app and verify that listings are loaded from the database (not just the demo fallback).
2. Perform a test login/register.
3. Place a bid and verify it persists after a backend restart.

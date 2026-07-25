# Fix Dev Server Startup Issues

The goal is to resolve the Prisma Client import error in the API service and fix the port 8081 conflict that prevents the mobile development server from starting.

## User Review Required

> [!IMPORTANT]
> I am modifying the way `PrismaClient` is imported in the API service to ensure compatibility with ESM (`"type": "module"`). This is a standard workaround for Prisma Client in Node.js ESM environments.

## Proposed Changes

### API Service

#### [MODIFY] [prisma.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/prisma.ts)
Update the import to use a default import and then destructure `PrismaClient` to avoid `SyntaxError` in ESM.

#### [MODIFY] [seed-direct.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/seed-direct.ts)
Update the import similarly to `prisma.ts`.

### Dev Environment

#### [ACTION] Kill blocking processes
Identify and terminate any process listening on port 8081 (Metro Bundler's default port).

#### [ACTION] Regenerate Prisma Client
Ensure the Prisma Client is up to date by running `prisma generate`.

## Verification Plan

### Automated Tests
- Run `npm run dev:api` to verify the API starts without syntax errors.
- Run `npm run dev:mobile` to verify the Metro server starts successfully on port 8081.

### Manual Verification
- Run the full development environment with `npm run dev` and ensure both services are running.

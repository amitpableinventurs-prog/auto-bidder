# Implementation Plan - Admin Panel Backend Integration

This plan outlines the steps to integrate the advanced admin panel frontend (`apps/admin/index.html`) with the backend API, ensuring all features are functional and all issues are resolved.

## User Review Required

> [!IMPORTANT]
> - The `User` model in `schema.prisma` does not have a `password` field. For the `/admin/login` feature, I will add a `password` field to the `User` model.
> - I will replace the current basic admin panel at `/admin` with the advanced one from `apps/admin`.

## Proposed Changes

### Database Schema

#### [schema.prisma](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/prisma/schema.prisma)

- Add `password String?` to the `User` model to support admin login.

---

### Backend API

#### [routes/index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)

- Add missing admin endpoints:
    - `POST /api/admin/login`: Authenticate admin users.
    - `GET /api/admin/staff/all`: List all users with `role: 'ADMIN'`.
    - `POST /api/admin/staff/create`: Create a new admin user.
    - `DELETE /api/admin/staff/:id`: Remove admin role from a user.
- Ensure all other `/admin/*` endpoints match the expectations of `apps/admin/app.js`.

#### [http.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/http.ts)

- Serve the `apps/admin` directory as static files at the `/admin` path.
- Update the `/admin` GET route to serve `index.html` from `apps/admin`.

#### [adminPanel.ts [DELETE]](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/adminPanel.ts)

- Remove this file as it's replaced by the advanced admin panel.

---

### Frontend

#### [app.js](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/app.js)

- Minor fixes if any mismatches are found during implementation.
- Ensure `apiBase` defaults correctly when served from the same origin.

## Verification Plan

### Automated Tests
- I will use `curl` or a similar tool to test the new API endpoints.
- I will check the logs for any errors.

### Manual Verification
- Open the admin panel at `http://localhost:4000/admin`.
- Verify Dashboard stats and tables.
- Verify User and Dealer management.
- Verify Brand and Slider management.
- Test "Seed Demo Data" functionality.
- Test Admin/Staff management features.

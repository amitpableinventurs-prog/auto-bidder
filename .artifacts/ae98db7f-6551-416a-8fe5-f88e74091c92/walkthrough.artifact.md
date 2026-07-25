# Walkthrough - Brand List Update

I have updated the car brands across the entire platform to match the 20 brands requested.

## Changes Made

### Backend
- **[services/api/src/routes/index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)**: Updated the `seed-rich` route to include all 20 brands with descriptions, counts, and proper logo URLs.

### Mobile App
- **[apps/mobile/src/api.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/api.ts)**: Updated the fallback brand list in `getBrands()` to ensure all 20 brands are available even if the backend is offline.
- **[apps/mobile/src/utils/brands.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/utils/brands.ts)**: Reordered the `ALL_BRANDS` list to prioritize the 20 brands from the image at the top of the list.

### Admin Panel
- **[apps/admin/index.html](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/index.html)**: Refined the `getBrandLogo` function to ensure "Land Rover" and other brands are correctly mapped to their high-quality icons.

## Verification Results

### Manual Verification
- The seeding logic now correctly populates the database with 20 distinct brands.
- The mobile app UI will now show these 20 brands at the top of the "All Brands" section.
- The admin dashboard will display the correct logos for all 20 brands.

> [!TIP]
> To see the changes in the Admin Dashboard, click on **✨ Seed Demo Data** in the Dashboard overview.

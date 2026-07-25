# Implementation Plan - Update Brands

Update the list of car brands across the project to match the 20 brands shown in the provided image.

## Proposed Changes

### [Backend] [services/api/src/routes/index.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/services/api/src/routes/index.ts)

Update the `seed-rich` route to include all 20 brands from the image with appropriate descriptions and counts.

- Maruti Suzuki
- Hyundai
- Tata Motors
- Mahindra
- Kia
- Honda
- Toyota
- Volkswagen
- Renault
- Ford
- Skoda
- Nissan
- MG Motors
- Jeep
- BMW
- Mercedes
- Audi
- Jaguar
- Volvo
- Land Rover

### [Mobile] [apps/mobile/src/api.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/api.ts)

Update the fallback brands in `getBrands()` to include all 20 brands for consistency when offline or during demo.

### [Mobile] [apps/mobile/src/utils/brands.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/utils/brands.ts)

Reorder and refine the `ALL_BRANDS` list to prioritize the 20 brands from the image.

### [Admin] [apps/admin/index.html](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/index.html)

Verify the `getBrandLogo` function. It already seems to contain these 20 brands, but I will ensure the mapping is correct and matches the order if necessary for any UI display.

## Verification Plan

### Automated Tests
- No automated tests for this UI/Data change, but I will ensure the code compiles.

### Manual Verification
- The user can run the `Seed Demo Data` button in the Admin Dashboard to see the updated brands in the Brand Network section.
- The user can check the Mobile App's "All Brands" screen to see the updated list.

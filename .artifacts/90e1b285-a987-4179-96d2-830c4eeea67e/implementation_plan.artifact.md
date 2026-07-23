# UI Updates for Car Details and Calendar

This plan covers updating the "Fill Car Details" screen and the "Calendar Modal" to match the latest design requirements provided in the images. The project is a React Native app using Expo.

## User Review Required

> [!IMPORTANT]
> The "Listed By" options have been expanded. Please confirm if "Showroom Staff", "Brokership", and "AB Network Partner" should all require contact details (Name and Number) for further coordination, similar to "Selling for a Friend".

## Proposed Changes

### Mobile App - Screens & Components

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)
- Update `LISTED_BY_OPTIONS` to include: `'Showroom Staff'`, `'Brokership'`, `'AB Network Partner'`.
- Update `VEHICLE_CONDITION_OPTIONS` to include: `'Not Running'`, `'Towing Required'`, `'Jump Start Required'`.
- Update `FUEL_TYPES` to include: `'Electric'`, `'Electric Hybrid'`.
- Update `VARIANT_OPTIONS` to use `'Not In The List Add Your Variant'` instead of `'Other'`.
- Update the conditional rendering for contact details to include the new "Listed By" options.

#### [MODIFY] [CalendarModal.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/components/CalendarModal.tsx)
- Redesign the header to place the month/year and navigation arrows in the same row, as seen in the images.
- Update the week row to show three-letter day names (Sun, Mon, Tue, etc.).
- Add a horizontal separator line between the week row and the days grid.
- Adjust styling (colors, fonts, spacing) to match the cleaner design in the images.

## Verification Plan

### Manual Verification
- **Form Options:** Open the "Fill Out the Car Details" screen in the mobile app and verify all dropdowns (Fuel Type, Listed By, Vehicle Condition, Variant) show the updated options.
- **Contact Details:** Select "Showroom Staff" in the "Listed By" dropdown and verify the "Enter Your Contact Details" section appears.
- **Calendar UI:** Open the registration or insurance date picker and verify the new calendar design matches the provided images (Header layout, full day names, separator line).
- **Variant Logic:** Select "Not In The List Add Your Variant" and verify the manual input field appears and behaves correctly.

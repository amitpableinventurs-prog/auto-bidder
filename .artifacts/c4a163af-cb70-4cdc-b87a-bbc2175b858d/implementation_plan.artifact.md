# Implementation Plan - Fix Brand Icons not showing

The user reported that brand icons are not showing in the brand grid. I will ensure that the icons always load from the local assets (which match the mockup) and fix the rendering logic to be more robust.

## User Review Required

> [!IMPORTANT]
> I will switch the brand grid to use local assets (`ALL_BRANDS`) instead of relying on the API response for the grid icons. This ensures the icons always match the design mockup even if the API is slow or returns different data.

## Proposed Changes

### [Component Name]

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)

- **Grid Rendering Logic:**
    - Change the `brandGrid` mapping to iterate over `PRIMARY_BRANDS` directly and look up the brand info from `ALL_BRANDS`.
    - This ensures the `require()`-based icons from the local assets are used for the 19 primary brands, guaranteeing they show up regardless of API state.
- **Image Component Styling:**
    - Adjust `brandLogo` styles to ensure the image fills the container appropriately.
    - Double-check the `source` logic to handle both local assets (numbers) and remote URLs correctly, although local assets will be prioritized for the grid.
- **Merge State:**
    - Keep `fetchBrands` to populate the `brands` state used in the search/select modal, but don't let it overwrite the grid's visual source.

## Verification Plan

### Manual Verification
- Open the "Fill Out the Car Details" screen.
- Confirm all 19 brand icons (Suzuki, Hyundai, Tata, etc.) are visible in the grid.
- Confirm the "OTHER" button is present and functional.
- Verify that clicking a brand icon still updates the selected brand and resets models/variants.

# Implementation Plan - Update Brand UI and Show More Brands

Update the brand selection grid in `MainHome.tsx` and `CarSearchFilter.tsx` to match the provided design images, including showing more brands by default.

## User Review Required

> [!IMPORTANT]
> - The images show a **black background** for the brand section and **light blue background** for individual brand items.
> - The grid will be updated to a **3-column layout** with brand names below logos.
> - **Brand Counts** will be removed as they are not in the design.
> - The initial view will show **20 brands** (as seen in the image) instead of 9, with "VIEW LESS" to collapse or "VIEW ALL BRANDS" to show the full list.

## Proposed Changes

### [Mobile App]

#### [MODIFY] [MainHome.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/MainHome.tsx)
- Change initial `showAllBrands` state or the slice count to show 20 brands by default.
- Update `brandsGrid` container:
    - Add `backgroundColor: COLORS.black1`.
    - Add padding.
- Update `brandItem` styling:
    - `backgroundColor: COLORS.lightBlue1`.
    - `borderRadius: 12`.
    - Remove borders and `brandCount`.
    - Increase `brandLogo` size to ~40-45.
    - Set `brandName` color to `COLORS.black2`.
- Update `SectionHeader`: Ensure the title "Explore Popular Brands" is white when on the black background.
- Update `viewAllBrandsBtn`:
    - Dark background.
    - Blue border and text.

#### [MODIFY] [CarSearchFilter.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/CarSearchFilter.tsx)
- Apply the same 20-brand initial slice and styling updates to the brand grid in the filter screen.

## Verification Plan

### Manual Verification
- **Home Screen:** Verify the brands section is black, items are light blue, and 20 brands are shown initially.
- **Filter Screen:** Verify the "Popular Brands" accordion contains the updated grid style and count.
- **Toggle:** Test "VIEW LESS" / "VIEW ALL BRANDS" to ensure it correctly collapses/expands the grid.

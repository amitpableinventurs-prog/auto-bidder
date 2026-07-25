# Implementation Plan - Optimize Fill Car Details UI Spacing

This plan addresses the excessive vertical space in the "Fill Car Details" screen by introducing a "View All Brands" toggle and further reducing component margins.

## User Review Required

> [!IMPORTANT]
> - **Brand Selection**: Only the top 12 brands will be shown by default. A "View All Brands" button will be added to expand the grid.
> - **Spacing**: Vertical margins for labels, grids, and input boxes will be reduced again to make the form even more compact.

## Proposed Changes

### Mobile App Component

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)

- **Brand Grid Logic**:
    - Add `showAllBrands` state (default `false`).
    - Slice `ALL_BRANDS` to show only 12 items when `showAllBrands` is `false` and `brandSearch` is empty.
    - Add a "View All Brands" / "View Less" button below the brand grid.
- **Style Adjustments**:
    - `label`: Reduce `marginTop` from 14 to 10 and `marginBottom` from 6 to 4.
    - `brandGrid`: Reduce `marginTop` from 8 to 4 and `marginBottom` from 4 to 2.
    - `chipGrid`: Reduce `marginTop` from 8 to 4 and `marginBottom` from 4 to 2.
    - `divider`: Reduce `marginTop` from 20 to 12.
    - `footerRow`: Reduce `marginTop` from 20 to 12.
    - `brandItem`: Slightly reduce padding and border radius to save space.

## Verification Plan

### Manual Verification
- Open the "Fill Out the Car Details" screen.
- Verify that only 12 brands are visible initially.
- Click "View All Brands" to see the full list.
- Check that the vertical spacing between labels and fields is tighter.

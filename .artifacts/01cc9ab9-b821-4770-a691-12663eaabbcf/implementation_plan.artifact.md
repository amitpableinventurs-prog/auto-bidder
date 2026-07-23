# Precise UI Update for Fill Car Details

Update the "Fill Out the Car Details" screen to match the design mockup exactly, focusing on spacing, rounding, and specific component colors.

## User Review Required

> [!IMPORTANT]
> The brand grid will be limited to 11 primary brands + "Other" to match the 4x3 layout in the mockup.

## Proposed Changes

### [Component Name] FillCarDetails Screen

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)

- **Update Brand Order**: Change `PRIMARY_BRANDS` to: `['maruti', 'hyundai', 'tata', 'mahindra', 'kia', 'toyota', 'honda', 'skoda', 'volkswagen', 'mg', 'renault']`.
- **Refine Brand Cards**:
    - Set `borderRadius` to `15` for `brandItem`.
    - Change `brandItemActive` background to `#FFFFFF` (white) with a blue border.
    - Reduce `shadowOpacity` and `elevation` for a cleaner look.
- **Adjust Search Bar**:
    - Change `searchBarContainerForm` background to `#F8FAFC`.
    - Set `borderRadius` to `12`.
    - Update placeholder text color to a lighter gray (`#CBD5E1`).
- **Update Form Inputs**:
    - Increase `inputBox` height to `48`.
    - Set `borderRadius` to `12`.
- **Style Upload Box**:
    - Background: `#FFFBEB`.
    - Border: `#FDE68A` (1px solid).
    - BorderRadius: `12`.
- **Tab Improvements**:
    - Set `tabActive` borderBottomWidth to `3`.
    - Increase `tabTextActive` weight to `Bold`.

## Verification Plan

### Manual Verification
- Verify the **Brand Grid** has exactly 3 rows of 4 items.
- Verify the **Hyundai** card (if selected) has a blue border and white background.
- Check that the **Registration Number** input and **Model/Variant** dropdowns have rounded corners (`12px`).
- Confirm the **Click Car Photos** box has a light yellow tint and rounded corners.

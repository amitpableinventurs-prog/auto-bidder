# Implementation Plan - UI Update for Fill Car Details

Update the "Fill Car Details" screen by converting the kilometers selection to a numeric input and refreshing the "View All Brands" button design.

## Proposed Changes

### [Component Name] FillCarDetails Screen

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)

- **Kilometers Field**:
    - Replace the `SelectInput` for "Kilometers Driven By Your Car" with a `TextInputBox`.
    - Set `keyboardType="numeric"` for the kilometers input.
    - Update `onChangeText` to handle the kilometers driven state.
    - Remove the `kmDriven` case from `BottomSelectModal` and its associated data list.
- **View All Brands Button**:
    - Refresh the design of the "View All Brands" button to make it look "new" (more modern).
    - Add a chevron icon (down/up) to indicate expansion.
    - Update the button text to be more descriptive (e.g., "Show More Brands" / "Show Less").
    - Improve the button's styling (padding, background, border).

## Verification Plan

### Manual Verification
- Navigate to the "Fill Car Details" screen.
- Verify that "Kilometers Driven By Your Car" is now a text input field that accepts numeric input.
- Verify that the "Show More Brands" button has a refreshed design and works correctly to expand/collapse the brand grid.
- Ensure the brand grid still shows the "OTHER" option correctly.

# Update Submit and More Details Button UI

The goal is to update the "SUBMIT" and "ADD MORE INFO" buttons in the `FillCarDetails` screen to match the provided 3D rounded design with icons.

## Proposed Changes

### Mobile App

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)
- Update `submitBtn` style to add a 3D effect using `borderBottomWidth` and `borderBottomColor`.
- Update the buttons in the footer row:
    - Change "ADD MORE INFO" to "MORE DETAILS".
    - Update icons to match the design (Paper plane for Submit, Document for More Details).
    - Use pill-shaped `borderRadius`.
- Adjust spacing and font weights to match the image.

## Verification Plan

### Manual Verification
- Navigate to the "Sell Car" flow and reach the "Fill Car Details" screen.
- Verify the buttons at the bottom have the new 3D rounded look.
- Confirm icons are displayed correctly next to the text.

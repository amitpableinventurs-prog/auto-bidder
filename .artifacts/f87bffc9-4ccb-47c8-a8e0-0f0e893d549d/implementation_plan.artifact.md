# Implementation Plan - Update "Fill Out the Car Details" UI

Update the "Fill Out the Car Details" screen to match the provided design mockup, focusing on layout, spacing, and component styling.

## Proposed Changes

### [Mobile App]

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)

- **Header Styling**:
    - Update `headerTitle` to use a bolder font and match the size in the image.
    - Ensure the back icon matches the image.
- **Tabs Styling**:
    - Adjust `tabsRow` to have a cleaner look.
    - Update `tabActive` to have a thicker blue underline that spans the width of the tab.
    - Adjust tab text colors and weights.
- **Form Components**:
    - **Labels**: Increase font weight and adjust margins for `Label` component.
    - **Registration Number**: Style the `TextInputBox` to match the image's clean look.
    - **Search Bar**: Update `searchBarContainerForm` with a more rounded border, light gray background, and appropriate padding/icons.
    - **Brand Grid**:
        - Update `brandItem` and `brandGrid` for 4-column layout with specific gap and item sizing.
        - Update `brandItemActive` to use a 2px blue border and a light blue tint background.
        - Style the brand logos and names to match the clean grid in the image.
        - Update the "Other" option to match the "..." icon and label in the image.
    - **Dropdowns (Model/Variant)**: Update `SelectInput` to match the style of other inputs and use a chevron-down icon.
    - **Car Images Upload**:
        - Style `UploadBox` with the yellowish background and dashed/solid border as per the image.
        - Update the upload icon to be a white camera inside a blue circle.
- **General Styles**:
    - Update `styles` object with new spacing, colors, and typography constants based on the design.

## Verification Plan

### Manual Verification
- Open the "Fill Out the Car Details" screen in the mobile app.
- Compare the UI with the provided mockup image.
- Verify that the brand grid is correctly aligned and interactive.
- Check that the tabs switch correctly and the active indicator is properly styled.
- Ensure the upload box and dropdowns are visually consistent with the design.

# Walkthrough - Form Button Updates

I have updated the action buttons at the bottom of the "Basic Details" tab in the `FillCarDetails` screen to match the requested labels and colors.

## Changes Made

### [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)

- **Button Labels:**
    - The "SKIP SUBMIT" button has been renamed to **SUBMIT**. This button allows users to finish the listing immediately using only the basic information.
- **Button Styling:**
    - Updated the background color of the **MORE DETAILS** button to the primary blue (`#246EB9`).
    - Updated the background color of the **SUBMIT** button (formerly Skip Submit) to the primary blue to maintain visual consistency.
    - Set the text color for both buttons to white for better contrast on the blue background.

## Verification Results

### Manual Verification
- Navigated to the "Basic Details" tab.
- Confirmed that the two primary actions at the bottom are now "SUBMIT" and "MORE DETAILS".
- Verified that both buttons are styled in blue with bold white text.
- Confirmed that the functionality (Submit vs. Go to More Details) remains intact.

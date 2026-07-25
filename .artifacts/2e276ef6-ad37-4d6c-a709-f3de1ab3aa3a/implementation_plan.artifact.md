# Implementation Plan - Refactor Camera Guidance and Capture Flow

Refactor the camera guidance (onboarding) flow and the actual camera capture screen to improve user experience and clarity based on the provided requirements.

## Proposed Changes

### [Camera Component]

#### [MODIFY] [CameraGuidance.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/CameraGuidance.tsx)
- **Step 0**: Car Type Selection (Portrait).
- **Tour Progress**: Add "Quick tour X of 4" label and a "Skip" button for steps 1-4.
- **Step 1 (Tour 1/4)**: Swipe Guide.
    - Add three small boxes showing different angles below the hand illustration.
    - Keep in Portrait.
- **Step 2 (Tour 2/4)**: Fit Borders.
    - Simplify UI: Remove cluttered elements.
    - Show: Car border, top instruction "Try to Fit your Car inside borders", and a "45° angle box".
    - Force **Landscape**.
- **Step 3 (Tour 3/4)**: Green Click.
    - Simplify UI: Remove cluttered elements.
    - Show: Instruction "To Click photo in best angles Click when green", green border, car border, and the capture button.
    - Force **Landscape**.
- **Step 4 (Tour 4/4)**: Combined Categories.
    - Combined instruction: "Click here to upload Interior, Detailed or Custom Images".
    - Force **Landscape**.
- **Navigation**: Update step logic to match the new 4-page tour structure.

#### [MODIFY] [CarCamera.tsx](file:///C:/Users/Vaibhav%20Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/CarCamera.tsx)
- Ensure robust state management for each angle.
- Verify that images are correctly assigned to their respective categories (Exterior, Interior, Detail, Custom).
- Improve the logic for "finishing" the flow and returning all captured images to the main listing form.

## Verification Plan

### Manual Verification
- **Test Guidance Flow**:
    - Start the "Click Car Photos" flow.
    - Select car type.
    - Verify "Quick tour X of 4" and "Skip" button appear.
    - Verify Step 1 shows three small boxes below the hand.
    - Verify Step 2 transitions to Landscape and shows simplified UI.
    - Verify Step 3 transitions to Landscape and shows simplified UI.
    - Verify Step 4 transitions to Landscape and shows combined instruction.
- **Test Actual Camera**:
    - Complete the tour or skip it.
    - Verify the actual camera screen opens in Landscape.
    - Capture photos for different angles and categories.
    - Verify "FINISH" returns to the `FillCarDetails` (via `ListingDocuments`) with all images.

### Automated Tests
- N/A

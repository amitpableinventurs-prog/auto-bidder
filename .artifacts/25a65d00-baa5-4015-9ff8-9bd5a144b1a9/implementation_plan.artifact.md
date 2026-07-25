# Implementation Plan - Expand Brand Grid with Toggle

Add the full set of 20 brands to the car selection grid and implement a "View More / View Less" toggle to match the requested design.

## User Review Required

> [!IMPORTANT]
> The "VIEW LESS" button at the bottom of the brand grid will toggle between showing a primary set of brands and the full list of 20 brands. I will default to showing all 20 if the user is already looking at the expanded state in the screenshot.

## Proposed Changes

### [mobile] [screens]

#### [MODIFY] [FillCarDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)
- **State:** Add `showAllBrands` boolean state (default: true, as per the screenshot showing "VIEW LESS").
- **Brand List:** Update the filtering logic to include:
    - `maruti`, `hyundai`, `tata`, `mahindra`, `kia`, `honda`, `toyota`, `volkswagen`, `renault`, `ford`, `skoda`, `nissan`, `mg`, `jeep`, `bmw`, `mercedes`, `audi`, `jaguar`, `volvo`, `landrover`.
- **UI:**
    - Render the expanded grid of 20 brands.
    - Add the "VIEW LESS / VIEW MORE" button at the bottom of the grid.
- **Styling:**
    - Match the toggle button style: dark background, blue text, rounded corners.

## Verification Plan

### Manual Verification
- Open the "Basic Details" tab.
- Verify that the brand grid shows 20 logos in a 4-column layout.
- Tapping "VIEW LESS" should collapse the grid (e.g., to 8 or 12 brands).
- Tapping "VIEW MORE" should expand it back to 20.
- Ensure all 20 brands are selectable and update the model/variant options correctly.

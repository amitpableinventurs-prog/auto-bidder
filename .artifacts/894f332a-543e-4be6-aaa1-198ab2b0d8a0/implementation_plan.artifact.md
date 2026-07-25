# Add More Brands to Explore Popular Brands Section

The user wants to see more brands in the "Explore Popular Brands" section on the Home screen.

## User Review Required

> [!NOTE]
> - I will increase the default number of brands shown from **9 to 12** to show 4 rows instead of 3.
> - I will also add **Skoda**, **MG**, and **Nissan** to the initial view list if they are not already there.

## Proposed Changes

### [Component] MainHome Screen

#### [MODIFY] [MainHome.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/MainHome.tsx)
- Change the `slice(0, 9)` to `slice(0, 12)` in the brands rendering loop.

### [Data] Brand Utils

#### [MODIFY] [brands.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/utils/brands.ts)
- Add any missing notable brands if needed (e.g. **BYD**, **Haval**, **McLaren**).
- Reorder the `ALL_BRANDS` list to ensure the top 12 brands are the most popular ones for the target market.

## Verification Plan

### Manual Verification
- Navigate to the Home screen.
- Verify that 12 brand cards are now visible by default.
- Confirm that the "VIEW ALL BRANDS" button still toggles the remaining brands correctly.

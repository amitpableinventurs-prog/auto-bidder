# Walkthrough - Car Details and Calendar UI Updates

I have updated the "Fill Car Details" screen and the "Calendar Modal" to match the provided design requirements.

## Changes

### Fill Car Details Screen
- **Expanded Options:**
    - **Listed By:** Added `Showroom Staff`, `Brokership`, and `AB Network Partner`.
    - **Vehicle Condition:** Added `Not Running`, `Towing Required`, and `Jump Start Required`.
    - **Fuel Type:** Added `Electric` and `Electric Hybrid`.
    - **Variant:** Replaced `Other` with `Not In The List Add Your Variant`.
- **Contact Details Logic:**
    - The "Enter Your Contact Details" section now appears for all new "Listed By" options.
    - Updated the label and icon to match the design images exactly.
- **Manual Variant Input:** Updated the logic to trigger the manual variant input field when "Not In The List Add Your Variant" is selected.

### Calendar Modal Redesign
- **Header:** Redesigned the header to show the Month/Year on the left and navigation arrows on the right in a single row.
- **Week Row:** Updated day names to 3-letter format (Sun, Mon, Tue, etc.).
- **Separator:** Added a horizontal line between the week row and the days grid.
- **Styling:** Updated fonts, colors, and border radius to achieve a cleaner, modern look as requested.

## Verification Results

### Form Options
- Verified that all dropdowns now contain the new items.
- Verified that selecting "Showroom Staff" displays the contact details input fields with the correct header.

### Calendar UI
- Verified the new layout of the calendar modal, including the single-row month navigation and the 3-letter day names.

render_diffs(file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/FillCarDetails.tsx)
render_diffs(file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/components/CalendarModal.tsx)

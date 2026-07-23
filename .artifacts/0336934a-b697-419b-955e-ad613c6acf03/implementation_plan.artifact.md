# Implementation Plan - Update Admin Logo

The goal is to replace the current text-and-icon based logo in the Admin Control Panel with the `hdlogo.png` asset currently located in the mobile app's assets.

## Proposed Changes

### Assets

#### [NEW] [hdlogo.png](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/assets/hdlogo.png)
- Copy the logo from `apps/mobile/assets/hdlogo.png` to a new `apps/admin/assets/` directory.

### Admin App

#### [MODIFY] [index.html](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/index.html)
- Replace the logo structure in the Login Screen (`.login-logo`) with an `<img>` tag pointing to `assets/hdlogo.png`.
- Replace the logo structure in the Main Header (`.logo`) with an `<img>` tag pointing to `assets/hdlogo.png`.

#### [MODIFY] [style.css](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/admin/style.css)
- Add styling for the new image-based logo to ensure it fits well in both the login screen and the header.
- Clean up or deprecate old `.logo-icon`, `.logo-gavel`, and `.logo-text` styles if they are no longer needed.

## Verification Plan

### Manual Verification
- Open the Admin Control Panel (`apps/admin/index.html`) in a browser.
- Verify that the new logo appears on the login screen.
- Log in and verify that the new logo appears in the main header.
- Check responsiveness to ensure the logo scales correctly on different screen sizes.

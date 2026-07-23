# Walkthrough - Fix RCTImageView Cast Error

I have fixed the crash where `RCTImageView` was unable to cast a `Double` (asset ID) to a `String` for the `uri` property. This was happening because local assets (imported via `require`) return a number, while the `uri` property expects a string.

## Changes

### apps/mobile

#### [BrandDetails.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/BrandDetails.tsx)
- Updated the brand logo `Image` source to check if `brand.logo` is a string. If it is, it uses `{ uri: brand.logo }`. If it's a number (asset ID), it uses `brand.logo` directly as the source.

#### [MainHome.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/screens/MainHome.tsx)
- Similarly updated the "Explore Popular Brands" section to safely handle both remote URIs and local asset IDs for brand logos.

## Verification Results

### Automated Tests
- Ran `analyze_file` on both modified files; no syntax errors or lint issues were detected.

### Manual Verification
- The logic now matches the working implementation in `AllBrands.tsx`, which correctly handles dynamic logo sources.

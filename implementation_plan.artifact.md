# Implementation Plan - Enhancements & Checklist Progress

This plan addresses several pending items from the development checklist, focusing on Offline Support, Theme Management, and UI consistency.

## Proposed Changes

### 1. Offline Support & Persistence

#### [MODIFY] [store/useAppStore.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/store/useAppStore.ts)
- Use `persist` middleware from Zustand to save `selectedCity`, `recentlyViewed`, and `favorites` to `AsyncStorage`.
- This ensures user preferences and activity persist across app restarts.

#### [MODIFY] [store/useSettingsStore.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/store/useSettingsStore.ts)
- Use `persist` middleware to save `notifications`, `language`, and `theme` settings.

### 2. Theme Management (Dark Mode)

#### [MODIFY] [theme.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/theme.ts)
- Define `LIGHT_COLORS` and `DARK_COLORS` objects.
- Export a function `getColors(theme: 'light' | 'dark' | 'system')` to return the appropriate color palette.

#### [NEW] [components/ThemeProvider.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/components/ThemeProvider.tsx)
- Create a context provider that wraps the app and provides the current color palette based on `useSettingsStore`.
- Listen for system appearance changes if theme is set to 'system'.

#### [MODIFY] [App.tsx](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/App.tsx)
- Wrap the app in the new `ThemeProvider`.

### 3. Multi-language Support (Foundation)

#### [NEW] [utils/i18n.ts](file:///C:/Users/Vaibhav Soni/StudioProjects/auto-bidder/auto-bidder/apps/mobile/src/utils/i18n.ts)
- Setup `i18next` and `react-i18next`.
- Create translation files for English, Hindi, and Marathi (initial boilerplate).

## Verification Plan

### Manual Verification
1. **Persistence**: Change city to "Mumbai", favorite a car, then force close and restart the app. Verify data persists.
2. **Theme**: Toggle "Dark Mode" in Settings. Verify colors update globally.
3. **Language**: Toggle "Language" in Settings. Verify static labels update (after adding initial translations).

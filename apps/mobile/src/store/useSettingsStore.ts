import { create } from 'zustand';

interface SettingsState {
  notifications: boolean;
  marketing: boolean;
  biometrics: boolean;
  language: 'English' | 'Hindi' | 'Marathi';
  theme: 'light' | 'dark' | 'system';

  setNotifications: (val: boolean) => void;
  setMarketing: (val: boolean) => void;
  setBiometrics: (val: boolean) => void;
  setLanguage: (val: 'English' | 'Hindi' | 'Marathi') => void;
  setTheme: (val: 'light' | 'dark' | 'system') => void;
}

export const useSettingsStore = create<SettingsState>((set) => ({
  notifications: true,
  marketing: false,
  biometrics: false,
  language: 'English',
  theme: 'system',

  setNotifications: (notifications) => set({ notifications }),
  setMarketing: (marketing) => set({ marketing }),
  setBiometrics: (biometrics) => set({ biometrics }),
  setLanguage: (language) => set({ language }),
  setTheme: (theme) => set({ theme }),
}));

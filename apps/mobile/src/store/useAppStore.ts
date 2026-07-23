import { create } from 'zustand';
import { ApiListing } from '../api';

interface AppState {
  phoneNumber: string;
  selectedCity: string;
  selectedListing: ApiListing | null;
  newListingData: any;
  isEditMode: boolean;
  filters: any;
  recentlyViewed: ApiListing[];
  favorites: string[];

  setPhoneNumber: (phone: string) => void;
  setSelectedCity: (city: string) => void;
  setSelectedListing: (listing: ApiListing | null) => void;
  setNewListingData: (data: any) => void;
  setIsEditMode: (isEdit: boolean) => void;
  setFilters: (filters: any) => void;
  addRecentlyViewed: (listing: ApiListing) => void;
  setFavorites: (favorites: string[]) => void;
  toggleFavorite: (listingId: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  phoneNumber: '',
  selectedCity: 'Indore',
  selectedListing: null,
  newListingData: null,
  isEditMode: false,
  filters: null,
  recentlyViewed: [],
  favorites: [],

  setPhoneNumber: (phoneNumber) => set({ phoneNumber }),
  setSelectedCity: (selectedCity) => set({ selectedCity }),
  setSelectedListing: (selectedListing) => set({ selectedListing }),
  setNewListingData: (newListingData) => set({ newListingData }),
  setIsEditMode: (isEditMode) => set({ isEditMode }),
  setFilters: (filters) => set({ filters }),
  addRecentlyViewed: (listing) => set((state) => {
    const filtered = state.recentlyViewed.filter((item) => item.id !== listing.id);
    return { recentlyViewed: [listing, ...filtered].slice(0, 20) };
  }),
  setFavorites: (favorites) => set({ favorites }),
  toggleFavorite: (listingId) => set((state) => ({
    favorites: state.favorites.includes(listingId)
      ? state.favorites.filter(id => id !== listingId)
      : [...state.favorites, listingId]
  })),
}));

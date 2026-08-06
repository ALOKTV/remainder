import { create } from 'zustand';
import { GuestUser } from '../types/models';

type AuthState = {
  guest: GuestUser | null;
  isGuest: boolean;
  setGuest: (guest: GuestUser | null) => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  guest: null,
  isGuest: false,
  setGuest: (guest) => set((state) => ({ ...state, guest, isGuest: !!guest })),
}));
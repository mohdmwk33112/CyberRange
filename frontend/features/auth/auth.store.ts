import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id?: string;
    _id?: string;
    sub?: string;
    email: string;
    username?: string;
    name?: string;
    role?: string;
}

interface AuthState {
    token: string | null;
    user: User | null;
    setAuth: (token: string, user: User) => void;
    clearAuth: () => void;
    isAuthenticated: () => boolean;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            token: null,
            user: null,
            setAuth: (token, user) => set({ token, user }),
            clearAuth: () => set({ token: null, user: null }),
            isAuthenticated: () => !!get().token,
        }),
        {
            name: 'auth-storage', // name of the item in the storage (must be unique)
        }
    )
);

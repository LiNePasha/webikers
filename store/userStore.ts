
import { create, StateCreator } from 'zustand';
import { clearJwtCookie } from '@/lib/api/customAuth';

interface UserState {
  user: null | {
    id: number;
    email: string;
    name?: string;
    token?: string;
    [key: string]: any;
  };
  setUser: (user: UserState['user']) => void;
  logout: () => void;
}

export const useUserStore = create<UserState>(((set) => ({
  user: null,
  setUser: (user: UserState['user']) => set({ user }),
  logout: async () => {
    // حذف الكوكي httpOnly من الراوت المحلي
    try {
      await clearJwtCookie();
    } catch {}
    set({ user: null });
  },
})) as StateCreator<UserState>);

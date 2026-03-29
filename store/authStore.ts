import { create } from "zustand";
import { loginUser, refreshToken as refreshTokenAPI, updateAvatar } from "../services/authService";
import { deleteRefreshToken, deleteToken, deleteUser, getRefreshToken, getToken, getUser, saveRefreshToken, saveToken, saveUser } from "../utils/secureStore";

interface AuthState {
  user: any;
  token: string | null;
  refreshToken: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshAccessToken: () => Promise<void>;
  setUser: (user: any) => void;
  initializeAuth: () => Promise<void>;
  uploadAvatar: (imageUri: string) => Promise<void>;
  updateUser: (userData: { username?: string; email?: string }) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  refreshToken: null,
  loading: false,
  isAuthenticated: false,

  login: async (email, password) => {
    try {
      set({ loading: true });

      const res = await loginUser(email, password);

      const accessToken = res.data?.accessToken;
      const refreshToken = res.data?.refreshToken;
      const user = res.data?.user;

      await saveToken(accessToken);
      if (refreshToken) {
        await saveRefreshToken(refreshToken);
      }
      await saveUser(user);

      set({
        user: user,
        token: accessToken,
        refreshToken: refreshToken || null,
        loading: false,
        isAuthenticated: true,
      });
      
      // Initialize user-specific course data
      const { useCourseStore } = await import("./courseStore");
      await useCourseStore.getState().initializeStorage(user._id || user.id || user.email);
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  logout: async () => {
    // Import courseStore dynamically to avoid circular dependency
    const { useCourseStore } = await import("./courseStore");
    
    await deleteToken();
    await deleteRefreshToken();
    await deleteUser();
    
    // Clear user-specific course data
    useCourseStore.getState().clearUserData();
    
    set({ 
      user: null, 
      token: null, 
      refreshToken: null,
      isAuthenticated: false 
    });
  },

  refreshAccessToken: async () => {
    try {
      const storedRefreshToken = await getRefreshToken();
      
      if (!storedRefreshToken) {
        throw new Error("No refresh token available");
      }

      const res = await refreshTokenAPI(storedRefreshToken);
      const newAccessToken = res.data?.accessToken;

      await saveToken(newAccessToken);

      set({
        token: newAccessToken,
      });
    } catch (err) {
      // If refresh fails, logout user
      await get().logout();
      throw err;
    }
  },

  setUser: (user) => {
    set({ user });
    saveUser(user);
  },

  initializeAuth: async () => {
    try {
      const token = await getToken();
      const refreshToken = await getRefreshToken();
      const user = await getUser();

      if (token && user) {
        set({
          token,
          refreshToken,
          user,
          isAuthenticated: true,
        });
        
        // Initialize user-specific course data
        const { useCourseStore } = await import("./courseStore");
        await useCourseStore.getState().initializeStorage(user._id || user.id || user.email);
      }
    } catch (err) {
      console.error("Failed to initialize auth:", err);
    }
  },

  uploadAvatar: async (imageUri: string) => {
    try {
      set({ loading: true });
      
      const res = await updateAvatar(imageUri);
      
      // Normalize avatar URL - handle both formats
      const avatarUrl = res.data?.avatar?.url || res.data?.avatar || imageUri;
      
      const updatedUser = {
        ...get().user,
        avatar: {
          url: avatarUrl
        }
      };
      
      await saveUser(updatedUser);
      
      set({
        user: updatedUser,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },

  updateUser: async (userData: { username?: string; email?: string }) => {
    try {
      set({ loading: true });
      
      // In a real app, you would call an API endpoint to update user info
      // For now, we'll just update the local state
      const currentUser = get().user;
      const updatedUser = {
        ...currentUser,
        ...userData,
      };
      
      await saveUser(updatedUser);
      
      set({
        user: updatedUser,
        loading: false,
      });
    } catch (err) {
      set({ loading: false });
      throw err;
    }
  },
}));

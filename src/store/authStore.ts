import { create } from 'zustand';
import { 
  loginWithEmailAndPassword, 
  logoutUser, 
  getCurrentUser,
  onAuthChange
} from '../utils/firebase/auth';
import React from 'react';

// Create auth store with Zustand
export const useAuthStore = create((set, get) => ({
  // State
  user: null,
  isAuthenticated: false,
  isLoading: false,
  loginError: null,
  
  // Initialize auth state
  init: () => {
    // Set up auth state listener
    const unsubscribe = onAuthChange((user) => {
      if (user) {
        // User is signed in
        set({
          user: {
            uid: user.uid,
            email: user.email,
            username: user.email, // Add username for compatibility with old code
            displayName: user.displayName,
            photoURL: user.photoURL,
            emailVerified: user.emailVerified,
            isAuthenticated: true, // Add isAuthenticated for compatibility with old code
          },
          isAuthenticated: true,
          isLoading: false,
          loginError: null
        });
      } else {
        // User is signed out
        set({
          user: null,
          isAuthenticated: false,
          isLoading: false,
        });
      }
    });
    
    // Return unsubscribe function
    return unsubscribe;
  },
  
  // Login with email and password
  login: async (email, password) => {
    console.log('Login attempt:', { email, timestamp: new Date().toISOString() });
    console.log('[Auth] Starting login process...');
    console.log('[Auth] Browser IndexedDB support:', !!window.indexedDB);
    
    // Log device info on login attempt (kept from original)
    console.log('Device info:', {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight
    });
    
    // Check for existing IndexedDB databases (kept from original)
    if (window.indexedDB) {
      console.log('[Auth] Checking for existing IndexedDB databases...');
      try {
        const databases = await window.indexedDB.databases();
        console.log('[Auth] Existing IndexedDB databases:', databases);
      } catch (indexedDBError) {
        console.log('[Auth] Error checking IndexedDB databases:', indexedDBError);
      }
    }
    
    set({ isLoading: true, loginError: null }); // Clear previous error
    
    try {
      console.log('[Auth] Attempting to authenticate with Firebase...');
      console.log('[Auth] Current time before authentication call:', new Date().toISOString());
      
      const startTime = performance.now();
      const result = await loginWithEmailAndPassword(email, password);
      const endTime = performance.now();
      
      console.log(`[Auth] Firebase authentication took ${endTime - startTime}ms to complete`);
      
      if (result.success) {
        console.log('[Auth] Login successful via Firebase');
        // Auth state listener will update the store
        return true;
      } else {
        // Login failed with an error message
        console.log('[Auth] Login failed:', result.error);
        set({ 
          loginError: result.error,
          isLoading: false
        });
        return false;
      }
    } catch (error) {
      // Handle potential errors during authentication
      console.error('[Auth] Login error:', error);
      console.error('[Auth] Error details:', {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      
      set({ 
        loginError: 'An error occurred during login. Please try again.',
        isLoading: false
      });
      return false;
    }
  },
  
  // Logout
  logout: async () => {
    console.log('Logout executed');
    set({ isLoading: true });
    
    try {
      await logoutUser();
      // Auth state listener will handle updating the store
      return true;
    } catch (error) {
      console.error('[AuthStore] Logout error:', error);
      set({ isLoading: false });
      return false;
    }
  },
  
  // Get current user
  getUser: () => {
    const currentUser = getCurrentUser();
    if (currentUser) {
      return {
        uid: currentUser.uid,
        email: currentUser.email,
        username: currentUser.email, // Use email as username for backward compatibility
        displayName: currentUser.displayName,
        photoURL: currentUser.photoURL,
        emailVerified: currentUser.emailVerified,
        isAuthenticated: true, // Add for backward compatibility
      };
    }
    return null;
  },
  
  // Check if user is admin
  isAdmin: () => {
    const { user } = get();
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    
    // You can implement your admin check logic here
    return user && user.email === adminEmail;
  },
  
  // Clear any login errors
  clearLoginError: () => set({ loginError: null }),
}));

// Initialize the auth state listener when the app starts
let authUnsubscribe;

// Custom hook to initialize auth state on component mount
export const useInitAuth = () => {
  const init = useAuthStore((state) => state.init);
  
  React.useEffect(() => {
    // Initialize auth and store the unsubscribe function
    authUnsubscribe = init();
    
    // Cleanup on unmount
    return () => {
      if (authUnsubscribe) {
        authUnsubscribe();
      }
    };
  }, [init]);
};
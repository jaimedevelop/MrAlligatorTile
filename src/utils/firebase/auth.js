import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import app from './config';

// Initialize Firebase Auth
const auth = getAuth(app);

// Admin users - this would typically come from a secure backend
// but for testing we can hardcode the admin emails
const ADMIN_EMAILS = ['admin@example.com', 'youradmin@email.com'];  // Replace with your actual admin emails

/**
 * Sign in with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Success status and user information
 */
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    
    // Check if this user is an admin (for client-side UI purposes only)
    // Real security is enforced by Firebase Rules
    const isAdmin = ADMIN_EMAILS.includes(email.toLowerCase());
    
    // Force token refresh to ensure we have latest claims
    await userCredential.user.getIdToken(true);
    
    // Get token result to verify admin claim
    const tokenResult = await userCredential.user.getIdTokenResult();
    const hasAdminClaim = tokenResult.claims.admin === true;
    
    return { 
      success: true,
      user: userCredential.user,
      isAdmin: hasAdminClaim || isAdmin // Use the claim from token if available
    };
  } catch (error) {
    console.error("[Firebase Auth] Login error:", error);
    let errorMessage = "Authentication failed";
    
    switch (error.code) {
      case 'auth/invalid-email':
        errorMessage = "Invalid email address format";
        break;
      case 'auth/user-disabled':
        errorMessage = "This user account has been disabled";
        break;
      case 'auth/user-not-found':
        errorMessage = "User not found";
        break;
      case 'auth/wrong-password':
        errorMessage = "Incorrect password";
        break;
      case 'auth/too-many-requests':
        errorMessage = "Too many unsuccessful login attempts. Please try again later";
        break;
      default:
        errorMessage = `Login failed: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Check if current user has admin privileges
 * @returns {Promise<boolean>} True if user is admin
 */
export const checkAdminStatus = async () => {
  const user = auth.currentUser;
  
  if (!user) {
    return false;
  }
  
  try {
    // First check if user's email is in the admin list (for development)
    if (ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return true;
    }
    
    // Then check the token claims (this is the secure way)
    const tokenResult = await user.getIdTokenResult();
    return tokenResult.claims.admin === true;
  } catch (error) {
    console.error("[Firebase Auth] Admin check error:", error);
    return false;
  }
};

/**
 * Create a new user with email and password
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Promise<Object>} Success status and user or error
 */
export const createUserWithEmail = async (email, password) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    return {
      success: true,
      user: userCredential.user
    };
  } catch (error) {
    console.error("[Firebase Auth] Create user error:", error);
    let errorMessage = "Failed to create account";
    
    switch (error.code) {
      case 'auth/email-already-in-use':
        errorMessage = "Email already in use";
        break;
      case 'auth/invalid-email':
        errorMessage = "Invalid email address format";
        break;
      case 'auth/weak-password':
        errorMessage = "Password is too weak";
        break;
      default:
        errorMessage = `Account creation failed: ${error.message}`;
    }
    
    return {
      success: false,
      error: errorMessage
    };
  }
};

/**
 * Sign out the current user
 * @returns {Promise<Object>} Success status
 */
export const logoutUser = async () => {
  try {
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error("[Firebase Auth] Logout error:", error);
    return {
      success: false,
      error: `Logout failed: ${error.message}`
    };
  }
};

/**
 * Get the current authenticated user
 * @returns {Object|null} Current user or null if not authenticated
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Subscribe to auth state changes
 * @param {Function} callback - Function to call when auth state changes
 * @returns {Function} Unsubscribe function
 */
export const onAuthChange = (callback) => {
  return onAuthStateChanged(auth, callback);
};

// Export the auth instance if needed
export { auth };
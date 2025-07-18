import { 
    getAuth, 
    createUserWithEmailAndPassword, 
    signInWithEmailAndPassword 
  } from 'firebase/auth';
  import { getFirestore, doc, setDoc } from 'firebase/firestore';
  import { app } from './firebase'; // Import from the index.js file
  
  const auth = getAuth(app);
  const db = getFirestore(app);
  
  /**
   * Checks if admin user exists and creates one if not
   * @returns {Promise<Object>} Result object
   */
  export const ensureAdminExists = async () => {
    // Get admin credentials from Vite env variables
    const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
    const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
    
    console.log('[AdminSetup] Admin email exists:', !!adminEmail);
    
    if (!adminEmail || !adminPassword) {
      return {
        success: false,
        message: 'Admin credentials not found in environment variables'
      };
    }
    
    try {
      // First try to sign in as admin
      console.log('[AdminSetup] Checking if admin exists...');
      
      try {
        await signInWithEmailAndPassword(auth, adminEmail, adminPassword);
        console.log('[AdminSetup] Admin user exists and credentials are valid');
        await auth.signOut(); // Sign out after verification
        
        return {
          success: true,
          message: 'Admin user exists and credentials are valid'
        };
      } catch (signInError) {
        console.log('[AdminSetup] Sign-in error code:', signInError.code);
        
        // If error is user-not-found, create the admin user
        if (signInError.code === 'auth/user-not-found') {
          console.log('[AdminSetup] Admin user does not exist, creating...');
          
          const userCredential = await createUserWithEmailAndPassword(
            auth, 
            adminEmail, 
            adminPassword
          );
          
          // Add admin role to the user in Firestore
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            email: adminEmail,
            role: 'admin',
            createdAt: new Date()
          });
          
          console.log('[AdminSetup] Admin user created successfully');
          await auth.signOut(); // Sign out after creation
          
          return {
            success: true,
            message: 'Admin user created successfully'
          };
        } else {
          // Other sign-in error
          console.error('[AdminSetup] Error signing in as admin:', signInError);
          return {
            success: false,
            message: `Error verifying admin: ${signInError.message}`
          };
        }
      }
    } catch (error) {
      console.error('[AdminSetup] Error in admin setup:', error);
      return {
        success: false,
        message: `Error in admin setup: ${error.message}`
      };
    }
  };
  
  /**
   * Run this function when your app first initializes to ensure admin exists
   */
  export const initializeAdminUser = async () => {
    console.log('[AdminSetup] Initializing admin user...');
    const result = await ensureAdminExists();
    console.log('[AdminSetup] Admin initialization result:', result);
    return result;
  };
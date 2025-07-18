import admin from 'firebase-admin';

// --- Configuration ---
// 1. UID for user 'admin@test.com'
const USER_UID_TO_MODIFY = "h3fAQN3G85O7FrTb4o16OWk2rD33"; 

// 2. Path to your downloaded service account key JSON file
//    Using forward slashes for better compatibility.
const SERVICE_ACCOUNT_PATH = "C:/Users/JaimeAI/Downloads/ezbossfirebase-firebase-adminsdk-fbsvc-709823826d.json"; 
// --- End Configuration ---


// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(SERVICE_ACCOUNT_PATH)
      // If using environment variable GOOGLE_APPLICATION_CREDENTIALS, use: admin.initializeApp();
    });
    console.log('Firebase Admin SDK Initialized.');
  }
} catch (error) {
  console.error('Error initializing Firebase Admin SDK:', error);
  process.exit(1); // Exit if initialization fails
}

async function setAdminClaim(uid: string) {
  // Basic check for UID validity (optional, but good practice)
  if (!uid || uid.length < 5) { 
     console.error("Error: Invalid User ID provided:", uid);
     return;
  }

  console.log(`Attempting to set admin claim for user: ${uid}`);
  try {
    await admin.auth().setCustomUserClaims(uid, { admin: true });
    console.log(`Successfully set { admin: true } custom claim for user: ${uid}`);
    console.log("Please ask the user to log out and log back in for the claim to take effect.");
  } catch (error) {
    console.error(`Error setting admin claim for user ${uid}:`, error);
  }
}

// Run the function
setAdminClaim(USER_UID_TO_MODIFY);
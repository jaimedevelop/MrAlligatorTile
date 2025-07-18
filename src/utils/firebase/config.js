// src/utils/firebase/config.js
import { initializeApp } from 'firebase/app';

// Use the exact configuration directly for testing
const firebaseConfig = {
  apiKey: "AIzaSyBRuLh0D9euk9f2QVvnSS-4fEd8MWT7_wY",
  authDomain: "ezbossfirebase.firebaseapp.com",
  projectId: "ezbossfirebase",
  storageBucket: "ezbossfirebase.firebasestorage.app", // Corrected bucket name
  messagingSenderId: "542279243482",
  appId: "1:542279243482:web:79a1980a62348ea62777e3"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
console.log('Firebase app initialized with name:', app.name);

export default app;
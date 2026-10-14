// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDnxvfhw7CJQdqT0xytKFnD2iqlvPzDCBs",
  authDomain: "tastory-fdf2b.firebaseapp.com",
  projectId: "tastory-fdf2b",
  storageBucket: "tastory-fdf2b.firebasestorage.app",
  messagingSenderId: "270803931954",
  appId: "1:270803931954:web:804e5cc4b67330c7c6fd2b",
  measurementId: "G-2TXYFBGN16"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth();
export const db = getFirestore(app); 

// src/config/firebaseConfig.js
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

 export const firebaseConfig = {
  apiKey: "AIzaSyAZ7TNIxpyng9lbXpQdo5Bd-lWv00iTVP0",
  authDomain: "erp-lite-73c97.firebaseapp.com",
  projectId: "erp-lite-73c97",
  storageBucket: "erp-lite-73c97.firebasestorage.app",
  messagingSenderId: "915308167351",
  appId: "1:915308167351:web:2975da017471f499cf8d32",
  measurementId: "G-ZNSQCCPWBL"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

export { auth, db };


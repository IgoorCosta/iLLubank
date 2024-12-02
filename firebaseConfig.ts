// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth} from 'firebase/auth';
import { getFirestore } from "firebase/firestore";

import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';

const firebaseConfig = {
  apiKey: "AIzaSyBjyfbAlo23hMbHfELG2Pa0juignmeiVQk",
  authDomain: "illubank-e7c22.firebaseapp.com",
  projectId: "illubank-e7c22",
  storageBucket: "illubank-e7c22.firebasestorage.app",
  messagingSenderId: "429686383305",
  appId: "1:429686383305:web:888cd056ae69e2f8076318"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth2 = initializeAuth(app, {
  persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

const auth = getAuth(app);
const db = getFirestore(app);

export { db, auth };
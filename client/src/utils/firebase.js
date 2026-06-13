
import {getAuth, GoogleAuthProvider} from "firebase/auth"
import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "mockmind-13653.firebaseapp.com",
  projectId: "mockmind-13653",
  storageBucket: "mockmind-13653.firebasestorage.app",
  messagingSenderId: "530717235601",
  appId: "1:530717235601:web:6e78ec7d7e9a8bbfe86230"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app)
const provider = new GoogleAuthProvider()
export {auth, provider}
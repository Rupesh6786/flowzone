import { getApp, getApps, initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCxdqwnc21Zu_T3fjt-Z5d-LsuNhY4JPZI",
  authDomain: "ac-solution-t0zkx.firebaseapp.com",
  projectId: "ac-solution-t0zkx",
  storageBucket: "ac-solution-t0zkx.appspot.com",
  messagingSenderId: "460214832955",
  appId: "1:460214832955:web:c3c73f3f198169b9b3711e"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);

export { app, db, storage, auth };

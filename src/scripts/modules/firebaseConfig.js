// firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection } from "firebase/firestore";

// Konfiguration als Konstante
const firebaseConfig = {
  apiKey: "AIzaSyAocWSpzgKCInAdNvMuLeT5SU6TD24DBkg",
  authDomain: "upgrade4me-7a4f0.firebaseapp.com",
  projectId: "upgrade4me-7a4f0",
  storageBucket: "upgrade4me-7a4f0.firebasestorage.app",
  messagingSenderId: "889986520193",
  appId: "1:889986520193:web:6cdaaa5e0540cabacb2980",
};

// Firebase initialisieren
const app = initializeApp(firebaseConfig);

// Firestore mit Offline-Persistenz initialisieren
const db = getFirestore(app);

// Collections definieren
const COLLECTIONS = {
  WORKSHOPS: "workshops",
  BOOKINGS: "bookings",
};

// Collection-Referenzen erstellen
export const collectionWorkshops = collection(db, COLLECTIONS.WORKSHOPS);
export const collectionBookings = collection(db, COLLECTIONS.BOOKINGS);

// Datenbank-Instanz exportieren
export { db };

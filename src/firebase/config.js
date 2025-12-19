// Firebase core
import { initializeApp } from "firebase/app"

// Firestore (Base de datos)
import { getFirestore } from "firebase/firestore"

// Storage (para firmas)
import { getStorage } from "firebase/storage"

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDYCgjO5DIlrNWn4pWOOommYLU7-mMcIqw",
  authDomain: "porceramica-it-assets.firebaseapp.com",
  projectId: "porceramica-it-assets",
  storageBucket: "porceramica-it-assets.firebasestorage.app",
  messagingSenderId: "608311853786",
  appId: "1:608311853786:web:86daeaf71aa3df88509be3",
}

// Inicializar Firebase
const app = initializeApp(firebaseConfig)

// Inicializar servicios
export const db = getFirestore(app)
export const storage = getStorage(app)

// (Opcional futuro)
// import { getAuth } from "firebase/auth"
// export const auth = getAuth(app)

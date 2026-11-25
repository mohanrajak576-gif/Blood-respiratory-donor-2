
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";

import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBCo-lwRQjHwx2EYjMAe2teQaO6pHp8LEo",
    authDomain: "blood-donor-finder-8547e.firebaseapp.com",
    projectId: "blood-donor-finder-8547e",
    storageBucket: "blood-donor-finder-8547e.firebasestorage.app",
    messagingSenderId: "297031413146",
    appId: "1:297031413146:web:9f321d35406b359e6e1e23",
    measurementId: "G-4EZ0M86K0H"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Authentication
export const auth = getAuth(app);

// Initialize Firestore Database
export const db = getFirestore(app);

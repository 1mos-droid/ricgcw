import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBVB98zALDEw8ULUdYORfF2EYucVfCn-2Q",
  authDomain: "thegatheringplace-app.firebaseapp.com",
  projectId: "thegatheringplace-app",
  storageBucket: "thegatheringplace-app.appspot.com",
  messagingSenderId: "664454264797",
  appId: "1:664454264797:web:42f5ae3c6fe3b67de22834"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };
export default app;

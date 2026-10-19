import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth } from "firebase/auth";

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
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

export { auth, db, storage };
export default app;

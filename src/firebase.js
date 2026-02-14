// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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

export default app;

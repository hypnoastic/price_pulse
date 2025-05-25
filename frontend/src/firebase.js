// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBY73WAAFdrIoDvB3DaMYC7dG_C3dNRLdE",
  authDomain: "internship-14e23.firebaseapp.com",
  projectId: "internship-14e23",
  storageBucket: "internship-14e23.firebasestorage.app",
  messagingSenderId: "639382355102",
  appId: "1:639382355102:web:2f2b5c766ed32238fb8f8f",
  measurementId: "G-JXKXE983DQ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { app, auth, provider };

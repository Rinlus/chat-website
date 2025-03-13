// Import the functions you need from the SDKs you need
// Firebase is a cloud-based NoSQL database
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signOut, sendPasswordResetEmail } from "firebase/auth";
import { setDoc, doc, getFirestore, collection, query, where, getDocs } from "firebase/firestore";
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { getStorage } from 'firebase/storage';

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD1bB12KRlqzedRbpOP8gu0M0vGjkpPHG4",
  authDomain: "chatta--gs-cdc73.firebaseapp.com",
  projectId: "chatta--gs-cdc73",
  storageBucket: "chatta--gs-cdc73.firebasestorage.app",
  messagingSenderId: "887107593031",
  appId: "1:887107593031:web:85b655a8c9063991f4e262"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const signup = async (username, email, password) => {
    try {
        const res = await createUserWithEmailAndPassword(auth, email, password);
        const user = res.user;
        await setDoc(doc(db, "users", user.uid), {
            id:user.uid,
            username:username.toLowerCase(),
            email,
            name: "",
            avatar: "",
            bio: "Yo, bro!",
            lastSeen: Date.now()
        });
        await setDoc(doc(db, "chats", user.uid), {
            chatsData: []
        });
    } catch (error) {
       console.error(error);
       toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const login = async (email, password) => {
    try {
        await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error(error);
        toast.error(error.code.split('/')[1].split('-').join(' '));
    }
}

const resetPass = async (email) => {
    if (!email) {
        toast.error('Please enter your email');
        return null;
    }
    try {
        const userRef = collection(db, 'users');
        const q = query(userRef, where('email', '==', email));
        const querySnap = await getDocs(q);
        if (!querySnap.empty) {
            await sendPasswordResetEmail(auth, email);
            toast.success('The reset email was sent, bruv');
        } else {
            toast.error('Email not found');
        }
    } catch (error) {
        console.error(error);
        toast.error(error.message);
    }
}
export {signup, login, logout, auth, db, resetPass};
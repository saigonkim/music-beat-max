import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

const firebaseConfig = {
    apiKey: "AIzaSyCvnqonvoP_vVjiDmEZ1ZE-ZJe6teuarzY",
    authDomain: "musicbeatmax-plab-dev.firebaseapp.com",
    projectId: "musicbeatmax-plab-dev",
    storageBucket: "musicbeatmax-plab-dev.firebasestorage.app",
    messagingSenderId: "954250905531",
    appId: "1:954250905531:web:f759e4c581a2d80f5ce69e"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Error signing in with Google", error);
        throw error;
    }
};

export const logout = async () => {
    try {
        await signOut(auth);
    } catch (error) {
        console.error("Error signing out", error);
        throw error;
    }
};

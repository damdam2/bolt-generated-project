import { createContext, useState, useEffect } from 'react';
import { 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Récupérer les infos supplémentaires depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            ...userDoc.data()
          });
        } else {
          // Si le document n'existe pas, créer un nouveau document avec l'email et le quota par défaut
          await setDoc(doc(db, 'users', firebaseUser.uid), {
            email: firebaseUser.email,
            role: 'user',
            quota: 25
          });
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            role: 'user',
            quota: 25
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erreur de connexion:', error);
      throw error;
    }
  };

  const register = async (email, password, userData) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email: userCredential.user.email, // Ajout de l'email
        ...userData,
        role: 'user', // Par défaut
        quota: 25     // Quota par défaut
      });
    } catch (error) {
      console.error('Erreur d\'inscription:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

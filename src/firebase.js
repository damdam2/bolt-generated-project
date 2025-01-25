import { initializeApp } from 'firebase/app';
    import { getAuth } from 'firebase/auth';
    import { getFirestore } from 'firebase/firestore';
    import { getStorage } from 'firebase/storage';

    const firebaseConfig = {
      apiKey: "AIzaSyCWCZxA9AVKeM8h8qLY7iDeBceLJmBjMUA",
      authDomain: "lapeyre-calendar.firebaseapp.com",
      projectId: "lapeyre-calendar",
      storageBucket: "lapeyre-calendar.appspot.com",
      messagingSenderId: "422411101594",
      appId: "1:422411101594:web:89297619979382e42e0623"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);
    let storage;
    try {
      storage = getStorage(app);
    } catch (error) {
      console.error("firebase.js: Erreur lors de l'initialisation de Firebase Storage:", error);
    }


    export { auth, db, storage };

import { 
      collection,
      doc,
      getDocs,
      addDoc,
      updateDoc,
      query,
      where,
      getDoc,
      deleteDoc,
    } from 'firebase/firestore';
    import { db } from './firebase';

    export function getConges(userId) {
      let q;
      if (userId === 'admin') {
        q = query(collection(db, 'conges'));
      } else {
        q = query(collection(db, 'conges'), where('userId', '==', userId));
      }
      return getDocs(q).then(querySnapshot => ({
        conges: querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          startDate: doc.data().startDate,
          endDate: doc.data().endDate,
          requestedAt: doc.data().requestedAt || null,
          approvedAt: doc.data().approvedAt
        })),
        lastVisible: null
      })).catch(error => {
        console.error("api.js: Erreur lors de la récupération des congés:", error);
        throw new Error("Erreur lors de la récupération des congés. Veuillez réessayer.");
      });
    }

    export function createConge(congeData) {
      return addDoc(collection(db, 'conges'), {
        ...congeData,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        approvedAt: null
      }).then(docRef => docRef.id).catch(error => {
        console.error("api.js: Erreur lors de la création du congé:", error);
        throw new Error("Erreur lors de la création du congé. Veuillez réessayer.");
      });
    }

    export function updateCongeStatus(congeId, status) {
      return updateDoc(doc(db, 'conges', congeId), {
        status,
        approvedAt: status !== 'pending' ? new Date().toISOString() : null
      }).catch(error => {
        console.error("api.js: Erreur lors de la mise à jour du statut du congé:", error);
        throw new Error("Erreur lors de la mise à jour du statut du congé. Veuillez réessayer.");
      });
    }

    export function getUsers() {
      return getDocs(collection(db, 'users')).then(querySnapshot => querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))).catch(error => {
        console.error("api.js: Erreur lors de la récupération des utilisateurs:", error);
        throw new Error("Erreur lors de la récupération des utilisateurs. Veuillez réessayer.");
      });
    }

    export function getUserQuota(userId) {
      return getDoc(doc(db, 'users', userId)).then(userDoc => {
        if (userDoc.exists()) {
          return userDoc.data().quota;
        }
        return 0;
      }).catch(error => {
        console.error("api.js: Erreur lors de la récupération du quota de l'utilisateur:", error);
        throw new Error("Erreur lors de la récupération du quota de l'utilisateur. Veuillez réessayer.");
      });
    }

    export function deleteConge(congeId) {
      return deleteDoc(doc(db, 'conges', congeId)).catch(error => {
        console.error("api.js: Erreur lors de la suppression du congé:", error);
        throw new Error("Erreur lors de la suppression du congé. Veuillez réessayer.");
      });
    }

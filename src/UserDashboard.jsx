import { useState, useEffect, useContext } from 'react';
    import { AuthContext } from './AuthContext';
    import { getConges, createConge, getUserQuota, deleteConge } from './api';
    import { extractFirstNameFromEmail } from './utils/utils';
    import './Dashboard.css';
    import { onSnapshot, collection, query, where } from 'firebase/firestore';
    import { db } from './firebase';

    function UserDashboard() {
      const { user } = useContext(AuthContext);
      const [conges, setConges] = useState([]);
      const [newConge, setNewConge] = useState({
        start_date: '',
        end_date: '',
        motif: ''
      });
      const [quota, setQuota] = useState(0);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [lastVisible, setLastVisible] = useState(null);
      const [hasMore, setHasMore] = useState(true);

      useEffect(() => {
        loadInitialData();
        const unsubscribe = onSnapshot(
          query(collection(db, 'conges'), where('userId', '==', user.uid)),
          (snapshot) => {
            console.log("UserDashboard: onSnapshot data:", snapshot.docs.map(doc => doc.data()));
            const updatedConges = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              startDate: doc.data().startDate,
              endDate: doc.data().endDate,
              requestedAt: doc.data().requestedAt,
              approvedAt: doc.data().approvedAt
            }));
            setConges(updatedConges);
          },
          (error) => {
            console.error('Erreur lors de l\'écoute des changements de congés:', error);
            setError(error.message);
          }
        );
        return () => unsubscribe();
      }, []);

      async function loadInitialData() {
        try {
          const [quotaData, { conges: congesData, lastVisible: initialLastVisible }] = await Promise.all([
            getUserQuota(user.uid),
            getConges(user.uid)
          ]);
          setConges(congesData);
          setQuota(quotaData);
          setLastVisible(initialLastVisible);
          setHasMore(congesData.length === 10);
        } catch (error) {
          console.error('Erreur lors du chargement initial des données:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      }

      const loadMoreConges = async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        try {
          const { conges: newConges, lastVisible: newLastVisible } = await getConges(user.uid, lastVisible);
          setConges([...conges, ...newConges]);
          setLastVisible(newLastVisible);
          setHasMore(newConges.length === 10);
        } catch (error) {
          console.error('Erreur lors du chargement des congés supplémentaires:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      function calculateDays(startDate, endDate) {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end - start);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;

        if (diffDays === 7) {
          return 6;
        }
        return diffDays;
      }

      function calculateRemainingDays() {
        const takenDays = conges
          .filter(c => c.status === 'approved')
          .reduce((total, c) => {
            return total + calculateDays(c.startDate, c.endDate);
          }, 0);

        return quota - takenDays;
      }

      async function handleCreateConge() {
        if (!newConge.start_date || !newConge.end_date) {
          alert('Veuillez remplir toutes les dates');
          return;
        }

        const daysRequested = calculateDays(newConge.start_date, newConge.end_date);
        if (calculateRemainingDays() < daysRequested) {
          alert('Vous n\'avez pas assez de jours disponibles');
          return;
        }

        try {
          await createConge({
            userId: user.uid,
            startDate: new Date(newConge.start_date).toISOString(),
            endDate: new Date(newConge.end_date).toISOString(),
            motif: newConge.motif
          });
          setNewConge({ start_date: '', end_date: '', motif: '' });
          loadInitialData();
        } catch (error) {
          console.error('Erreur lors de la création du congé:', error);
          setError(error.message);
        }
      }

      const handleDeleteConge = async (congeId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de congé ?')) {
          try {
            await deleteConge(congeId);
            loadInitialData();
          } catch (error) {
            console.error('Erreur lors de la suppression du congé:', error);
            setError(error.message);
          }
        }
      };

      if (loading) return <div>Chargement...</div>;
      if (error) return <div className="error">{error}</div>;

      return (
        <div className="user-dashboard">
          {error && <div className="error">{error}</div>}
          <h3>Mes congés</h3>
          <p>Jours restants : {calculateRemainingDays()} / {quota}</p>

          <div className="conge-form">
            <h4>Demander un congé</h4>
            <div className="form-group">
              <label>Date de début :</label>
              <input
                type="date"
                value={newConge.start_date}
                onChange={e => setNewConge({ ...newConge, start_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Date de fin :</label>
              <input
                type="date"
                value={newConge.end_date}
                onChange={e => setNewConge({ ...newConge, end_date: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Motif :</label>
              <textarea
                value={newConge.motif}
                onChange={e => setNewConge({ ...newConge, motif: e.target.value })}
              />
            </div>
            <button onClick={handleCreateConge}>Soumettre</button>
          </div>

          <div className="conge-list">
            {conges.map(conge => (
              <div key={conge.id} className={`conge-item ${conge.status}`}>
                <div className="conge-info">
                  <div>
                    Du {conge.startDate ? new Date(conge.startDate).toLocaleDateString() : 'N/A'} au {conge.endDate ? new Date(conge.endDate).toLocaleDateString() : 'N/A'}
                  </div>
                  <div>Statut : <span className={`status ${conge.status}`}>
                    {conge.status === 'pending' ? 'en attente' : conge.status === 'approved' ? 'approuvé' : 'rejeté'}
                  </span></div>
                  {conge.motif && <div>Motif : {conge.motif}</div>}
                </div>
                <div className="conge-details">
                  {extractFirstNameFromEmail(user.email)} - {conge.requestedAt ? new Date(conge.requestedAt).toLocaleDateString('fr-FR') : 'N/A'}
                </div>
                <button className="btn-delete" onClick={() => handleDeleteConge(conge.id)}>Supprimer</button>
              </div>
            ))}
            {hasMore && (
              <button onClick={loadMoreConges}>Charger plus</button>
            )}
          </div>
        </div>
      );
    }

    export default UserDashboard;

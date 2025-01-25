import { useState, useEffect, useContext } from 'react';
    import { getConges, updateCongeStatus, deleteConge, getUsers } from './api';
    import { extractFirstNameFromEmail, sortByDate } from './utils/utils';
    import UserManagement from './components/UserManagement';
    import { AuthContext } from './AuthContext';
    import './Dashboard.css';
    import { doc, updateDoc, onSnapshot, collection, query } from 'firebase/firestore';
    import { db } from './firebase';

    function AdminDashboard() {
      const { user } = useContext(AuthContext);
      const [conges, setConges] = useState([]);
      const [users, setUsers] = useState([]);
      const [loading, setLoading] = useState(true);
      const [error, setError] = useState(null);
      const [lastVisible, setLastVisible] = useState(null);
      const [hasMore, setHasMore] = useState(true);

      useEffect(() => {
        loadInitialData();
        const unsubscribe = onSnapshot(
          query(collection(db, 'conges')),
          (snapshot) => {
            console.log("AdminDashboard: onSnapshot data:", snapshot.docs.map(doc => doc.data()));
            const updatedConges = snapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data(),
              startDate: doc.data().startDate,
              endDate: doc.data().endDate,
              requestedAt: doc.data().requestedAt,
              approvedAt: doc.data().approvedAt
            }));
            setConges(sortByDate(updatedConges, 'requestedAt', 'desc'));
          },
          (error) => {
            console.error('Erreur lors de l\'écoute des changements de congés:', error);
            setError(error.message);
          }
        );
        return () => unsubscribe();
      }, []);

      const loadInitialData = async () => {
        try {
          const [usersData, { conges: congesData, lastVisible: initialLastVisible }] = await Promise.all([
            getUsers(),
            getConges('admin')
          ]);
          setUsers(usersData);
          setConges(sortByDate(congesData, 'requestedAt', 'desc'));
          setLastVisible(initialLastVisible);
          setHasMore(congesData.length === 10);
        } catch (error) {
          console.error('Erreur lors du chargement initial des données:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      const loadMoreConges = async () => {
        if (!hasMore || loading) return;
        setLoading(true);
        try {
          const { conges: newConges, lastVisible: newLastVisible } = await getConges('admin', lastVisible);
          setConges([...conges, ...sortByDate(newConges, 'requestedAt', 'desc')]);
          setLastVisible(newLastVisible);
          setHasMore(newConges.length === 10);
        } catch (error) {
          console.error('Erreur lors du chargement des congés supplémentaires:', error);
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      const handleStatusChange = async (congeId, status) => {
        try {
          await updateDoc(doc(db, 'conges', congeId), {
            status,
            approvedAt: status !== 'pending' ? new Date().toISOString() : null
          });
          setConges(conges.map(conge =>
            conge.id === congeId ? { ...conge, status } : conge
          ));
        } catch (error) {
          console.error('Erreur lors de la mise à jour du statut:', error);
          setError(error.message);
        }
      };

      const handleDeleteConge = async (congeId) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette demande de congé ?')) {
          try {
            await deleteConge(congeId);
            const { conges: congesData, lastVisible: newLastVisible } = await getConges('admin', lastVisible);
            setConges(sortByDate(congesData, 'requestedAt', 'desc'));
            setLastVisible(newLastVisible);
            setHasMore(congesData.length === 10);
          } catch (error) {
            console.error('Erreur lors de la suppression du congé:', error);
            setError(error.message);
          }
        }
      };

      const getUserEmail = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.email : '';
      };

      if (loading) return <div>Chargement...</div>;
      if (error) return <div className="error">{error}</div>;

      return (
        <div className="admin-dashboard">
          {error && <div className="error">{error}</div>}
          <div className="conge-list">
            <h3>Demandes de congés</h3>
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
                  <strong style={{ color: 'red' }}>{extractFirstNameFromEmail(getUserEmail(conge.userId)) || 'N/A'}</strong> - {conge.requestedAt ? new Date(conge.requestedAt).toLocaleDateString('fr-FR') : 'N/A'}
                </div>
                {conge.status === 'pending' && (
                  <div className="conge-actions">
                    <button
                      className="btn-approve"
                      onClick={() => handleStatusChange(conge.id, 'approved')}
                    >
                      Approuver
                    </button>
                    <button
                      className="btn-reject"
                      onClick={() => handleStatusChange(conge.id, 'rejected')}
                    >
                      Rejeter
                    </button>
                  </div>
                )}
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

    export default AdminDashboard;

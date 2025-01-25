import { useState, useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { deleteUser } from 'firebase/auth';
import { auth } from '../firebase';

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'users'));
        const usersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);
      } catch (error) {
        console.error('Erreur lors du chargement des utilisateurs:', error);
        setError('Erreur lors du chargement des utilisateurs.');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleUpdateUser = async (userId, field, value) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        [field]: value
      });
      setUsers(users.map(user => 
        user.id === userId ? { ...user, [field]: value } : user
      ));
    } catch (error) {
      console.error('Erreur lors de la mise à jour:', error);
      setError('Erreur lors de la mise à jour de l\'utilisateur.');
    }
  };

  const handleDeleteUser = async (userId, userEmail) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return;
    }
    try {
      // Supprimer l'utilisateur de Firestore
      await deleteDoc(doc(db, 'users', userId));

      // Supprimer l'utilisateur de Firebase Auth
      const userToDelete = auth.currentUser;
      if (userToDelete && userToDelete.email === userEmail) {
        await deleteUser(userToDelete);
      }

      setUsers(users.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Erreur lors de la suppression de l\'utilisateur:', error);
      setError('Erreur lors de la suppression de l\'utilisateur.');
    }
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="user-management">
      <h3>Gestion des utilisateurs</h3>
      <table>
        <thead>
          <tr>
            <th>Email</th>
            <th>Poste</th>
            <th>Rôle</th>
            <th>Quota</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id}>
              <td>{user.email}</td>
              <td>
                <select
                  value={user.poste}
                  onChange={(e) => handleUpdateUser(user.id, 'poste', e.target.value)}
                >
                  <option value="menuiserie">Menuiserie</option>
                  <option value="projet">Projet</option>
                  <option value="pro">Pro</option>
                  <option value="cadre">Cadre</option>
                </select>
              </td>
              <td>
                <select
                  value={user.role}
                  onChange={(e) => handleUpdateUser(user.id, 'role', e.target.value)}
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Administrateur</option>
                </select>
              </td>
              <td>
                <input
                  type="number"
                  value={user.quota}
                  onChange={(e) => handleUpdateUser(user.id, 'quota', parseInt(e.target.value))}
                />
              </td>
              <td>
                <button
                  className="btn-delete"
                  onClick={() => handleDeleteUser(user.id, user.email)}
                >
                  Supprimer
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default UserManagement;

import React, { useState, useContext } from 'react';
    import { auth } from '../firebase';
    import { updatePassword, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
    import { AuthContext } from '../AuthContext';

    function ChangePasswordModal({ onClose }) {
      const [oldPassword, setOldPassword] = useState('');
      const [newPassword, setNewPassword] = useState('');
      const [confirmPassword, setConfirmPassword] = useState('');
      const [error, setError] = useState('');
      const [successMessage, setSuccessMessage] = useState('');
      const { user } = useContext(AuthContext);

      const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccessMessage('');

        if (newPassword !== confirmPassword) {
          setError('Les nouveaux mots de passe ne correspondent pas.');
          return;
        }

        try {
          const credential = EmailAuthProvider.credential(user.email, oldPassword);
          await reauthenticateWithCredential(auth.currentUser, credential);
          await updatePassword(auth.currentUser, newPassword);
          setSuccessMessage('Mot de passe mis à jour avec succès!');
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
        } catch (err) {
          setError(err.message);
        }
      };

      return (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Changer le mot de passe</h2>
            {error && <div className="error">{error}</div>}
            {successMessage && <div className="success">{successMessage}</div>}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Ancien mot de passe</label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Nouveau mot de passe</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>Confirmer le nouveau mot de passe</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
              <div className="modal-actions">
                <button type="submit">Changer le mot de passe</button>
                <button type="button" onClick={onClose}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      );
    }

    export default ChangePasswordModal;

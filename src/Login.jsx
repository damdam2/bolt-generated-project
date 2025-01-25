import { useState, useContext } from 'react';
import { AuthContext } from './AuthContext';
import './App.css';

function Login() {
  const { login, register } = useContext(AuthContext);
  const [isRegistering, setIsRegistering] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    poste: 'menuiserie' // Valeur par défaut
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegistering) {
        await register(formData.email, formData.password, {
          poste: formData.poste
        });
      } else {
        await login(formData.email, formData.password);
      }
    } catch (error) {
      setError(error.message);
    }
  };

  return (
    <div className="login-container">
      <h2>{isRegistering ? 'Créer un compte' : 'Connexion'}</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            required
          />
        </div>
        <div className="form-group">
          <label>Mot de passe</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            required
          />
        </div>
        {isRegistering && (
          <div className="form-group">
            <label>Poste</label>
            <select
              value={formData.poste}
              onChange={(e) => setFormData({...formData, poste: e.target.value})}
            >
              <option value="menuiserie">Menuiserie</option>
              <option value="projet">Projet</option>
              <option value="pro">Pro</option>
              <option value="cadre">Cadre</option>
            </select>
          </div>
        )}
        {error && <div className="error">{error}</div>}
        <button type="submit">
          {isRegistering ? 'Créer un compte' : 'Se connecter'}
        </button>
        <button
          type="button"
          onClick={() => setIsRegistering(!isRegistering)}
        >
          {isRegistering ? 'Déjà un compte ? Se connecter' : 'Créer un compte'}
        </button>
      </form>
    </div>
  );
}

export default Login;

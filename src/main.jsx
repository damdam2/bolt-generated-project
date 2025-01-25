import React from 'react';
    import ReactDOM from 'react-dom/client';
    import App from './App';
    import { AuthProvider } from './AuthContext';
    import './index.css';
    import * as api from './api';

    const storedUser = JSON.parse(localStorage.getItem('user') || 'null');

    ReactDOM.createRoot(document.getElementById('root')).render(
      <React.StrictMode>
        <AuthProvider initialUser={storedUser}>
          <App />
        </AuthProvider>
      </React.StrictMode>
    );

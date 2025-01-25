import { useContext } from 'react';
    import { AuthContext } from './AuthContext';
    import Login from './Login';
    import Dashboard from './Dashboard';
    import './App.css';
    import { BrowserRouter, Routes, Route } from 'react-router-dom';
    import UsersPage from './UsersPage';

    function App() {
      const { user } = useContext(AuthContext);

      return (
        <div className="app">
          <BrowserRouter>
            <Routes>
              <Route path="/" element={!user ? <Login /> : <Dashboard />} />
              {user?.role === 'admin' && <Route path="/users" element={<UsersPage />} />}
            </Routes>
          </BrowserRouter>
        </div>
      );
    }

    export default App;

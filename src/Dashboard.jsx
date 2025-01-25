import { useContext, useState } from 'react';
    import { AuthContext } from './AuthContext';
    import UserDashboard from './UserDashboard';
    import AdminDashboard from './AdminDashboard';
    import CalendarView from './components/CalendarView';
    import { useNavigate } from 'react-router-dom';
    import { extractFirstNameFromEmail } from './utils/utils';
    import ChangePasswordModal from './components/ChangePasswordModal';

    function Dashboard() {
      const { user, logout } = useContext(AuthContext);
      const [showCalendar, setShowCalendar] = useState(false);
      const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
      const navigate = useNavigate();

      const handleSwitchView = () => {
        setShowCalendar(!showCalendar);
      };

      const handleUsersClick = () => {
        navigate('/users');
      };

      const handleOpenChangePasswordModal = () => {
        setShowChangePasswordModal(true);
      };

      const handleCloseChangePasswordModal = () => {
        setShowChangePasswordModal(false);
      };

      const firstName = extractFirstNameFromEmail(user.email);
      const capitalizedFirstName = firstName ? firstName.charAt(0).toUpperCase() + firstName.slice(1) : '';

      return (
        <div className="dashboard">
          <header>
            <h2>Bonjour {capitalizedFirstName}</h2>
            <button onClick={logout}>Déconnexion</button>
            {user.role === 'admin' && (
              <button onClick={handleUsersClick}>Gestion des utilisateurs</button>
            )}
            <button onClick={handleSwitchView}>
              {showCalendar ? 'Interface Demande' : 'Vue Calendrier'}
            </button>
            <button onClick={handleOpenChangePasswordModal} style={{ color: 'black', backgroundColor: 'lightgray' }}>
              Changer le mot de passe
            </button>
          </header>
          
          {showCalendar ? (
            <CalendarView />
          ) : (
            user.role === 'admin' ? <AdminDashboard /> : <UserDashboard />
          )}
          {showChangePasswordModal && (
            <ChangePasswordModal onClose={handleCloseChangePasswordModal} />
          )}
        </div>
      );
    }

    export default Dashboard;

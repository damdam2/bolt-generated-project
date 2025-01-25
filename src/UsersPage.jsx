import UserManagement from './components/UserManagement';
    import { useNavigate } from 'react-router-dom';

    function UsersPage() {
      const navigate = useNavigate();

      const handleBackClick = () => {
        navigate('/');
      };

      return (
        <div className="users-page">
          <button onClick={handleBackClick}>Retour au tableau de bord</button>
          <UserManagement />
        </div>
      );
    }

    export default UsersPage;

// src/routes/RedirectToDashboard.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const RedirectToDashboard = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (!user) {
    return <Navigate to="/connexion" replace />;
  }

  return <Navigate to={`/${user.role}/tableau-de-bord`} replace />;
};

export default RedirectToDashboard;

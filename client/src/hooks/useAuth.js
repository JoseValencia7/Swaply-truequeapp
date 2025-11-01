import { useSelector } from 'react-redux';

export const useAuth = () => {
  const { user, isAuthenticated, loading } = useSelector((state) => state.auth);
  
  const isAdmin = user?.role === 'admin';
  const isModerator = user?.role === 'moderator' || isAdmin;

  return {
    user,
    isAuthenticated,
    loading,
    isAdmin,
    isModerator
  };
};

export default useAuth;
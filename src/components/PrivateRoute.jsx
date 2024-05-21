import { Navigate } from 'react-router-dom';

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token === null) {
    return <Navigate to="/login" />;
  }

  try {
    // Check if the token is not an empty string
    if (typeof token !== 'string' || token.trim() === '') {
      return <Navigate to="/login" />;
    }
  } catch (error) {
    console.error('Error checking token:', error);
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;

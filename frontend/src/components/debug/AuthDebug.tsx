import { useAuthStore } from '../../store/authStore';

const AuthDebug = () => {
  const { user, token, isAuthenticated, isInitialized } = useAuthStore();
  
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-75 text-white p-3 rounded text-xs max-w-xs">
      <div><strong>Auth Debug:</strong></div>
      <div>Initialized: {isInitialized ? '✅' : '❌'}</div>
      <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
      <div>User: {user ? user.email : 'null'}</div>
      <div>Token: {token ? `${token.slice(0, 20)}...` : 'null'}</div>
    </div>
  );
};

export default AuthDebug;
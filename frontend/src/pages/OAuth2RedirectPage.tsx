import { useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authApi } from '../api/auth';

export default function OAuth2RedirectPage() {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const navigate = useNavigate();
  const handled = useRef(false); // prevent double-execution in StrictMode

  useEffect(() => {
    if (handled.current) return;
    handled.current = true;

    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (!token || !refreshToken) {
      console.error('Missing token in OAuth2 redirect');
      navigate('/login?error=missing_token', { replace: true });
      return;
    }

    // Store tokens first so the API client can use them
    localStorage.setItem('accessToken', token);
    localStorage.setItem('refreshToken', refreshToken);

    authApi.getMe()
      .then((user) => {
        login(token, refreshToken, user);
        navigate('/bookings', { replace: true });
      })
      .catch((err) => {
        console.error('Failed to fetch user after OAuth2:', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        navigate('/login?error=auth_failed', { replace: true });
      });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-surface-400 text-sm">Completing sign in...</p>
        <p className="text-surface-600 text-xs mt-2">Please wait, do not close this tab</p>
      </div>
    </div>
  );
}

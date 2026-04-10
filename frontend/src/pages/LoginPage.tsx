import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Shield, Calendar, Wrench, Eye, EyeOff, Loader2 } from 'lucide-react';
import { localAuthApi } from '../api/auth';
import { authApi } from '../api/auth';
import toast from 'react-hot-toast';
import clsx from 'clsx';

type Tab = 'login' | 'register';

const features = [
  { icon: Building2, title: 'Facility Booking',  desc: 'Reserve halls, labs & equipment' },
  { icon: Calendar,  title: 'Smart Scheduling',  desc: 'Conflict-free time management'   },
  { icon: Wrench,    title: 'Incident Tracking', desc: 'Report & resolve issues fast'    },
  { icon: Shield,    title: 'Role-Based Access', desc: 'Secure, auditable workflows'     },
];

// ── Field component defined OUTSIDE LoginPage to prevent re-render focus loss ──
interface FieldProps {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  placeholder?: string;
  autoComplete?: string;
  rightElement?: React.ReactNode;
}

function Field({
  label, type = 'text', value, onChange, error,
  placeholder, autoComplete, rightElement,
}: FieldProps) {
  return (
    <div>
      <label className="block text-xs font-medium text-surface-600 dark:text-surface-400 mb-1.5">
        {label}
      </label>
      <div className="relative">
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          className={clsx(
            'w-full px-3.5 py-2.5 rounded-xl border text-sm transition-all',
            'bg-white dark:bg-surface-800 text-surface-900 dark:text-surface-100',
            'placeholder-surface-400 dark:placeholder-surface-500',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            error
              ? 'border-red-300 dark:border-red-700 focus:ring-red-400'
              : 'border-surface-200 dark:border-surface-700 focus:ring-brand-400',
            rightElement && 'pr-10'
          )}
        />
        {rightElement && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

// ── Field component defined OUTSIDE LoginPage to prevent remount on every keystroke ──


export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginErrors, setLoginErrors] = useState<Record<string, string>>({});

  // Register form state
  const [registerForm, setRegisterForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
  });
  const [registerErrors, setRegisterErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard', { replace: true });
  }, [isAuthenticated, navigate]);

  // ── Validation ──────────────────────────────────────────────
  const validateLogin = () => {
    const errors: Record<string, string> = {};
    if (!loginForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(loginForm.email)) errors.email = 'Enter a valid email';
    if (!loginForm.password) errors.password = 'Password is required';
    setLoginErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validateRegister = () => {
    const errors: Record<string, string> = {};
    if (!registerForm.name.trim()) errors.name = 'Name is required';
    else if (registerForm.name.trim().length < 2) errors.name = 'Name must be at least 2 characters';
    if (!registerForm.email.trim()) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(registerForm.email)) errors.email = 'Enter a valid email';
    if (!registerForm.password) errors.password = 'Password is required';
    else if (registerForm.password.length < 8) errors.password = 'At least 8 characters';
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(registerForm.password))
      errors.password = 'Must include uppercase, lowercase and a number';
    if (!registerForm.confirmPassword) errors.confirmPassword = 'Please confirm your password';
    else if (registerForm.password !== registerForm.confirmPassword)
      errors.confirmPassword = 'Passwords do not match';
    setRegisterErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { label: '', color: '', width: '0%' };
    let score = 0;
    if (pwd.length >= 8)  score++;
    if (pwd.length >= 12) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    if (score <= 1) return { label: 'Weak',   color: 'bg-red-500',    width: '25%'  };
    if (score <= 2) return { label: 'Fair',   color: 'bg-yellow-500', width: '50%'  };
    if (score <= 3) return { label: 'Good',   color: 'bg-blue-500',   width: '75%'  };
    return              { label: 'Strong', color: 'bg-green-500',  width: '100%' };
  };

  const strength = getPasswordStrength(registerForm.password);

  // ── Submit handlers ─────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateLogin()) return;
    setLoading(true);
    try {
      const data: any = await localAuthApi.login({
        email: loginForm.email,
        password: loginForm.password,
      });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Login failed. Please try again.';
      toast.error(msg);
      setLoginErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateRegister()) return;
    setLoading(true);
    try {
      const data: any = await localAuthApi.register({
        name: registerForm.name,
        email: registerForm.email,
        password: registerForm.password,
      });
      login(data.accessToken, data.refreshToken, data.user);
      toast.success(`Welcome to Smart Campus, ${data.user.name}!`);
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? 'Registration failed. Please try again.';
      toast.error(msg);
      setRegisterErrors({ general: msg });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = '/oauth2/authorization/google';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-surface-950 via-surface-900 to-brand-900 flex">

      {/* ── Left panel ───────────────────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-display font-700 text-white">Smart Campus</div>
            <div className="text-[11px] text-brand-300 uppercase tracking-widest">Operations Hub</div>
          </div>
        </div>

        <div>
          <h1 className="font-display text-5xl font-700 text-white leading-tight mb-6">
            Manage your campus<br />
            <span className="text-brand-400">intelligently.</span>
          </h1>
          <p className="text-surface-400 text-lg leading-relaxed max-w-md">
            A unified platform for facility bookings, asset management,
            and maintenance operations.
          </p>
          <div className="grid grid-cols-2 gap-4 mt-10">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="w-8 h-8 bg-brand-500/20 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <div className="font-medium text-white text-sm">{title}</div>
                <div className="text-surface-400 text-xs mt-1">{desc}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="text-surface-600 text-xs">
          © 2026 Smart Campus Operations Hub · SLIIT Faculty of Computing
        </p>
      </div>

      {/* ── Right panel ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-8">
        <div className="w-full max-w-sm">

          {/* Mobile logo */}
          <div className="flex lg:hidden items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-display font-700 text-white">Smart Campus</span>
          </div>

          <div className="bg-white dark:bg-surface-900 rounded-3xl shadow-2xl border border-surface-100 dark:border-surface-800 overflow-hidden">

            {/* ── Tab switcher ───────────────────────────────── */}
            <div className="flex border-b border-surface-100 dark:border-surface-800">
              {(['login', 'register'] as Tab[]).map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={clsx(
                    'flex-1 py-4 text-sm font-medium transition-all',
                    tab === t
                      ? 'text-brand-600 dark:text-brand-400 border-b-2 border-brand-500 bg-brand-50/50 dark:bg-brand-950/20'
                      : 'text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200'
                  )}
                >
                  {t === 'login' ? 'Sign In' : 'Register'}
                </button>
              ))}
            </div>

            <div className="p-6 space-y-5">
              {/* ── LOGIN FORM ──────────────────────────────── */}
              {tab === 'login' && (
                <form onSubmit={handleLogin} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white">
                      Welcome back
                    </h2>
                    <p className="text-surface-500 dark:text-surface-400 text-xs">
                      Sign in to your Smart Campus account
                    </p>
                  </div>

                  {loginErrors.general && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400">{loginErrors.general}</p>
                    </div>
                  )}

                  <Field
                    label="Email address"
                    type="email"
                    value={loginForm.email}
                    onChange={v => { setLoginForm(f => ({ ...f, email: v })); setLoginErrors({}); }}
                    error={loginErrors.email}
                    placeholder="you@university.edu"
                    autoComplete="email"
                  />

                  <Field
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginForm.password}
                    onChange={v => { setLoginForm(f => ({ ...f, password: v })); setLoginErrors({}); }}
                    error={loginErrors.password}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowPassword(s => !s)}
                        className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                      >
                        {showPassword
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-2.5 justify-center"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : 'Sign In'
                    }
                  </button>
                </form>
              )}

              {/* ── REGISTER FORM ───────────────────────────── */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white">
                      Create account
                    </h2>
                    <p className="text-surface-500 dark:text-surface-400 text-xs">
                      Join Smart Campus Operations Hub
                    </p>
                  </div>

                  {registerErrors.general && (
                    <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-100 dark:border-red-900/30 rounded-xl">
                      <p className="text-xs text-red-600 dark:text-red-400">{registerErrors.general}</p>
                    </div>
                  )}

                  <Field
                    label="Full name"
                    value={registerForm.name}
                    onChange={v => { setRegisterForm(f => ({ ...f, name: v })); setRegisterErrors({}); }}
                    error={registerErrors.name}
                    placeholder="Your full name"
                    autoComplete="name"
                  />

                  <Field
                    label="Email address"
                    type="email"
                    value={registerForm.email}
                    onChange={v => { setRegisterForm(f => ({ ...f, email: v })); setRegisterErrors({}); }}
                    error={registerErrors.email}
                    placeholder="you@university.edu"
                    autoComplete="email"
                  />

                  <div>
                    <Field
                      label="Password"
                      type={showPassword ? 'text' : 'password'}
                      value={registerForm.password}
                      onChange={v => { setRegisterForm(f => ({ ...f, password: v })); setRegisterErrors({}); }}
                      error={registerErrors.password}
                      placeholder="Min 8 characters"
                      autoComplete="new-password"
                      rightElement={
                        <button
                          type="button"
                          onClick={() => setShowPassword(s => !s)}
                          className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                        >
                          {showPassword
                            ? <EyeOff className="w-4 h-4" />
                            : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />
                    {/* Password strength bar */}
                    {registerForm.password && (
                      <div className="mt-2">
                        <div className="h-1 bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                          <div
                            className={clsx('h-full rounded-full transition-all duration-300', strength.color)}
                            style={{ width: strength.width }}
                          />
                        </div>
                        <p className={clsx(
                          'text-[10px] mt-1',
                          strength.label === 'Weak'   && 'text-red-500',
                          strength.label === 'Fair'   && 'text-yellow-500',
                          strength.label === 'Good'   && 'text-blue-500',
                          strength.label === 'Strong' && 'text-green-500',
                        )}>
                          {strength.label} password
                        </p>
                      </div>
                    )}
                  </div>

                  <Field
                    label="Confirm password"
                    type={showConfirm ? 'text' : 'password'}
                    value={registerForm.confirmPassword}
                    onChange={v => { setRegisterForm(f => ({ ...f, confirmPassword: v })); setRegisterErrors({}); }}
                    error={registerErrors.confirmPassword}
                    placeholder="Re-enter your password"
                    autoComplete="new-password"
                    rightElement={
                      <button
                        type="button"
                        onClick={() => setShowConfirm(s => !s)}
                        className="text-surface-400 hover:text-surface-600 dark:hover:text-surface-300 transition-colors"
                      >
                        {showConfirm
                          ? <EyeOff className="w-4 h-4" />
                          : <Eye className="w-4 h-4" />}
                      </button>
                    }
                  />

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full btn-primary py-2.5 justify-center"
                  >
                    {loading
                      ? <Loader2 className="w-4 h-4 animate-spin" />
                      : 'Create Account'
                    }
                  </button>
                </form>
              )}

              {/* ── Divider ─────────────────────────────────── */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800" />
                <span className="text-xs text-surface-400">or</span>
                <div className="flex-1 h-px bg-surface-100 dark:bg-surface-800" />
              </div>

              {/* ── Google button ────────────────────────────── */}
              <button
                onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                           bg-white dark:bg-surface-800 border-2 border-surface-200
                           dark:border-surface-700 rounded-2xl text-surface-800
                           dark:text-surface-100 font-medium text-sm
                           hover:border-brand-400 hover:shadow-md transition-all group"
              >
                <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <span className="group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  Continue with Google
                </span>
              </button>

              <p className="text-center text-[10px] text-surface-400">
                By signing in you agree to the university's acceptable use policy.
              </p>
            </div>
          </div>

          <p className="text-center text-surface-600 text-xs mt-4">
            Need help?{' '}
            <a href="mailto:support@smartcampus.edu" className="text-brand-400 hover:underline">
              support@smartcampus.edu
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

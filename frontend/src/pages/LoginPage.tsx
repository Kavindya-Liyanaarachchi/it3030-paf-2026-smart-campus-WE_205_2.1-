import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Building2, Shield, Calendar, Wrench, Eye, EyeOff, Loader2, Sun, Moon } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import logo from '../assets/logo.svg';
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

// -- Field component defined OUTSIDE LoginPage to prevent re-render focus loss --
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
      <label className="block text-xs font-medium text-surface-700 dark:text-surface-300 mb-1.5 transition-colors">
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
            'bg-white/80 dark:bg-surface-800/80 text-surface-900 dark:text-surface-100',
            'placeholder-brand-400',
            'focus:outline-none focus:ring-2 focus:border-transparent',
            error
              ? 'border-red-300 focus:ring-red-400'
              : 'border-brand-500 focus:ring-surface-300 dark:focus:ring-brand-400',
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

// -- Field component defined OUTSIDE LoginPage to prevent remount on every keystroke --


export default function LoginPage() {
  const { isAuthenticated, login } = useAuth();
  const { isDark, toggleTheme } = useTheme();
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

  // -- Validation ----------------------------------------------------------------
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

  // -- Submit handlers ------------------------------------------------------------
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
    <div className="min-h-screen relative overflow-hidden bg-surface-950 dark:bg-black text-surface-100 font-formal transition-colors duration-500">
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-brand-500/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-[28rem] h-[28rem] bg-brand-400/20 blur-[120px] rounded-full" />
      <div className="absolute inset-0 bg-[radial-gradient(1200px_600px_at_10%_20%,rgba(255,255,255,0.1),transparent_55%)]" />

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-20 p-3 rounded-2xl bg-surface-800/40 hover:bg-surface-700/60 text-white border border-surface-700/50 backdrop-blur transition-all"
      >
        {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>

      <div className="relative z-10 min-h-screen grid lg:grid-cols-[1.15fr_0.85fr] gap-8 p-6 lg:p-12">
        {/* -- Main card --------------------------------------------------------- */}
        <div className="flex items-center">
          <div className="w-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-11 h-11 bg-[#393E46] rounded-2xl flex items-center justify-center shadow-glow">
                <img src={logo} alt="Smart Campus logo" className="w-7 h-7" />
              </div>
              <div>
                <div className="font-formal font-800 text-[#EEEEEE] text-lg">Smart Campus</div>
                <div className="text-[11px] text-[#7BC74D] uppercase tracking-[0.3em]">Operations Hub</div>
              </div>
            </div>

            <div className="bg-surface-100 dark:bg-surface-900 text-surface-950 dark:text-surface-100 rounded-[28px] shadow-2xl border border-brand-500/50 backdrop-blur-xl transition-colors duration-300">
              <div className="p-6 lg:p-8 border-b border-surface-200 dark:border-surface-800">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="font-formal text-2xl lg:text-3xl font-800 text-surface-900 dark:text-white">
                      Your campus, one control room.
                    </h1>
                    <p className="text-surface-600 dark:text-surface-400 text-sm mt-2 max-w-md">
                      Book facilities, coordinate maintenance, and keep teams aligned.
                    </p>
                  </div>
                  <div className="hidden md:flex items-center gap-2 bg-[#7BC74D]/30 rounded-full p-1">
                    {(['login', 'register'] as Tab[]).map(t => (
                      <button
                        key={t}
                        onClick={() => setTab(t)}
                        className={clsx(
                          'px-4 py-2 text-xs font-semibold rounded-full transition-all',
                          tab === t
                            ? 'bg-[#393E46] text-[#EEEEEE] shadow-sm'
                            : 'text-[#393E46] hover:text-[#222831]'
                        )}
                      >
                        {t === 'login' ? 'Sign In' : 'Create Account'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile segmented switcher */}
              <div className="md:hidden px-6 pt-5">
                <div className="flex items-center gap-2 bg-[#7BC74D]/30 rounded-2xl p-1">
                  {(['login', 'register'] as Tab[]).map(t => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={clsx(
                        'flex-1 py-2 text-xs font-semibold rounded-xl transition-all',
                        tab === t
                          ? 'bg-[#393E46] text-[#EEEEEE]'
                          : 'text-[#393E46] hover:text-[#222831]'
                      )}
                    >
                      {t === 'login' ? 'Sign In' : 'Create Account'}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-6 lg:p-8 space-y-5">
                {/* -- LOGIN FORM ------------------------------------------------ */}
                {tab === 'login' && (
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="font-formal text-xl font-700 text-[#222831]">
                        Welcome back
                      </h2>
                      <p className="text-[#393E46] text-xs">
                        Sign in to continue to the operations hub
                      </p>
                    </div>

                    {loginErrors.general && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs text-red-600">{loginErrors.general}</p>
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
                          className="text-[#7BC74D] hover:text-[#393E46] transition-colors"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                 bg-[#393E46] text-[#EEEEEE] hover:bg-[#222831] transition-all disabled:opacity-60"
                    >
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : 'Sign In'
                      }
                    </button>
                  </form>
                )}

                {/* -- REGISTER FORM --------------------------------------------- */}
                {tab === 'register' && (
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                      <h2 className="font-formal text-xl font-700 text-[#222831]">
                        Create account
                      </h2>
                      <p className="text-[#393E46] text-xs">
                        Join the campus operations workspace
                      </p>
                    </div>

                    {registerErrors.general && (
                      <div className="p-3 bg-red-50 border border-red-100 rounded-xl">
                        <p className="text-xs text-red-600">{registerErrors.general}</p>
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
                            className="text-[#7BC74D] hover:text-[#393E46] transition-colors"
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
                          <div className="h-1 bg-[#7BC74D]/40 rounded-full overflow-hidden">
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
                          className="text-[#7BC74D] hover:text-[#393E46] transition-colors"
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
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
                                 bg-[#393E46] text-[#EEEEEE] hover:bg-[#222831] transition-all disabled:opacity-60"
                    >
                      {loading
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : 'Create Account'
                      }
                    </button>
                  </form>
                )}

                {/* -- Divider -------------------------------------------------- */}
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-px bg-[#7BC74D]/50" />
                  <span className="text-xs text-[#393E46]">or</span>
                  <div className="flex-1 h-px bg-[#7BC74D]/50" />
                </div>

                {/* -- Google button -------------------------------------------- */}
                <button
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 px-4 py-2.5
                           bg-white border-2 border-[#7BC74D] rounded-2xl text-[#222831]
                           font-medium text-sm hover:border-[#393E46] hover:shadow-md transition-all group"
                >
                  <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="group-hover:text-[#222831] transition-colors">
                    Continue with Google
                  </span>
                </button>

                <p className="text-center text-[10px] text-[#393E46]">
                  By signing in you agree to the university's acceptable use policy.
                </p>
              </div>
            </div>

            <p className="text-center text-[#EEEEEE]/80 text-xs mt-6">
              Need help?{' '}
              <a href="mailto:support@smartcampus.edu" className="text-[#EEEEEE] hover:underline">
                support@smartcampus.edu
              </a>
            </p>
          </div>
        </div>

        {/* -- Right rail -------------------------------------------------------- */}
        <div className="hidden lg:flex flex-col justify-center gap-8 px-4">
          <div className="rounded-[28px] bg-[#393E46]/30 border border-[#7BC74D]/40 p-8 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#393E46]/60 flex items-center justify-center">
                <Shield className="w-6 h-6 text-[#EEEEEE]" />
              </div>
              <div>
                <div className="text-sm uppercase tracking-[0.2em] text-[#7BC74D]">Trusted Access</div>
                <div className="font-formal text-2xl font-700 text-[#EEEEEE]">Secure by design</div>
              </div>
            </div>
            <p className="text-[#EEEEEE]/70 text-sm mt-4">
              Role-based permissions and activity trails keep every action accountable.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#222831]/40 border border-[#7BC74D]/30 p-4">
                <div className="text-2xl font-700 text-[#EEEEEE]">24/7</div>
                <div className="text-xs text-[#7BC74D]">Operations visibility</div>
              </div>
              <div className="rounded-2xl bg-[#222831]/40 border border-[#7BC74D]/30 p-4">
                <div className="text-2xl font-700 text-[#EEEEEE]">4 roles</div>
                <div className="text-xs text-[#7BC74D]">User, Admin, Manager, Tech</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-2xl bg-[#393E46]/25 border border-[#7BC74D]/30 p-4 backdrop-blur">
                <div className="w-9 h-9 rounded-xl bg-[#222831]/40 flex items-center justify-center mb-3">
                  <Icon className="w-4 h-4 text-[#EEEEEE]" />
                </div>
                <div className="text-sm font-semibold text-[#EEEEEE]">{title}</div>
                <div className="text-xs text-[#7BC74D] mt-1">{desc}</div>
              </div>
            ))}
          </div>

          <p className="text-[#7BC74D] text-xs">
            (c) 2026 Smart Campus Operations Hub · SLIIT Faculty of Computing
          </p>
        </div>
      </div>
    </div>
  );
}







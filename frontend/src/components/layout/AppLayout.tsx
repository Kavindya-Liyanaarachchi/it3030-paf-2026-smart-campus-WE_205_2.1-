import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { notificationsApi } from '../../api/notifications';
import {
  LayoutDashboard, Building2, Calendar, Flag ,
  Bell, Settings, LogOut, ChevronRight, Menu, X, Moon, Sun,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import clsx from 'clsx';

const navItems = [
  { to: '/dashboard',     icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/resources',     icon: Building2,        label: 'Resources'  },
  { to: '/bookings',      icon: Calendar,         label: 'Bookings'   },
  { to: '/tickets',       icon: Flag ,      label: 'Tickets'    },
  { to: '/notifications', icon: Bell,             label: 'Notifications', badge: true },
];

const adminItems = [
  { to: '/admin', icon: Settings, label: 'Admin Panel' },
];

export default function AppLayout() {
  const { user, logout, hasRole } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const navigate = useNavigate();

  const { data: countData } = useQuery({
    queryKey: ['notifications', 'count'],
    queryFn: notificationsApi.getCount,
    refetchInterval: 30000,
  });

  const unreadCount = countData?.count ?? 0;

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('theme', dark ? 'dark' : 'light');
  }, [dark]);

  const Sidebar = ({ mobile = false }: { mobile?: boolean }) => (
    <div className={clsx(
      'flex flex-col h-full',
      mobile ? 'p-4' : 'p-5'
    )}>
      {/* Logo */}
      <a href="/dashboard" className="flex items-center gap-3 mb-8 px-1">
        <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow flex-shrink-0">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <div className="font-display font-700 text-sm text-surface-900 dark:text-white leading-tight">
            Smart Campus
          </div>
          <div className="text-[10px] text-surface-400 uppercase tracking-wider">
            Operations Hub
          </div>
        </div>
      </a>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        <div className="text-[10px] font-medium text-surface-400 uppercase tracking-wider px-3 mb-2">Main</div>
        {navItems.map(({ to, icon: Icon, label, badge }) => (
          <NavLink
            key={to}
            to={to}
            onClick={() => mobile && setSidebarOpen(false)}
            className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
          >
            <Icon className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">{label}</span>
            {badge && unreadCount > 0 && (
              <span className="ml-auto bg-brand-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </NavLink>
        ))}

        {hasRole('ADMIN', 'MANAGER') && (
          <>
            <div className="text-[10px] font-medium text-surface-400 uppercase tracking-wider px-3 mt-4 mb-2">Admin</div>
            {adminItems.map(({ to, icon: Icon, label }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => mobile && setSidebarOpen(false)}
                className={({ isActive }) => clsx('sidebar-link', isActive && 'active')}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{label}</span>
              </NavLink>
            ))}
          </>
        )}
      </nav>

      {/* User section */}
      <div className="border-t border-surface-100 dark:border-surface-800 pt-4 space-y-1">
        <button
          onClick={() => setDark(d => !d)}
          className="sidebar-link w-full"
        >
          {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          <span>{dark ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <button
          onClick={() => { navigate('/profile'); mobile && setSidebarOpen(false); }}
          className="sidebar-link w-full"
        >
          {user?.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="w-5 h-5 rounded-full" />
          ) : (
            <div className="w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium truncate text-surface-800 dark:text-surface-200">{user?.name}</div>
            <div className="text-[10px] text-surface-400 truncate">{user?.role}</div>
          </div>
          <ChevronRight className="w-3 h-3 text-surface-400 flex-shrink-0" />
        </button>
        <button onClick={() => { if (confirm("Are you sure you want to sign out?")) logout(); }} className="sidebar-link w-full text-red-500 ...">          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-surface-50 dark:bg-surface-950">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-surface-900 border-r border-surface-100 dark:border-surface-800 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
          <aside className="relative z-50 flex flex-col w-72 bg-white dark:bg-surface-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-surface-100 dark:border-surface-800">
              <span className="font-display font-700 text-sm">Smart Campus</span>
              <button onClick={() => setSidebarOpen(false)} className="btn-ghost p-1.5">
                <X className="w-4 h-4" />
              </button>
            </div>
            <Sidebar mobile />
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile top bar */}
        <header className="lg:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-surface-900 border-b border-surface-100 dark:border-surface-800">
          <button onClick={() => setSidebarOpen(true)} className="btn-ghost p-1.5">
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-display font-700 text-sm flex-1">Smart Campus</span>
          <button onClick={() => navigate('/notifications')} className="btn-ghost p-1.5 relative">
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 bg-brand-500 text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto scrollbar-thin">
          <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}

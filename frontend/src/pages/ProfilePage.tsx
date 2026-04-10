import { useAuth } from '../contexts/AuthContext';
import { User, Shield, Mail, Calendar } from 'lucide-react';
import { formatDateTime } from '../utils';

export default function ProfilePage() {
  const { user } = useAuth();
  if (!user) return null;

  const roleColors: Record<string, string> = {
    ADMIN: 'badge-red', MANAGER: 'badge-purple',
    TECHNICIAN: 'badge-blue', USER: 'badge-gray',
  };

  return (
    <div className="max-w-xl space-y-6">
      <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">My Profile</h1>

      <div className="card p-6">
        <div className="flex items-center gap-4 mb-6">
          {user.pictureUrl ? (
            <img src={user.pictureUrl} alt="" className="w-16 h-16 rounded-2xl object-cover" />
          ) : (
            <div className="w-16 h-16 rounded-2xl bg-brand-500 flex items-center justify-center text-2xl font-bold text-white">
              {user.name[0]}
            </div>
          )}
          <div>
            <h2 className="font-display text-xl font-700 text-surface-900 dark:text-white">{user.name}</h2>
            <span className={roleColors[user.role] + ' mt-1'}>{user.role}</span>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <Mail className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-surface-400 uppercase tracking-wide">Email</div>
              <div className="text-sm text-surface-800 dark:text-surface-200">{user.email}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <Shield className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-surface-400 uppercase tracking-wide">Role</div>
              <div className="text-sm text-surface-800 dark:text-surface-200">{user.role}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl">
            <Calendar className="w-4 h-4 text-surface-400 flex-shrink-0" />
            <div>
              <div className="text-[10px] text-surface-400 uppercase tracking-wide">Member Since</div>
              <div className="text-sm text-surface-800 dark:text-surface-200">{formatDateTime(user.createdAt)}</div>
            </div>
          </div>
        </div>

        <div className="mt-4 p-3 bg-surface-50 dark:bg-surface-800 rounded-xl text-xs text-surface-400 text-center">
          Profile information is synced from your Google account.
        </div>
      </div>
    </div>
  );
}

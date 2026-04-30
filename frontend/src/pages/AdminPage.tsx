import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../api/admin';
import { UserRole } from '../types';
import { Users, Shield } from 'lucide-react';
import { formatDate } from '../utils';
import toast from 'react-hot-toast';

const ROLES: UserRole[] = ['USER', 'TECHNICIAN', 'MANAGER', 'ADMIN'];
const roleBadge: Record<UserRole, string> = {
  ADMIN: 'badge-red', MANAGER: 'badge-purple', TECHNICIAN: 'badge-blue', USER: 'badge-gray',
};

export default function AdminPage() {
  const queryClient = useQueryClient();

  const { data: users = [], isLoading } = useQuery({
    queryKey: ['admin', 'users'],
    queryFn: adminApi.getUsers,
  });

  const roleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => adminApi.updateRole(id, role),
    onSuccess: () => { toast.success('Role updated'); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: () => toast.error('Failed to update role'),
  });

  const toggleMutation = useMutation({
    mutationFn: adminApi.toggleEnabled,
    onSuccess: () => { toast.success('User status updated'); queryClient.invalidateQueries({ queryKey: ['admin', 'users'] }); },
    onError: () => toast.error('Failed to update user'),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-700 text-surface-900 dark:text-white">Admin Panel</h1>
        <p className="text-surface-500 dark:text-surface-400 text-sm mt-1">Manage users and system settings</p>
      </div>

      <div className="card">
        <div className="flex items-center gap-2 p-5 border-b border-surface-100 dark:border-surface-800">
          <Users className="w-4 h-4 text-surface-400" />
          <h2 className="font-display font-600 text-surface-900 dark:text-white">User Management</h2>
          <span className="ml-auto badge-gray">{users.length} users</span>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-surface-100 dark:bg-surface-800 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-surface-50 dark:divide-surface-800">
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-4 p-4">
                <div className="w-9 h-9 rounded-xl bg-brand-100 dark:bg-brand-900/40 flex items-center justify-center text-sm font-bold text-brand-600 dark:text-brand-400 flex-shrink-0">
                  {u.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate">{u.name}</div>
                  <div className="text-xs text-surface-400 truncate">{u.email}</div>
                </div>
                <div className="flex items-center gap-2">
                  <select
                    value={u.role}
                    onChange={e => {
                      if (confirm(`Change ${u.name}'s role to ${e.target.value}?`)) {
                        roleMutation.mutate({ id: u.id, role: e.target.value as UserRole });
                      }
                    }}
                    className="input text-xs py-1 w-32"
                  >
                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                  <button
                    onClick={() => {
                      if (confirm(`${u.enabled ? 'Disable' : 'Enable'} ${u.name}'s account?`)) {
                        toggleMutation.mutate(u.id);
                      }
                    }}
                    className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all ${
                      u.enabled
                        ? 'bg-red-50 dark:bg-red-950/20 text-red-500 hover:bg-red-100 dark:hover:bg-red-950/30'
                        : 'bg-green-50 dark:bg-green-950/20 text-green-500 hover:bg-green-100 dark:hover:bg-green-950/30'
                    }`}
                  >
                    {u.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
                <div className="text-[10px] text-surface-400 hidden sm:block">{formatDate(u.createdAt)}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

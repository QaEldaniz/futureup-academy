'use client';

import { useAuthStore } from '@/stores/auth';
import { useLmsT } from '@/hooks/useLmsT';
import { Mail, User } from 'lucide-react';

export default function ParentProfilePage() {
  const { user } = useAuthStore();
  const { t, tField } = useLmsT();

  const displayName = tField(user, 'name') !== '—' ? tField(user, 'name') : (user?.name || t('roleParent'));

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{t('profile')}</h1>

      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-secondary-500 flex items-center justify-center text-white text-xl font-bold">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{displayName}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">{t('roleParent')}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50">
            <Mail className="w-5 h-5 text-gray-400" />
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-400">{t('email')}</p>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

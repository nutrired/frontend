// frontend/app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useMyProfile } from '@/lib/profile';
import { useConversations } from '@/lib/chat';
import { Avatar } from '@/components/Avatar';
import useSWR from 'swr';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const t = useTranslations('dashboard');
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  // Called for all users; returns null for non-nutritionists (endpoint returns 404)
  // Slight waste for clients but avoids conditional hook calls (React rules)
  const { profile } = useMyProfile();
  const { conversations } = useConversations();
  const { data: version } = useSWR<{ version: string; commit: string; buildTime: string }>(
    '/api/version',
    () => fetch('/api/version').then(r => r.json()),
    { revalidateOnFocus: false }
  );

  // Settings section state (persisted to localStorage)
  const [settingsOpen, setSettingsOpen] = useState(true);

  // Hydrate settings state from localStorage after mount
  useEffect(() => {
    const stored = localStorage.getItem('sidebar:settingsOpen');
    if (stored !== null) {
      setSettingsOpen(stored === 'true');
    }
  }, []);

  const toggleSettings = () => {
    const newState = !settingsOpen;
    setSettingsOpen(newState);
    localStorage.setItem('sidebar:settingsOpen', String(newState));
  };

  // Redirect unauthenticated users to login.
  useEffect(() => {
    if (!isLoading && !user) {
      router.replace(`/login?from=${encodeURIComponent(pathname)}`);
    }
  }, [user, isLoading, pathname, router]);

  if (isLoading || !user) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--nc-cream)' }}>
        <span style={{ color: 'var(--nc-stone)', fontWeight: 300, fontSize: 14 }}>Loading…</span>
      </div>
    );
  }

  const handleSignOut = async () => {
    await api.post('/auth/logout', {}).catch(() => {});
    router.push('/login');
  };

  const totalUnreadCount = conversations.reduce((sum, c) => sum + c.unread_count, 0);

  const navItems = [
    { href: '/dashboard', labelKey: 'home', icon: '◎', roles: ['client', 'nutritionist'] },
    { href: '/dashboard/clients', labelKey: 'clients', icon: '◉', roles: ['nutritionist'] },
    { href: '/dashboard/surveys', labelKey: 'surveys', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/my-recipes', labelKey: 'recipes', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/my-exercises', labelKey: 'exercises', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/appointment-types', labelKey: 'appointment_types', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/availability', labelKey: 'availability', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/calendar', labelKey: 'calendar', icon: '◈', roles: ['client', 'nutritionist'] },
    { href: '/dashboard/messages', labelKey: 'chat', icon: '◈', roles: ['client', 'nutritionist'] },
    { href: '/dashboard/my-nutritionist', labelKey: 'my_nutritionist', icon: '◉', roles: ['client'] },
    { href: '/dashboard/my-plans', labelKey: 'plans', icon: '◈', roles: ['client'] },
    { href: '/dashboard/business', labelKey: 'business', icon: '◈', roles: ['nutritionist'] },
  ].filter((item) => item.roles.includes(user.role));

  const settingsItems = [
    { href: '/dashboard/profile', labelKey: 'profile', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/client-profile', labelKey: 'profile', icon: '◈', roles: ['client'] },
    { href: '/dashboard/billing', labelKey: 'billing', icon: '◈', roles: ['nutritionist'] },
  ].filter((item) => item.roles.includes(user.role));

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <Link href="/">Nutri<span>Red</span></Link>
        </div>
        <div className="dash-user">
          <Avatar
            avatarUrl={user.role === 'nutritionist' ? (profile?.avatar_url ?? null) : null}
            displayName={
              user.role === 'nutritionist' && profile?.display_name
                ? profile.display_name
                : user.email
            }
            size="small"
          />
          <div>
            <div className="dash-user-name">
              {user.role === 'nutritionist' && profile?.display_name
                ? profile.display_name
                : user.email.split('@')[0]}
            </div>
            <div className="dash-user-role">{user.role}</div>
          </div>
        </div>
        {user.role === 'nutritionist' && profile && (
          <div style={{ padding: '8px 16px 12px' }}>
            <div style={{ marginBottom: 8 }}>
              <span style={{
                fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
                padding: '4px 10px', borderRadius: 100,
                background: profile.tier === 'premium' ? '#4a7c59' : (profile.tier === 'pro' ? '#c4622d' : 'rgba(139,115,85,0.12)'),
                color: profile.tier === 'free' ? 'var(--nc-stone)' : 'white',
              }}>
                {profile.tier}
              </span>
              {profile.tier === 'free' && (
                <a href="/dashboard/billing" style={{ fontSize: 11, color: 'var(--nc-terra)', marginLeft: 8, textDecoration: 'none' }}>
                  {t('tier.upgrade')}
                </a>
              )}
            </div>
            {profile.slug && (
              <Link
                href={`/nutritionists/${profile.slug}`}
                target="_blank"
                style={{
                  fontSize: 11,
                  color: 'var(--nc-stone)',
                  textDecoration: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                }}
              >
                {t('profile.view_public')}
              </Link>
            )}
          </div>
        )}
        <nav className="dash-nav">
          <span className="dash-nav-section">{t('sections.manage')}</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ? ' active' : ''}`}
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
              }}
            >
              <span>{item.icon}</span> {t(`nav.${item.labelKey}`)}
              {item.href === '/dashboard/messages' && totalUnreadCount > 0 && (
                <span
                  style={{
                    marginLeft: 'auto',
                    background: 'var(--nc-terra)',
                    color: 'white',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 6px',
                    borderRadius: 10,
                    minWidth: 18,
                    textAlign: 'center',
                  }}
                >
                  {totalUnreadCount}
                </span>
              )}
            </Link>
          ))}
          <span
            className="dash-nav-section"
            onClick={toggleSettings}
            style={{
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '8px 16px',
              marginTop: 4,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.03)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
            }}
          >
            {t('sections.settings')}
            <span style={{ fontSize: 12, marginLeft: 8 }}>
              {settingsOpen ? '▼' : '▶'}
            </span>
          </span>

          <div
            style={{
              overflow: 'hidden',
              maxHeight: settingsOpen ? '500px' : '0',
              transition: 'max-height 200ms ease-in-out',
            }}
          >
            {settingsItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`dash-nav-item${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ? ' active' : ''}`}
                style={{ paddingLeft: 24 }}
              >
                <span>{item.icon}</span> {t(`nav.${item.labelKey}`)}
              </Link>
            ))}
          </div>
        </nav>
        <div className="dash-footer">
          <button onClick={handleSignOut} className="dash-nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span>←</span> {t('user_menu.logout')}
          </button>
          {version && (
            <div
              style={{
                fontSize: 10,
                color: 'rgba(139,115,85,0.5)',
                padding: '8px 16px',
                textAlign: 'center',
              }}
              title={`Commit: ${version.commit}\nBuild: ${version.buildTime}`}
            >
              v{version.version}
            </div>
          )}
        </div>
      </aside>
      <main className="dash-main">{children}</main>
    </div>
  );
}

// frontend/app/dashboard/layout.tsx
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { useMyProfile } from '@/lib/profile';

function initials(email: string): string {
  return email.slice(0, 2).toUpperCase();
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  // Called for all users; returns null for non-nutritionists (endpoint returns 404)
  // Slight waste for clients but avoids conditional hook calls (React rules)
  const { profile } = useMyProfile();

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

  const navItems = [
    { href: '/dashboard', label: 'Overview', icon: '◎', roles: ['client', 'nutritionist'] },
    { href: '/dashboard/clients', label: 'Mis clientes', icon: '◉', roles: ['nutritionist'] },
    { href: '/dashboard/my-recipes', label: 'Mis recetas', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/my-nutritionist', label: 'My nutritionist', icon: '◉', roles: ['client'] },
    { href: '/dashboard/my-plans', label: 'Mis planes', icon: '◈', roles: ['client'] },
    { href: '/dashboard/billing', label: 'Billing & Earnings', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/business', label: 'Business Dashboard', icon: '◈', roles: ['nutritionist'] },
  ].filter((item) => item.roles.includes(user.role));

  const settingsItems = [
    { href: '/dashboard/profile', label: 'My profile', icon: '◈', roles: ['nutritionist'] },
    { href: '/dashboard/client-profile', label: 'My profile', icon: '◈', roles: ['client'] },
  ].filter((item) => item.roles.includes(user.role));

  return (
    <div className="dash-root">
      <aside className="dash-sidebar">
        <div className="dash-logo">
          <Link href="/">Nutri<span>Connect</span></Link>
        </div>
        <div className="dash-user">
          <div className="dash-avatar">{initials(user.email)}</div>
          <div>
            <div className="dash-user-name">{user.email.split('@')[0]}</div>
            <div className="dash-user-role">{user.role}</div>
          </div>
        </div>
        {user.role === 'nutritionist' && profile && (
          <div style={{ padding: '8px 16px 0' }}>
            <span style={{
              fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '3px 8px', borderRadius: 100,
              background: profile.tier === 'free' ? 'rgba(139,115,85,0.12)' : 'rgba(74,124,89,0.12)',
              color: profile.tier === 'free' ? 'var(--nc-stone)' : 'var(--nc-forest)',
            }}>
              {profile.tier}
            </span>
            {profile.tier === 'free' && (
              <a href="/dashboard/billing" style={{ fontSize: 11, color: 'var(--nc-terra)', marginLeft: 8, textDecoration: 'none' }}>
                Upgrade →
              </a>
            )}
          </div>
        )}
        <nav className="dash-nav">
          <span className="dash-nav-section">Manage</span>
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`dash-nav-item${pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href + '/')) ? ' active' : ''}`}
            >
              <span>{item.icon}</span> {item.label}
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
            Settings
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
                <span>{item.icon}</span> {item.label}
              </Link>
            ))}
          </div>

          {user.role === 'nutritionist' && (
            <Link
              href="/nutritionists"
              className="dash-nav-item"
              target="_blank"
              style={{ marginTop: 8 }}
            >
              <span>↗</span> View public directory
            </Link>
          )}
        </nav>
        <div className="dash-footer">
          <button onClick={handleSignOut} className="dash-nav-item" style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
            <span>←</span> Sign out
          </button>
        </div>
      </aside>
      <main className="dash-main">{children}</main>
    </div>
  );
}

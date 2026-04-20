// frontend/app/dashboard/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useAuth } from '@/lib/auth';
import { useMyClientProfile, useWeightEntries, useActivityEntries } from '@/lib/client-profile';
import { UpcomingAppointments } from './components/UpcomingAppointments';
import { useMyRelationships } from '@/lib/hiring';
import { useSurveyAssignment, usePendingSurveyReviews } from '@/lib/survey';
import type { WeightEntry, ActivityEntry } from '@/lib/types';

// ─── Client Health Graphs ──────────────────────────────────────────────────────

function WeightGraph({ entries }: { entries: WeightEntry[] }) {
  const data = entries
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(e => ({
      date: new Date(e.recorded_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
      weight: parseFloat(String(e.weight_kg)),
    }));

  if (data.length === 0) {
    return (
      <div style={{
        color: 'var(--nc-stone)',
        fontSize: 13,
        fontWeight: 300,
        padding: '40px 0',
        textAlign: 'center'
      }}>
        No weight entries yet. Log your first weight to see your trend.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nc-border)" />
        <XAxis
          dataKey="date"
          style={{ fontSize: 11, fill: 'var(--nc-stone)' }}
        />
        <YAxis
          domain={['dataMin - 1', 'dataMax + 1']}
          style={{ fontSize: 11, fill: 'var(--nc-stone)' }}
          label={{ value: 'kg', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid var(--nc-border)',
            borderRadius: 6,
            fontSize: 12
          }}
        />
        <Line
          type="monotone"
          dataKey="weight"
          stroke="var(--nc-forest)"
          strokeWidth={2}
          dot={{ r: 3, fill: 'var(--nc-forest)' }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

function ActivityGraph({ entries }: { entries: ActivityEntry[] }) {
  // Group by date, sum duration_minutes
  const grouped = entries.reduce((acc, e) => {
    const date = new Date(e.recorded_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += e.duration_minutes;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped)
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => {
      const entryA = entries.find(e => new Date(e.recorded_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) === a.date);
      const entryB = entries.find(e => new Date(e.recorded_at).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }) === b.date);
      if (!entryA || !entryB) return 0;
      return new Date(entryA.recorded_at).getTime() - new Date(entryB.recorded_at).getTime();
    });

  if (data.length === 0) {
    return (
      <div style={{
        color: 'var(--nc-stone)',
        fontSize: 13,
        fontWeight: 300,
        padding: '40px 0',
        textAlign: 'center'
      }}>
        No activity entries yet. Log your first workout to see your progress.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--nc-border)" />
        <XAxis
          dataKey="date"
          style={{ fontSize: 11, fill: 'var(--nc-stone)' }}
        />
        <YAxis
          style={{ fontSize: 11, fill: 'var(--nc-stone)' }}
          label={{ value: 'min', angle: -90, position: 'insideLeft', style: { fontSize: 11 } }}
        />
        <Tooltip
          contentStyle={{
            background: 'white',
            border: '1px solid var(--nc-border)',
            borderRadius: 6,
            fontSize: 12
          }}
        />
        <Bar dataKey="minutes" fill="var(--nc-terra)" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Client overview ──────────────────────────────────────────────────────────

function ClientOverview() {
  const [activeTab, setActiveTab] = useState<'weight' | 'activity'>('weight');
  const { profile, isLoading: profileLoading } = useMyClientProfile();
  const { entries: weightEntries, isLoading: weightLoading } = useWeightEntries();
  const { entries: activityEntries, isLoading: activityLoading } = useActivityEntries();
  const { relationships } = useMyRelationships();
  const activeRelationship = relationships.find(r => r.status === 'active');
  const { assignment } = useSurveyAssignment(activeRelationship?.id);

  if (profileLoading) return null;

  if (!profile || !profile.display_name?.trim()) {
    return (
      <div style={{
        background: 'var(--nc-forest-pale)',
        border: '1px solid rgba(26,51,41,0.12)',
        borderRadius: 10,
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 500, color: 'var(--nc-forest)', marginBottom: 4 }}>Set up your profile</div>
          <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>Add your goals and health info so your nutritionist can personalise your plan.</div>
        </div>
        <Link href="/dashboard/client-profile" style={{ color: 'var(--nc-terra)', fontSize: 14, fontWeight: 600, textDecoration: 'none', whiteSpace: 'nowrap' }}>
          Get started →
        </Link>
      </div>
    );
  }

  // Weight stats
  const sortedWeight = [...weightEntries].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const latestWeight = sortedWeight[sortedWeight.length - 1];
  const prevWeight = sortedWeight[sortedWeight.length - 2];
  const weightDelta = latestWeight && prevWeight ? latestWeight.weight_kg - prevWeight.weight_kg : null;

  // Recent activity (last 4)
  const recentActivity = [...activityEntries]
    .sort((a, b) => b.recorded_at.localeCompare(a.recorded_at))
    .slice(0, 4);

  const fmtDate = (s: string) => {
    const parts = s.split('-');
    return `${parts[2]}/${parts[1]}`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Pending survey alert */}
      {assignment && assignment.status === 'pending' && (
        <div style={{
          background: 'rgba(196,98,45,0.08)',
          border: '1px solid rgba(196,98,45,0.2)',
          borderRadius: 10,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
        }}>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-terra)', marginBottom: 4 }}>
              📋 Cuestionario pendiente
            </div>
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>
              Tu nutricionista necesita que completes un cuestionario inicial.
            </div>
          </div>
          <Link
            href={`/dashboard/survey/${assignment.relationship_id}`}
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'white',
              background: 'var(--nc-terra)',
              borderRadius: 6,
              padding: '8px 16px',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            Completar →
          </Link>
        </div>
      )}

      {/* Top stats row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
        <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 8 }}>Latest weight</div>
          {weightLoading ? (
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>—</div>
          ) : latestWeight ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <span style={{ fontSize: 26, fontWeight: 600, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>{latestWeight.weight_kg}</span>
              <span style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>kg</span>
              {weightDelta !== null && (
                <span style={{ fontSize: 12, fontWeight: 500, color: weightDelta <= 0 ? '#2A7A4A' : '#C4622D', marginLeft: 2 }}>
                  {weightDelta > 0 ? '+' : ''}{weightDelta.toFixed(1)}
                </span>
              )}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>No entries yet</div>
          )}
          {latestWeight && <div style={{ fontSize: 11, color: 'var(--nc-stone)', marginTop: 2 }}>{fmtDate(latestWeight.recorded_at)}</div>}
        </div>

        <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 8 }}>Entries logged</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>{weightLoading ? '—' : weightEntries.length}</div>
          <div style={{ fontSize: 11, color: 'var(--nc-stone)', marginTop: 2 }}>weight readings</div>
        </div>

        <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '16px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.07em', color: 'var(--nc-stone)', textTransform: 'uppercase', marginBottom: 8 }}>Activities</div>
          <div style={{ fontSize: 26, fontWeight: 600, color: 'var(--nc-ink)', fontFamily: 'var(--font-display)' }}>{activityLoading ? '—' : activityEntries.length}</div>
          <div style={{ fontSize: 11, color: 'var(--nc-stone)', marginTop: 2 }}>sessions logged</div>
        </div>
      </div>

      {/* Upcoming appointments */}
      <UpcomingAppointments />

      {/* Health tracking graphs */}
      <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)' }}>Health Tracking</div>
          <Link href="/dashboard/client-profile" style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none', fontWeight: 500 }}>
            Log data →
          </Link>
        </div>

        {/* Tab buttons */}
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 20,
          borderBottom: '1px solid var(--nc-border)',
          paddingBottom: 0,
        }}>
          <button
            onClick={() => setActiveTab('weight')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === 'weight' ? 'var(--nc-forest)' : 'var(--nc-stone)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'weight' ? '2px solid var(--nc-forest)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            Weight
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              fontWeight: 500,
              color: activeTab === 'activity' ? 'var(--nc-forest)' : 'var(--nc-stone)',
              background: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'activity' ? '2px solid var(--nc-forest)' : '2px solid transparent',
              cursor: 'pointer',
              transition: 'color 0.2s, border-color 0.2s',
            }}
          >
            Activity
          </button>
        </div>

        {/* Graph content */}
        {activeTab === 'weight' ? (
          weightLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>
              Loading...
            </div>
          ) : (
            <WeightGraph entries={weightEntries} />
          )
        ) : (
          activityLoading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>
              Loading...
            </div>
          ) : (
            <ActivityGraph entries={activityEntries} />
          )
        )}
      </div>

      {/* Bottom row: recent activity + profile */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)' }}>Recent activity</div>
            <Link href="/dashboard/client-profile" style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none', fontWeight: 500 }}>
              Log →
            </Link>
          </div>
          {!activityLoading && recentActivity.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {recentActivity.map((e) => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(139,115,85,0.1)', paddingBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)' }}>{e.activity_type}</div>
                    <div style={{ fontSize: 11, color: 'var(--nc-stone)', fontWeight: 300 }}>{fmtDate(e.recorded_at)}</div>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300 }}>{e.duration_minutes} min</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ fontSize: 13, color: 'var(--nc-stone)', fontWeight: 300 }}>No activity logged yet.</div>
          )}
        </div>

        <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)' }}>Your profile</div>
            <Link href="/dashboard/client-profile" style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none', fontWeight: 500 }}>
              Edit →
            </Link>
          </div>
          <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 4 }}>{profile.display_name}</div>
          {profile.city && <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300, marginBottom: 8 }}>📍 {profile.city}</div>}
          {profile.goals.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
              {profile.goals.slice(0, 3).map((g) => (
                <span key={g} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 20, background: 'rgba(26,51,41,0.07)', color: 'var(--nc-forest)', fontWeight: 500 }}>{g}</span>
              ))}
            </div>
          )}
          {profile.activity_level && (
            <div style={{ fontSize: 12, color: 'var(--nc-stone)', fontWeight: 300, marginTop: 8 }}>
              Activity: {profile.activity_level.replace('_', ' ')}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

// ─── Nutritionist overview ────────────────────────────────────────────────────

function NutritionistOverview() {
  const { reviews, isLoading } = usePendingSurveyReviews();

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {!isLoading && reviews.length > 0 && (
        <div style={{
          background: 'rgba(196,98,45,0.08)',
          border: '1px solid rgba(196,98,45,0.2)',
          borderRadius: 10,
          padding: '16px 20px',
        }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--nc-terra)', marginBottom: 12 }}>
            📋 Encuestas completadas ({reviews.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {reviews.slice(0, 3).map((review) => (
              <Link
                key={review.assignment_id}
                href={`/dashboard/clients/${review.client_id}`}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'white',
                  border: '1px solid rgba(196,98,45,0.15)',
                  borderRadius: 6,
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--nc-ink)' }}>
                    {review.client_name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--nc-stone)', fontWeight: 300 }}>
                    Completado {new Date(review.completed_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div style={{ fontSize: 12, color: 'var(--nc-terra)', fontWeight: 500 }}>
                  Revisar →
                </div>
              </Link>
            ))}
          </div>
          {reviews.length > 3 && (
            <div style={{ fontSize: 12, color: 'var(--nc-stone)', marginTop: 8, textAlign: 'center' }}>
              Y {reviews.length - 3} más...
            </div>
          )}
        </div>
      )}

      <div style={{
        background: 'white',
        border: '1px solid var(--nc-border)',
        borderRadius: 10,
        padding: '20px 24px',
      }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--nc-ink)', marginBottom: 8 }}>
          Acciones rápidas
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <Link href="/dashboard/clients" style={{ fontSize: 13, color: 'var(--nc-terra)', textDecoration: 'none' }}>
            → Ver mis clientes
          </Link>
          <Link href="/dashboard/surveys" style={{ fontSize: 13, color: 'var(--nc-terra)', textDecoration: 'none' }}>
            → Gestionar encuestas
          </Link>
          <Link href="/dashboard/profile" style={{ fontSize: 13, color: 'var(--nc-terra)', textDecoration: 'none' }}>
            → Editar mi perfil
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <>
      <div className="dash-topbar">
        <div className="dash-topbar-title">Overview</div>
      </div>
      <div className="dash-content">
        {user?.role === 'client' && <ClientOverview />}
        {user?.role === 'nutritionist' && <NutritionistOverview />}
      </div>
    </>
  );
}

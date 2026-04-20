// frontend/app/dashboard/page.tsx
'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth';
import { useMyClientProfile, useWeightEntries, useActivityEntries } from '@/lib/client-profile';
import { UpcomingAppointments } from './components/UpcomingAppointments';
import { useMyRelationships } from '@/lib/hiring';
import { useSurveyAssignment, usePendingSurveyReviews } from '@/lib/survey';

// ─── Mini weight chart (SVG, no deps) ─────────────────────────────────────────

type MiniEntry = { id: string; weight_kg: number; recorded_at: string };

function MiniWeightChart({ entries }: { entries: MiniEntry[] }) {
  if (entries.length < 2) return null;
  const sorted = [...entries].sort((a, b) => a.recorded_at.localeCompare(b.recorded_at));
  const W = 300; const H = 60; const PX = 4; const PY = 4;
  const innerW = W - PX * 2; const innerH = H - PY * 2;
  const vals = sorted.map((e) => e.weight_kg);
  const minV = Math.min(...vals); const maxV = Math.max(...vals);
  const range = maxV - minV || 1;
  const toX = (i: number) => PX + (i / (sorted.length - 1)) * innerW;
  const toY = (v: number) => PY + innerH - ((v - minV) / range) * innerH;
  const pts = sorted.map((e, i) => `${toX(i)},${toY(e.weight_kg)}`).join(' ');
  const area = `${PX},${PY + innerH} ${pts} ${PX + innerW},${PY + innerH}`;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
      <polygon points={area} fill="rgba(26,51,41,0.07)" />
      <polyline points={pts} fill="none" stroke="#1A3329" strokeWidth={1.5} strokeLinejoin="round" strokeLinecap="round" />
      {sorted.map((e, i) => (
        <circle key={e.id} cx={toX(i)} cy={toY(e.weight_kg)} r={2.5} fill="#C4622D" />
      ))}
    </svg>
  );
}

// ─── Client overview ──────────────────────────────────────────────────────────

function ClientOverview() {
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

      {/* Weight chart card */}
      <div style={{ background: 'white', border: '1px solid var(--nc-border)', borderRadius: 10, padding: '20px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--nc-ink)' }}>Weight trend</div>
          <Link href="/dashboard/client-profile" style={{ fontSize: 12, color: 'var(--nc-terra)', textDecoration: 'none', fontWeight: 500 }}>
            Log weight →
          </Link>
        </div>
        {!weightLoading && sortedWeight.length >= 2 ? (
          <MiniWeightChart entries={sortedWeight} />
        ) : (
          <div style={{ height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300, borderTop: '1px dashed var(--nc-border)', borderBottom: '1px dashed var(--nc-border)' }}>
            Log at least 2 weights to see your trend
          </div>
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

'use client';

import { useState } from 'react';
import { useClientWeight, useClientActivity } from '@/lib/client-health';
import { WeightGraph, ActivityGraph } from './HealthGraph';
import type { WeightEntry, ActivityEntry } from '@/lib/types';

function WeightView({ entries, isLoading }: { entries: WeightEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return <div style={{ color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>Cargando…</div>;
  }

  // Show last 5 entries
  const recent = entries
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 5);

  return (
    <div>
      <WeightGraph entries={entries} />

      {recent.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--nc-stone)',
            marginBottom: 8
          }}>
            Entradas recientes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recent.map(e => (
              <div key={e.id} style={{
                fontSize: 13,
                color: 'var(--nc-ink)',
                fontWeight: 300,
                padding: '6px 0',
                borderBottom: '1px solid var(--nc-cream)',
              }}>
                <span style={{ fontWeight: 500 }}>{e.weight_kg} kg</span>
                {' · '}
                <span style={{ color: 'var(--nc-stone)' }}>
                  {new Date(e.recorded_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ActivityView({ entries, isLoading }: { entries: ActivityEntry[]; isLoading: boolean }) {
  if (isLoading) {
    return <div style={{ color: 'var(--nc-stone)', fontSize: 13, fontWeight: 300 }}>Cargando…</div>;
  }

  // Show last 5 entries
  const recent = entries
    .sort((a, b) => new Date(b.recorded_at).getTime() - new Date(a.recorded_at).getTime())
    .slice(0, 5);

  return (
    <div>
      <ActivityGraph entries={entries} />

      {recent.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <div style={{
            fontSize: 11,
            fontWeight: 600,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'var(--nc-stone)',
            marginBottom: 8
          }}>
            Entradas recientes
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {recent.map(e => (
              <div key={e.id} style={{
                fontSize: 13,
                color: 'var(--nc-ink)',
                fontWeight: 300,
                padding: '6px 0',
                borderBottom: '1px solid var(--nc-cream)',
              }}>
                <span style={{ fontWeight: 500 }}>{e.activity_type}</span>
                {' · '}
                <span>{e.duration_minutes} min</span>
                {' · '}
                <span style={{ color: 'var(--nc-stone)' }}>
                  {new Date(e.recorded_at).toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HealthTrackingSection({
  clientId,
  relationshipStatus
}: {
  clientId: string;
  relationshipStatus: string;
}) {
  const [activeTab, setActiveTab] = useState<'weight' | 'activity'>('weight');
  const [showFullHistory, setShowFullHistory] = useState(false);
  const days = showFullHistory ? 0 : 30;

  const { entries: weightEntries, isLoading: weightLoading } = useClientWeight(clientId, days);
  const { entries: activityEntries, isLoading: activityLoading } = useClientActivity(clientId, days);

  // Only render for active relationships
  if (relationshipStatus !== 'active') {
    return null;
  }

  return (
    <div className="dash-section">
      <div className="dash-section-head">
        <div className="dash-section-title">Health Tracking</div>
        <div className="dash-section-sub">Monitorea el peso y actividad física de tu cliente</div>
      </div>
      <div className="dash-section-body">
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
            Peso
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
            Actividad
          </button>
        </div>

        {/* Content */}
        {activeTab === 'weight' ? (
          <WeightView entries={weightEntries} isLoading={weightLoading} />
        ) : (
          <ActivityView entries={activityEntries} isLoading={activityLoading} />
        )}

        {/* Toggle full history */}
        <button
          onClick={() => setShowFullHistory(!showFullHistory)}
          style={{
            marginTop: 16,
            padding: '8px 16px',
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--nc-terra)',
            background: 'transparent',
            border: '1px solid var(--nc-border)',
            borderRadius: 6,
            cursor: 'pointer',
            transition: 'border-color 0.2s',
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--nc-terra)'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = 'var(--nc-border)'}
        >
          {showFullHistory ? '← Últimos 30 días' : 'Ver historial completo →'}
        </button>
      </div>
    </div>
  );
}

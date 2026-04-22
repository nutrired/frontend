import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { useTranslations, useLocale } from 'next-intl';
import type { WeightEntry, ActivityEntry } from '@/lib/types';

export function WeightGraph({ entries }: { entries: WeightEntry[] }) {
  const t = useTranslations('dashboard.client_detail');
  const locale = useLocale();
  const data = entries
    .sort((a, b) => new Date(a.recorded_at).getTime() - new Date(b.recorded_at).getTime())
    .map(e => ({
      date: new Date(e.recorded_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' }),
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
        {t('no_weight_data')}
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

export function ActivityGraph({ entries }: { entries: ActivityEntry[] }) {
  const t = useTranslations('dashboard.client_detail');
  const locale = useLocale();

  // Group by date, sum duration_minutes
  const grouped = entries.reduce((acc, e) => {
    const date = new Date(e.recorded_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' });
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += e.duration_minutes;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(grouped)
    .map(([date, minutes]) => ({ date, minutes }))
    .sort((a, b) => {
      // Sort by original date
      const entryA = entries.find(e => new Date(e.recorded_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) === a.date);
      const entryB = entries.find(e => new Date(e.recorded_at).toLocaleDateString(locale, { month: 'short', day: 'numeric' }) === b.date);
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
        {t('no_activity_data')}
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

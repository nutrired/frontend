// frontend/components/SearchFilterBar.tsx
'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface SearchFilterBarProps {
  onSearchChange: (search: string) => void;
  onStatusChange: (status: string) => void;
  onSortChange: (sort: string) => void;
  initialSearch?: string;
  initialStatus?: string;
  initialSort?: string;
}

export default function SearchFilterBar({
  onSearchChange,
  onStatusChange,
  onSortChange,
  initialSearch = '',
  initialStatus = '',
  initialSort = 'newest',
}: SearchFilterBarProps) {
  const t = useTranslations('dashboard.clients');
  const [searchInput, setSearchInput] = useState(initialSearch);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      onSearchChange(searchInput);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, onSearchChange]);

  return (
    <div style={{
      display: 'flex',
      gap: 12,
      marginBottom: 16,
      flexWrap: 'wrap',
    }}>
      {/* Search input */}
      <input
        type="text"
        placeholder={t('search_placeholder')}
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        style={{
          flex: '1 1 300px',
          height: 40,
          padding: '0 12px',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: 'var(--font-body)',
        }}
      />

      {/* Status filter */}
      <select
        value={initialStatus}
        onChange={(e) => onStatusChange(e.target.value)}
        style={{
          height: 40,
          padding: '0 12px',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        <option value="">{t('filter_all_statuses')}</option>
        <option value="active">{t('filter_active')}</option>
        <option value="pending_intro">{t('filter_pending')}</option>
      </select>

      {/* Sort dropdown */}
      <select
        value={initialSort}
        onChange={(e) => onSortChange(e.target.value)}
        style={{
          height: 40,
          padding: '0 12px',
          border: '1px solid rgba(139,115,85,0.2)',
          borderRadius: 6,
          fontSize: 14,
          fontFamily: 'var(--font-body)',
          background: 'white',
          cursor: 'pointer',
        }}
      >
        <option value="newest">{t('sort_newest')}</option>
        <option value="oldest">{t('sort_oldest')}</option>
        <option value="name_asc">{t('sort_name_asc')}</option>
        <option value="name_desc">{t('sort_name_desc')}</option>
      </select>
    </div>
  );
}

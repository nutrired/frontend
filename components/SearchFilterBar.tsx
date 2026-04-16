// frontend/components/SearchFilterBar.tsx
'use client';

import { useEffect, useState } from 'react';

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
        placeholder="Buscar por nombre o email…"
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
        <option value="">Todos los estados</option>
        <option value="active">Activos</option>
        <option value="pending_intro">Pendientes</option>
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
        <option value="newest">Más recientes</option>
        <option value="oldest">Más antiguos</option>
        <option value="name_asc">Nombre A-Z</option>
        <option value="name_desc">Nombre Z-A</option>
      </select>
    </div>
  );
}

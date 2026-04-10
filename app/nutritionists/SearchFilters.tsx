'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';

export function SearchFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [city, setCity] = useState(searchParams.get('city') ?? '');
  const [specialty, setSpecialty] = useState(searchParams.get('specialty') ?? '');
  const [language, setLanguage] = useState(searchParams.get('language') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? '');
  const [minPrice, setMinPrice] = useState(searchParams.get('min_price') ?? '');
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max_price') ?? '');

  // Sync state when URL changes (back/forward navigation).
  useEffect(() => {
    setQ(searchParams.get('q') ?? '');
    setCity(searchParams.get('city') ?? '');
    setSpecialty(searchParams.get('specialty') ?? '');
    setLanguage(searchParams.get('language') ?? '');
    setSort(searchParams.get('sort') ?? '');
    setMinPrice(searchParams.get('min_price') ?? '');
    setMaxPrice(searchParams.get('max_price') ?? '');
  }, [searchParams]);

  // Debounced live search: update URL 400 ms after the last keystroke.
  // Uses replace (not push) to avoid cluttering browser history while typing.
  // Skips the initial render so it doesn't fire on mount.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) { mounted.current = true; return; }
    const timer = setTimeout(() => {
      const params = new URLSearchParams();
      if (q) params.set('q', q);
      if (city) params.set('city', city);
      if (specialty) params.set('specialty', specialty);
      if (language) params.set('language', language);
      if (sort) params.set('sort', sort);
      if (minPrice) params.set('min_price', minPrice);
      if (maxPrice) params.set('max_price', maxPrice);
      params.set('page', '1');
      router.replace(`/nutritionists?${params.toString()}`);
    }, 400);
    return () => clearTimeout(timer);
  }, [q, city, specialty, language, sort, minPrice, maxPrice]); // eslint-disable-line react-hooks/exhaustive-deps

  const hasFilters = q || city || specialty || language || sort || minPrice || maxPrice;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (specialty) params.set('specialty', specialty);
    if (language) params.set('language', language);
    if (sort) params.set('sort', sort);
    if (minPrice) params.set('min_price', minPrice);
    if (maxPrice) params.set('max_price', maxPrice);
    params.set('page', '1');
    router.push(`/nutritionists?${params.toString()}`);
  }

  function handleClear() {
    router.push('/nutritionists');
  }

  return (
    <form className="nc-filters" onSubmit={handleSubmit}>
      <input
        className="nc-filter-input wide"
        type="text"
        placeholder="Search by name or keyword…"
        aria-label="Search by name or keyword"
        value={q}
        onChange={(e) => setQ(e.target.value)}
      />
      <input
        className="nc-filter-input medium"
        type="text"
        placeholder="City"
        aria-label="City"
        value={city}
        onChange={(e) => setCity(e.target.value)}
      />
      <input
        className="nc-filter-input medium"
        type="text"
        placeholder="Specialty"
        aria-label="Specialty"
        value={specialty}
        onChange={(e) => setSpecialty(e.target.value)}
      />
      <input
        className="nc-filter-input medium"
        type="text"
        placeholder="Language"
        aria-label="Language"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
      />
      <select
        className="nc-filter-select"
        aria-label="Sort order"
        value={sort}
        onChange={(e) => setSort(e.target.value)}
      >
        <option value="">Newest</option>
        <option value="price_asc">Price: low → high</option>
        <option value="price_desc">Price: high → low</option>
      </select>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <input
          className="nc-filter-input short"
          type="number"
          placeholder="Min €"
          aria-label="Minimum price in euros"
          min={0}
          step={1}
          max={9999}
          value={minPrice}
          onChange={(e) => setMinPrice(e.target.value)}
          style={{ width: 80 }}
        />
        <span style={{ color: 'var(--nc-stone)', fontSize: 13 }}>–</span>
        <input
          className="nc-filter-input short"
          type="number"
          placeholder="Max €"
          aria-label="Maximum price in euros"
          min={0}
          step={1}
          max={9999}
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{ width: 80 }}
        />
      </div>
      <button type="submit" className="nc-filter-btn">Search</button>
      {hasFilters && (
        <button
          type="button"
          onClick={handleClear}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'var(--nc-stone)',
            fontSize: 13,
            cursor: 'pointer',
            textDecoration: 'underline',
            padding: '0 4px',
          }}
        >
          Clear filters
        </button>
      )}
    </form>
  );
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import EventCard from '@/components/EventCard';
import MediaByteCard from '@/components/MediaByteCard';
import FilterBar from '@/components/FilterBar';
import type { Event, MediaByte } from '@/types';

export default function HomePage() {
  const t = useTranslations('home');
  const tEvents = useTranslations('events');
  const tCommon = useTranslations('common');

  const [events, setEvents] = useState<Event[]>([]);
  const [mediaBytes, setMediaBytes] = useState<MediaByte[]>([]);
  const [topConstituencies, setTopConstituencies] = useState<{ constituency: string; count: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<{
    state?: string;
    district?: string;
    constituency?: string;
    category?: string;
  }>({});

  // Fetch events
  useEffect(() => {
    const params = new URLSearchParams();
    if (filters.state) params.append('state', filters.state);
    if (filters.district) params.append('district', filters.district);
    if (filters.constituency) params.append('constituency', filters.constituency);
    if (filters.category) params.append('category', filters.category);
    params.append('limit', '12');

    fetch(`/api/events?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setEvents(data.items || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Error fetching events:', err);
        setLoading(false);
      });
  }, [filters]);

  // Fetch media bytes and top constituencies on mount
  useEffect(() => {
    // Media bytes
    fetch('/api/media-bytes?limit=4')
      .then((res) => res.json())
      .then((data) => setMediaBytes(data.items || []))
      .catch(console.error);

    // Top constituencies
    fetch('/api/analytics/top-constituencies?limit=5')
      .then((res) => res.json())
      .then((data) => setTopConstituencies(data.items || []))
      .catch(console.error);
  }, []);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setLoading(true);
  }, []);

  return (
    <>
      <FilterBar onFilterChange={handleFilterChange} />

      {/* Hero Section */}
      <section className="hero">
        <h1 className="hero-title">{t('title')}</h1>
        <p className="hero-subtitle">{t('subtitle')}</p>
      </section>

      {/* Featured Media Bytes - Leader Speaks */}
      {mediaBytes.length > 0 && (
        <section className="mb-8">
          <div className="section-header">
            <h2 className="section-title">{t('featuredLeaders')}</h2>
            <a href="/leader-speaks" className="btn btn-outline btn-sm">
              {tCommon('viewMore')}
            </a>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {mediaBytes.map((mb) => (
              <MediaByteCard key={mb.id} mediaByte={mb} />
            ))}
          </div>
        </section>
      )}

      <div className="grid lg:grid-cols-4 gap-8">
        {/* Main Event Feed */}
        <div className="lg:col-span-3">
          <div className="section-header">
            <h2 className="section-title">{t('latestEvents')}</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ aspectRatio: '16/9' }} />
                  <div className="p-4">
                    <div className="skeleton" style={{ height: '20px', width: '80%', marginBottom: '8px' }} />
                    <div className="skeleton" style={{ height: '16px', width: '60%' }} />
                  </div>
                </div>
              ))}
            </div>
          ) : events.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <svg className="empty-state-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <h3 className="empty-state-title">{tCommon('noResults')}</h3>
              <p className="empty-state-text">
                {tEvents('title')}
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="lg:col-span-1">
          <div className="card">
            <div className="card-header">
              <h3 className="text-lg font-semibold">{t('topConstituencies')}</h3>
            </div>
            <div className="card-body">
              {topConstituencies.length > 0 ? (
                <ul className="space-y-3">
                  {topConstituencies.map((item, index) => (
                    <li key={item.constituency} className="flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        <span className="text-primary font-bold">{index + 1}.</span>
                        <span className="text-sm">{item.constituency}</span>
                      </span>
                      <span className="badge badge-info">{item.count}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-gray-500 text-sm">{tCommon('noResults')}</p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

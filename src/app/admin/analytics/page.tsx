'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    LineChart,
    Line,
} from 'recharts';

interface AnalyticsData {
    totalEvents: number;
    eventsLast7Days: number;
    eventsLast30Days: number;
    eventsByDistrict: Array<{ district: string; count: number }>;
    topConstituencies: Array<{ constituency: string; count: number }>;
    topCadres: Array<{ id: string; name: string; eventCount: number }>;
    mediaByteViews: number;
    eventsOverTime: Array<{ date: string; count: number }>;
    eventsByCategory: Record<string, number>;
}

export default function AnalyticsPage() {
    const t = useTranslations('analytics');
    const [data, setData] = useState<AnalyticsData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/analytics')
            .then((res) => res.json())
            .then((data) => {
                setData(data);
                setLoading(false);
            })
            .catch((err) => {
                console.error('Error fetching analytics:', err);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!data) {
        return <div>Failed to load analytics</div>;
    }

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t('title')}</h1>

            {/* Stats Cards */}
            <div className="stats-grid mb-8">
                <div className="stat-card">
                    <div className="stat-value">{data.totalEvents}</div>
                    <div className="stat-label">{t('totalEvents')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data.eventsLast7Days}</div>
                    <div className="stat-label">{t('eventsLast7Days')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data.eventsLast30Days}</div>
                    <div className="stat-label">{t('eventsLast30Days')}</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{data.mediaByteViews.toLocaleString()}</div>
                    <div className="stat-label">{t('mediaByteViews')}</div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6 mb-8">
                {/* Events by District Chart */}
                <div className="chart-container">
                    <h3 className="chart-title">{t('eventsByDistrict')}</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.eventsByDistrict.slice(0, 10)} layout="vertical">
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis dataKey="district" type="category" width={100} tick={{ fontSize: 12 }} />
                                <Tooltip />
                                <Bar dataKey="count" fill="#FFD700" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Events Over Time Chart */}
                <div className="chart-container">
                    <h3 className="chart-title">{t('eventsOverTime')}</h3>
                    <div style={{ height: '300px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data.eventsOverTime}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                                <YAxis />
                                <Tooltip />
                                <Line type="monotone" dataKey="count" stroke="#1E3A5F" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Top Constituencies */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold">{t('topConstituencies')}</h3>
                    </div>
                    <div className="card-body">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Constituency</th>
                                    <th>Events</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topConstituencies.map((item, index) => (
                                    <tr key={item.constituency}>
                                        <td>{index + 1}</td>
                                        <td>{item.constituency}</td>
                                        <td>
                                            <span className="badge badge-info">{item.count}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Top Cadres */}
                <div className="card">
                    <div className="card-header">
                        <h3 className="font-semibold">{t('topCadres')}</h3>
                    </div>
                    <div className="card-body">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Name</th>
                                    <th>Events</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topCadres.map((cadre, index) => (
                                    <tr key={cadre.id}>
                                        <td>{index + 1}</td>
                                        <td>{cadre.name}</td>
                                        <td>
                                            <span className="badge badge-success">{cadre.eventCount}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}

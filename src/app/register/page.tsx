'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { State, District, Constituency } from '@/types';

export default function RegisterPage() {
    const t = useTranslations('auth');
    const tCommon = useTranslations('common');
    const router = useRouter();

    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        password: '',
        confirmPassword: '',
        inviteCode: '',
        state: '',
        district: '',
        constituency: '',
    });

    const [states, setStates] = useState<State[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [constituencies, setConstituencies] = useState<Constituency[]>([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Fetch states
    useEffect(() => {
        fetch('/api/locations/states')
            .then((res) => res.json())
            .then((data) => setStates(data.items || []))
            .catch(console.error);
    }, []);

    // Fetch districts when state changes
    useEffect(() => {
        if (formData.state) {
            fetch(`/api/locations/districts?stateId=${formData.state}`)
                .then((res) => res.json())
                .then((data) => setDistricts(data.items || []))
                .catch(console.error);
        } else {
            setDistricts([]);
        }
        setFormData(prev => ({ ...prev, district: '', constituency: '' }));
    }, [formData.state]);

    // Fetch constituencies when district changes
    useEffect(() => {
        if (formData.district) {
            fetch(`/api/locations/constituencies?districtId=${formData.district}`)
                .then((res) => res.json())
                .then((data) => setConstituencies(data.items || []))
                .catch(console.error);
        } else {
            setConstituencies([]);
        }
        setFormData(prev => ({ ...prev, constituency: '' }));
    }, [formData.district]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        try {
            const res = await fetch('/api/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.name,
                    mobile: formData.mobile,
                    password: formData.password,
                    inviteCode: formData.inviteCode,
                    state: states.find(s => s.id === formData.state)?.name || '',
                    district: districts.find(d => d.id === formData.district)?.name || '',
                    constituency: constituencies.find(c => c.id === formData.constituency)?.name || '',
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return;
            }

            // Redirect to login
            router.push('/login?registered=true');
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-8">
            <div className="card" style={{ width: '100%', maxWidth: '500px' }}>
                <div className="card-header text-center">
                    <h1 className="text-2xl font-bold text-primary">{t('register')}</h1>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="badge badge-error mb-4" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">{t('inviteCode')} *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.inviteCode}
                                onChange={(e) => setFormData({ ...formData, inviteCode: e.target.value.toUpperCase() })}
                                placeholder="XXXXXXXX"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('name')} *</label>
                            <input
                                type="text"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('mobile')} *</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={formData.mobile}
                                onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                                placeholder="9876543210"
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">{t('password')} *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    minLength={6}
                                    required
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">{t('confirmPassword')} *</label>
                                <input
                                    type="password"
                                    className="form-input"
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        </div>

                        <hr style={{ margin: '24px 0', border: 'none', borderTop: '1px solid #e5e7eb' }} />

                        <div className="form-group">
                            <label className="form-label">{tCommon('selectState')}</label>
                            <select
                                className="form-select"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                            >
                                <option value="">{tCommon('selectState')}</option>
                                {states.map((state) => (
                                    <option key={state.id} value={state.id}>
                                        {state.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="form-group">
                                <label className="form-label">{tCommon('selectDistrict')}</label>
                                <select
                                    className="form-select"
                                    value={formData.district}
                                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                    disabled={!formData.state}
                                >
                                    <option value="">{tCommon('selectDistrict')}</option>
                                    {districts.map((district) => (
                                        <option key={district.id} value={district.id}>
                                            {district.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">{tCommon('selectConstituency')}</label>
                                <select
                                    className="form-select"
                                    value={formData.constituency}
                                    onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                                    disabled={!formData.district}
                                >
                                    <option value="">{tCommon('selectConstituency')}</option>
                                    {constituencies.map((constituency) => (
                                        <option key={constituency.id} value={constituency.id}>
                                            {constituency.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                            disabled={loading}
                        >
                            {loading ? '...' : t('registerButton')}
                        </button>
                    </form>

                    <p className="text-center mt-4 text-sm text-gray-500">
                        {t('hasAccount')}{' '}
                        <Link href="/login" className="text-primary font-medium">
                            {t('login')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

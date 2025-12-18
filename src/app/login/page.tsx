'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function LoginPage() {
    const t = useTranslations('auth');
    const router = useRouter();

    const [mobile, setMobile] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await signIn('credentials', {
                mobile,
                password,
                redirect: false,
            });

            if (result?.error) {
                setError(t('invalidCredentials'));
            } else {
                router.push('/dashboard');
                router.refresh();
            }
        } catch (err) {
            setError(t('invalidCredentials'));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <div className="card-header text-center">
                    <h1 className="text-2xl font-bold text-primary">{t('login')}</h1>
                </div>
                <div className="card-body">
                    <form onSubmit={handleSubmit}>
                        {error && (
                            <div className="badge badge-error mb-4" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                                {error}
                            </div>
                        )}

                        <div className="form-group">
                            <label className="form-label">{t('mobile')}</label>
                            <input
                                type="tel"
                                className="form-input"
                                value={mobile}
                                onChange={(e) => setMobile(e.target.value)}
                                placeholder="9876543210"
                                pattern="[0-9]{10}"
                                required
                            />
                        </div>

                        <div className="form-group">
                            <label className="form-label">{t('password')}</label>
                            <input
                                type="password"
                                className="form-input"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn btn-primary"
                            style={{ width: '100%', marginTop: '16px' }}
                            disabled={loading}
                        >
                            {loading ? '...' : t('loginButton')}
                        </button>
                    </form>

                    <p className="text-center mt-4 text-sm text-gray-500">
                        {t('noAccount')}{' '}
                        <Link href="/register" className="text-primary font-medium">
                            {t('register')}
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
}

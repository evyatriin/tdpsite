'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

export default function CreateMediaBytePage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations('mediaBytes');

    const [youtubeUrl, setYoutubeUrl] = useState('');
    const [message, setMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not Leader
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'LEADER') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!youtubeUrl.trim()) {
            setError('YouTube URL is required');
            return;
        }

        setSubmitting(true);

        try {
            const formData = new FormData();
            formData.append('youtubeUrl', youtubeUrl);
            if (message) formData.append('message', message);

            const res = await fetch('/api/media-bytes', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to create media byte');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create media byte');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('createMediaByte')}</h1>

            <form onSubmit={handleSubmit} className="card">
                <div className="card-body">
                    {error && (
                        <div className="badge badge-error mb-4" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* YouTube URL */}
                    <div className="form-group">
                        <label className="form-label">{t('videoUrl')} *</label>
                        <input
                            type="url"
                            className="form-input"
                            value={youtubeUrl}
                            onChange={(e) => setYoutubeUrl(e.target.value)}
                            placeholder="https://www.youtube.com/watch?v=..."
                            required
                        />
                        <div className="form-hint">
                            Paste a YouTube video URL
                        </div>
                    </div>

                    {/* Message */}
                    <div className="form-group">
                        <label className="form-label">{t('message')}</label>
                        <textarea
                            className="form-textarea"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={4}
                            placeholder="Add an optional message..."
                        />
                    </div>

                    {/* Submit */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : t('createMediaByte')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

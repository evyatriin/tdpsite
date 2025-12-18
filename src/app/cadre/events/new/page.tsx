'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import type { State, District, Constituency, SocialPlatform } from '@/types';

export default function CreateEventPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const t = useTranslations('events');
    const tCommon = useTranslations('common');

    const [formData, setFormData] = useState({
        title: '',
        category: 'OUTREACH' as const,
        description: '',
        state: '',
        district: '',
        constituency: '',
    });

    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);
    const [socialLinks, setSocialLinks] = useState<Array<{ platform: SocialPlatform; url: string }>>([]);

    const [states, setStates] = useState<State[]>([]);
    const [districts, setDistricts] = useState<District[]>([]);
    const [constituencies, setConstituencies] = useState<Constituency[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    // Redirect if not Cadre
    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated' && session?.user?.role !== 'CADRE') {
            router.push('/dashboard');
        }
    }, [status, session, router]);

    // Fetch states
    useEffect(() => {
        fetch('/api/locations/states')
            .then((res) => res.json())
            .then((data) => setStates(data.items || []))
            .catch(console.error);
    }, []);

    // Fetch districts
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

    // Fetch constituencies
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

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 5) {
            setError('Maximum 5 images allowed');
            return;
        }

        const newImages = [...images, ...files].slice(0, 5);
        setImages(newImages);

        // Generate previews
        const previews = newImages.map(file => URL.createObjectURL(file));
        setImagePreviews(previews);
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        const newPreviews = imagePreviews.filter((_, i) => i !== index);
        setImages(newImages);
        setImagePreviews(newPreviews);
    };

    const addSocialLink = () => {
        setSocialLinks([...socialLinks, { platform: 'YOUTUBE', url: '' }]);
    };

    const updateSocialLink = (index: number, field: 'platform' | 'url', value: string) => {
        const updated = [...socialLinks];
        updated[index] = { ...updated[index], [field]: value };
        setSocialLinks(updated);
    };

    const removeSocialLink = (index: number) => {
        setSocialLinks(socialLinks.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (images.length === 0) {
            setError('At least one image is required');
            return;
        }

        if (formData.description.length > 500) {
            setError('Description must be 500 characters or less');
            return;
        }

        setSubmitting(true);

        try {
            const data = new FormData();
            data.append('title', formData.title);
            data.append('category', formData.category);
            data.append('description', formData.description);
            data.append('state', states.find(s => s.id === formData.state)?.name || '');
            data.append('district', districts.find(d => d.id === formData.district)?.name || '');
            data.append('constituency', constituencies.find(c => c.id === formData.constituency)?.name || '');

            images.forEach(img => data.append('images', img));

            const validLinks = socialLinks.filter(link => link.url.trim());
            if (validLinks.length > 0) {
                data.append('socialLinks', JSON.stringify(validLinks));
            }

            const res = await fetch('/api/events', {
                method: 'POST',
                body: data,
            });

            if (!res.ok) {
                const result = await res.json();
                throw new Error(result.error || 'Failed to create event');
            }

            router.push('/dashboard');
        } catch (err: any) {
            setError(err.message || 'Failed to create event');
        } finally {
            setSubmitting(false);
        }
    };

    if (status === 'loading') {
        return <div className="flex items-center justify-center min-h-[60vh]">Loading...</div>;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h1 className="text-2xl font-bold mb-6">{t('createEvent')}</h1>

            <form onSubmit={handleSubmit} className="card">
                <div className="card-body">
                    {error && (
                        <div className="badge badge-error mb-4" style={{ display: 'block', padding: '12px', textAlign: 'center' }}>
                            {error}
                        </div>
                    )}

                    {/* Title */}
                    <div className="form-group">
                        <label className="form-label">{t('eventTitle')} *</label>
                        <input
                            type="text"
                            className="form-input"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            required
                            maxLength={100}
                        />
                    </div>

                    {/* Category */}
                    <div className="form-group">
                        <label className="form-label">{t('category')} *</label>
                        <select
                            className="form-select"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as any })}
                            required
                        >
                            <option value="OUTREACH">{t('categories.OUTREACH')}</option>
                            <option value="WELFARE">{t('categories.WELFARE')}</option>
                            <option value="MEETING">{t('categories.MEETING')}</option>
                            <option value="PROTEST">{t('categories.PROTEST')}</option>
                            <option value="SOCIAL_SERVICE">{t('categories.SOCIAL_SERVICE')}</option>
                        </select>
                    </div>

                    {/* Description */}
                    <div className="form-group">
                        <label className="form-label">{t('description')} *</label>
                        <textarea
                            className="form-textarea"
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                            maxLength={500}
                            rows={4}
                        />
                        <div className="form-hint">
                            {formData.description.length}/500 characters
                        </div>
                    </div>

                    {/* Location */}
                    <h3 className="font-semibold mt-6 mb-3">{t('location')}</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="form-group">
                            <label className="form-label">{tCommon('selectState')} *</label>
                            <select
                                className="form-select"
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                required
                            >
                                <option value="">{tCommon('selectState')}</option>
                                {states.map((state) => (
                                    <option key={state.id} value={state.id}>{state.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{tCommon('selectDistrict')} *</label>
                            <select
                                className="form-select"
                                value={formData.district}
                                onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                                disabled={!formData.state}
                                required
                            >
                                <option value="">{tCommon('selectDistrict')}</option>
                                {districts.map((district) => (
                                    <option key={district.id} value={district.id}>{district.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">{tCommon('selectConstituency')} *</label>
                            <select
                                className="form-select"
                                value={formData.constituency}
                                onChange={(e) => setFormData({ ...formData, constituency: e.target.value })}
                                disabled={!formData.district}
                                required
                            >
                                <option value="">{tCommon('selectConstituency')}</option>
                                {constituencies.map((constituency) => (
                                    <option key={constituency.id} value={constituency.id}>{constituency.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Images */}
                    <h3 className="font-semibold mt-6 mb-3">{t('images')} (1-5 required)</h3>
                    <div className="image-upload" onClick={() => document.getElementById('image-input')?.click()}>
                        <svg className="image-upload-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <polyline points="21 15 16 10 5 21" />
                        </svg>
                        <p className="image-upload-text">{t('addImage')}</p>
                        <p className="image-upload-hint">Click to upload (max 5 images)</p>
                    </div>
                    <input
                        id="image-input"
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleImageChange}
                        className="hidden"
                    />

                    {imagePreviews.length > 0 && (
                        <div className="image-preview-grid">
                            {imagePreviews.map((preview, index) => (
                                <div key={index} className="image-preview-item">
                                    <img src={preview} alt={`Preview ${index + 1}`} />
                                    <button
                                        type="button"
                                        className="image-preview-remove"
                                        onClick={() => removeImage(index)}
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Social Links */}
                    <h3 className="font-semibold mt-6 mb-3">{t('socialLinks')} (optional)</h3>
                    {socialLinks.map((link, index) => (
                        <div key={index} className="flex gap-2 mb-2">
                            <select
                                className="form-select"
                                style={{ width: '120px' }}
                                value={link.platform}
                                onChange={(e) => updateSocialLink(index, 'platform', e.target.value)}
                            >
                                <option value="YOUTUBE">YouTube</option>
                                <option value="TWITTER">X (Twitter)</option>
                                <option value="FACEBOOK">Facebook</option>
                                <option value="INSTAGRAM">Instagram</option>
                            </select>
                            <input
                                type="url"
                                className="form-input"
                                value={link.url}
                                onChange={(e) => updateSocialLink(index, 'url', e.target.value)}
                                placeholder="https://..."
                            />
                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={() => removeSocialLink(index)}
                            >
                                ×
                            </button>
                        </div>
                    ))}
                    <button
                        type="button"
                        className="btn btn-outline btn-sm"
                        onClick={addSocialLink}
                    >
                        + {t('addSocialLink')}
                    </button>

                    {/* Submit */}
                    <div className="mt-8">
                        <button
                            type="submit"
                            className="btn btn-primary btn-lg"
                            style={{ width: '100%' }}
                            disabled={submitting}
                        >
                            {submitting ? 'Creating...' : t('createEvent')}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}

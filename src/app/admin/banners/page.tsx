'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

interface BannerImage {
    id: string;
    url: string;
    title: string | null;
    link: string | null;
    order: number;
    isActive: boolean;
}

export default function BannersPage() {
    const t = useTranslations('admin');
    const [banners, setBanners] = useState<BannerImage[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newLink, setNewLink] = useState('');

    const fetchBanners = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/admin/banners');
            const data = await res.json();
            setBanners(data.items || []);
        } catch (error) {
            console.error('Error fetching banners:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBanners();
    }, []);

    const handleUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        formData.append('order', String(banners.length));

        setUploading(true);
        try {
            const res = await fetch('/api/admin/banners', {
                method: 'POST',
                body: formData,
            });

            if (res.ok) {
                setNewTitle('');
                setNewLink('');
                form.reset();
                fetchBanners();
            }
        } catch (error) {
            console.error('Error uploading banner:', error);
        } finally {
            setUploading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this banner?')) return;

        try {
            await fetch(`/api/admin/banners?id=${id}`, { method: 'DELETE' });
            fetchBanners();
        } catch (error) {
            console.error('Error deleting banner:', error);
        }
    };

    const handleToggleActive = async (id: string, isActive: boolean) => {
        try {
            await fetch('/api/admin/banners', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, isActive: !isActive }),
            });
            fetchBanners();
        } catch (error) {
            console.error('Error toggling banner:', error);
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold mb-6">{t('bannerManagement')}</h1>

            {/* Upload New Banner */}
            <div className="card mb-6">
                <div className="card-header">
                    <h3 className="font-semibold">Add New Banner</h3>
                </div>
                <div className="card-body">
                    <form onSubmit={handleUpload}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Banner Image *</label>
                                <input
                                    type="file"
                                    name="image"
                                    accept="image/*"
                                    className="form-input"
                                    required
                                />
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Title (optional)</label>
                                <input
                                    type="text"
                                    name="title"
                                    className="form-input"
                                    value={newTitle}
                                    onChange={(e) => setNewTitle(e.target.value)}
                                    placeholder="Banner title"
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Link URL (optional)</label>
                            <input
                                type="url"
                                name="link"
                                className="form-input"
                                value={newLink}
                                onChange={(e) => setNewLink(e.target.value)}
                                placeholder="https://..."
                            />
                        </div>
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={uploading}
                        >
                            {uploading ? 'Uploading...' : 'Upload Banner'}
                        </button>
                    </form>
                </div>
            </div>

            {/* Banner List */}
            <div className="card">
                <div className="card-header">
                    <h3 className="font-semibold">Current Banners ({banners.length})</h3>
                </div>
                <div className="card-body">
                    {loading ? (
                        <div className="text-center py-8">Loading...</div>
                    ) : banners.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {banners.map((banner, index) => (
                                <div key={banner.id} className="border rounded-lg overflow-hidden">
                                    <img
                                        src={banner.url}
                                        alt={banner.title || `Banner ${index + 1}`}
                                        className="w-full h-32 object-cover"
                                    />
                                    <div className="p-3">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-medium">
                                                {banner.title || `Banner ${index + 1}`}
                                            </span>
                                            <span className={`badge ${banner.isActive ? 'badge-success' : 'badge-warning'}`}>
                                                {banner.isActive ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleToggleActive(banner.id, banner.isActive)}
                                                className="btn btn-sm btn-outline"
                                            >
                                                {banner.isActive ? 'Disable' : 'Enable'}
                                            </button>
                                            <button
                                                onClick={() => handleDelete(banner.id)}
                                                className="btn btn-sm"
                                                style={{ background: 'var(--color-error)', color: 'white' }}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <h3 className="empty-state-title">No banners</h3>
                            <p className="empty-state-text">Upload your first banner image to display on the homepage carousel.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

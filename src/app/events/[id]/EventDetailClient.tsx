'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import { formatDistanceToNow, format } from 'date-fns';
import ShareButtons from '@/components/ShareButtons';
// Define inline type to match Prisma query result
interface EventWithRelations {
    id: string;
    title: string;
    category: string;
    description: string;
    state: string;
    district: string;
    constituency: string;
    status: string;
    language: string;
    createdAt: Date;
    updatedAt: Date;
    userId: string;
    user?: { id: string; name: string };
    images: Array<{ id: string; url: string; order: number }>;
    socialLinks?: Array<{ id: string; platform: string; url: string; thumbnailUrl?: string | null }>;
    comments: Array<{
        id: string;
        content: string;
        createdAt: Date;
        user?: { id: string; name: string };
    }>;
}

interface Props {
    event: EventWithRelations;
}

export default function EventDetailClient({ event }: Props) {
    const { data: session } = useSession();
    const t = useTranslations('events');
    const tComments = useTranslations('comments');
    const tCommon = useTranslations('common');

    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [comments, setComments] = useState(event.comments);
    const [newComment, setNewComment] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const categoryLabels: Record<string, string> = {
        OUTREACH: t('categories.OUTREACH'),
        WELFARE: t('categories.WELFARE'),
        MEETING: t('categories.MEETING'),
        PROTEST: t('categories.PROTEST'),
        SOCIAL_SERVICE: t('categories.SOCIAL_SERVICE'),
    };

    const canComment = session?.user?.role === 'CADRE' || session?.user?.role === 'LEADER';

    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || !canComment) return;

        setSubmitting(true);
        try {
            const res = await fetch('/api/comments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    content: newComment,
                    eventId: event.id,
                }),
            });

            if (res.ok) {
                const { comment } = await res.json();
                setComments([comment, ...comments]);
                setNewComment('');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const eventUrl = `${process.env.NEXT_PUBLIC_APP_URL}/events/${event.id}`;

    return (
        <article className="max-w-4xl mx-auto">
            {/* Image Gallery */}
            {event.images.length > 0 && (
                <div className="image-gallery mb-6">
                    <Image
                        src={event.images[currentImageIndex]?.url || '/placeholder-event.jpg'}
                        alt={event.title}
                        fill
                        className="image-gallery-main"
                        priority
                    />
                    {event.images.length > 1 && (
                        <div className="image-gallery-nav">
                            {event.images.map((_, index) => (
                                <button
                                    key={index}
                                    className={`image-gallery-dot ${index === currentImageIndex ? 'active' : ''}`}
                                    onClick={() => setCurrentImageIndex(index)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* Event Info */}
            <div className="card mb-6">
                <div className="card-body">
                    <span className="badge badge-info mb-3">
                        {categoryLabels[event.category] || event.category}
                    </span>

                    <h1 className="text-3xl font-bold mb-4">{event.title}</h1>

                    <div className="flex items-center gap-4 text-gray-500 mb-4">
                        <span className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                            </svg>
                            {event.constituency}, {event.district}, {event.state}
                        </span>
                        <span className="flex items-center gap-1">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {format(new Date(event.createdAt), 'PPP')}
                        </span>
                    </div>

                    <p className="text-gray-700 whitespace-pre-wrap mb-6">{event.description}</p>

                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                            {t('postedBy')} <strong>{event.user?.name}</strong>
                        </span>
                        <ShareButtons url={eventUrl} title={event.title} />
                    </div>
                </div>
            </div>

            {/* Social Links */}
            {event.socialLinks && event.socialLinks.length > 0 && (
                <div className="card mb-6">
                    <div className="card-header">
                        <h3 className="font-semibold">{t('socialLinks')}</h3>
                    </div>
                    <div className="card-body">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {event.socialLinks.map((link) => (
                                <a
                                    key={link.id}
                                    href={link.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                                >
                                    {link.thumbnailUrl && (
                                        <img
                                            src={link.thumbnailUrl}
                                            alt={link.platform}
                                            className="w-20 h-12 object-cover rounded"
                                        />
                                    )}
                                    <div>
                                        <span className="font-medium">{link.platform}</span>
                                        <p className="text-xs text-gray-500 truncate" style={{ maxWidth: '150px' }}>
                                            {link.url}
                                        </p>
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Comments */}
            <div className="card">
                <div className="card-header">
                    <h3 className="font-semibold">{tComments('title')} ({comments.length})</h3>
                </div>
                <div className="card-body">
                    {canComment ? (
                        <form onSubmit={handleAddComment} className="comment-form mb-6">
                            <input
                                type="text"
                                className="comment-input"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder={tComments('addComment')}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={submitting || !newComment.trim()}
                            >
                                {tComments('postComment')}
                            </button>
                        </form>
                    ) : session ? null : (
                        <p className="text-center text-gray-500 mb-6">
                            {tComments('loginToComment')}
                        </p>
                    )}

                    {comments.length > 0 ? (
                        <div className="comments-list">
                            {comments.map((comment) => (
                                <div key={comment.id} className="comment-item">
                                    <div className="comment-avatar">
                                        {comment.user?.name?.charAt(0).toUpperCase() || '?'}
                                    </div>
                                    <div className="comment-content">
                                        <div className="comment-author">{comment.user?.name || 'Unknown'}</div>
                                        <p className="comment-text">{comment.content}</p>
                                        <div className="comment-time">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-center text-gray-500">{tComments('noComments')}</p>
                    )}
                </div>
            </div>
        </article>
    );
}

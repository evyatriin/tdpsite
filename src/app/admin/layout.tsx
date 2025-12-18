'use client';

import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import { useTranslations } from 'next-intl';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession();
    const router = useRouter();
    const pathname = usePathname();
    const t = useTranslations('admin');

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        } else if (status === 'authenticated') {
            const role = session?.user?.role;
            if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
                router.push('/dashboard');
            }
        }
    }, [status, session, router]);

    if (status === 'loading') {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
        return null;
    }

    const sidebarLinks = [
        { href: '/admin', label: t('title'), icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
        { href: '/admin/users', label: t('users'), icon: 'M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M9 7a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75' },
        { href: '/admin/invites', label: t('invites'), icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
        { href: '/admin/banners', label: t('bannerManagement'), icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
        { href: '/admin/moderation', label: t('moderation'), icon: 'M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12' },
        { href: '/admin/analytics', label: t('analytics'), icon: 'M18 20V10M12 20V4M6 20v-6' },
    ];

    return (
        <div className="admin-layout" style={{ marginLeft: '-1rem', marginRight: '-1rem' }}>
            <aside className="admin-sidebar">
                <h2 className="text-xl font-bold mb-6">{t('title')}</h2>
                <nav>
                    {sidebarLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`admin-sidebar-link ${pathname === link.href ? 'active' : ''}`}
                        >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d={link.icon} />
                            </svg>
                            {link.label}
                        </Link>
                    ))}
                </nav>
            </aside>
            <main className="admin-content">{children}</main>
        </div>
    );
}

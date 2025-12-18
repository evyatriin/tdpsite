'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { useTranslations } from 'next-intl';
import LanguageToggle from './LanguageToggle';

export default function Navbar() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();
    const t = useTranslations('nav');

    const isActive = (path: string) => pathname === path;

    const navLinks = [
        { href: '/', label: t('home') },
        { href: '/leader-speaks', label: t('leaderSpeaks') },
        { href: '/leaders', label: t('leaders') },
    ];

    const isAdmin = session?.user?.role === 'ADMIN' || session?.user?.role === 'SUPER_ADMIN';

    return (
        <>
            <nav className="navbar">
                <div className="navbar-container">
                    <Link href="/" className="navbar-brand">
                        <span>TDP</span>
                    </Link>

                    <div className="navbar-nav">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`navbar-link ${isActive(link.href) ? 'active' : ''}`}
                            >
                                {link.label}
                            </Link>
                        ))}
                        {isAdmin && (
                            <Link
                                href="/admin"
                                className={`navbar-link ${pathname.startsWith('/admin') ? 'active' : ''}`}
                            >
                                {t('admin')}
                            </Link>
                        )}
                    </div>

                    <div className="navbar-actions">
                        <LanguageToggle />

                        {session ? (
                            <div className="flex items-center gap-3">
                                <Link href="/dashboard" className="btn btn-ghost">
                                    {t('dashboard')}
                                </Link>
                                <button onClick={() => signOut()} className="btn btn-outline">
                                    {t('logout')}
                                </button>
                            </div>
                        ) : (
                            <Link href="/login" className="btn btn-secondary">
                                {t('login')}
                            </Link>
                        )}

                        <button
                            className="mobile-menu-btn"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label="Toggle menu"
                        >
                            <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                {mobileMenuOpen ? (
                                    <path d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </nav>

            {/* Mobile Menu */}
            <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
                <div className="mobile-menu-nav">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className="mobile-menu-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {link.label}
                        </Link>
                    ))}
                    {isAdmin && (
                        <Link
                            href="/admin"
                            className="mobile-menu-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('admin')}
                        </Link>
                    )}
                    {session ? (
                        <>
                            <Link
                                href="/dashboard"
                                className="mobile-menu-link"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {t('dashboard')}
                            </Link>
                            <button
                                onClick={() => {
                                    signOut();
                                    setMobileMenuOpen(false);
                                }}
                                className="mobile-menu-link"
                                style={{ textAlign: 'left', width: '100%' }}
                            >
                                {t('logout')}
                            </button>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            className="mobile-menu-link"
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            {t('login')}
                        </Link>
                    )}
                </div>
            </div>
        </>
    );
}

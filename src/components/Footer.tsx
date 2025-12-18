'use client';

import { useTranslations } from 'next-intl';

export default function Footer() {
    const t = useTranslations('nav');
    const year = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-brand">
                    TDP - Telugu Desam Party
                </div>
                <div className="footer-links">
                    <a href="/" className="footer-link">{t('home')}</a>
                    <a href="/leader-speaks" className="footer-link">{t('leaderSpeaks')}</a>
                    <a href="/leaders" className="footer-link">{t('leaders')}</a>
                </div>
                <div className="footer-copyright">
                    © {year} Telugu Desam Party. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

'use client';

import { useTransition } from 'react';
import { locales, localeNames, type Locale } from '@/i18n/config';

export default function LanguageToggle() {
    const [isPending, startTransition] = useTransition();

    const setLocale = (locale: Locale) => {
        startTransition(() => {
            document.cookie = `locale=${locale};path=/;max-age=31536000`;
            window.location.reload();
        });
    };

    // Get current locale from cookie
    const getCurrentLocale = (): Locale => {
        if (typeof document === 'undefined') return 'en';
        const match = document.cookie.match(/locale=([^;]+)/);
        return (match?.[1] as Locale) || 'en';
    };

    const currentLocale = getCurrentLocale();

    return (
        <div className="lang-toggle">
            {locales.map((locale) => (
                <button
                    key={locale}
                    onClick={() => setLocale(locale)}
                    className={`lang-btn ${currentLocale === locale ? 'active' : ''}`}
                    disabled={isPending}
                >
                    {localeNames[locale]}
                </button>
            ))}
        </div>
    );
}

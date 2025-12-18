import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'te'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'en';

export const localeNames: Record<Locale, string> = {
    en: 'English',
    te: 'తెలుగు',
};

export default getRequestConfig(async ({ requestLocale }) => {
    // Use the request locale or fallback to default
    const locale = (await requestLocale) || defaultLocale;

    return {
        locale,
        messages: (await import(`./messages/${locale}.json`)).default,
    };
});

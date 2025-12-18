import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import './globals.css';

export const metadata: Metadata = {
  title: 'TDP - Telugu Desam Party | Ground Activity • Digital Visibility',
  description: 'Official platform of Telugu Desam Party showcasing ground-level cadre activities, leader messages, and constituency-wise impact across Andhra Pradesh and Telangana.',
  keywords: 'TDP, Telugu Desam Party, Andhra Pradesh, Telangana, Politics, Cadre Activities, Leader Messages',
  openGraph: {
    title: 'TDP - Telugu Desam Party',
    description: 'Ground Activity • Digital Visibility • Measurable Impact',
    type: 'website',
    locale: 'en_IN',
    siteName: 'TDP Platform',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TDP - Telugu Desam Party',
    description: 'Ground Activity • Digital Visibility • Measurable Impact',
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <Providers>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <div className="page-container">
              <Navbar />
              <main className="main-content">
                {children}
              </main>
              <Footer />
            </div>
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}

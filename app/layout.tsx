import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { LanguageProvider } from '@/lib/i18n/context';
import { RtlWrapper } from '@/components/RtlWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

const SITE = 'https://roofsolar.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: 'RoofSolar — Free AI Solar Calculator',
    template: '%s | RoofSolar',
  },
  description:
    'Free solar panel calculator powered by AI. Get a 25-year cashflow model, payback period, export earnings, battery & EV savings in under 3 minutes. Works worldwide.',
  keywords: [
    'solar calculator', 'solar panel calculator', 'solar payback calculator',
    'solar ROI', 'solar investment', 'solar savings calculator',
    'solar energy calculator', 'solar panel cost', 'solar battery',
    'free solar calculator', 'AI solar advisor',
  ],
  alternates: { canonical: SITE },
  icons: {
    icon: '/logo-192.png',
    apple: '/logo-192.png',
    shortcut: '/logo-192.png',
  },
  openGraph: {
    type: 'website',
    url: SITE,
    siteName: 'RoofSolar',
    title: 'RoofSolar — Free AI Solar Calculator',
    description:
      'Free solar panel calculator. 25-year cashflow, payback period, battery & EV savings. Instant results, works worldwide.',
    images: [{ url: '/logo-512.png', width: 512, height: 512, alt: 'RoofSolar logo' }],
    locale: 'en_US',
  },
  twitter: {
    card: 'summary',
    title: 'RoofSolar — Free AI Solar Calculator',
    description: 'Free solar panel calculator. 25-year cashflow, payback, battery & EV savings. Instant results.',
    images: ['/logo-512.png'],
  },
  robots: { index: true, follow: true },
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'RoofSolar',
  url: SITE,
  description: 'Free AI-powered solar panel investment calculator. Get payback period, 25-year cashflow, export earnings, battery and EV economics in under 3 minutes.',
  applicationCategory: 'FinanceApplication',
  operatingSystem: 'Any',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'USD',
    availability: 'https://schema.org/InStock',
  },
  featureList: [
    '25-year cashflow model',
    'Solar payback period calculator',
    'Export earnings calculator',
    'Battery storage economics',
    'EV charging savings',
    'AI solar advisor',
    'Works worldwide',
  ],
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN && (
          <Script
            defer
            data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
            src="https://plausible.io/js/script.js"
          />
        )}
        {GA_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga-init" strategy="afterInteractive">
              {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}
            </Script>
          </>
        )}
      </head>
      <body className="min-h-screen bg-gray-50 font-sans antialiased">
        <LanguageProvider>
          <RtlWrapper>
            {children}
          </RtlWrapper>
        </LanguageProvider>
      </body>
    </html>
  );
}

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Script from 'next/script';
import { FeedbackWidget } from '@/components/FeedbackWidget';
import { AiAdvisor } from '@/components/results/AiAdvisor';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'RoofSolar — AI Solar Advisor',
  description:
    'Free, AI-powered solar investment analysis in under 3 minutes. 25-year cashflow model, payback, export earnings, battery and EV economics — with a built-in AI advisor that explains every number in plain English.',
  icons: {
    icon: '/logo-192.png',
    apple: '/logo-192.png',
    shortcut: '/logo-192.png',
  },
  openGraph: {
    title: 'RoofSolar — AI Solar Advisor',
    description: 'AI-powered solar investment analysis. 25-year cashflow, plain-English explanations, works worldwide.',
    images: [{ url: '/logo-512.png', width: 512, height: 512 }],
  },
};

const GA_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
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
        {children}
        <FeedbackWidget />
        <AiAdvisor />
      </body>
    </html>
  );
}

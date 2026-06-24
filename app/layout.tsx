import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/Providers';

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] });
const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://hushcash.xyz'),
  title: 'HushCash',
  description: 'Send. Claim. Own. Privately.',
  icons: { icon: '/logo.png', apple: '/logo.png' },
  openGraph: {
    title: 'HushCash',
    description: 'Private payments on Arc.',
    url: 'https://hushcash.xyz',
    siteName: 'HushCash',
    images: [
      {
        url: '/earlyaccess.png',
        width: 1200,
        height: 630,
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HushCash',
    description: 'Private payments on Arc.',
    images: ['/earlyaccess.png'],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en' className='dark'>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

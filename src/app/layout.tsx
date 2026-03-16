import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { SiteChrome } from '../components/site/SiteChrome';

export const metadata: Metadata = {
    metadataBase: new URL('https://thedrip.to'),
    title: {
        default: 'The Drip',
        template: '%s | The Drip',
    },
    description: 'Today’s games, opening lines, and matchup cards on one homepage.',
    openGraph: {
        siteName: 'The Drip',
        type: 'website',
    },
};

type RootLayoutProps = {
    children: ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
    return (
        <html lang="en">
            <body>
                <SiteChrome />
                {children}
            </body>
        </html>
    );
}

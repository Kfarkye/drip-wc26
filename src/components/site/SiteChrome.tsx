'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
    { href: '/', label: 'Markets' },
    { href: '/today', label: 'Today' },
    { href: '/edges/rsa-vs-mex-2026-06-11', label: 'Edges' },
] as const;

const GROUP_LINKS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'] as const;

function isActive(pathname: string, href: string): boolean {
    if (href === '/') return pathname === '/';
    return pathname === href || pathname.startsWith(`${href}/`);
}

export function SiteChrome() {
    const pathname = usePathname();

    return (
        <>
            <header className="site-header">
                <div className="site-header-inner">
                    <div className="site-brand-row">
                        <Link href="/" className="site-brand">
                            <span>The Drip</span>
                            <small>World Cup 2026 Edge Intel</small>
                        </Link>

                        <div className="site-status">
                            <span className="site-status-dot" />
                            <span>App Router Live</span>
                        </div>
                    </div>

                    <nav className="site-primary-nav" aria-label="Primary">
                        {NAV_LINKS.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={isActive(pathname, link.href) ? 'site-nav-link site-nav-link-active' : 'site-nav-link'}
                            >
                                {link.label}
                            </Link>
                        ))}
                    </nav>

                    <nav className="site-group-nav" aria-label="Groups">
                        {GROUP_LINKS.map((letter) => {
                            const href = `/group/${letter.toLowerCase()}`;
                            return (
                                <Link
                                    key={letter}
                                    href={href}
                                    className={isActive(pathname, href) ? 'site-group-link site-group-link-active' : 'site-group-link'}
                                >
                                    {letter}
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </header>

            <footer className="site-footer">
                <div className="site-footer-inner">
                    <p>
                        Oracle-grade World Cup 2026 pricing context, match intelligence, and edge pages built for crawlable public discovery.
                    </p>
                    <p>
                        Sources blend seeded tournament data with Supabase-backed live layers when configured. Not financial advice.
                    </p>
                </div>
            </footer>
        </>
    );
}

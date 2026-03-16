import Link from 'next/link';

export default function NotFound() {
    return (
        <main className="app-shell">
            <section className="hero-card not-found-card">
                <p className="eyebrow">404</p>
                <h1 className="hero-title">This route isn’t on the board.</h1>
                <p className="hero-copy">
                    The page may have moved during the Next.js migration, or the match slug does not exist in the current tournament map.
                </p>
                <div className="not-found-actions">
                    <Link href="/" className="site-nav-link site-nav-link-active">
                        Open markets
                    </Link>
                    <Link href="/today" className="site-nav-link">
                        Open today
                    </Link>
                </div>
            </section>
        </main>
    );
}

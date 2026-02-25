import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navLinks = [
    { label: 'Hub', path: '/' },
    { label: 'Group D', path: '/group/d' },
];

export const Nav: React.FC = () => {
    const location = useLocation();

    return (
        <nav className="border-b border-[var(--card-border)] bg-[var(--void)]/90 backdrop-blur-2xl sticky top-0 z-50">
            <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
                <div className="flex items-center gap-8">
                    <Link to="/" className="flex items-baseline gap-0.5 group">
                        <span className="text-[10px] font-sans lowercase text-[var(--mist)] group-hover:text-[var(--bone)] transition-colors">the</span>
                        <span className="text-[26px] font-serif italic font-[300] text-[var(--bone)] group-hover:text-[var(--white)] transition-colors leading-none">Drip</span>
                    </Link>
                    <div className="hidden md:flex gap-6">
                        {navLinks.map(({ label, path }) => {
                            const isActive = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`text-[13px] font-sans transition-colors ${
                                        isActive
                                            ? 'text-[var(--ivory)] font-[500]'
                                            : 'text-[var(--silver)] hover:text-[var(--bone)]'
                                    }`}
                                >
                                    {label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className="h-[6px] w-[6px] rounded-full bg-[var(--emerald)] shadow-[0_0_8px_rgba(0,201,120,0.4)]" />
                    <span className="text-[10px] tracking-[0.15em] text-[var(--silver)] uppercase font-mono">Live</span>
                </div>
            </div>
        </nav>
    );
};

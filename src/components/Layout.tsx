import React from 'react';
import { Nav } from './layout/Nav';
import { Footer } from './layout/Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-[var(--void)] selection:bg-emerald/30 grain-overlay vignette">
            <Nav />
            <main className="max-w-7xl mx-auto px-6 py-12">
                {children}
            </main>
            <Footer />
        </div>
    );
};

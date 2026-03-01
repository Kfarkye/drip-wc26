import React from 'react';
import { Nav } from './layout/Nav';
import { Footer } from './layout/Footer';

interface LayoutProps {
    children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
    return (
        <div className="min-h-screen bg-white">
            <Nav />
            <main>{children}</main>
            <Footer />
        </div>
    );
};

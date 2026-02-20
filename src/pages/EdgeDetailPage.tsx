import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Layout } from '../components/Layout';

export const EdgeDetailPage: React.FC = () => {
    const { slug } = useParams<{ slug: string }>();

    const title = slug
        ?.replace(/-/g, ' ')
        .replace(/\b\w/g, (c) => c.toUpperCase()) ?? 'Edge Detail';

    return (
        <Layout>
            <div className="mb-8">
                <Link to="/group/d" className="text-sm text-[var(--silver)] hover:text-[var(--ivory)] transition-colors font-sans">
                    &larr; Back to Group D
                </Link>
            </div>
            <h1 className="text-4xl font-sans font-[200] tracking-tight text-[var(--ivory)] mb-6">
                {title}
            </h1>
            <p className="text-lg text-[var(--silver)] font-serif italic">
                Full edge breakdown coming soon.
            </p>
        </Layout>
    );
};

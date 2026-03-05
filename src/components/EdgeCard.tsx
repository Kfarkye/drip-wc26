import React from 'react';
import { Link } from 'react-router-dom';

interface BookBreakdownItem {
    name: string;
    price: string;
    type: 'sportsbook' | 'market';
    link?: string;
}

interface EdgeCardProps {
    marketName: string;
    sportsbookName: string;
    sportsbookOdds: string;
    sportsbookLink?: string;
    predictionName: string;
    predictionPrice: string;
    predictionLink?: string;
    edgePercentage: number;
    confidence?: 'high' | 'medium' | 'low';
    volume?: number;
    link?: string;
    bookBreakdown?: BookBreakdownItem[];
}

const confidenceStyles: Record<string, { border: string; text: string; bg: string }> = {
    high: { border: 'rgba(34,197,94,0.45)', text: '#22c55e', bg: 'rgba(34,197,94,0.08)' },
    medium: { border: 'rgba(161,161,170,0.35)', text: '#a1a1aa', bg: 'rgba(161,161,170,0.08)' },
    low: { border: 'rgba(113,113,122,0.35)', text: '#71717a', bg: 'rgba(113,113,122,0.08)' },
};

const parseAmericanOdds = (odds: string): number | null => {
    const cleaned = odds.trim().replace(/[^\d+-]/g, '');
    const parsed = Number(cleaned);
    return Number.isFinite(parsed) ? parsed : null;
};

const parsePredictionPrice = (price: string): number | null => {
    const numeric = Number(price.replace(/[^\d.]/g, ''));
    if (!Number.isFinite(numeric)) return null;
    return numeric > 1 ? numeric / 100 : numeric;
};

const americanToImplied = (american: number): number => {
    if (american > 0) return 100 / (american + 100);
    return Math.abs(american) / (Math.abs(american) + 100);
};

export const EdgeCard: React.FC<EdgeCardProps> = ({
    marketName,
    sportsbookName,
    sportsbookOdds,
    sportsbookLink,
    predictionName,
    predictionPrice,
    predictionLink,
    edgePercentage,
    confidence = 'medium',
    volume,
    link,
    bookBreakdown,
}) => {
    const cStyle = confidenceStyles[confidence];
    const parsedSbOdds = parseAmericanOdds(sportsbookOdds);
    const parsedPmPrice = parsePredictionPrice(predictionPrice);

    let directionLabel: 'market above book' | 'book above market' | null = null;
    if (parsedSbOdds != null && parsedPmPrice != null) {
        const sportsbookImplied = americanToImplied(parsedSbOdds);
        if (sportsbookImplied > parsedPmPrice) {
            directionLabel = 'book above market';
        } else if (sportsbookImplied < parsedPmPrice) {
            directionLabel = 'market above book';
        }
    }

    const edgeColor = edgePercentage >= 4 ? '#22c55e' : '#a1a1aa';

    const card = (
        <div
            className="border rounded-[14px] overflow-hidden transition-colors"
            style={{
                borderColor: '#27272a',
                background: '#09090b',
            }}
        >
            <div className="px-5 py-4 flex items-start justify-between gap-4" style={{ borderBottom: '1px solid #27272a' }}>
                <div
                    className="text-[15px] leading-snug"
                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, color: '#f4f4f5' }}
                >
                    {marketName}
                </div>
                <span
                    className="text-[9px] uppercase tracking-[0.12em] px-2 py-1 rounded-full"
                    style={{
                        fontFamily: 'var(--font-data)',
                        fontWeight: 700,
                        border: `1px solid ${cStyle.border}`,
                        color: cStyle.text,
                        background: cStyle.bg,
                    }}
                >
                    {confidence}
                </span>
            </div>

            <div className="px-5 py-2">
                {bookBreakdown && bookBreakdown.length > 0 ? (
                    <div>
                        {bookBreakdown.map((book, index) => {
                            const showDivider = index < bookBreakdown.length - 1;
                            const bulletColor = book.type === 'sportsbook' ? '#22c55e' : '#71717a';
                            return (
                                <div
                                    key={`${book.name}-${book.price}`}
                                    className="flex items-center justify-between py-2.5"
                                    style={showDivider ? { borderBottom: '1px solid #27272a' } : undefined}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-[4px] h-[4px] rounded-full" style={{ background: bulletColor }} />
                                        <span
                                            className="text-[12px]"
                                            style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: '#a1a1aa' }}
                                        >
                                            {book.link ? (
                                                <a
                                                    href={book.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                    style={{ color: '#a1a1aa' }}
                                                    onClick={(e) => e.stopPropagation()}
                                                >
                                                    {book.name}
                                                </a>
                                            ) : (
                                                book.name
                                            )}
                                        </span>
                                    </div>
                                    <span
                                        className="text-sm"
                                        style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: '#f4f4f5' }}
                                    >
                                        {book.price}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between py-2.5" style={{ borderBottom: '1px solid #27272a' }}>
                            <div className="flex items-center gap-2">
                                <span className="w-[4px] h-[4px] rounded-full" style={{ background: '#22c55e' }} />
                                <span className="text-[12px]" style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: '#a1a1aa' }}>
                                    {sportsbookLink ? (
                                        <a
                                            href={sportsbookLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                            style={{ color: '#a1a1aa' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {sportsbookName}
                                        </a>
                                    ) : (
                                        sportsbookName
                                    )}
                                </span>
                            </div>
                            <span className="text-sm" style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: '#f4f4f5' }}>
                                {sportsbookOdds}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-2.5">
                            <div className="flex items-center gap-2">
                                <span className="w-[4px] h-[4px] rounded-full" style={{ background: '#71717a' }} />
                                <span className="text-[12px]" style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: '#a1a1aa' }}>
                                    {predictionLink ? (
                                        <a
                                            href={predictionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                            style={{ color: '#a1a1aa' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {predictionName}
                                        </a>
                                    ) : (
                                        predictionName
                                    )}
                                </span>
                            </div>
                            <span className="text-sm" style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: '#f4f4f5' }}>
                                {predictionPrice}
                            </span>
                        </div>
                    </>
                )}
            </div>

            <div
                className="px-5 py-4 flex items-end justify-between gap-4"
                style={{ borderTop: '1px solid #27272a', background: 'rgba(255,255,255,0.01)' }}
            >
                <div className="flex items-baseline gap-1">
                    <span
                        style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: 'clamp(34px, 6vw, 44px)',
                            fontWeight: 800,
                            color: edgeColor,
                            lineHeight: 1,
                        }}
                    >
                        {edgePercentage.toFixed(1)}
                    </span>
                    <span style={{ fontFamily: 'var(--font-data)', fontWeight: 700, fontSize: 18, color: '#71717a' }}>%</span>
                </div>

                <div className="text-right">
                    <div
                        className="text-[9px] uppercase tracking-[0.12em]"
                        style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: '#71717a' }}
                    >
                        Edge Gap
                    </div>
                    {directionLabel && (
                        <div className="text-[10px] mt-1" style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: '#a1a1aa' }}>
                            {directionLabel}
                        </div>
                    )}
                    {volume != null && volume > 0 && (
                        <div className="text-[10px]" style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: '#71717a' }}>
                            ${(volume / 1000).toFixed(0)}k vol
                        </div>
                    )}
                </div>
            </div>
        </div>
    );

    if (link) {
        return <Link to={link} className="block">{card}</Link>;
    }
    return card;
};

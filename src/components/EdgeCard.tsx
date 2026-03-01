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

const confidenceStyles: Record<string, { bg: string; border: string; text: string }> = {
    high: { bg: 'rgba(204,0,0,0.06)', border: 'var(--brand-red)', text: 'var(--brand-red)' },
    medium: { bg: 'var(--gray-50)', border: 'var(--gray-800)', text: 'var(--gray-800)' },
    low: { bg: 'var(--gray-50)', border: 'var(--gray-300)', text: 'var(--gray-500)' },
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

    let directionLabel: '↑ sportsbook favors' | '↓ market favors' | null = null;
    if (parsedSbOdds != null && parsedPmPrice != null) {
        const sportsbookImplied = americanToImplied(parsedSbOdds);
        if (sportsbookImplied > parsedPmPrice) {
            directionLabel = '↑ sportsbook favors';
        } else if (sportsbookImplied < parsedPmPrice) {
            directionLabel = '↓ market favors';
        }
    }

    const card = (
        <div
            className="border overflow-hidden transition-all duration-150 hover:shadow-md group"
            style={{
                borderColor: 'var(--gray-300)',
                borderTopWidth: '4px',
                borderTopColor: edgePercentage >= 3 ? 'var(--brand-red)' : 'var(--gray-800)',
                background: 'var(--white)',
            }}
        >
            {/* Header */}
            <div
                className="flex items-start justify-between px-5 pt-5 pb-3"
            >
                <div
                    className="text-[15px] tracking-tight leading-snug"
                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, color: 'var(--gray-900)' }}
                >
                    {marketName}
                </div>
                {confidence && (
                    <span
                        className="text-[9px] uppercase tracking-[0.08em] px-1.5 py-0.5 flex-shrink-0 ml-3"
                        style={{
                            fontWeight: 800,
                            background: cStyle.bg,
                            border: `1px solid ${cStyle.border}`,
                            color: cStyle.text,
                        }}
                    >
                        {confidence}
                    </span>
                )}
            </div>

            {/* Odds comparison rows */}
            <div className="px-5">
                {bookBreakdown && bookBreakdown.length > 0 ? (
                    <div className="py-1">
                        {bookBreakdown.map((book, index) => {
                            const showDivider = index < bookBreakdown.length - 1;
                            const bulletColor = book.type === 'sportsbook' ? 'var(--brand-red)' : 'var(--gray-400)';
                            return (
                                <div
                                    key={`${book.name}-${book.price}`}
                                    className="flex items-center justify-between py-2.5"
                                    style={showDivider ? { borderBottom: '1px solid var(--gray-200)' } : undefined}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className="w-[3px] h-3 rounded-full" style={{ background: bulletColor }} />
                                        <span
                                            className="text-[13px]"
                                            style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                                        >
                                            {book.link ? (
                                                <a
                                                    href={book.link}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:underline"
                                                    style={{ color: 'var(--gray-500)' }}
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
                                        className="text-sm tracking-tight"
                                        style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--gray-900)' }}
                                    >
                                        {book.price}
                                    </span>
                                </div>
                            );
                        })}
                    </div>
                ) : (
                    <>
                        <div
                            className="flex items-center justify-between py-3"
                            style={{ borderBottom: '1px solid var(--gray-200)' }}
                        >
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-[3px] h-3 rounded-full"
                                    style={{ background: 'var(--brand-red)' }}
                                />
                                <span
                                    className="text-[13px]"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                                >
                                    {sportsbookLink ? (
                                        <a
                                            href={sportsbookLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                            style={{ color: 'var(--gray-500)' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {sportsbookName}
                                        </a>
                                    ) : sportsbookName}
                                </span>
                            </div>
                            <span
                                className="text-sm tracking-tight"
                                style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--gray-900)' }}
                            >
                                {sportsbookOdds}
                            </span>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <div className="flex items-center gap-2">
                                <span
                                    className="w-[3px] h-3 rounded-full"
                                    style={{ background: 'var(--gray-300)' }}
                                />
                                <span
                                    className="text-[13px]"
                                    style={{ fontFamily: 'var(--font-ui)', fontWeight: 500, color: 'var(--gray-500)' }}
                                >
                                    {predictionLink ? (
                                        <a
                                            href={predictionLink}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline"
                                            style={{ color: 'var(--gray-500)' }}
                                            onClick={(e) => e.stopPropagation()}
                                        >
                                            {predictionName}
                                        </a>
                                    ) : predictionName}
                                </span>
                            </div>
                            <span
                                className="text-sm tracking-tight"
                                style={{ fontFamily: 'var(--font-data)', fontWeight: 700, color: 'var(--gray-900)' }}
                            >
                                {predictionPrice}
                            </span>
                        </div>
                    </>
                )}
            </div>

            {/* Edge hero number */}
            <div
                className="flex flex-col items-center py-5"
                style={{ background: 'var(--gray-50)', borderTop: '1px solid var(--gray-200)' }}
            >
                <div className="flex items-baseline gap-0.5">
                    <span
                        className="leading-none"
                        style={{
                            fontFamily: 'var(--font-data)',
                            fontSize: 'clamp(36px, 8vw, 48px)',
                            fontWeight: 800,
                            color: edgePercentage >= 3 ? 'var(--brand-red)' : 'var(--gray-900)',
                        }}
                    >
                        {edgePercentage.toFixed(1)}
                    </span>
                    <span
                        className="text-xl"
                        style={{
                            fontFamily: 'var(--font-data)',
                            fontWeight: 600,
                            color: 'var(--gray-500)',
                        }}
                    >
                        %
                    </span>
                </div>
                <div className="mt-1.5 flex items-center gap-2">
                    <span
                        className="text-[9px] uppercase tracking-[0.12em]"
                        style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, color: 'var(--gray-500)' }}
                    >
                        gap
                    </span>
                    {directionLabel && (
                        <>
                            <span
                                className="w-[3px] h-[3px] rounded-full"
                                style={{ background: 'var(--gray-300)' }}
                            />
                            <span
                                className="text-[9px] uppercase tracking-[0.06em]"
                                style={{
                                    fontFamily: 'var(--font-ui)',
                                    fontWeight: 800,
                                    color: directionLabel.includes('sportsbook') ? 'var(--brand-red)' : 'var(--gray-700)',
                                }}
                            >
                                {directionLabel}
                            </span>
                        </>
                    )}
                    {volume != null && volume > 0 && (
                        <>
                            <span
                                className="w-[3px] h-[3px] rounded-full"
                                style={{ background: 'var(--gray-300)' }}
                            />
                            <span
                                className="text-[10px]"
                                style={{ fontFamily: 'var(--font-data)', fontWeight: 600, color: 'var(--gray-500)' }}
                            >
                                ${(volume / 1000).toFixed(0)}k vol
                            </span>
                        </>
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

export type HomeFavorite = {
    name: string;
    code: string;
    group: string;
    odds: string;
    implied: string;
    pct: number;
    desc: string;
};

export type HomeMarketDepthRow = {
    name: string;
    code: string;
    amount: string;
    pct: string;
    width: number;
    isLeader: boolean;
};

export type HomeGroupMeta = {
    badge?: string;
    badgeType?: 'host' | 'death';
    tagline: string;
};

export const HOME_GROUP_META: Record<string, HomeGroupMeta> = {
    A: { badge: 'Host Nation', badgeType: 'host', tagline: 'Mexico opener at Azteca' },
    B: { badge: 'Host Nation', badgeType: 'host', tagline: 'Canada · Italy playoff swing' },
    C: { badge: 'Group of Death', badgeType: 'death', tagline: 'Brazil vs Morocco marquee' },
    D: { badge: 'Host Nation', badgeType: 'host', tagline: 'USA home advantage' },
    E: { tagline: 'Germany redemption · Curacao debut' },
    F: { badge: 'Dangerous', badgeType: 'death', tagline: 'Japan trap · Netherlands beware' },
    G: { tagline: 'Belgium fading · Egypt and Salah' },
    H: { tagline: 'Spain handle lead · Yamal turns 18' },
    I: { badge: 'Group of Death', badgeType: 'death', tagline: 'Mbappe vs Haaland' },
    J: { tagline: 'Messi farewell · Defending champions' },
    K: { badge: 'Dangerous', badgeType: 'death', tagline: 'Ronaldo swan song · Colombia dark horse' },
    L: { badge: 'Group of Death', badgeType: 'death', tagline: 'England vs Croatia opener' },
};

export const HOME_BRACKET_STEPS = [
    { num: '48', label: 'Group Stage' },
    { num: '32', label: 'Knockouts' },
    { num: '16', label: 'Round of 16' },
    { num: '8', label: 'Quarters' },
    { num: '4', label: 'Semis' },
    { num: '1', label: 'Champion', isFinal: true },
];

export const HOME_FAVORITES: HomeFavorite[] = [
    { name: 'Spain', code: 'ESP', group: 'H', odds: '+450', implied: '15.0%', pct: 100, desc: 'Euro 2024 champs' },
    { name: 'England', code: 'ENG', group: 'L', odds: '+550', implied: '13.2%', pct: 88, desc: 'Kane + Bellingham' },
    { name: 'Argentina', code: 'ARG', group: 'J', odds: '+800', implied: '12.3%', pct: 82, desc: 'Defending champs' },
    { name: 'France', code: 'FRA', group: 'I', odds: '+750', implied: '10.5%', pct: 70, desc: 'Mbappe Golden Boot favorite' },
    { name: 'Brazil', code: 'BRA', group: 'C', odds: '+750', implied: '10.5%', pct: 70, desc: 'Five-time champions' },
    { name: 'Germany', code: 'GER', group: 'E', odds: '+1000', implied: '7.1%', pct: 47, desc: 'Wirtz and Musiala' },
];

export const HOME_MARKET_DEPTH: HomeMarketDepthRow[] = [
    { name: 'Spain', code: 'ESP', amount: '$41.3M', pct: '18.5%', width: 100, isLeader: true },
    { name: 'England', code: 'ENG', amount: '$31.7M', pct: '14.2%', width: 76, isLeader: false },
    { name: 'Argentina', code: 'ARG', amount: '$30.8M', pct: '13.8%', width: 74, isLeader: false },
    { name: 'France', code: 'FRA', amount: '$27.0M', pct: '12.1%', width: 65, isLeader: false },
    { name: 'Brazil', code: 'BRA', amount: '$25.7M', pct: '11.5%', width: 62, isLeader: false },
    { name: 'Germany', code: 'GER', amount: '$18.5M', pct: '8.3%', width: 44, isLeader: false },
];

export const HOME_FACTS = [
    { num: '48', label: 'Total Teams', desc: 'First expansion since 1998.' },
    { num: '104', label: 'Matches', desc: 'Thirty-nine days across three host nations.' },
    { num: '67%', label: 'Advancement', desc: 'Thirty-two of forty-eight now move on.' },
    { num: '8', label: 'Wins To Title', desc: 'One more hurdle than the old format.' },
];

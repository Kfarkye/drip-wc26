export type GroupEditorial = {
    analysis: string;
    badge?: string;
    badgeType?: 'host' | 'death';
};

export const GROUP_EDITORIAL: Record<string, GroupEditorial> = {
    A: {
        badge: 'Host Nation',
        badgeType: 'host',
        analysis: 'Mexico\'s high-altitude advantage at the Azteca is the strongest of any host, heavily favoring progression. The South Korea matchup in Monterrey is the group\'s swing fixture.',
    },
    B: {
        badge: 'Host Nation',
        badgeType: 'host',
        analysis: 'If Italy wins their playoff bracket to enter this group, the math drastically changes against the Canadian hosts. Switzerland profiles as the most reliable group-stage nation in recent tournament history.',
    },
    C: {
        badge: 'Group of Death',
        badgeType: 'death',
        analysis: 'Brazil vs Morocco at MetLife Stadium (Jun 13) is the undisputed heavyweight fixture of the group stage. Morocco\'s 2022 semifinal run proved their defensive structure is real.',
    },
    D: {
        badge: 'Host Nation',
        badgeType: 'host',
        analysis: 'Highly favorable draw for the USMNT. Pochettino avoids elite European squads while playing securely on home soil. The opening match against Paraguay at SoFi sets the tournament tone.',
    },
    E: {
        analysis: 'Germany desperately seeks redemption after back-to-back group stage exits in 2018 and 2022. Curaçao makes a historic World Cup debut as the smallest nation in the field.',
    },
    F: {
        badge: 'Dangerous',
        badgeType: 'death',
        analysis: 'Japan stunned both Germany and Spain in 2022 groups, making this an extremely uncomfortable draw for the Netherlands. The UEFA Playoff B winner could add Austria or Ukraine to the mix.',
    },
    G: {
        analysis: 'Belgium\'s golden generation core is running on fumes, making this one of the most wide-open groups. Egypt\'s Salah is likely playing his final World Cup.',
    },
    H: {
        analysis: 'Spain holds 18.5% of the total betting handle. Lamine Yamal will be 18 years old during the tournament. Uruguay brings legitimate knockout-stage pedigree with Nunez and Valverde.',
    },
    I: {
        badge: 'Group of Death',
        badgeType: 'death',
        analysis: 'Mbappe vs. Haaland. This generational collision, France vs Norway, is projected to be the most-watched match of the group stage. Senegal adds genuine dark-horse quality.',
    },
    J: {
        analysis: 'Messi turns 39 during the tournament. If he plays, every Argentina match is the hottest ticket on the continent. Austria showed strong form at Euro 2024.',
    },
    K: {
        badge: 'Dangerous',
        badgeType: 'death',
        analysis: 'Aside from Ronaldo\'s swan song, Colombia represents legitimate, battle-tested knockout-stage quality after their 2024 Copa America final run.',
    },
    L: {
        badge: 'Group of Death',
        badgeType: 'death',
        analysis: 'England vs Croatia in Dallas acts as a brutal opening act. Croatia reached the 2018 final and 2022 semifinal. The consensus Group of Death.',
    },
};

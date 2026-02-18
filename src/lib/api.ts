import { supabase } from './supabase';

export async function getMatches(groupLetter: string) {
    const { data, error } = await supabase
        .from('matches')
        .select(`
      *,
      venue:venues(*),
      home_team:teams!matches_home_team_code_fkey(*),
      away_team:teams!matches_away_team_code_fkey(*)
    `)
        .eq('group_letter', groupLetter)
        .order('kickoff', { ascending: true });

    if (error) throw error;
    return data;
}

export async function getEdges(groupLetter: string) {
    const { data, error } = await supabase
        .from('edges')
        .select('*')
        .eq('group_letter', groupLetter); // Assuming group_letter is added or filter by match_id

    if (error) throw error;
    return data;
}

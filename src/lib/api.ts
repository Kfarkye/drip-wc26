import { supabase } from './supabase';

export async function getMatches(_groupLetter: string) {
    // Match data comes from static groups.ts — DB match table not yet wired
    return [];
}

export async function getEdges(groupLetter: string) {
    const { data, error } = await supabase
        .from('wc_edges')
        .select('*')
        .eq('group_letter', groupLetter.toUpperCase());

    if (error) throw error;
    return data;
}

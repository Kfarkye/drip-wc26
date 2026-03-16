import { NextRequest, NextResponse } from 'next/server';
import {
  getTrendsPageData,
  type TrendsPageData,
  type TrendsPageRequestFilters,
} from '../../../../lib/trends-page';

export const dynamic = 'force-dynamic';

function clampMinRate(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return 80;
  return Math.min(100, Math.max(50, parsed));
}

function clampLimit(value: string | null): number {
  const parsed = Number.parseInt(value ?? '', 10);
  if (!Number.isFinite(parsed)) return 250;
  return Math.min(1000, Math.max(25, parsed));
}

function normalizeFilter(value: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  return normalized === 'all' || normalized.length === 0 ? undefined : normalized;
}

export async function GET(request: NextRequest): Promise<NextResponse<TrendsPageData | { error: string }>> {
  const { searchParams } = new URL(request.url);

  const filters: TrendsPageRequestFilters = {
    league: normalizeFilter(searchParams.get('league')),
    layer: normalizeFilter(searchParams.get('layer')),
    minRate: clampMinRate(searchParams.get('minRate') || searchParams.get('p_min_rate')),
    limit: clampLimit(searchParams.get('limit') || searchParams.get('p_limit')),
  };

  try {
    const payload = await getTrendsPageData(filters);
    return NextResponse.json(payload);
  } catch {
    return NextResponse.json({ error: 'Unable to load trends' }, { status: 500 });
  }
}

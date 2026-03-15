import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

// POST: Record an analytics event (no auth required)
export async function POST(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    const { portfolio_id, event_type } = await request.json();

    if (!portfolio_id || !event_type) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const validTypes = ['view', 'chat', 'fit_assessment'];
    if (!validTypes.includes(event_type)) {
      return NextResponse.json({ error: 'Invalid event type' }, { status: 400 });
    }

    // Validate portfolio_id is a valid UUID format
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(portfolio_id)) {
      return NextResponse.json({ error: 'Invalid portfolio ID' }, { status: 400 });
    }

    // Verify portfolio exists before inserting
    const { data: exists } = await supabase
      .from('portfolios')
      .select('id')
      .eq('id', portfolio_id)
      .maybeSingle();

    if (!exists) {
      return NextResponse.json({ error: 'Portfolio not found' }, { status: 404 });
    }

    await supabase.from('portfolio_analytics').insert({
      portfolio_id,
      event_type,
    });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to record' }, { status: 500 });
  }
}

// GET: Get analytics summary for authenticated user's portfolio
export async function GET(request: NextRequest) {
  try {
    const supabase = getSupabase();
    if (!supabase) {
      return NextResponse.json({ error: 'Not configured' }, { status: 503 });
    }

    // Get auth token from header
    const authHeader = request.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user } } = await supabase.auth.getUser(token);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's portfolio
    const { data: portfolio } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!portfolio) {
      return NextResponse.json({ views: 0, chats: 0, assessments: 0 });
    }

    // Get counts
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();

    const [viewsResult, chatsResult, assessmentsResult] = await Promise.all([
      supabase
        .from('portfolio_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('portfolio_id', portfolio.id)
        .eq('event_type', 'view')
        .gte('created_at', thirtyDaysAgo),
      supabase
        .from('portfolio_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('portfolio_id', portfolio.id)
        .eq('event_type', 'chat')
        .gte('created_at', thirtyDaysAgo),
      supabase
        .from('portfolio_analytics')
        .select('id', { count: 'exact', head: true })
        .eq('portfolio_id', portfolio.id)
        .eq('event_type', 'fit_assessment')
        .gte('created_at', thirtyDaysAgo),
    ]);

    return NextResponse.json({
      views: viewsResult.count || 0,
      chats: chatsResult.count || 0,
      assessments: assessmentsResult.count || 0,
    });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}

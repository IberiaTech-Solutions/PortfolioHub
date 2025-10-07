import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/utils/supabase';

export async function POST(request: NextRequest) {
  try {
    const { portfolioId, collaboratorEmail, collaboratorName, projectTitle, projectDescription, role } = await request.json();

    if (!portfolioId || !collaboratorEmail || !collaboratorName || !projectTitle || !role) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Check if collaborator exists in PortfolioHub (optional)
    // For now, we'll set collaborator_user_id to null and let them verify later
    const collaboratorUserId = null;

    // Create collaboration
    const { data, error } = await supabase
      .from('collaborations')
      .insert({
        portfolio_id: portfolioId,
        collaborator_user_id: collaboratorUserId,
        collaborator_name: collaboratorName,
        collaborator_email: collaboratorEmail,
        project_title: projectTitle,
        project_description: projectDescription,
        role: role,
        status: 'pending'
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating collaboration:', error);
      return NextResponse.json({ error: 'Failed to create collaboration' }, { status: 500 });
    }

    return NextResponse.json({ collaboration: data });
  } catch (error) {
    console.error('Error in collaboration API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const portfolioId = searchParams.get('portfolioId');

    if (!portfolioId) {
      return NextResponse.json({ error: 'Portfolio ID is required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('collaborations')
      .select(`
        *,
        portfolios!inner(user_id)
      `)
      .eq('portfolio_id', portfolioId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching collaborations:', error);
      return NextResponse.json({ error: 'Failed to fetch collaborations' }, { status: 500 });
    }

    return NextResponse.json({ collaborations: data });
  } catch (error) {
    console.error('Error in collaboration API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { collaborationId, status } = await request.json();

    if (!collaborationId || !status) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const updateData: any = { status };
    if (status === 'accepted') {
      updateData.verified_at = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('collaborations')
      .update(updateData)
      .eq('id', collaborationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating collaboration:', error);
      return NextResponse.json({ error: 'Failed to update collaboration' }, { status: 500 });
    }

    return NextResponse.json({ collaboration: data });
  } catch (error) {
    console.error('Error in collaboration API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const collaborationId = searchParams.get('id');

    if (!collaborationId) {
      return NextResponse.json({ error: 'Collaboration ID is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('collaborations')
      .delete()
      .eq('id', collaborationId);

    if (error) {
      console.error('Error deleting collaboration:', error);
      return NextResponse.json({ error: 'Failed to delete collaboration' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in collaboration API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

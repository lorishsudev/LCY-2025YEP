import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/winners/[id] - 獲取單個得獎者
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { data, error } = await supabase
      .from('lottery_winner')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Winner not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (error) {
    console.error('Error fetching winner:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winner' },
      { status: 500 }
    );
  }
}

// PUT /api/winners/[id] - 更新得獎者
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { award_id, award, emp_id, emp_cname, emp_ename, emp_factory } = body;

    // 構建更新資料
    const updateData: any = {};
    if (award_id) updateData.award_id = award_id;
    if (award) updateData.award = award;
    if (emp_id) updateData.emp_id = emp_id;
    if (emp_cname !== undefined) updateData.emp_cname = emp_cname;
    if (emp_ename !== undefined) updateData.emp_ename = emp_ename;
    if (emp_factory !== undefined) updateData.emp_factory = emp_factory;

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: 'No fields to update' },
        { status: 400 }
      );
    }

    // 如果更新 award_id，驗證其存在性
    if (award_id) {
      const { data: awardExists } = await supabase
        .from('lottery_award')
        .select('id')
        .eq('id', award_id)
        .single();

      if (!awardExists) {
        return NextResponse.json(
          { error: 'Award ID does not exist' },
          { status: 400 }
        );
      }
    }

    const { data, error } = await supabase
      .from('lottery_winner')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { error: 'Winner not found' },
          { status: 404 }
        );
      }
      throw error;
    }

    return NextResponse.json({
      success: true,
      data,
      message: 'Winner updated successfully',
    });
  } catch (error) {
    console.error('Error updating winner:', error);
    return NextResponse.json(
      { error: 'Failed to update winner' },
      { status: 500 }
    );
  }
}

// DELETE /api/winners/[id] - 刪除得獎者
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const { error } = await supabase
      .from('lottery_winner')
      .delete()
      .eq('id', id);

    if (error) throw error;

    return NextResponse.json({
      success: true,
      message: 'Winner deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting winner:', error);
    return NextResponse.json(
      { error: 'Failed to delete winner' },
      { status: 500 }
    );
  }
}

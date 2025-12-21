import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// GET /api/winners - 獲取所有得獎者 (支援過濾)
export async function GET(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const awardId = searchParams.get('award_id');
    const empId = searchParams.get('emp_id');

    let query = supabase
      .from('lottery_winner')
      .select('*')
      .order('won_at', { ascending: false });

    // 過濾條件
    if (awardId) {
      query = query.eq('award_id', awardId);
    }
    if (empId) {
      query = query.eq('emp_id', empId);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({
      success: true,
      data,
      count: data?.length || 0,
    });
  } catch (error) {
    console.error('Error fetching winners:', error);
    return NextResponse.json(
      { error: 'Failed to fetch winners' },
      { status: 500 }
    );
  }
}

// POST /api/winners - 創建新得獎者
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { award_id, award, emp_id, emp_cname, emp_ename, emp_factory } = body;

    // 驗證必填欄位
    if (!award_id || !award || !emp_id) {
      return NextResponse.json(
        { error: 'Missing required fields: award_id, award, emp_id' },
        { status: 400 }
      );
    }

    // 驗證獎項是否存在
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

    // 檢查員工是否已經得獎
    const { data: existingWinner } = await supabase
      .from('lottery_winner')
      .select('id')
      .eq('emp_id', emp_id)
      .single();

    if (existingWinner) {
      return NextResponse.json(
        { error: 'Employee has already won a prize' },
        { status: 409 }
      );
    }

    const { data, error } = await supabase
      .from('lottery_winner')
      .insert([
        {
          award_id,
          award,
          emp_id,
          emp_cname: emp_cname || null,
          emp_ename: emp_ename || null,
          emp_factory: emp_factory || null,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data,
        message: 'Winner created successfully',
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating winner:', error);
    return NextResponse.json(
      { error: 'Failed to create winner' },
      { status: 500 }
    );
  }
}

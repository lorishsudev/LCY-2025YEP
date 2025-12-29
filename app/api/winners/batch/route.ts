import { NextRequest, NextResponse } from 'next/server';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';

// POST /api/winners/batch - 批量新增得獎者
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { winners } = body;

    // 驗證輸入
    if (!winners || !Array.isArray(winners) || winners.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: winners array is required and cannot be empty' },
        { status: 400 }
      );
    }

    // 驗證每筆資料的必填欄位
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      if (!winner.award_id || !winner.award || !winner.emp_id) {
        return NextResponse.json(
          {
            error: `Invalid data at index ${i}: Missing required fields (award_id, award, emp_id)`,
            index: i,
            winner
          },
          { status: 400 }
        );
      }
    }

    // 批量處理結果
    const results: Array<{
      emp_id: string;
      status: 'created' | 'failed' | 'duplicate' | 'invalid_award';
      error?: string;
      data?: any;
    }> = [];

    let createdCount = 0;
    let failedCount = 0;

    // 先獲取所有唯一的 award_id 列表
    const uniqueAwardIds = [...new Set(winners.map((w: any) => w.award_id))];

    // 批量驗證獎項是否存在
    const { data: validAwards } = await supabase
      .from('lottery_award')
      .select('id')
      .in('id', uniqueAwardIds);

    const validAwardIdSet = new Set(validAwards?.map((a) => a.id) || []);

    // 獲取所有已經得獎的員工 ID
    const empIds = winners.map((w: any) => w.emp_id);
    const { data: existingWinners } = await supabase
      .from('lottery_winner')
      .select('emp_id')
      .in('emp_id', empIds);

    const existingWinnerSet = new Set(existingWinners?.map((w) => w.emp_id) || []);

    // 處理每筆資料
    for (const winner of winners) {
      const { award_id, award, emp_id, emp_cname, emp_ename, emp_factory } = winner;

      // 檢查獎項是否存在
      if (!validAwardIdSet.has(award_id)) {
        results.push({
          emp_id,
          status: 'invalid_award',
          error: `Award ID ${award_id} does not exist`,
        });
        failedCount++;
        continue;
      }

      // 檢查員工是否已經得獎
      if (existingWinnerSet.has(emp_id)) {
        results.push({
          emp_id,
          status: 'duplicate',
          error: 'Employee has already won a prize',
        });
        failedCount++;
        continue;
      }

      // 嘗試新增得獎者
      try {
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

        // 成功後加入已存在列表（避免同一批次中重複）
        existingWinnerSet.add(emp_id);

        results.push({
          emp_id,
          status: 'created',
          data,
        });
        createdCount++;
      } catch (error) {
        console.error(`Error creating winner ${emp_id}:`, error);
        results.push({
          emp_id,
          status: 'failed',
          error: error instanceof Error ? error.message : 'Unknown error',
        });
        failedCount++;
      }
    }

    return NextResponse.json(
      {
        success: createdCount > 0,
        data: {
          total: winners.length,
          created: createdCount,
          failed: failedCount,
          results,
        },
        message: `Batch operation completed: ${createdCount} created, ${failedCount} failed`,
      },
      { status: createdCount > 0 ? 201 : 400 }
    );
  } catch (error) {
    console.error('Error in batch create winners:', error);
    return NextResponse.json(
      { error: 'Failed to process batch create' },
      { status: 500 }
    );
  }
}

// DELETE /api/winners/batch?award_id=XX - 批量刪除得獎者 (依獎項 ID)
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured || !supabase) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const awardId = searchParams.get('award_id');

    // 驗證必填參數
    if (!awardId) {
      return NextResponse.json(
        { error: 'Missing required parameter: award_id' },
        { status: 400 }
      );
    }

    // 檢查獎項是否存在
    const { data: awardExists } = await supabase
      .from('lottery_award')
      .select('id')
      .eq('id', awardId)
      .single();

    if (!awardExists) {
      return NextResponse.json(
        { error: `Award ID ${awardId} does not exist` },
        { status: 404 }
      );
    }

    // 先查詢要刪除的記錄數量
    const { data: winnersToDelete, error: countError } = await supabase
      .from('lottery_winner')
      .select('id, emp_id, emp_cname')
      .eq('award_id', awardId);

    if (countError) throw countError;

    const deleteCount = winnersToDelete?.length || 0;

    if (deleteCount === 0) {
      return NextResponse.json({
        success: true,
        data: {
          deleted: 0,
          award_id: awardId,
        },
        message: `No winners found for award ${awardId}`,
      });
    }

    // 執行批量刪除
    const { error: deleteError } = await supabase
      .from('lottery_winner')
      .delete()
      .eq('award_id', awardId);

    if (deleteError) throw deleteError;

    return NextResponse.json({
      success: true,
      data: {
        deleted: deleteCount,
        award_id: awardId,
        winners: winnersToDelete,
      },
      message: `Successfully deleted ${deleteCount} winner(s) for award ${awardId}`,
    });
  } catch (error) {
    console.error('Error in batch delete winners:', error);
    return NextResponse.json(
      { error: 'Failed to process batch delete' },
      { status: 500 }
    );
  }
}

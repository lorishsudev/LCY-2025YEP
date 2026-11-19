import { NextResponse } from 'next/server';
import { fetchBoardPrizes } from '@/lib/db-helpers';

// GET /api/board - 前台/後台看板資料（全部獎項 + 得獎者）
//
// 所有手機都輪詢這支 API，而不是直接連 Supabase。
// 回應在 Vercel CDN 快取 3 秒（過期後 60 秒內先回舊資料、背景更新），
// 因此不論多少人在線，Supabase 每 3 秒最多只會被讀一次。
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const prizes = await fetchBoardPrizes();
    return NextResponse.json(
      { prizes, generatedAt: Date.now() },
      {
        headers: {
          // 瀏覽器不快取，每次輪詢都向 CDN 拿
          'Cache-Control': 'public, max-age=0, must-revalidate',
          // 只給 Vercel CDN 用的快取設定
          'Vercel-CDN-Cache-Control': 'max-age=3, stale-while-revalidate=60',
        },
      }
    );
  } catch (error) {
    console.error('Error fetching board:', error);
    // 錯誤不快取，下一次輪詢會重新嘗試
    return NextResponse.json(
      { error: 'Failed to fetch board' },
      { status: 500, headers: { 'Cache-Control': 'no-store', 'Vercel-CDN-Cache-Control': 'no-store' } }
    );
  }
}

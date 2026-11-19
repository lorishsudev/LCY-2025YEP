'use client';

import React from 'react';
import { DisplayBoard } from '../components/DisplayBoard';
import { BoardLoader } from '../components/BoardLoader';

// 前台看板：資料由 /api/board 定時更新（見 lib/useBoardData.ts），
// 手機不直接連 Supabase，在線人數多也不會壓垮資料庫。
export default function Home() {
  return (
    <BoardLoader>
      {(prizes) => <DisplayBoard prizes={prizes} lastWinnerId={null} />}
    </BoardLoader>
  );
}

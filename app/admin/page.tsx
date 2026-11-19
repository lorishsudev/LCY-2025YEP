'use client';

import React from 'react';
import { AdminBoard } from '../../components/AdminBoard';
import { BoardLoader } from '../../components/BoardLoader';

// 後台看板：資料由 /api/board 定時更新（見 lib/useBoardData.ts）
export default function AdminPage() {
  return (
    <BoardLoader>
      {(prizes) => <AdminBoard prizes={prizes} lastWinnerId={null} />}
    </BoardLoader>
  );
}

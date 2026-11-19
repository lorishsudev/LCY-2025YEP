'use client';

import React from 'react';
import { Prize } from '../types';
import { useBoardData } from '../lib/useBoardData';

interface BoardLoaderProps {
  children: (prizes: Prize[]) => React.ReactNode;
}

/**
 * 載入看板資料並處理載入中 / 連線失敗的畫面。
 * 失敗時會自動重試，不會停在載入中。
 */
export const BoardLoader: React.FC<BoardLoaderProps> = ({ children }) => {
  const { prizes, status, stale } = useBoardData();

  if (status !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center px-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lcy-yellow mx-auto mb-4"></div>
          <p className="text-gray-600">
            {status === 'loading' ? '載入中...' : '連線忙碌中，正在自動重試...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      {stale && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
          ⚠️ 連線不穩，畫面可能不是最新資料，正在自動重試...
        </div>
      )}
      {children(prizes)}
    </>
  );
};

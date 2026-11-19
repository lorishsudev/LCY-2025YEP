'use client';

import { useEffect, useRef, useState } from 'react';
import { Prize } from '../types';

const POLL_MS = 5000; // 正常輪詢間隔
const POLL_JITTER_MS = 1000; // 隨機錯開，避免所有手機同一瞬間打 API
const MAX_BACKOFF_MS = 15000; // 連續失敗時最長的重試間隔
const REQUEST_TIMEOUT_MS = 10000; // 單次請求逾時

export type BoardStatus = 'loading' | 'ready' | 'error';

/**
 * 定時向 /api/board 取得看板資料。
 * - 分頁在背景時暫停，回到前景立即更新
 * - 請求逾時或失敗時保留上一次的資料並自動重試（指數退避）
 */
export function useBoardData() {
  const [prizes, setPrizes] = useState<Prize[]>([]);
  const [status, setStatus] = useState<BoardStatus>('loading');
  const [stale, setStale] = useState(false); // 有舊資料但最近一次更新失敗
  const hasDataRef = useRef(false);

  useEffect(() => {
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | null = null;
    let inFlight = false;
    let failures = 0;

    const schedule = (delay: number) => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(tick, delay);
    };

    const nextDelay = () =>
      failures === 0
        ? POLL_MS + Math.random() * POLL_JITTER_MS
        : Math.min(MAX_BACKOFF_MS, 2000 * 2 ** (failures - 1)) + Math.random() * POLL_JITTER_MS;

    const tick = async () => {
      if (cancelled) return;
      if (typeof document !== 'undefined' && document.hidden) return; // 背景分頁不輪詢
      if (inFlight) return;
      inFlight = true;

      const ac = new AbortController();
      const abortTimer = setTimeout(() => ac.abort(), REQUEST_TIMEOUT_MS);
      try {
        const res = await fetch('/api/board', { signal: ac.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const body = (await res.json()) as { prizes: Prize[] };
        if (cancelled) return;
        setPrizes(body.prizes);
        hasDataRef.current = true;
        setStatus('ready');
        setStale(false);
        failures = 0;
      } catch (error) {
        if (cancelled) return;
        console.warn('[useBoardData] 更新失敗，稍後重試:', error);
        failures += 1;
        if (hasDataRef.current) setStale(true);
        else setStatus('error');
      } finally {
        clearTimeout(abortTimer);
        inFlight = false;
        if (!cancelled) schedule(nextDelay());
      }
    };

    const onVisibility = () => {
      if (!document.hidden) schedule(0);
    };

    document.addEventListener('visibilitychange', onVisibility);
    tick();

    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, []);

  return { prizes, status, stale };
}

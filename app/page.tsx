'use client';

import React, { useState, useEffect } from 'react';
import { Prize } from '../types';
import { DisplayBoard } from '../components/DisplayBoard';
import { fetchPrizesWithWinners } from '../lib/db-helpers';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Fallback mock data (used when database is not configured)
const FALLBACK_PRIZES: Prize[] = [
  {
    id: '01',
    name: '特獎 Grand Prize',
    description: '極光之旅 雙人行 Travel Voucher $100,000',
    image: 'https://images.unsplash.com/photo-1531297461136-82lw3f8f19b4?w=600&q=80',
    totalCount: 1,
    rank: 1,
    winners: [{ id: '1', name: '陳O銘 (A00018801)', department: '台北總部', wonAt: Date.now() }],
  },
  {
    id: '02',
    name: '二獎 Second Prize',
    description: 'Apple iPhone 15 Pro Max (Titanium)',
    image: 'https://images.unsplash.com/photo-1696446701796-da61225697cc?w=600&q=80',
    totalCount: 2,
    rank: 2,
    winners: [
      { id: '2', name: '林O儀 (A00018802)', department: '高雄廠', wonAt: Date.now() },
      { id: '3', name: '王O宏 (A00018803)', department: '小港廠', wonAt: Date.now() }
    ],
  },
  {
    id: '03',
    name: '三獎 Third Prize',
    description: 'Sony PlayStation 5 Pro Bundle',
    image: 'https://images.unsplash.com/photo-1552831388-6a0b3575b32a?w=600&q=80',
    totalCount: 5,
    rank: 3,
    winners: [
      { id: '4', name: '張O華 (A00018804)', department: '林園廠', wonAt: Date.now() },
      { id: '5', name: '郭O芬 (A00018805)', department: '大社廠', wonAt: Date.now() },
      { id: '6', name: '李O成 (A00018806)', department: '研發中心', wonAt: Date.now() }
    ],
  },
  {
    id: '04',
    name: '四獎 Fourth Prize',
    description: 'Dyson Zone 空氣清淨耳機',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80',
    totalCount: 5,
    rank: 4,
    winners: [
      { id: '7', name: '黃O偉 (A00018807)', department: '運籌管理處', wonAt: Date.now() },
      { id: '8', name: '蔡O婷 (A00018808)', department: '財務處', wonAt: Date.now() },
    ],
  },
  {
    id: '05',
    name: '五獎 Fifth Prize',
    description: 'Nespresso 膠囊咖啡機',
    image: 'https://images.unsplash.com/photo-1517668808822-9ebb02f2a0e6?w=600&q=80',
    totalCount: 10,
    rank: 5,
    winners: [],
  },
  {
    id: '06',
    name: '六獎 Sixth Prize',
    description: 'SOGO 禮券 $5,000',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?w=600&q=80',
    totalCount: 10,
    rank: 6,
    winners: [{ id: '10', name: '楊O傑 (A00018809)', department: '工安環保處', wonAt: Date.now() }],
  },
  {
    id: '07',
    name: '七獎 Seventh Prize',
    description: 'AirPods Pro 2',
    image: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=600&q=80',
    totalCount: 15,
    rank: 7,
    winners: [],
  },
  {
    id: '10',
    name: '十獎 Tenth Prize',
    description: '現金紅包 Cash Prize $3,000',
    image: 'https://images.unsplash.com/photo-1580519542036-c47de6196ba5?w=600&q=80',
    totalCount: 20,
    rank: 10,
    winners: [{ id: '11', name: '劉O君 (A00018810)', department: '行政處', wonAt: Date.now() }],
  },
  {
    id: '11',
    name: '十一獎 11th Prize',
    description: '家樂福禮券 $1,000',
    image: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&q=80',
    totalCount: 30,
    rank: 11,
    winners: [{ id: '12', name: '吳O憲 (A00018811)', department: '實習生', wonAt: Date.now() }],
  },
  {
    id: '15',
    name: '十五獎 15th Prize',
    description: '電影票券組 Movie Tickets',
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&q=80',
    totalCount: 50,
    rank: 15,
    winners: [],
  },
  {
    id: '99',
    name: '溫馨獎 Comfort Prize',
    description: 'LCY 專屬紀念保溫杯 + 參加獎 $600',
    image: 'https://images.unsplash.com/photo-1517263904808-5dc8b43b1c3f?w=600&q=80',
    totalCount: 100,
    rank: 99,
    winners: [
      { id: 'w1', name: '許O欽 (A00019088)', department: '資訊處', wonAt: Date.now() },
      { id: 'w2', name: '鄭O文 (A00019089)', department: '法務處', wonAt: Date.now() },
      { id: 'w3', name: '謝O霖 (A00019090)', department: '業務處', wonAt: Date.now() },
    ],
  },
];

export default function Home() {
  const [prizes, setPrizes] = useState<Prize[]>(FALLBACK_PRIZES);
  const [loading, setLoading] = useState(true);
  const [usingFallback, setUsingFallback] = useState(false);

  useEffect(() => {
    const loadPrizes = async () => {
      try {
        const data = await fetchPrizesWithWinners();

        if (data && data.length > 0) {
          setPrizes(data);
          setUsingFallback(false);
        } else {
          // If no data from database, use fallback
          console.warn('No prizes fetched from database, using fallback data');
          setUsingFallback(true);
        }
      } catch (error) {
        console.error('Error loading prizes:', error);
        setUsingFallback(true);
      } finally {
        setLoading(false);
      }
    };

    // Initial load
    loadPrizes();

    // Setup realtime subscriptions only if Supabase is configured
    if (isSupabaseConfigured && supabase) {
      console.log('🔴 Setting up Realtime subscriptions...');

      // Subscribe to lottery_award changes
      const awardsChannel = supabase
        .channel('lottery-award-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'lottery_award'
          },
          (payload) => {
            console.log('📢 Award change detected:', payload);
            loadPrizes(); // Reload all prizes when award changes
          }
        )
        .subscribe((status) => {
          console.log('Awards channel status:', status);
        });

      // Subscribe to lottery_winner changes
      const winnersChannel = supabase
        .channel('lottery-winner-changes')
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to INSERT, UPDATE, DELETE
            schema: 'public',
            table: 'lottery_winner'
          },
          (payload) => {
            console.log('🏆 Winner change detected:', payload);
            loadPrizes(); // Reload all prizes when winner changes
          }
        )
        .subscribe((status) => {
          console.log('Winners channel status:', status);
        });

      // Cleanup subscriptions on unmount
      return () => {
        console.log('🔴 Cleaning up Realtime subscriptions...');
        if (supabase) {
          supabase.removeChannel(awardsChannel);
          supabase.removeChannel(winnersChannel);
        }
      };
    }
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lcy-yellow mx-auto mb-4"></div>
          <p className="text-gray-600">載入中...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {usingFallback && (
        <div className="bg-yellow-50 border-b border-yellow-200 px-4 py-2 text-center text-sm text-yellow-800">
          ⚠️ 使用離線數據模式 - Supabase 資料庫未配置
        </div>
      )}
      <DisplayBoard prizes={prizes} lastWinnerId={null} />
    </>
  );
}

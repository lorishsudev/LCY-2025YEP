'use client';

import React, { useMemo, useState } from 'react';
import { Prize } from '../types';
import { Users, Search } from 'lucide-react';

interface DisplayBoardProps {
  prizes: Prize[];
  lastWinnerId: string | null;
}

type TabType = 'special-top' | '1-5' | '6-10' | '11-13' | 'comfort';

export const DisplayBoard: React.FC<DisplayBoardProps> = ({ prizes }) => {
  const [activeTab, setActiveTab] = useState<TabType>('special-top');

  // Sort by rank (0 is highest, then 1-13, then 99)
  const sortedPrizes = useMemo(() => [...prizes].sort((a, b) => a.rank - b.rank), [prizes]);

  // Filter prizes based on active tab
  const filteredPrizes = useMemo(() => {
    return sortedPrizes.filter(prize => {
      switch (activeTab) {
        case 'special-top':
          return prize.rank === 0 || prize.rank === 1; // 特獎 + 頭獎
        case '1-5':
          return prize.rank >= 2 && prize.rank <= 5; // 2-5獎
        case '6-10':
          return prize.rank >= 6 && prize.rank <= 10; // 6-10獎
        case '11-13':
          return prize.rank >= 11 && prize.rank <= 13; // 11-13獎
        case 'comfort':
          return prize.rank === 99; // 溫馨獎
        default:
          return true;
      }
    });
  }, [sortedPrizes, activeTab]);

  const tabs: { id: TabType; label: string }[] = [
    { id: 'special-top', label: '特獎/頭獎' },
    { id: '1-5', label: '2-5 獎' },
    { id: '6-10', label: '6-10 獎' },
    { id: '11-13', label: '11-13 獎' },
    { id: 'comfort', label: '溫馨獎' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-lcy-slate font-sans">

      {/* Navigation Bar - Fixed positioning for Safari compatibility */}
      <nav className="bg-white border-b border-gray-200 fixed top-0 left-0 right-0 z-50 shadow-sm">
        {/* Desktop Layout - 保持不變 */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 h-16 items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-lcy-dark">LCy</span>
            <div className="h-5 w-[1px] bg-gray-300 mx-2"></div>
            <span className="text-xs font-bold text-gray-500 tracking-wide">YEAR END PARTY 2025</span>
          </div>

          {/* Desktop Tabs */}
          <div className="flex items-center h-full gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  h-full px-5 text-sm font-bold transition-colors relative flex items-center
                  ${activeTab === tab.id ? 'text-lcy-dark bg-gray-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50/50'}
                `}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <span className="absolute bottom-0 left-0 w-full h-[3px] bg-lcy-yellow"></span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Layout - 兩排按鈕設計 */}
        <div className="md:hidden px-3 py-3">
          {/* Logo */}
          <div className="flex items-center gap-2 mb-3 justify-center">
            <span className="text-lg font-black tracking-tighter text-lcy-dark">LCy</span>
            <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
            <span className="text-[10px] font-bold text-gray-500 tracking-wide">YEAR END PARTY 2025</span>
          </div>

          {/* Mobile Tabs - 兩排網格布局 */}
          <div className="grid grid-cols-3 gap-2">
            {/* 第一排：3 個按鈕 */}
            {tabs.slice(0, 3).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-2 py-2.5 text-[11px] font-bold rounded-md transition-all relative
                  ${activeTab === tab.id
                    ? 'bg-lcy-yellow text-lcy-dark shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'}
                `}
              >
                {tab.label}
              </button>
            ))}

            {/* 第二排：2 個按鈕 + 1 個空位 */}
            {tabs.slice(3, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`
                  px-2 py-2.5 text-[11px] font-bold rounded-md transition-all relative
                  ${activeTab === tab.id
                    ? 'bg-lcy-yellow text-lcy-dark shadow-sm'
                    : 'bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95'}
                `}
              >
                {tab.label}
              </button>
            ))}
            <div></div> {/* 空位保持對齊 */}
          </div>
        </div>
      </nav>

      {/* Spacer for fixed navigation - Different heights for mobile/desktop */}
      <div className="h-[120px] md:h-16"></div>

      {/* Hero / Title Section */}
      <header className="bg-white py-6 px-4 text-center border-b border-gray-100">
        <div className="max-w-4xl mx-auto space-y-2">
           <h1 className="text-2xl md:text-3xl font-black text-lcy-dark tracking-tight">
             榮耀時刻 · 得獎名單
           </h1>
           <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed font-light">
             創新永續，共創未來。感謝每一位夥伴的傑出貢獻。
           </p>
        </div>
      </header>

      {/* Main Content List */}
      <main className="flex-grow px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="space-y-4">
          {filteredPrizes.length > 0 ? (
            filteredPrizes.map((prize) => (
              <div 
                key={prize.id} 
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 min-h-[140px] flex flex-col md:flex-row"
              >
                {/* Left Section: Prize Info with Background Image */}
                <div className="md:w-[320px] relative shrink-0 overflow-hidden flex flex-col justify-center p-5 group">
                   {/* Background Image & Overlay */}
                   <div className="absolute inset-0 z-0">
                      <img 
                        src={prize.image} 
                        alt={prize.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                      <div className="absolute inset-0 bg-slate-900/85 group-hover:bg-slate-900/80 transition-colors"></div>
                   </div>

                   {/* Content */}
                   <div className="relative z-10 text-white">
                      <h2 className="text-lg font-bold leading-tight mb-1 drop-shadow-sm">
                        {prize.name}
                      </h2>
                      <p className="text-gray-300 text-xs font-light line-clamp-2 mb-3">
                        {prize.description}
                      </p>

                      <div className="flex items-center gap-4 text-xs font-bold tracking-wider">
                        <div className="flex items-baseline gap-1">
                          <span className="uppercase text-[9px] text-gray-400">Total</span>
                          <span className="text-base text-white">{prize.totalCount}</span>
                        </div>
                        <div className="w-[1px] h-3 bg-gray-600"></div>
                        <div className="flex items-baseline gap-1">
                          <span className="uppercase text-[9px] text-gray-400">Awarded</span>
                          <span className="text-base text-lcy-yellow">{prize.winners.length}</span>
                        </div>
                      </div>
                   </div>
                </div>

                {/* Right Section: Winners Grid */}
                <div className="flex-1 p-4 bg-white flex flex-col justify-center min-w-0">
                  {prize.winners.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                      {prize.winners.map((winner) => (
                        <div 
                          key={winner.id}
                          className="flex items-center gap-2 bg-gray-50 border border-gray-100 rounded px-3 py-2 hover:border-lcy-yellow/50 transition-colors"
                        >
                          <div className="w-7 h-7 rounded-full bg-white border border-gray-200 flex items-center justify-center text-gray-600 font-bold text-xs shrink-0 shadow-sm">
                            {winner.name.charAt(0)}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-bold text-lcy-dark text-xs truncate">
                              {winner.name}
                            </div>
                            <div className="text-[10px] text-gray-500 font-medium truncate">
                              {winner.department}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 gap-2 py-2">
                      <Users className="w-4 h-4 text-gray-300" />
                      <span className="text-xs font-medium tracking-wide">尚未公布得獎名單</span>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">此區間尚未建立獎項或名單</p>
            </div>
          )}
        </div>
      </main>

      {/* Corporate Footer - New Design */}
      <footer className="relative bg-[#333333] h-32 overflow-hidden mt-auto">
        {/* Yellow Diagonal Shape */}
        <div
          className="absolute top-0 left-0 h-full w-[35%] bg-lcy-yellow"
          style={{ clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)' }}
        ></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex justify-end items-center">
            <div className="flex flex-col items-end">
                <h2 className="text-xl font-black text-white tracking-tight leading-none mb-2">
                  LC<span style={{ fontSize: '1.2em' }}>y</span>
                </h2>
                <div className="w-full min-w-[300px] h-[1px] bg-gray-500 mb-2"></div>
                <p className="text-gray-400 text-xs font-light">
                  © 2025 LCy All Rights Reserved.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};
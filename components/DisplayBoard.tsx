'use client';

import React, { useMemo, useState, useRef, useEffect } from 'react';
import { Prize, Winner } from '../types';
import { Users, Search, Trophy } from 'lucide-react';
import { prizeImageFocus } from '../lib/prizeImages';

interface DisplayBoardProps {
  prizes: Prize[];
  lastWinnerId: string | null;
}

type TabType = 'special-top' | '2-5' | '6-10' | '11-13' | 'bonus' | 'comfort';

interface SearchResult {
  winner: Winner;
  prize: Prize;
  winnerId: string; // Unique ID for scrolling
}

// Function to mask middle characters of a name (only Chinese name part, preserve employee ID)
const maskName = (fullName: string): string => {
  // Split by parenthesis to separate name and employee ID
  const match = fullName.match(/^(.+?)\s*(\(.+\))?$/);
  if (!match) return fullName;

  const namePart = match[1].trim(); // Chinese name part
  const idPart = match[2] || ''; // Employee ID part (with parenthesis)

  // Mask only the middle characters of the Chinese name
  if (namePart.length <= 2) {
    return fullName; // Don't mask if name is too short
  }

  const firstChar = namePart.charAt(0);
  const lastChar = namePart.charAt(namePart.length - 1);
  const middleLength = namePart.length - 2;
  const maskedName = firstChar + 'O'.repeat(middleLength) + lastChar;

  // Combine masked name with employee ID
  return idPart ? `${maskedName} ${idPart}` : maskedName;
};

export const DisplayBoard: React.FC<DisplayBoardProps> = ({ prizes }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  // 上方固定區（導覽列 + 標題橫幅）；捲動到指定段落時用實際高度計算位移
  const fixedTopRef = useRef<HTMLDivElement>(null);
  const fixedTopHeight = () => fixedTopRef.current?.offsetHeight ?? (window.innerWidth >= 768 ? 267 : 315);

  // Sort by rank (0 is highest, then 1-13, then 99)
  const sortedPrizes = useMemo(() => [...prizes].sort((a, b) => a.rank - b.rank), [prizes]);

  // Group prizes by tab categories
  const prizeGroups = useMemo(() => {
    return {
      'special-top': sortedPrizes.filter(p => p.rank === 0 || p.rank === 1),
      '2-5': sortedPrizes.filter(p => p.rank >= 2 && p.rank <= 5),
      '6-10': sortedPrizes.filter(p => p.rank >= 6 && p.rank <= 10),
      '11-13': sortedPrizes.filter(p => p.rank >= 11 && p.rank <= 13),
      'bonus': sortedPrizes.filter(p => p.rank === 95), // 總裁加碼獎
      'comfort': sortedPrizes.filter(p => p.rank >= 96 && p.rank <= 99), // 溫馨獎
    };
  }, [sortedPrizes]);

  // Filter winners based on search query
  const isWinnerMatch = (winner: Winner) => {
    if (!searchQuery) return false;
    const query = searchQuery.toLowerCase();
    return winner.name.toLowerCase().includes(query) ||
           winner.department.toLowerCase().includes(query) ||
           winner.id.toLowerCase().includes(query);
  };

  // Calculate search results with prize information
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!searchQuery.trim()) return [];

    const results: SearchResult[] = [];
    sortedPrizes.forEach((prize) => {
      prize.winners.forEach((winner) => {
        if (isWinnerMatch(winner)) {
          results.push({
            winner,
            prize,
            winnerId: `winner-${prize.id}-${winner.id}`,
          });
        }
      });
    });
    return results;
  }, [searchQuery, sortedPrizes]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Scroll to specific winner
  const scrollToWinner = (winnerId: string) => {
    const element = document.getElementById(winnerId);
    if (element) {
      const navHeight = fixedTopHeight();
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight - 20; // Extra 20px padding

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });

      setShowResults(false); // Close dropdown after scrolling
    }
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Account for both fixed nav and fixed header (nav + search section)
      const navHeight = fixedTopHeight() + 16;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - navHeight;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  const tabs: { id: TabType; label: string }[] = [
    { id: 'special-top', label: '特獎/頭獎' },
    { id: '2-5', label: '2-5 獎' },
    { id: '6-10', label: '6-10 獎' },
    { id: '11-13', label: '11-13 獎' },
    { id: 'bonus', label: '加碼獎' },
    { id: 'comfort', label: '溫馨獎' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-lcy-slate font-sans">

      {/* 固定在上方的導覽列 + 標題橫幅（同一個容器，高度自動銜接）
          手機：Logo 列 → 標題橫幅 → 分頁按鈕；桌機：導覽列 → 標題橫幅 */}
      <div ref={fixedTopRef} className="fixed top-0 left-0 right-0 z-50 flex flex-col">

      {/* 手機版 Logo 列：放在最上方（桌機的 Logo 在導覽列內） */}
      <div className="md:hidden order-1 relative z-0 bg-white flex items-center gap-2 justify-center py-2.5 border-b border-gray-100">
        <span className="text-lg font-black tracking-tighter text-lcy-dark">LCy</span>
        <div className="h-4 w-[1px] bg-gray-300 mx-1"></div>
        <span className="text-[10px] font-bold text-yep-electric tracking-wide">YEAR END PARTY 2026</span>
      </div>

      {/* Navigation Bar */}
      <nav className="order-3 md:order-1 relative z-0 bg-white border-b border-gray-200 shadow-sm">
        {/* Desktop Layout - 保持不變 */}
        <div className="hidden md:flex max-w-7xl mx-auto px-4 h-16 items-center justify-between">
          {/* Logo Area */}
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black tracking-tighter text-lcy-dark">LCy</span>
            <div className="h-5 w-[1px] bg-gray-300 mx-2"></div>
            <span className="text-xs font-bold text-yep-electric tracking-wide">YEAR END PARTY 2026</span>
          </div>

          {/* Desktop Tabs */}
          <div className="flex items-center h-full gap-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="h-full px-5 text-sm font-bold transition-colors relative flex items-center text-gray-400 hover:text-gray-600 hover:bg-gray-50/50"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Mobile Layout - 兩排按鈕設計 */}
        <div className="md:hidden px-3 py-3">
          {/* Mobile Tabs - 兩排網格布局 */}
          <div className="grid grid-cols-3 gap-2">
            {/* 第一排：3 個按鈕 */}
            {tabs.slice(0, 3).map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="px-2 py-2.5 text-[11px] font-bold rounded-md transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
              >
                {tab.label}
              </button>
            ))}

            {/* 第二排：3 個按鈕 */}
            {tabs.slice(3, 6).map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="px-2 py-2.5 text-[11px] font-bold rounded-md transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Hero / Title Section - Fixed at top（2026 主視覺：榮聚先進・催化未來） */}
      {/* relative z-10：搜尋結果往下展開時要蓋在分頁按鈕上方 */}
      <header className="yep-hero order-2 md:order-2 relative z-10 py-4 md:py-5 px-4 text-center shadow-lg shadow-blue-900/30">
        <div className="yep-hero-bg" aria-hidden="true">
          <div className="yep-hero-grid"></div>
        </div>
        <div className="relative max-w-4xl mx-auto">
           {/* 李長榮集團 · 2026 年終尾牙盛會 */}
           <div className="flex items-center justify-center gap-3 text-[11px] md:text-sm font-semibold tracking-[0.3em] text-blue-100">
             <span className="yep-rule yep-rule-left" aria-hidden="true"></span>
             <span className="whitespace-nowrap">李長榮集團 · 2026 年終尾牙盛會</span>
             <span className="yep-rule yep-rule-right" aria-hidden="true"></span>
           </div>

           {/* 主標題 */}
           <h1 className="mt-1.5 md:mt-2 text-[28px] leading-tight md:text-5xl">
             <span className="yep-title">榮聚先進・催化未來</span>
           </h1>
           <div className="yep-flare w-40 md:w-64 mx-auto mt-1" aria-hidden="true"></div>

           {/* 英文副標 */}
           <div className="mt-1.5 flex items-center justify-center gap-3 text-[9px] md:text-[11px] italic font-semibold tracking-[0.45em] text-blue-200/90">
             <span className="yep-rule yep-rule-left" aria-hidden="true"></span>
             <span className="whitespace-nowrap">CATALYZING THE FUTURE</span>
             <span className="yep-rule yep-rule-right" aria-hidden="true"></span>
           </div>

           {/* Search Input with Dropdown Results */}
           <div className="max-w-md mx-auto relative mt-3 md:mt-4" ref={searchRef}>
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 z-10" />
             <input
               type="text"
               placeholder="搜尋得獎者姓名、工號或廠別"
               value={searchQuery}
               onChange={(e) => {
                 setSearchQuery(e.target.value);
                 setShowResults(true);
               }}
               onFocus={() => searchQuery && setShowResults(true)}
               className="w-full pl-10 pr-10 py-2.5 border border-blue-300/40 bg-white/95 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-transparent text-sm text-lcy-dark shadow-[0_0_18px_rgba(59,155,255,0.35)]"
             />
             {searchQuery && (
               <button
                 onClick={() => {
                   setSearchQuery('');
                   setShowResults(false);
                 }}
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 z-10"
               >
                 ✕
               </button>
             )}

             {/* Search Results Dropdown */}
             {showResults && searchQuery && (
               <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-[40vh] md:max-h-[300px] overflow-y-auto">
                 {searchResults.length > 0 ? (
                   <>
                     {/* Results Summary */}
                     <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                       <p className="text-xs font-medium text-gray-600">
                         找到 <span className="text-lcy-yellow font-bold">{searchResults.length}</span> 筆結果
                       </p>
                     </div>

                     {/* Results List */}
                     <div className="py-1">
                       {searchResults.map((result, index) => (
                         <button
                           key={result.winnerId}
                           onClick={() => scrollToWinner(result.winnerId)}
                           className="w-full px-4 py-3 text-left hover:bg-lcy-yellow/10 transition-colors border-b border-gray-100 last:border-b-0 flex items-start gap-3 group"
                         >
                           {/* Prize Icon */}
                           <div className="shrink-0 mt-0.5">
                             <Trophy className="w-4 h-4 text-lcy-yellow" />
                           </div>

                           {/* Winner Info */}
                           <div className="flex-1 min-w-0">
                             <div className="flex items-baseline gap-2 mb-1">
                               <span className="text-xs font-bold text-gray-400 uppercase">
                                 {result.prize.name}
                               </span>
                             </div>
                             <div className="font-bold text-sm text-lcy-dark group-hover:text-lcy-yellow transition-colors">
                               {maskName(result.winner.name)}
                             </div>
                             <div className="text-xs text-gray-500 mt-0.5">
                               {result.winner.department}
                             </div>
                           </div>

                           {/* Arrow Indicator */}
                           <div className="shrink-0 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                             <svg className="w-4 h-4 text-lcy-yellow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                             </svg>
                           </div>
                         </button>
                       ))}
                     </div>
                   </>
                 ) : (
                   /* No Results */
                   <div className="px-4 py-8 text-center">
                     <Search className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                     <p className="text-sm text-gray-500">查無相關得獎者</p>
                     <p className="text-xs text-gray-400 mt-1">請嘗試其他關鍵字</p>
                   </div>
                 )}
               </div>
             )}
           </div>
        </div>
      </header>

      </div>

      {/* Spacer for the fixed nav + header (mobile ≈ 146 + 169, desktop ≈ 64 + 203) */}
      <div className="h-[326px] md:h-[280px]"></div>

      {/* Main Content List */}
      <main className="flex-grow px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          {tabs.map((tab) => {
            const groupPrizes = prizeGroups[tab.id];
            if (!groupPrizes || groupPrizes.length === 0) return null;

            return (
              <section key={tab.id} id={tab.id} className="scroll-mt-[340px] md:scroll-mt-[292px]">
                {/* Section Header */}
                <div className="mb-4">
                  <h2 className="text-xl font-bold text-lcy-dark pb-2">{tab.label}</h2>
                  <div className="yep-section-rule" aria-hidden="true"></div>
                </div>

                {/* Prizes in this section */}
                <div className="space-y-4">
                  {groupPrizes.map((prize) => (
                    <div
                      key={prize.id}
                      className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow duration-300 min-h-[140px] flex flex-col md:flex-row"
                    >
                      {/* Left Section: Prize Info with Background Image */}
                      <div className="md:w-[320px] relative shrink-0 overflow-hidden flex flex-col justify-center p-5 group">
                         {/* Background Image & Overlay */}
                         {/* 獎品圖滿版填滿卡片；實拍照依 lib/prizeImages.ts 的對焦位置裁切 */}
                         <div className="absolute inset-0 z-0">
                            <img
                              src={prize.image}
                              alt={prize.name}
                              style={{ objectPosition: prizeImageFocus(prize.image) }}
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            {/* 實拍照：左深右淺的漸層遮罩，左側文字清楚、右側商品透出；禮券等維持均勻深色 */}
                            <div
                              className={`absolute inset-0 transition-opacity group-hover:opacity-90 ${
                                prize.image.startsWith('/prizes/')
                                  ? 'bg-gradient-to-r from-[#061a52]/90 via-[#061a52]/65 to-[#061a52]/25'
                                  : 'bg-[#061a52]/85'
                              }`}
                            ></div>
                         </div>

                         {/* Content */}
                         <div className="relative z-10 text-white">
                            <h3 className="text-lg font-bold leading-tight mb-3 drop-shadow-sm">
                              {prize.name}
                            </h3>

                            <div className="flex items-center gap-4 text-xs font-bold tracking-wider">
                              <div className="flex items-baseline gap-1">
                                <span className="uppercase text-[9px] text-gray-400">Total</span>
                                <span className="text-base text-white">{prize.totalCount}</span>
                              </div>
                              <div className="w-[1px] h-3 bg-gray-600"></div>
                              <div className="flex items-baseline gap-1">
                                <span className="uppercase text-[9px] text-gray-400">Awarded</span>
                                <span className="text-base text-sky-300">{prize.winners.length}</span>
                              </div>
                            </div>
                         </div>
                      </div>

                      {/* Right Section: Winners Grid */}
                      <div className="flex-1 p-4 bg-white flex flex-col justify-center min-w-0">
                        {prize.winners.length > 0 ? (
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {prize.winners.map((winner) => {
                              const isHighlighted = isWinnerMatch(winner);
                              const winnerId = `winner-${prize.id}-${winner.id}`;
                              return (
                                <div
                                  key={winner.id}
                                  id={winnerId}
                                  className={`flex flex-col gap-1 rounded px-3 py-3 transition-all ${
                                    isHighlighted
                                      ? 'bg-lcy-yellow border-2 border-lcy-yellow shadow-md'
                                      : 'bg-gray-50 border border-gray-100 hover:border-sky-400/60'
                                  }`}
                                >
                                  <div className="font-bold text-lcy-dark text-base leading-tight">
                                    {maskName(winner.name)} {winner.department} 
                                  </div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    {prize.name}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="flex items-center justify-center h-full text-gray-400 gap-2 py-2">
                            <Users className="w-4 h-4 text-gray-300" />
                            <span className="text-xs font-medium tracking-wide">尚未公布得獎名單</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {sortedPrizes.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-block p-4 rounded-full bg-gray-100 mb-3">
                <Search className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">尚未建立獎項或名單</p>
            </div>
          )}
        </div>
      </main>

      {/* Corporate Footer - New Design */}
      <footer className="relative bg-[#050f3a] h-32 overflow-hidden mt-auto">
        {/* Yellow Diagonal Shape */}
        <div
          className="absolute top-0 left-0 h-full w-[35%]"
          style={{
            clipPath: 'polygon(0 0, 100% 0, 70% 100%, 0% 100%)',
            background: 'linear-gradient(120deg, #2563ff 0%, #3b9bff 55%, #5ad1ff 100%)',
          }}
        ></div>

        {/* Content */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 h-full flex justify-end items-center">
            <div className="flex flex-col items-end">
                <h2 className="text-xl font-black text-white tracking-tight leading-none mb-2">
                  LC<span style={{ fontSize: '1.2em' }}>y</span>
                </h2>
                <div className="w-full min-w-[300px] h-[1px] bg-gray-500 mb-2"></div>
                <p className="text-gray-400 text-xs font-light">
                  © 2026 LCy All Rights Reserved.
                </p>
            </div>
        </div>
      </footer>
    </div>
  );
};
'use client';

import React, { useMemo, useState } from 'react';
import { Prize, Winner } from '../types';
import { Users, Search } from 'lucide-react';

interface DisplayBoardProps {
  prizes: Prize[];
  lastWinnerId: string | null;
}

type TabType = 'special-top' | '1-5' | '6-10' | '11-13' | 'comfort';

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

  // Sort by rank (0 is highest, then 1-13, then 99)
  const sortedPrizes = useMemo(() => [...prizes].sort((a, b) => a.rank - b.rank), [prizes]);

  // Group prizes by tab categories
  const prizeGroups = useMemo(() => {
    return {
      'special-top': sortedPrizes.filter(p => p.rank === 0 || p.rank === 1),
      '1-5': sortedPrizes.filter(p => p.rank >= 2 && p.rank <= 5),
      '6-10': sortedPrizes.filter(p => p.rank >= 6 && p.rank <= 10),
      '11-13': sortedPrizes.filter(p => p.rank >= 11 && p.rank <= 13),
      'comfort': sortedPrizes.filter(p => p.rank === 99),
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

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      // Account for both fixed nav and fixed header (nav + search section)
      const navHeight = window.innerWidth >= 768 ? 196 : 320; // md:196px (16+180), mobile:320px (120+200)
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
                onClick={() => scrollToSection(tab.id)}
                className="px-2 py-2.5 text-[11px] font-bold rounded-md transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
              >
                {tab.label}
              </button>
            ))}

            {/* 第二排：2 個按鈕 + 1 個空位 */}
            {tabs.slice(3, 5).map((tab) => (
              <button
                key={tab.id}
                onClick={() => scrollToSection(tab.id)}
                className="px-2 py-2.5 text-[11px] font-bold rounded-md transition-all bg-gray-100 text-gray-500 hover:bg-gray-200 active:scale-95"
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

      {/* Hero / Title Section - Fixed at top */}
      <header className="bg-white py-6 px-4 text-center border-b border-gray-100 fixed top-[120px] md:top-16 left-0 right-0 z-40 shadow-sm">
        <div className="max-w-4xl mx-auto space-y-4">
           <h1 className="text-2xl md:text-3xl font-black text-lcy-dark tracking-tight">
             榮耀時刻 · 得獎名單
           </h1>
           <p className="text-gray-500 text-sm max-w-2xl mx-auto leading-relaxed font-light">
             創新永續，共創未來。感謝每一位夥伴的傑出貢獻。
           </p>

           {/* Search Input */}
           <div className="max-w-md mx-auto relative">
             <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
             <input
               type="text"
               placeholder="搜尋得獎者姓名、工號、廠別，搜尋後會標示黃色背景，請下拉找尋"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
               className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lcy-yellow focus:border-transparent text-sm"
             />
             {searchQuery && (
               <button
                 onClick={() => setSearchQuery('')}
                 className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
               >
                 ✕
               </button>
             )}
           </div>
        </div>
      </header>

      {/* Spacer for fixed header */}
      <div className="h-[200px] md:h-[180px]"></div>

      {/* Main Content List */}
      <main className="flex-grow px-4 py-6 max-w-7xl mx-auto w-full">
        <div className="space-y-8">
          {tabs.map((tab) => {
            const groupPrizes = prizeGroups[tab.id];
            if (!groupPrizes || groupPrizes.length === 0) return null;

            return (
              <section key={tab.id} id={tab.id} className="scroll-mt-[340px] md:scroll-mt-[220px]">
                {/* Section Header */}
                <div className="mb-4 pb-2 border-b-2 border-lcy-yellow">
                  <h2 className="text-xl font-bold text-lcy-dark">{tab.label}</h2>
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
                            <h3 className="text-lg font-bold leading-tight mb-1 drop-shadow-sm">
                              {prize.name}
                            </h3>
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {prize.winners.map((winner) => {
                              const isHighlighted = isWinnerMatch(winner);
                              return (
                                <div
                                  key={winner.id}
                                  className={`flex flex-col gap-1 rounded px-3 py-3 transition-all ${
                                    isHighlighted
                                      ? 'bg-lcy-yellow border-2 border-lcy-yellow shadow-md'
                                      : 'bg-gray-50 border border-gray-100 hover:border-lcy-yellow/50'
                                  }`}
                                >
                                  <div className="font-bold text-lcy-dark text-xl leading-tight">
                                    {maskName(winner.name)}
                                  </div>
                                  <div className="text-sm text-gray-500 font-medium">
                                    {winner.department}
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
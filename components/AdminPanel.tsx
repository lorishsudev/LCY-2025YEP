'use client';

import React, { useState } from 'react';
import { Prize, Employee } from '../types';
import { Trash2, UserPlus, PlayCircle, RotateCcw } from 'lucide-react';

interface AdminPanelProps {
  prizes: Prize[];
  candidates: Employee[];
  onImportCandidates: (candidates: Employee[]) => void;
  onDrawWinner: (prizeId: string) => void;
  onReset: () => void;
  isDrawing: boolean;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  prizes,
  candidates,
  onImportCandidates,
  onDrawWinner,
  onReset,
  isDrawing
}) => {
  const [candidateInput, setCandidateInput] = useState('');
  const [selectedPrizeId, setSelectedPrizeId] = useState<string>('');

  const handleImportCandidates = () => {
    const lines = candidateInput.split('\n').filter(l => l.trim());
    const newCandidates: Employee[] = lines.map((line, idx) => {
      // Simple parse: "Name, Dept" or just "Name"
      const [name, dept] = line.split(/[,\t]+/).map(s => s.trim());
      return {
        id: `c-${Date.now()}-${idx}`,
        name: name || 'Unknown',
        department: dept || 'General'
      };
    });
    onImportCandidates(newCandidates);
    setCandidateInput('');
  };

  const getAvailableCandidates = (prizeId: string) => {
      // In a real app, logic might exclude winners of OTHER prizes if rules say one prize per person
      // For this simple version, we filter out people who already won THIS prize, or ANY prize depending on rule.
      // Let's assume 1 person = 1 prize total.
      const allWinners = prizes.flatMap(p => p.winners.map(w => w.id));
      return candidates.filter(c => !allWinners.includes(c.id));
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-gray-800">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Left: Configuration */}
        <div className="space-y-8">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2 text-gray-700">
              <UserPlus /> 人員管理 / Candidates
            </h2>
            <div className="mb-4">
               <div className="text-sm text-gray-500 mb-2">
                 Total Pool: <span className="font-bold text-blue-600">{candidates.length}</span> people.
                 <br />
                 Available for Draw: <span className="font-bold text-green-600">{getAvailableCandidates('').length}</span>
               </div>
               <textarea
                 className="w-full h-32 border rounded p-2 font-mono text-sm bg-gray-50 mb-2"
                 placeholder="Format: Name, Department (one per line)&#10;Alice, Sales&#10;Bob, IT"
                 value={candidateInput}
                 onChange={e => setCandidateInput(e.target.value)}
               />
               <button 
                 onClick={handleImportCandidates}
                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
               >
                 Import Candidates
               </button>
            </div>
          </div>
          
           <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-red-500">
             <h2 className="text-xl font-bold text-red-600 mb-4">Danger Zone</h2>
             <button onClick={() => { if(confirm('Reset all data?')) onReset() }} className="flex items-center gap-2 text-red-600 hover:bg-red-50 p-2 rounded">
               <RotateCcw size={20} /> Reset System
             </button>
           </div>
        </div>

        {/* Right: Control Center */}
        <div className="space-y-8">
           <div className="bg-white p-6 rounded-xl shadow-xl border border-blue-100">
             <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-800">
               <PlayCircle className="text-blue-600" /> 抽獎控制台 / Draw Control
             </h2>
             
             <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
               {prizes.sort((a,b) => a.rank - b.rank).map(prize => {
                 const available = getAvailableCandidates(prize.id).length;
                 const remaining = prize.totalCount - prize.winners.length;
                 const isCompleted = remaining <= 0;
                 
                 return (
                   <div key={prize.id} className={`p-4 rounded-lg border-2 ${isCompleted ? 'bg-gray-50 border-gray-200' : 'bg-blue-50 border-blue-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-bold text-lg text-gray-800">{prize.name}</h3>
                          <p className="text-sm text-gray-500">{prize.description}</p>
                        </div>
                        <div className="text-right">
                          <span className={`text-xl font-bold ${isCompleted ? 'text-gray-400' : 'text-blue-600'}`}>
                            {prize.winners.length} / {prize.totalCount}
                          </span>
                        </div>
                      </div>
                      
                      {!isCompleted && (
                        <div className="flex items-center justify-between mt-4">
                           <span className="text-sm text-gray-500">
                             Pool: {available} candidates
                           </span>
                           <button 
                             onClick={() => onDrawWinner(prize.id)}
                             disabled={isDrawing || available === 0}
                             className={`
                               px-6 py-2 rounded-full font-bold shadow-lg transition-all
                               ${isDrawing ? 'bg-gray-400 cursor-wait' : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:scale-105 active:scale-95'}
                             `}
                           >
                             {isDrawing ? 'Drawing...' : 'DRAW ONE'}
                           </button>
                        </div>
                      )}

                      {/* Winners List for this prize */}
                      {prize.winners.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-gray-200 grid grid-cols-2 gap-2">
                          {prize.winners.map(w => (
                             <div key={w.id} className="text-sm bg-white border rounded px-2 py-1 flex justify-between">
                               <span>{w.name}</span>
                               <span className="text-gray-400 text-xs">{new Date(w.wonAt).toLocaleTimeString()}</span>
                             </div>
                          ))}
                        </div>
                      )}
                   </div>
                 )
               })}
               
               {prizes.length === 0 && (
                 <div className="text-center text-gray-400 py-12">
                   No prizes added yet. Add some prizes on the left!
                 </div>
               )}
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};
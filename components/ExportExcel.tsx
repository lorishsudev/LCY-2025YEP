'use client';

import React from 'react';
import { Prize } from '../types';
import { Download } from 'lucide-react';
import * as XLSX from 'xlsx';

interface ExportExcelProps {
  prizes: Prize[];
}

export const ExportExcel: React.FC<ExportExcelProps> = ({ prizes }) => {

  const handleExport = () => {
    // 準備數據
    const data: any[] = [];

    // 添加標題行
    data.push(['獎項ID', '獎項名稱', '總數量', '已抽出', '員工工號', '員工姓名', '員工廠別', '中獎時間']);

    // 按 rank 排序獎項
    const sortedPrizes = [...prizes].sort((a, b) => a.rank - b.rank);

    // 遍歷所有獎項
    sortedPrizes.forEach((prize) => {
      if (prize.winners.length > 0) {
        // 如果有得獎者，每個得獎者一行，每行都顯示獎項資訊
        prize.winners.forEach((winner) => {
          data.push([
            prize.id, // 獎項ID
            prize.name, // 獎項名稱
            prize.totalCount, // 總數量
            prize.winners.length, // 已抽出數量
            winner.id, // 員工工號
            winner.name, // 員工姓名
            winner.department, // 員工廠別
            new Date(winner.wonAt).toLocaleString('zh-TW', {
              timeZone: 'Asia/Taipei',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: false
            }) // 中獎時間
          ]);
        });
      } else {
        // 如果沒有得獎者，只顯示獎項資訊
        data.push([
          prize.id,
          prize.name,
          prize.totalCount,
          0,
          '-',
          '尚未抽出',
          '-',
          '-'
        ]);
      }
    });

    // 創建工作簿
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // 設置列寬
    worksheet['!cols'] = [
      { wch: 10 },  // 獎項ID
      { wch: 50 },  // 獎項名稱
      { wch: 10 },  // 總數量
      { wch: 10 },  // 已抽出
      { wch: 15 },  // 員工工號
      { wch: 25 },  // 員工姓名
      { wch: 20 },  // 員工廠別
      { wch: 20 },  // 中獎時間
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, '得獎名單');

    // 生成文件名（包含日期時間）
    const now = new Date();
    const fileName = `LCy_2025年終尾牙得獎名單_${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}_${String(now.getHours()).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}.xlsx`;

    // 下載文件
    XLSX.writeFile(workbook, fileName);
  };

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg active:scale-95 font-medium text-sm"
    >
      <Download className="w-4 h-4" />
      <span>匯出 Excel</span>
    </button>
  );
};

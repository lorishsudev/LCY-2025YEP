import { supabase, isSupabaseConfigured } from './supabase';
import { Prize, Winner, Employee } from '../types';
import { LotteryAward, LotteryWinner } from './database.types';

/**
 * Fetch all prizes with their winners from the database.
 * 失敗時直接拋出錯誤（不回傳空陣列），避免 /api/board 把「讀取失敗」快取成「沒有資料」。
 */
export async function fetchBoardPrizes(): Promise<Prize[]> {
  if (!isSupabaseConfigured || !supabase) {
    throw new Error('Supabase not configured');
  }

  // Fetch all awards
  const { data: awards, error: awardsError } = await supabase
    .from('lottery_award')
    .select('*')
    .order('id', { ascending: true });

  if (awardsError) throw awardsError;

  // Fetch all winners
  const { data: winners, error: winnersError } = await supabase
    .from('lottery_winner')
    .select('*')
    .order('won_at', { ascending: true });

  if (winnersError) throw winnersError;

  // Map database data to Prize type
  const prizes: Prize[] = (awards || []).map((award: LotteryAward) => {
    const awardWinners = (winners || [])
      .filter((w: LotteryWinner) => w.award_id === award.id)
      .map((w: LotteryWinner) => ({
        id: w.emp_id,
        name: `${w.emp_cname || w.emp_ename || 'Unknown'} (${w.emp_id})`,
        department: w.emp_factory || 'General',
        wonAt: new Date(w.won_at).getTime(),
      }));

    // Convert award ID to rank number
    const rank = convertAwardIdToRank(award.id);

    return {
      id: award.id,
      name: award.award,
      description: getAwardDescription(award.award, rank),
      image: getAwardImage(rank),
      totalCount: award.num,
      unitPrice: award.unit_price,
      rank,
      winners: awardWinners,
    };
  });

  return prizes;
}

/**
 * Add a winner to the database
 */
export async function addWinner(
  awardId: string,
  employee: Employee
): Promise<LotteryWinner | null> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured');
    return null;
  }

  try {
    // Get award details
    const { data: award, error: awardError } = await supabase
      .from('lottery_award')
      .select('*')
      .eq('id', awardId)
      .single();

    if (awardError) throw awardError;

    // Insert winner
    const { data, error } = await supabase
      .from('lottery_winner')
      .insert({
        award_id: awardId,
        award: award.award,
        emp_id: employee.id,
        emp_cname: employee.name,
        emp_ename: null,
        emp_factory: employee.department,
      })
      .select()
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error adding winner:', error);
    return null;
  }
}

/**
 * Get all employees/candidates (for admin panel)
 * Note: You'll need to create an employee table or import from your system
 */
export async function fetchCandidates(): Promise<Employee[]> {
  // TODO: Implement if you have an employee table
  // For now, returning empty array
  return [];
}

/**
 * Reset all winners (admin function)
 */
export async function resetWinners(): Promise<boolean> {
  if (!isSupabaseConfigured || !supabase) {
    console.error('Supabase not configured');
    return false;
  }

  try {
    const { error } = await supabase
      .from('lottery_winner')
      .delete()
      .neq('id', 0); // Delete all rows

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error resetting winners:', error);
    return false;
  }
}

/**
 * Helper function to convert award ID to rank number
 */
function convertAwardIdToRank(awardId: string): number {
  const idNum = parseInt(awardId, 10);
  if (awardId === '00') return 0; // 特獎
  if (idNum >= 95 && idNum <= 99) return idNum; // 加碼獎 (95-99)
  return idNum;
}

/**
 * Helper function to get award description based on rank
 */
function getAwardDescription(awardName: string, rank: number): string {
  // Award name from database already includes full description
  return awardName;
}

/**
 * Helper function to create instant-loading SVG voucher image
 */
function createVoucherSVG(amount: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400">
    <rect width="600" height="400" fill="#FFD700"/>
    <text x="300" y="200" font-family="Arial, sans-serif" font-size="72" font-weight="bold" fill="#1a202c" text-anchor="middle" dominant-baseline="middle">${amount}</text>
  </svg>`;
  return `data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}`;
}

/**
 * Helper function to get award image based on rank
 */
function getAwardImage(rank: number): string {
  const images: Record<number, string> = {
    // 2026 尾牙獎項（依 獎品品項_2026.pdf）
    0: '/prizes/gold-20g.jpg', // 特獎 幻彩黃金(20公克)
    1: createVoucherSVG('$50,000'), // 頭獎 禮券 $50,000
    2: '/prizes/iphone-18-pro.jpg', // 2獎 Apple iPhone 18 Pro (256G)
    3: '/prizes/ipad-pro-11.jpg', // 3獎 11吋 iPad Pro Wi-Fi 256GB
    4: createVoucherSVG('$35,000'), // 4獎 禮券 $35,000
    5: createVoucherSVG('$20,000'), // 5獎 禮券 $20,000
    6: '/prizes/dyson-hp11.jpg', // 6獎 Dyson 三合一涼暖智能空氣清淨機 HP11
    7: '/prizes/dyson-v10.jpg', // 7獎 Dyson V10 Konical 雙錐無纏結吸塵器
    8: '/prizes/switch-2.jpg', // 8獎 Nintendo Switch 2 主機
    9: '/prizes/garmin-forerunner-170.jpg', // 9獎 Garmin Forerunner 170 Music
    10: createVoucherSVG('$10,000'), // 10獎 禮券 $10,000
    11: '/prizes/sony-wf-l910.jpg', // 11獎 SONY 真無線開放式藍牙耳機 WF-L910
    12: createVoucherSVG('$5,000'), // 12獎 禮券 $5,000
    13: '/prizes/sodastream-terra.jpg', // 13獎 Sodastream 快扣氣泡水機 TERRA
    95: createVoucherSVG('$10,000'), // 總裁加碼獎 禮券 $10,000
    96: createVoucherSVG('$2,500'), // 溫馨獎 禮券 $2,500
  };

  return images[rank] || createVoucherSVG('Prize');
}

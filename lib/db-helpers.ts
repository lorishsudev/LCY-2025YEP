import { supabase, isSupabaseConfigured } from './supabase';
import { Prize, Winner, Employee } from '../types';
import { LotteryAward, LotteryWinner } from './database.types';

/**
 * Fetch all prizes with their winners from the database
 */
export async function fetchPrizesWithWinners(): Promise<Prize[]> {
  // Return empty array if Supabase is not configured
  if (!isSupabaseConfigured || !supabase) {
    return [];
  }

  try {
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
        rank,
        winners: awardWinners,
      };
    });

    return prizes;
  } catch (error) {
    console.error('Error fetching prizes:', error);
    return [];
  }
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
  if (awardId === '99') return 99; // 溫馨獎
  if (awardId === '00') return 0; // 特獎
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
    0: createVoucherSVG('$100,000'), // 特獎禮券 $100,000
    1: 'https://images.unsplash.com/photo-1593784991095-a205069470b6?w=600&q=80', // SHARP 電視
    2: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&q=80', // MacBook Air
    3: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&q=80', // iPad Pro
    4: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80', // iPhone 17
    5: 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&q=80', // ECOVACS 掃地機器人
    6: 'https://images.unsplash.com/photo-1578303512597-81e6cc155b3e?w=600&q=80', // Nintendo Switch 2
    7: 'https://images.unsplash.com/photo-1434493789847-2f02dc6ca35d?w=600&q=80', // Apple Watch
    8: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80', // Dyson 空氣清淨機
    9: createVoucherSVG('$10,000'), // 9獎禮券 $10,000
    10: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=600&q=80', // 飛利浦氣炸鍋
    11: createVoucherSVG('$5,000'), // 11獎禮券 $5,000
    12: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=600&q=80', // Panasonic 吹風機
    13: 'https://images.unsplash.com/photo-1606841837239-c5a1a4a07af7?w=600&q=80', // AirPods 4
    99: createVoucherSVG('$3,000'), // 溫馨獎禮券 $3,000
  };

  return images[rank] || createVoucherSVG('Prize');
}

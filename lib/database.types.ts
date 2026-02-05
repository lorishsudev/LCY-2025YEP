// Database types matching the Supabase schema

export interface LotteryAward {
  id: string;
  award: string;
  num: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

export interface LotteryWinner {
  id: number;
  award_id: string;
  award: string;
  emp_id: string;
  emp_cname: string | null;
  emp_ename: string | null;
  emp_factory: string | null;
  won_at: string;
}

// Mapping functions to convert database types to app types
export interface DatabasePrize {
  award: LotteryAward;
  winners: LotteryWinner[];
}

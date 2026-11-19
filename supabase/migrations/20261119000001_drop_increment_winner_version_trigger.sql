-- increment_winner_version 會寫入 lottery_winner.version，但該欄位不存在，
-- 導致任何 UPDATE lottery_winner（含 PUT /api/winners/:id）都失敗。
DROP TRIGGER IF EXISTS increment_winner_version ON public.lottery_winner;

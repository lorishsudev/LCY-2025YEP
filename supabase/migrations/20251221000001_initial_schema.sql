-- Create Lottery_Award table (獎項表)
CREATE TABLE IF NOT EXISTS lottery_award (
  id CHAR(2) PRIMARY KEY,
  award VARCHAR(100) NOT NULL,
  num INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create Lottery_Winner table (得獎者表)
CREATE TABLE IF NOT EXISTS lottery_winner (
  id SERIAL PRIMARY KEY,
  award_id CHAR(2) NOT NULL,
  award VARCHAR(100) NOT NULL,
  emp_id VARCHAR(20) NOT NULL,
  emp_cname VARCHAR(100),
  emp_ename VARCHAR(100),
  emp_factory VARCHAR(20),
  won_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  CONSTRAINT fk_award FOREIGN KEY (award_id) REFERENCES lottery_award(id) ON DELETE CASCADE
);

-- Create indexes for better query performance
CREATE INDEX idx_lottery_winner_award_id ON lottery_winner(award_id);
CREATE INDEX idx_lottery_winner_emp_id ON lottery_winner(emp_id);
CREATE INDEX idx_lottery_winner_won_at ON lottery_winner(won_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE lottery_award ENABLE ROW LEVEL SECURITY;
ALTER TABLE lottery_winner ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access (adjust based on your security requirements)
-- For now, allowing public read access for display purposes
CREATE POLICY "Allow public read access on lottery_award"
  ON lottery_award FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access on lottery_winner"
  ON lottery_winner FOR SELECT
  USING (true);

-- Create policy for authenticated insert/update/delete (admin operations)
-- You'll need to adjust these based on your authentication setup
CREATE POLICY "Allow authenticated insert on lottery_winner"
  ON lottery_winner FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated update on lottery_award"
  ON lottery_award FOR UPDATE
  USING (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated delete on lottery_winner"
  ON lottery_winner FOR DELETE
  USING (auth.role() = 'authenticated');

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for lottery_award
CREATE TRIGGER update_lottery_award_updated_at
  BEFORE UPDATE ON lottery_award
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data for testing (matching your current INITIAL_PRIZES structure)
INSERT INTO lottery_award (id, award, num) VALUES
  ('01', '特獎 Grand Prize', 1),
  ('02', '二獎 Second Prize', 2),
  ('03', '三獎 Third Prize', 5),
  ('04', '四獎 Fourth Prize', 5),
  ('05', '五獎 Fifth Prize', 10),
  ('06', '六獎 Sixth Prize', 10),
  ('07', '七獎 Seventh Prize', 15),
  ('10', '十獎 Tenth Prize', 20),
  ('11', '十一獎 11th Prize', 30),
  ('15', '十五獎 15th Prize', 50),
  ('99', '溫馨獎 Comfort Prize', 100)
ON CONFLICT (id) DO NOTHING;

-- Insert sample winners (matching your current test data)
INSERT INTO lottery_winner (award_id, award, emp_id, emp_cname, emp_ename, emp_factory) VALUES
  ('01', '特獎 Grand Prize', 'A00018801', '陳O銘', NULL, '台北總部'),
  ('02', '二獎 Second Prize', 'A00018802', '林O儀', NULL, '高雄廠'),
  ('02', '二獎 Second Prize', 'A00018803', '王O宏', NULL, '小港廠'),
  ('03', '三獎 Third Prize', 'A00018804', '張O華', NULL, '林園廠'),
  ('03', '三獎 Third Prize', 'A00018805', '郭O芬', NULL, '大社廠'),
  ('03', '三獎 Third Prize', 'A00018806', '李O成', NULL, '研發中心'),
  ('04', '四獎 Fourth Prize', 'A00018807', '黃O偉', NULL, '運籌管理處'),
  ('04', '四獎 Fourth Prize', 'A00018808', '蔡O婷', NULL, '財務處'),
  ('06', '六獎 Sixth Prize', 'A00018809', '楊O傑', NULL, '工安環保處'),
  ('10', '十獎 Tenth Prize', 'A00018810', '劉O君', NULL, '行政處'),
  ('11', '十一獎 11th Prize', 'A00018811', '吳O憲', NULL, '實習生'),
  ('99', '溫馨獎 Comfort Prize', 'A00019088', '許O欽', NULL, '資訊處'),
  ('99', '溫馨獎 Comfort Prize', 'A00019089', '鄭O文', NULL, '法務處'),
  ('99', '溫馨獎 Comfort Prize', 'A00019090', '謝O霖', NULL, '業務處')
ON CONFLICT DO NOTHING;

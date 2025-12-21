# Supabase 資料庫設置指南

此應用使用 Supabase 作為後端資料庫來存儲獎項和得獎者資訊。

## 快速開始

### 1. 創建 Supabase 專案

1. 前往 [Supabase](https://app.supabase.com)
2. 創建新專案或使用現有專案
3. 記下專案的 URL 和 anon key

### 2. 配置環境變數

在專案根目錄的 `.env.local` 文件中設置：

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. 執行資料庫遷移

#### 方法 A: 使用 Supabase SQL Editor (推薦)

1. 登入 Supabase Dashboard
2. 點擊左側菜單的 "SQL Editor"
3. 創建新查詢
4. 複製 `migrations/20251221000001_initial_schema.sql` 的內容
5. 貼上並執行

#### 方法 B: 使用 Supabase CLI

```bash
# 安裝 Supabase CLI (如果尚未安裝)
npm install -g supabase

# 登入
supabase login

# 鏈接到你的專案
supabase link --project-ref your-project-id

# 執行遷移
supabase db push
```

### 4. 驗證設置

執行遷移後，你應該在 Supabase Dashboard 的 "Table Editor" 中看到兩個表：

- `lottery_award` - 獎項表
- `lottery_winner` - 得獎者表

## 資料表結構

### lottery_award (獎項表)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | CHAR(2) | 獎項ID (主鍵) |
| award | VARCHAR(100) | 獎項名稱 |
| num | INTEGER | 獎項數量 |
| created_at | TIMESTAMP | 創建時間 |
| updated_at | TIMESTAMP | 更新時間 |

### lottery_winner (得獎者表)

| 欄位 | 類型 | 說明 |
|------|------|------|
| id | SERIAL | 自動遞增ID (主鍵) |
| award_id | CHAR(2) | 獎項ID (外鍵) |
| award | VARCHAR(100) | 獎項名稱 |
| emp_id | VARCHAR(20) | 員工ID |
| emp_cname | VARCHAR(100) | 員工中文姓名 |
| emp_ename | VARCHAR(100) | 員工英文姓名 |
| emp_factory | VARCHAR(20) | 部門/廠區 |
| won_at | TIMESTAMP | 得獎時間 |

## 獎項排名系統

獎項 ID 對應排名：
- `01-05`: 一至五獎 (最高獎項)
- `06-10`: 六至十獎 (中等獎項)
- `11-15`: 十一至十五獎 (普通獎項)
- `99`: 溫馨獎 (特殊獎項)

數字越小 = 獎項等級越高

## Row Level Security (RLS)

遷移文件已配置基本的 RLS 策略：

- **公開讀取**: 所有人都可以查看獎項和得獎者
- **認證寫入**: 只有認證用戶可以新增/修改/刪除數據

根據你的需求調整這些策略。

## API 使用範例

### 獲取所有獎項和得獎者

```typescript
import { fetchPrizesWithWinners } from '@/lib/db-helpers';

const prizes = await fetchPrizesWithWinners();
```

### 新增得獎者

```typescript
import { addWinner } from '@/lib/db-helpers';

const winner = await addWinner('01', {
  id: 'A00012345',
  name: '王小明',
  department: '研發中心'
});
```

### 重置所有得獎者

```typescript
import { resetWinners } from '@/lib/db-helpers';

const success = await resetWinners();
```

## 離線模式

如果未配置 Supabase 連接，應用會自動使用離線數據模式（硬編碼的測試數據），並在頁面頂部顯示警告訊息。

## 疑難排解

### 連接問題

1. 確認 `.env.local` 中的 URL 和 key 正確
2. 檢查 Supabase 專案是否處於活動狀態
3. 查看瀏覽器控制台的錯誤訊息

### RLS 策略問題

如果遇到權限錯誤，在 Supabase Dashboard 中：
1. 前往 "Authentication" > "Policies"
2. 檢查或調整策略設定

### 數據未顯示

1. 確認遷移已正確執行
2. 使用 Supabase SQL Editor 檢查表中是否有數據：
   ```sql
   SELECT * FROM lottery_award;
   SELECT * FROM lottery_winner;
   ```

# LCy 2025 Year End Party - RESTful API 文檔

## 基本資訊

**Base URL**: `http://localhost:3000/api` (開發環境)

**Content-Type**: `application/json`

## API 端點總覽

### 獎項管理 (Awards)
- `GET /api/awards` - 獲取所有獎項
- `GET /api/awards/:id` - 獲取單個獎項
- `POST /api/awards` - 創建新獎項
- `PUT /api/awards/:id` - 更新獎項
- `DELETE /api/awards/:id` - 刪除獎項

### 得獎者管理 (Winners)
- `GET /api/winners` - 獲取所有得獎者
- `GET /api/winners/:id` - 獲取單個得獎者
- `POST /api/winners` - 創建新得獎者
- `PUT /api/winners/:id` - 更新得獎者
- `DELETE /api/winners/:id` - 刪除得獎者

---

## 獎項管理 API

### 1. 獲取所有獎項

```http
GET /api/awards
```

**Response 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": "01",
      "award": "頭獎 SHARP 75型 QLED臻原色液晶顯示器",
      "num": 3,
      "created_at": "2025-12-21T11:48:16.771242Z",
      "updated_at": "2025-12-21T11:48:16.771242Z"
    }
  ],
  "count": 15
}
```

---

### 2. 獲取單個獎項

```http
GET /api/awards/:id
```

**Path Parameters**
- `id` (string, required) - 獎項ID，例如 "01"

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "01",
    "award": "頭獎 SHARP 75型 QLED臻原色液晶顯示器",
    "num": 3,
    "created_at": "2025-12-21T11:48:16.771242Z",
    "updated_at": "2025-12-21T11:48:16.771242Z"
  }
}
```

**Response 404 Not Found**
```json
{
  "error": "Award not found"
}
```

---

### 3. 創建新獎項

```http
POST /api/awards
```

**Request Body**
```json
{
  "id": "14",
  "award": "14獎 測試獎項",
  "num": 10
}
```

**Required Fields**
- `id` (string) - 獎項ID (2位字元)
- `award` (string) - 獎項名稱
- `num` (integer) - 獎項數量

**Response 201 Created**
```json
{
  "success": true,
  "data": {
    "id": "14",
    "award": "14獎 測試獎項",
    "num": 10,
    "created_at": "2025-12-21T12:00:00.000000Z",
    "updated_at": "2025-12-21T12:00:00.000000Z"
  },
  "message": "Award created successfully"
}
```

**Response 409 Conflict**
```json
{
  "error": "Award ID already exists"
}
```

---

### 4. 更新獎項

```http
PUT /api/awards/:id
```

**Path Parameters**
- `id` (string, required) - 獎項ID

**Request Body** (至少提供一個欄位)
```json
{
  "award": "14獎 更新後的獎項名稱",
  "num": 15
}
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "id": "14",
    "award": "14獎 更新後的獎項名稱",
    "num": 15,
    "created_at": "2025-12-21T12:00:00.000000Z",
    "updated_at": "2025-12-21T12:05:00.000000Z"
  },
  "message": "Award updated successfully"
}
```

---

### 5. 刪除獎項

```http
DELETE /api/awards/:id
```

**Path Parameters**
- `id` (string, required) - 獎項ID

**Response 200 OK**
```json
{
  "success": true,
  "message": "Award deleted successfully"
}
```

**注意**: 刪除獎項會同時刪除所有相關的得獎者記錄 (CASCADE)

---

## 得獎者管理 API

### 1. 獲取所有得獎者

```http
GET /api/winners
GET /api/winners?award_id=01
GET /api/winners?emp_id=A00018801
```

**Query Parameters**
- `award_id` (string, optional) - 過濾特定獎項的得獎者
- `emp_id` (string, optional) - 過濾特定員工

**Response 200 OK**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "award_id": "01",
      "award": "頭獎 SHARP 75型 QLED臻原色液晶顯示器",
      "emp_id": "A00018801",
      "emp_cname": "陳O銘",
      "emp_ename": null,
      "emp_factory": "台北總部",
      "won_at": "2025-12-21T11:50:00.000000Z"
    }
  ],
  "count": 1
}
```

---

### 2. 獲取單個得獎者

```http
GET /api/winners/:id
```

**Path Parameters**
- `id` (integer, required) - 得獎者ID

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "award_id": "01",
    "award": "頭獎 SHARP 75型 QLED臻原色液晶顯示器",
    "emp_id": "A00018801",
    "emp_cname": "陳O銘",
    "emp_ename": null,
    "emp_factory": "台北總部",
    "won_at": "2025-12-21T11:50:00.000000Z"
  }
}
```

---

### 3. 創建新得獎者

```http
POST /api/winners
```

**Request Body**
```json
{
  "award_id": "02",
  "award": "2獎 MacBook Air M4",
  "emp_id": "A00099999",
  "emp_cname": "王小明",
  "emp_ename": "Wang Xiao Ming",
  "emp_factory": "台北總部"
}
```

**Required Fields**
- `award_id` (string) - 獎項ID
- `award` (string) - 獎項名稱
- `emp_id` (string) - 員工ID

**Optional Fields**
- `emp_cname` (string) - 員工中文姓名
- `emp_ename` (string) - 員工英文姓名
- `emp_factory` (string) - 部門/廠區

**Response 201 Created**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "award_id": "02",
    "award": "2獎 MacBook Air M4",
    "emp_id": "A00099999",
    "emp_cname": "王小明",
    "emp_ename": "Wang Xiao Ming",
    "emp_factory": "台北總部",
    "won_at": "2025-12-21T12:10:00.000000Z"
  },
  "message": "Winner created successfully"
}
```

**Response 409 Conflict**
```json
{
  "error": "Employee has already won a prize"
}
```

**Response 400 Bad Request**
```json
{
  "error": "Award ID does not exist"
}
```

---

### 4. 更新得獎者

```http
PUT /api/winners/:id
```

**Path Parameters**
- `id` (integer, required) - 得獎者ID

**Request Body** (至少提供一個欄位)
```json
{
  "emp_cname": "王大明",
  "emp_factory": "高雄廠"
}
```

**Response 200 OK**
```json
{
  "success": true,
  "data": {
    "id": 15,
    "award_id": "02",
    "award": "2獎 MacBook Air M4",
    "emp_id": "A00099999",
    "emp_cname": "王大明",
    "emp_ename": "Wang Xiao Ming",
    "emp_factory": "高雄廠",
    "won_at": "2025-12-21T12:10:00.000000Z"
  },
  "message": "Winner updated successfully"
}
```

---

### 5. 刪除得獎者

```http
DELETE /api/winners/:id
```

**Path Parameters**
- `id` (integer, required) - 得獎者ID

**Response 200 OK**
```json
{
  "success": true,
  "message": "Winner deleted successfully"
}
```

---

## 錯誤碼說明

| 狀態碼 | 說明 |
|--------|------|
| 200 | 成功 |
| 201 | 創建成功 |
| 400 | 請求參數錯誤 |
| 404 | 資源不存在 |
| 409 | 資源衝突 (如 ID 重複) |
| 500 | 伺服器內部錯誤 |
| 503 | 資料庫未配置 |

---

## Postman 測試範例

### 測試流程

1. **獲取所有獎項**
   ```
   GET http://localhost:3000/api/awards
   ```

2. **創建新獎項**
   ```
   POST http://localhost:3000/api/awards
   Body (JSON):
   {
     "id": "20",
     "award": "測試獎項",
     "num": 5
   }
   ```

3. **創建得獎者**
   ```
   POST http://localhost:3000/api/winners
   Body (JSON):
   {
     "award_id": "20",
     "award": "測試獎項",
     "emp_id": "TEST001",
     "emp_cname": "測試員工"
   }
   ```

4. **查詢特定獎項的得獎者**
   ```
   GET http://localhost:3000/api/winners?award_id=20
   ```

5. **更新得獎者**
   ```
   PUT http://localhost:3000/api/winners/15
   Body (JSON):
   {
     "emp_factory": "新竹廠"
   }
   ```

6. **刪除測試資料**
   ```
   DELETE http://localhost:3000/api/winners/15
   DELETE http://localhost:3000/api/awards/20
   ```

---

## 注意事項

1. **一人一獎規則**: 系統會檢查員工 (emp_id) 是否已經得獎，每位員工只能得一次獎
2. **外鍵約束**: 創建得獎者時，award_id 必須存在於 lottery_award 表中
3. **級聯刪除**: 刪除獎項時會自動刪除該獎項的所有得獎者
4. **時間戳**: 創建得獎者時會自動記錄 won_at 時間
5. **排序**: 獲取得獎者列表時，預設按 won_at 降序排列 (最新的在前)

---

## 開發伺服器

啟動開發伺服器:
```bash
npm run dev
```

API 將在 `http://localhost:3000/api` 可用

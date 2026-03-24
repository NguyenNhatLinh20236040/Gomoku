# GOMOKU PROJECT — MILESTONE 1
# TÀI LIỆU THIẾT KẾ & TRIỂN KHAI (Tuần 28–30)

---

## PHẦN 1 — SYSTEM DESIGN

### 0. Deliverables tuần 28
- Kiến trúc tổng quan (frontend ↔ backend ↔ DB ↔ AI stub)
- ERD và schema ban đầu (SQLite dev, có thể chuyển MySQL)
- API spec ngắn (tạo trận, ghi nước đi, lấy lịch sử, AI/hint stub)
- Wireframe 3 màn: Home, Game, Pause/Menu

### 1.1. Kiến trúc hệ thống (tuần 28)

```
┌─────────────────────────────────────────────────┐
│                   CLIENT (Browser)              │
│  ┌───────────────────────────────────────────┐  │
│  │         ReactJS + TailwindCSS             │  │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐  │  │
│  │  │ HomePage  │ │  Game    │ │  Board   │  │  │
│  │  │          │ │(logic)    │ │  + Cell  │  │  │
│  │  └──────────┘ └──────────┘ └──────────┘  │  │
│  │         ↕ State Management (useState)     │  │
│  └───────────────────────────────────────────┘  │
│                       │                         │
│                       │ REST API (Milestone 2+) │
│                       ▼                         │
│  ┌───────────────────────────────────────────┐  │
│  │          NodeJS + Express (Backend)       │  │
│  │       - Lưu lịch sử trận đấu             │  │
│  │       - API cho AI opponent (stub tuần 28)|  │
│  └───────────────┬───────────────────────────┘  │
│                  │                              │
│                  ▼                              │
│  ┌───────────────────────────────────────────┐  │
│  │          SQLite Database                  │  │
│  │       - match_history table               │  │
│  └───────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘
```

**Mô tả các tầng:**

| Tầng | Công nghệ | Vai trò |
|------|-----------|---------|
| Frontend | ReactJS + TailwindCSS + Vite | Hiển thị UI, xử lý logic game, tương tác người dùng |
| Backend | NodeJS + Express | REST API lưu lịch sử, xử lý AI (milestone 2+) |
| Database | SQLite | Lưu trữ kết quả các trận đấu |

**Luồng dữ liệu (Milestone 1):**
1. Người dùng truy cập → React render **HomePage**
2. Click "Chơi 2 Người" → chuyển sang **Game**
3. Mỗi click ô cờ → `useState` cập nhật `board[][]` → re-render **Board** → hiển thị X/O
4. Sau mỗi nước → gọi `checkWin()` → nếu thắng, highlight 5 quân + hiện thông báo
5. *(Milestone 2+)*: Kết quả trận gửi lên Backend → lưu SQLite

---

### 1.2. Thiết kế Database (tuần 28)

**ERD rút gọn:**

```
Users (optional)
   └─< Matches ─┬─< Moves
        └─< MatchNotes (optional)
```

**Bảng `matches`:**

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Khóa chính |
| `mode` | TEXT NOT NULL DEFAULT 'local' | 'local' hoặc 'ai' |
| `rule` | TEXT NOT NULL DEFAULT 'gomoku5' | 'gomoku3', 'gomoku4', 'gomoku5', 'renju' |
| `ai_level` | TEXT | 'easy'/'medium'/'hard' hoặc null |
| `winner` | TEXT CHECK(winner IN ('X','O','DRAW')) | Kết quả |
| `total_moves` | INTEGER NOT NULL DEFAULT 0 | Tổng nước đi |
| `started_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | Bắt đầu |
| `ended_at` | DATETIME | Kết thúc |

**Bảng `moves`:**

| Field | Type | Mô tả |
|-------|------|-------|
| `id` | INTEGER PRIMARY KEY AUTOINCREMENT | Khóa chính |
| `match_id` | INTEGER NOT NULL | FK → matches.id |
| `turn` | INTEGER NOT NULL | Số thứ tự nước đi |
| `player` | TEXT CHECK(player IN ('X','O','AI')) | Người đánh |
| `row` | INTEGER NOT NULL | 0..14 |
| `col` | INTEGER NOT NULL | 0..14 |
| `played_at` | DATETIME DEFAULT CURRENT_TIMESTAMP | Thời gian đánh |

**Chỉ mục khuyến nghị:**
- `CREATE INDEX idx_moves_match_turn ON moves(match_id, turn);`
- `CREATE INDEX idx_matches_mode_rule ON matches(mode, rule, started_at);`

**SQL mẫu (SQLite):**

```sql
CREATE TABLE IF NOT EXISTS matches (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  mode         TEXT NOT NULL DEFAULT 'local',
  rule         TEXT NOT NULL DEFAULT 'gomoku5',
  ai_level     TEXT,
  winner       TEXT CHECK(winner IN ('X','O','DRAW')),
  total_moves  INTEGER NOT NULL DEFAULT 0,
  started_at   DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at     DATETIME
);

CREATE TABLE IF NOT EXISTS moves (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  match_id  INTEGER NOT NULL,
  turn      INTEGER NOT NULL,
  player    TEXT CHECK(player IN ('X','O','AI')) NOT NULL,
  row       INTEGER NOT NULL,
  col       INTEGER NOT NULL,
  played_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (match_id) REFERENCES matches(id)
);

CREATE INDEX IF NOT EXISTS idx_moves_match_turn ON moves(match_id, turn);
CREATE INDEX IF NOT EXISTS idx_matches_mode_rule ON matches(mode, rule, started_at);
```

---

### 1.3. API spec rút gọn (tuần 28)

| Method & Path | Body | Trả về | Ghi chú |
|---------------|------|--------|--------|
| POST /matches | `mode`, `rule`, `ai_level?` | `match_id`, trạng thái ban đầu | Tạo trận mới |
| POST /matches/:id/moves | `row`, `col`, `player` | trạng thái sau nước đi (`board`, `nextPlayer`, `winner`, `winCells`) | Validate hợp lệ, cập nhật DB |
| GET /matches/:id | - | metadata + moves | Phục vụ replay/history |
| GET /matches | query: `mode?`, `rule?`, `limit?` | danh sách trận | Phân trang sau |
| POST /ai/move | `board`, `currentPlayer`, `level` | `{row, col}` | Stub tuần 28 (random nếu level easy) |
| POST /ai/hint | `board`, `currentPlayer`, `rule` | `{row, col, reason?}` | Stub tuần 28 (chọn ô trống gần quân) |

**Quy tắc:**
- Board 15x15, rule quyết định `win_length` (3/4/5), Renju bổ sung forbidden move (tuần 35 mới áp).
- Server chịu trách nhiệm kiểm tra hợp lệ (ô trống, không vượt biên, đúng lượt, đúng rule) trước khi ghi DB.
- Response thống nhất: `{ data, error }` hoặc HTTP 4xx/5xx với message ngắn gọn.

### 1.4. Wireframe/Menu Pause (bổ sung tuần 28)

**Pause / In-game menu (modal):**

```
┌──────────────────────────────┐
│   GAME PAUSED                │
│   Rule: Gomoku-5   Timer: 30s│
│                              │
│  [▶ Resume]                  │
│  [↻ Restart]                 │
│  [⌂ Back to Home]            │
└──────────────────────────────┘
```

**Metadata panel (game screen, side/right or top bar):**
- Rule đang chơi (3/4/5/Renju)
- Timer mỗi lượt (đếm ngược)
- AI level nếu ở chế độ AI

## PHẦN 2 — UI/UX DESIGN

### 2.1. Trang Home (HomePage)

```
┌──────────────────────────────────────┐
│         (background: dark gradient)  │
│                                      │
│           ┌──────────┐               │
│           │  X  ·  O │               │
│           │  ·  X  · │  ← Logo icon  │
│           │  O  ·  X │               │
│           └──────────┘               │
│                                      │
│           G O M O K U                │
│    Cờ Caro - Năm quân để thắng      │
│                                      │
│   ┌──────────────────────────┐       │
│   │  👥 Chơi 2 Người (Local) │  ← Active button (indigo)
│   └──────────────────────────┘       │
│   ┌──────────────────────────┐       │
│   │  🤖 Chơi với AI          │  ← Disabled (gray)
│   │     Sắp ra mắt           │       │
│   └──────────────────────────┘       │
│                                      │
│      Project II - Gomoku Game        │
└──────────────────────────────────────┘
```

### 2.2. Trang Game

```
┌─────────────────────────────────────────┐
│  [← Trang chủ]    ⚔️ GOMOKU    [↻ Ván mới]│
│                                           │
│   ┌─────────────┐  VS  ┌─────────────┐   │
│   │ X Player 1  │      │ O Player 2  │   │  ← Lượt hiện tại sáng lên
│   └─────────────┘      └─────────────┘   │
│                                           │
│   🎉 Người chơi 1 (X) CHIẾN THẮNG!      │  ← Khi có kết quả
│                                           │
│   Nước đi: 25                             │
│                                           │
│      A  B  C  D  E  F  G  H  ...  O      │
│   1 ┌──┬──┬──┬──┬──┬──┬──┬──┬──┐        │
│   2 ├──┼──┼──┼──┤──┼──┼──┼──┤──┤        │
│   3 ├──┼──┤ X├──┼──┼──┼──┼──┤──┤        │
│   . ├──┼──┼──┤ O├──┼──┼──┼──┤──┤        │
│  15 └──┴──┴──┴──┴──┴──┴──┴──┴──┘        │
│                                           │
│   Gomoku - Project II                     │
└─────────────────────────────────────────┘
```

### 2.3. Màu sắc & UX

| Thành phần | Màu | Mục đích |
|------------|-----|----------|
| Background | Gradient dark (slate-900 → indigo-950) | Chuyên nghiệp, tập trung |
| Quân X | Indigo-600 (`#4F46E5`) | Nổi bật, dễ phân biệt |
| Quân O | Rose-500 (`#F43F5E`) | Tương phản rõ với X |
| Nước đi cuối | Yellow-100 + pulse glow | Thu hút mắt vào nước vừa đi |
| Ô thắng | Green-200 + blink | Rõ ràng khi kết thúc |
| Bàn cờ | Amber-50 (nền gỗ nhạt) | Giống bàn cờ thật |

**Trải nghiệm UX:**
- Quân cờ có animation **pop** khi đặt
- Nước đi cuối có **pulse glow** (nhấp nháy nhẹ)
- 5 quân thắng có **blink** animation
- Hover ô trống → đổi màu nền nhẹ (indigo-50)
- Ô đã có quân → cursor mặc định (không click được)

---

## PHẦN 3 — IMPLEMENTATION

### 3.1. Công nghệ sử dụng

| Công nghệ | Phiên bản | Ghi chú |
|-----------|-----------|---------|
| ReactJS | 19.x | UI framework |
| Vite | 8.x | Build tool, dev server |
| TailwindCSS | 4.x | Utility-first CSS |
| NodeJS | 18+ | Runtime |

### 3.2. Cấu trúc thư mục

```
gomoku/
├── index.html                  ← Entry HTML
├── package.json
├── vite.config.js              ← Cấu hình Vite + TailwindCSS v4
├── doc.md                      ← Tài liệu này
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx                ← Entry point React
    ├── index.css               ← TailwindCSS import + CSS animations
    ├── App.jsx                 ← Điều hướng Home ↔ Game
    ├── components/
    │   ├── Cell.jsx            ← Component ô cờ đơn lẻ
    │   ├── Board.jsx           ← Component bàn cờ 15x15
    │   └── Game.jsx            ← Logic chính: state, click, check win
    ├── pages/
    │   └── HomePage.jsx        ← Trang chủ
    └── utils/
        └── checkWin.js         ← Hàm kiểm tra thắng/hòa/tạo board
```

### 3.3. Mô tả các file chính

| File | Dòng | Chức năng |
|------|------|-----------|
| `src/utils/checkWin.js` | 67 | Logic kiểm tra thắng/hòa/tạo board |
| `src/components/Cell.jsx` | 39 | Component ô cờ (X/O/trống + highlight) |
| `src/components/Board.jsx` | 60 | Render lưới 15x15 với header hàng/cột |
| `src/components/Game.jsx` | 137 | Quản lý toàn bộ state + logic game |
| `src/pages/HomePage.jsx` | 60 | Giao diện trang chủ |
| `src/App.jsx` | 22 | Điều hướng trang (Home ↔ Game) |
| `src/index.css` | 49 | TailwindCSS + custom animations |

### 3.4. Hướng dẫn khởi tạo & chạy project

```bash
# 1. Di chuyển vào thư mục project
cd gomoku

# 2. Cài dependencies
npm install

# 3. Chạy development server
npm run dev

# 4. Mở trình duyệt
# http://localhost:5173

# 5. Build production (nếu cần)
npm run build
```

### 3.5. Cấu hình TailwindCSS v4 (vite.config.js)

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
})
```

### 3.6. Code các file chính

#### `src/utils/checkWin.js`

```js
const BOARD_SIZE = 15;
const WIN_COUNT = 5;

// Kiểm tra thắng — trả về mảng tọa độ 5 quân, hoặc null
export function checkWin(board, row, col, player) {
  const directions = [
    [0, 1],   // ngang
    [1, 0],   // dọc
    [1, 1],   // chéo chính (\)
    [1, -1],  // chéo phụ (/)
  ];

  for (const [dr, dc] of directions) {
    const cells = [[row, col]];

    // Đếm hướng thuận
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row + dr * i;
      const c = col + dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }

    // Đếm hướng ngược
    for (let i = 1; i < WIN_COUNT; i++) {
      const r = row - dr * i;
      const c = col - dc * i;
      if (r < 0 || r >= BOARD_SIZE || c < 0 || c >= BOARD_SIZE) break;
      if (board[r][c] !== player) break;
      cells.push([r, c]);
    }

    if (cells.length >= WIN_COUNT) return cells;
  }

  return null;
}

export function checkDraw(board) {
  return board.every(row => row.every(cell => cell !== null));
}

export function createEmptyBoard() {
  return Array.from({ length: BOARD_SIZE }, () =>
    Array.from({ length: BOARD_SIZE }, () => null)
  );
}
```

#### `src/components/Cell.jsx`

```jsx
export default function Cell({ value, onClick, isLastMove, isWinCell, disabled }) {
  const pieceClass = value === 'X'
    ? 'text-indigo-600 font-extrabold'
    : 'text-rose-500 font-extrabold';

  return (
    <button
      onClick={onClick}
      disabled={disabled || value !== null}
      className={`
        w-full aspect-square border border-gray-300
        flex items-center justify-center text-lg sm:text-xl md:text-2xl
        transition-all duration-150 cursor-pointer
        ${!value && !disabled ? 'hover:bg-indigo-50' : ''}
        ${isLastMove ? 'bg-yellow-100 animate-pulse-glow' : 'bg-white'}
        ${isWinCell ? 'bg-green-200 animate-win-blink' : ''}
      `}
    >
      {value && (
        <span className={`${pieceClass} animate-pop select-none`}>
          {value}
        </span>
      )}
    </button>
  );
}
```

#### `src/components/Board.jsx`

```jsx
import Cell from './Cell';
import { BOARD_SIZE } from '../utils/checkWin';

export default function Board({ board, onCellClick, lastMove, winCells, gameOver }) {
  const isLastMove = (row, col) => lastMove && lastMove[0] === row && lastMove[1] === col;
  const isWinCell  = (row, col) => winCells ? winCells.some(([r, c]) => r === row && c === col) : false;

  return (
    <div className="inline-block p-2 bg-amber-50 rounded-lg shadow-xl border-2 border-amber-200">
      {/* Header cột: A B C ... O */}
      <div className="grid gap-0" style={{ gridTemplateColumns: `28px repeat(${BOARD_SIZE}, 1fr)` }}>
        <div />
        {Array.from({ length: BOARD_SIZE }, (_, i) => (
          <div key={i} className="text-center text-xs text-gray-400 font-mono pb-1">
            {String.fromCharCode(65 + i)}
          </div>
        ))}
      </div>

      {/* Các hàng cờ */}
      {board.map((row, rowIdx) => (
        <div key={rowIdx} className="grid gap-0" style={{ gridTemplateColumns: `28px repeat(${BOARD_SIZE}, 1fr)` }}>
          <div className="flex items-center justify-center text-xs text-gray-400 font-mono pr-1">
            {rowIdx + 1}
          </div>
          {row.map((cell, colIdx) => (
            <Cell
              key={`${rowIdx}-${colIdx}`}
              value={cell}
              onClick={() => onCellClick(rowIdx, colIdx)}
              isLastMove={isLastMove(rowIdx, colIdx)}
              isWinCell={isWinCell(rowIdx, colIdx)}
              disabled={gameOver}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
```

#### `src/components/Game.jsx` (tóm tắt state logic)

```jsx
import { useState, useCallback } from 'react';
import Board from './Board';
import { checkWin, checkDraw, createEmptyBoard } from '../utils/checkWin';

export default function Game({ onBack }) {
  const [board, setBoard]       = useState(createEmptyBoard);
  const [isXTurn, setIsXTurn]   = useState(true);
  const [lastMove, setLastMove] = useState(null);
  const [winCells, setWinCells] = useState(null);
  const [winner, setWinner]     = useState(null);
  const [isDraw, setIsDraw]     = useState(false);
  const [moveCount, setMoveCount] = useState(0);

  const gameOver = winner !== null || isDraw;

  const handleCellClick = useCallback((row, col) => {
    if (board[row][col] || gameOver) return;

    const currentPlayer = isXTurn ? 'X' : 'O';
    const newBoard = board.map(r => [...r]);
    newBoard[row][col] = currentPlayer;

    setBoard(newBoard);
    setLastMove([row, col]);
    setMoveCount(prev => prev + 1);

    const winResult = checkWin(newBoard, row, col, currentPlayer);
    if (winResult) { setWinCells(winResult); setWinner(currentPlayer); return; }
    if (checkDraw(newBoard)) { setIsDraw(true); return; }

    setIsXTurn(!isXTurn);
  }, [board, isXTurn, gameOver]);

  const handleRestart = () => {
    setBoard(createEmptyBoard());
    setIsXTurn(true); setLastMove(null); setWinCells(null);
    setWinner(null);  setIsDraw(false);  setMoveCount(0);
  };

  // JSX render Board + UI ...
}
```

---

## PHẦN 4 — DEMO & GIẢI THÍCH

### 4.1. Hướng dẫn Demo

| Bước | Thao tác | Kết quả hiển thị |
|------|----------|-------------------|
| 1 | Chạy `npm run dev`, mở http://localhost:5173 | Trang Home với logo GOMOKU |
| 2 | Click **"👥 Chơi 2 Người (Local)"** | Chuyển sang trang Game, bàn cờ 15x15 hiện ra |
| 3 | Player 1 (X) click 1 ô | Ký tự **X** xuất hiện (animation pop), ô đổi nền vàng glow |
| 4 | Player 2 (O) click ô khác | Ký tự **O** xuất hiện, glow chuyển sang ô mới |
| 5 | Đặt 5 quân X liên tiếp | 5 ô đổi xanh + nhấp nháy, banner **"🎉 Người chơi 1 CHIẾN THẮNG!"** |
| 6 | Click **"↻ Ván mới"** | Reset toàn bộ, chơi lại ván mới |
| 7 | Click **"← Trang chủ"** | Quay về HomePage |
| 8 | Bàn cờ đầy mà không ai thắng | Banner **"🤝 HÒA!"** |

### 4.2. Giải thích Logic Check Win

```
Thuật toán: Kiểm tra 4 hướng từ ô vừa đặt
═══════════════════════════════════════════

Khi người chơi đặt quân tại (row, col), kiểm tra 4 hướng:

   Hướng 1: Ngang    →  (0, +1) và (0, -1)
   Hướng 2: Dọc      →  (+1, 0) và (-1, 0)
   Hướng 3: Chéo \   →  (+1, +1) và (-1, -1)
   Hướng 4: Chéo /   →  (+1, -1) và (-1, +1)

Với mỗi hướng:
  1. Bắt đầu từ ô (row, col) — đã có 1 quân
  2. Đi theo hướng thuận: đếm quân cùng loại liên tiếp
  3. Đi theo hướng ngược: đếm quân cùng loại liên tiếp
  4. Tổng >= 5 → THẮNG, trả về tọa độ các quân thắng

Ví dụ: X vừa đặt tại (7,7), kiểm tra hướng ngang:
  → Hướng thuận (+1): (7,8)=X, (7,9)=X, (7,10)=O → dừng. Đếm = 2
  → Hướng ngược (-1): (7,6)=X, (7,5)=X, (7,4)=null → dừng. Đếm = 2
  → Tổng: 1 (gốc) + 2 + 2 = 5 → THẮNG!
  → Trả về: [[7,5],[7,6],[7,7],[7,8],[7,9]] để highlight
```

**Độ phức tạp:** O(1) — chỉ kiểm tra tối đa 4 hướng × 8 bước = 32 ô, không phụ thuộc kích thước bàn.

---

## TỔNG KẾT MILESTONE 1

| Yêu cầu | Trạng thái | Ghi chú |
|---------|-----------|---------|
| Bàn cờ 15×15 | Hoàn thành | Header A-O (cột) + 1-15 (hàng) |
| Click đặt X / O | Hoàn thành | Animation pop khi đặt quân |
| Luân phiên lượt | Hoàn thành | Thanh hiển thị lượt sáng/tối |
| Kiểm tra thắng 5 quân | Hoàn thành | 4 hướng: ngang, dọc, chéo \, chéo / |
| Highlight nước đi cuối | Hoàn thành | Nền vàng + pulse glow animation |
| Highlight đường thắng | Hoàn thành | Nền xanh + blink animation |
| Thông báo kết quả | Hoàn thành | Banner thắng/hòa animate fade-in |
| Restart / Back | Hoàn thành | Nút ván mới + quay trang chủ |
| Giao diện đẹp | Hoàn thành | Dark gradient + TailwindCSS |
| Chơi với AI | Chưa làm | Milestone 2 |
| Backend NodeJS | Chưa làm | Milestone 2 |
| Database SQLite | Chưa làm | Milestone 2 |

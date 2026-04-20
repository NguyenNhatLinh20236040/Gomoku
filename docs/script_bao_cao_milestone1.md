# SCRIPT BÁO CÁO MILESTONE 1 — TUẦN 28–30
## Đề tài: Phát triển game Gomoku với AI nhiều cấp độ
### Sinh viên: Nguyễn Nhất Linh — 20236040

---

## 🎤 PHẦN MỞ ĐẦU (~1 phút)

> **Nói:**
>
> "Xin chào thầy, em là Nguyễn Nhất Linh, mã sinh viên 20236040. Hôm nay em xin báo cáo tiến độ Milestone 1 của đề tài **Phát triển game Gomoku với AI nhiều cấp độ và các chế độ luật chơi đa dạng**.
>
> Milestone 1 bao gồm công việc từ **tuần 28 đến tuần 30**, tập trung vào 3 mảng chính:
> 1. **Tuần 28**: Thiết kế hệ thống — kiến trúc, database, API spec, wireframe
> 2. **Tuần 29**: Khởi tạo project — setup ReactJS, NodeJS, cấu trúc thư mục
> 3. **Tuần 30**: Triển khai game local cơ bản — bàn cờ 15×15, đặt quân, kiểm tra thắng
>
> Em xin trình bày chi tiết từng phần ạ."

---

## 📐 PHẦN 1 — THIẾT KẾ HỆ THỐNG (Tuần 28) (~5 phút)

### 1.1. Kiến trúc hệ thống

> **Nói:**
>
> "Đầu tiên về kiến trúc hệ thống, em thiết kế theo **mô hình 3 tầng**:
>
> - **Tầng Frontend**: Sử dụng **ReactJS 19** kết hợp với **TailwindCSS 4** để xây dựng giao diện, build tool là **Vite 8**. Frontend xử lý trực tiếp logic game trên client, không phụ thuộc vào mạng.
> - **Tầng Backend**: Sử dụng **NodeJS 18+ với Express 4**, chạy REST API trên port 3001. Backend phục vụ lưu lịch sử trận đấu và xử lý AI ở các milestone sau.
> - **Tầng Database**: Sử dụng **SQLite** thông qua thư viện `better-sqlite3`, dạng file-based, không cần cài đặt server riêng.
>
> **Nguyên tắc thiết kế** của em là:
> - **Client-first Logic**: Logic đặt quân, kiểm tra thắng chạy trên client → game vẫn hoạt động offline
> - **Backend cho Persistence**: Backend chỉ bổ sung tính năng lưu trữ, không bắt buộc
> - **Stateless API**: Mỗi request độc lập, server không giữ session game
> - **Progressive Enhancement**: Game hoạt động offline trước, backend bổ sung tính năng dần"
>
> *(Mở file `docs/diagram_architecture.md` hoặc `docs/system-design.md` để chỉ sơ đồ Mermaid)*

### 1.2. Thiết kế Database

> **Nói:**
>
> "Về database, em thiết kế **2 bảng chính**:
>
> **Bảng `matches`** — lưu thông tin từng trận đấu, gồm 8 trường:
> - `id`: Khóa chính, tự tăng
> - `mode`: Chế độ chơi (`local` hoặc `ai`)
> - `rule`: Luật chơi (`gomoku3`, `gomoku4`, `gomoku5`, `renju`)
> - `ai_level`: Mức AI (nếu chơi với AI)
> - `winner`: Kết quả trận (`X`, `O`, hoặc `DRAW`)
> - `total_moves`: Tổng số nước đi
> - `started_at`, `ended_at`: Thời gian bắt đầu và kết thúc
>
> **Bảng `moves`** — lưu từng nước đi, gồm 7 trường:
> - `id`, `match_id` (FK liên kết về `matches`), `turn`, `player`, `row`, `col`, `played_at`
>
> **Quan hệ**: Một trận đấu (match) có nhiều nước đi (moves) → quan hệ **1-N**.
>
> Em cũng thiết kế sẵn các **index** để tối ưu truy vấn, ví dụ `idx_moves_match_turn` để truy vấn nhanh theo trận và thứ tự nước đi."
>
> *(Mở file `docs/diagram_erd.md` để chỉ sơ đồ ERD)*

### 1.3. API Specification

> **Nói:**
>
> "Em cũng thiết kế sẵn **6 endpoints API** cho backend:
>
> | # | Endpoint | Mô tả |
> |---|----------|-------|
> | 1 | `POST /api/matches` | Tạo trận đấu mới |
> | 2 | `GET /api/matches` | Lấy danh sách trận với filter + phân trang |
> | 3 | `GET /api/matches/:id` | Xem chi tiết 1 trận + tất cả nước đi |
> | 4 | `POST /api/matches/:id/moves` | Ghi nước đi mới vào trận |
> | 5 | `POST /api/ai/move` | AI tính nước đi (stub tuần 28) |
> | 6 | `POST /api/ai/hint` | Gợi ý nước đi (stub tuần 28) |
>
> Response thống nhất format `{ data, error }`. Server validate đầy đủ: ô trống, không vượt biên, đúng lượt, đúng rule.
>
> Các API AI ở milestone 1 này chỉ là **stub** — level easy trả random ô trống, sẽ implement thật ở milestone 2."

### 1.4. Wireframe UI

> **Nói:**
>
> "Về giao diện, em thiết kế wireframe cho **3 màn hình chính**:
>
> 1. **Trang Home**: Logo Gomoku, nút **Chơi 2 Người** (active), nút **Chơi với AI** (disabled, sắp ra mắt), nút **Lịch sử trận đấu** (disabled)
> 2. **Trang Game**: Header hiển thị lượt chơi + timer, bàn cờ 15×15 với header cột (A–O) và hàng (1–15), banner kết quả khi thắng/hòa
> 3. **Pause Menu**: Modal với 3 lựa chọn — Resume, Restart, Back to Home
>
> Bảng màu sử dụng tone **pink gradient** cho background, quân X màu **Pink-600**, quân O màu **Pink-500**, bàn cờ nền **Amber-50** giống gỗ."
>
> *(Mở file `docs/diagram_ui_flow.md` để chỉ sơ đồ luồng giao diện)*

---

## 🛠️ PHẦN 2 — KHỞI TẠO PROJECT (Tuần 29) (~3 phút)

### 2.1. Cấu trúc thư mục

> **Nói:**
>
> "Tuần 29, em tập trung **khởi tạo project** và setup môi trường phát triển.
>
> Cấu trúc thư mục tổng thể:
>
> ```
> gomoku/
> ├── docs/                  ← Tài liệu thiết kế (4 file)
> ├── server/                ← Backend NodeJS + Express
> │   ├── index.js           ← Entry point server
> │   ├── db/                ← Database schema + connection
> │   └── routes/            ← API routes
> └── src/                   ← Frontend React
>     ├── App.jsx            ← Router điều hướng
>     ├── components/        ← Board, Cell, Game, VictoryModal
>     ├── pages/             ← HomePage
>     └── utils/             ← checkWin logic
> ```
>
> Em phân chia rõ ràng Frontend (`src/`) và Backend (`server/`), riêng documentation nằm trong `docs/`."

### 2.2. Công nghệ và cấu hình

> **Nói:**
>
> "Các công nghệ em sử dụng:
>
> | Công nghệ | Phiên bản | Mục đích |
> |-----------|-----------|----------|
> | ReactJS | 19.x | UI framework |
> | TailwindCSS | 4.x | Utility-first CSS |
> | Vite | 8.x | Build tool + dev server |
> | NodeJS | 18+ | Backend runtime |
> | Express | 4.x | REST API framework |
> | better-sqlite3 | — | SQLite driver |
>
> Vite được cấu hình với plugin `@tailwindcss/vite` để tích hợp TailwindCSS v4 trực tiếp. Frontend chạy trên port **5173**, backend chạy trên port **3001**.
>
> Để chạy project, chỉ cần:
> ```bash
> npm install     # Cài dependencies
> npm run dev     # Chạy dev server frontend
> ```
> Server backend chạy riêng trong thư mục `server/`."

---

## 💻 PHẦN 3 — TRIỂN KHAI GAME (Tuần 29–30) (~7 phút)

### 3.1. Tổng quan các file đã triển khai

> **Nói:**
>
> "Về phần code, em đã triển khai **các file chính** sau:
>
> | File | Chức năng |
> |------|-----------|
> | `src/utils/checkWin.js` | Logic kiểm tra thắng, hòa, tạo board trống |
> | `src/components/Cell.jsx` | Component 1 ô cờ: hiển thị X/O, highlight, animation |
> | `src/components/Board.jsx` | Bàn cờ 15×15 với header cột/hàng |
> | `src/components/Game.jsx` | Quản lý toàn bộ state + logic chính |
> | `src/components/VictoryModal.jsx` | Modal hiển thị kết quả khi thắng/thua |
> | `src/pages/HomePage.jsx` | Trang chủ với logo và các nút chức năng |
> | `src/App.jsx` | Điều hướng giữa Home ↔ Game |
> | `src/index.css` | TailwindCSS import + custom animations |
>
> Em xin giải thích chi tiết phần **logic chính**."

### 3.2. Thuật toán kiểm tra thắng (checkWin)

> **Nói:**
>
> "Phần quan trọng nhất là **thuật toán kiểm tra thắng** trong file `checkWin.js`.
>
> **Ý tưởng**: Mỗi khi người chơi đặt quân tại ô (row, col), em kiểm tra **4 hướng** từ ô đó:
> 1. **Ngang**: hướng phải (0, +1) và trái (0, -1)
> 2. **Dọc**: hướng xuống (+1, 0) và lên (-1, 0)
> 3. **Chéo chính (\\)**: (+1, +1) và (-1, -1)
> 4. **Chéo phụ (/)**: (+1, -1) và (-1, +1)
>
> Với **mỗi hướng**, em:
> - Bắt đầu từ ô vừa đặt (đã có 1 quân)
> - Đi theo hướng thuận: đếm quân cùng loại liên tiếp cho đến khi gặp quân khác hoặc ra ngoài biên
> - Đi theo hướng ngược: tương tự
> - Nếu tổng ≥ 5 → **THẮNG**, trả về mảng tọa độ để highlight
>
> **Ví dụ**: X vừa đặt tại (7,7), kiểm tra hướng ngang:
> - Thuận: (7,8)=X, (7,9)=X, (7,10)=O → đếm = 2
> - Ngược: (7,6)=X, (7,5)=X, (7,4)=null → đếm = 2
> - Tổng: 1 + 2 + 2 = 5 → **THẮNG!**
>
> **Độ phức tạp: O(1)** — chỉ kiểm tra tối đa 4 hướng × 8 bước = **32 ô**, không phụ thuộc kích thước bàn cờ.
>
> Ngoài ra còn hàm `checkDraw()` — kiểm tra hòa khi toàn bộ 225 ô đã có quân mà không ai thắng, và `createEmptyBoard()` — tạo mảng 15×15 giá trị null."
>
> *(Mở file `src/utils/checkWin.js` để chỉ code)*

### 3.3. Game State Management

> **Nói:**
>
> "File `Game.jsx` quản lý toàn bộ **state** của ván cờ, sử dụng React Hooks:
>
> | State | Kiểu | Mô tả |
> |-------|------|-------|
> | `board` | `Array[15][15]` | Mảng 2D lưu trạng thái bàn cờ (null / 'X' / 'O') |
> | `isXTurn` | `boolean` | Lượt hiện tại (true = X, false = O) |
> | `lastMove` | `[row, col]` | Tọa độ nước đi cuối để highlight vàng glow |
> | `winCells` | `Array` | Mảng 5 tọa độ quân thắng để highlight xanh blink |
> | `winner` | `'X' / 'O' / null` | Người thắng |
> | `isDraw` | `boolean` | Trạng thái hòa |
> | `moveCount` | `number` | Đếm số nước đi |
>
> **Luồng xử lý khi click 1 ô:**
> 1. Kiểm tra ô có trống và game chưa kết thúc → nếu không thì bỏ qua
> 2. Tạo bản sao board mới (immutable), gán `X` hoặc `O` vào ô
> 3. Cập nhật `board`, `lastMove`, `moveCount`
> 4. Gọi `checkWin()` — nếu trả về mảng tọa độ → set `winCells` + `winner`, dừng
> 5. Gọi `checkDraw()` — nếu hết ô → set `isDraw`, dừng
> 6. Đổi lượt: `isXTurn = !isXTurn`
>
> Hàm `handleRestart()` reset toàn bộ state về ban đầu."
>
> *(Mở file `src/components/Game.jsx` để chỉ code)*

### 3.4. Giao diện và Animation

> **Nói:**
>
> "Về giao diện, em chú trọng **trải nghiệm người dùng** với các hiệu ứng:
>
> | Animation | Mô tả | Khi nào |
> |-----------|-------|---------|
> | **Pop** (0.25s) | Quân cờ xuất hiện với hiệu ứng scale 0→1.2→1 | Khi đặt quân |
> | **Pulse Glow** (1.5s, lặp) | Nước đi cuối nhấp nháy nhẹ nền vàng | Sau mỗi nước đi |
> | **Win Blink** (0.8s, lặp) | 5 quân thắng blink nền xanh | Khi có người thắng |
> | **Fade In** (0.5s) | Banner kết quả trượt vào mượt mà | Khi thắng/hòa |
>
> Bàn cờ có nền **Amber-50** giống gỗ, quân X màu **Indigo/Pink-600**, quân O màu **Rose/Pink-500**, tạo sự tương phản rõ ràng.
>
> Khi hover vào ô trống, nền đổi màu nhẹ. Ô đã có quân thì cursor mặc định, không click được.
>
> Em cũng thêm component **VictoryModal** — modal xuất hiện khi kết thúc ván, hiển thị người thắng và các lựa chọn."

---

## 🎮 PHẦN 4 — DEMO TRỰC TIẾP (~3 phút)

> **Nói:**
>
> "Bây giờ em xin demo trực tiếp ạ."
>
> *(Chạy `npm run dev` → mở http://localhost:5173)*

### Kịch bản demo:

| Bước | Thao tác | Nói |
|------|----------|-----|
| 1 | Mở trang Home | "Đây là trang chủ với logo Gomoku, nút Chơi 2 Người active, các nút AI và Lịch sử tạm disabled cho milestone sau." |
| 2 | Click **"👥 Chơi 2 Người"** | "Click vào đây để bắt đầu trận mới, giao diện chuyển sang trang Game." |
| 3 | X click 1 ô | "Player 1 đánh quân X — thầy có thể thấy animation pop khi đặt quân, ô có glow vàng nhấp nháy." |
| 4 | O click ô khác | "Đổi lượt sang Player 2 đánh O — thanh hiển thị lượt cập nhật, glow chuyển sang ô mới." |
| 5 | Đặt tiếp vài nước | "Em sẽ tạo tình huống 5 quân X liên tiếp..." |
| 6 | X thắng (5 quân) | "5 quân X xếp hàng → 5 ô đổi màu xanh + nhấp nháy, xuất hiện banner thông báo **Người chơi 1 CHIẾN THẮNG!**" |
| 7 | Click **"↻ Ván mới"** | "Click Ván mới để reset, toàn bộ state trở về ban đầu." |
| 8 | Click **"← Trang chủ"** | "Và có thể quay về trang chủ bất kỳ lúc nào." |

---

## 📊 PHẦN 5 — TỔNG KẾT & KẾ HOẠCH (~2 phút)

### 5.1. Bảng tổng kết Milestone 1

> **Nói:**
>
> "Tổng kết lại những gì đã hoàn thành trong Milestone 1:"

| Yêu cầu | Trạng thái | Ghi chú |
|----------|-----------|---------|
| Thiết kế kiến trúc 3 tầng | ✅ Hoàn thành | Frontend ↔ Backend ↔ Database |
| Thiết kế Database (ERD + Schema) | ✅ Hoàn thành | 2 bảng: matches, moves |
| Thiết kế API Spec (6 endpoints) | ✅ Hoàn thành | REST API với validation |
| Wireframe 3 màn hình | ✅ Hoàn thành | Home, Game, Pause Menu |
| Tài liệu hệ thống (Mermaid diagrams) | ✅ Hoàn thành | 4 file trong `docs/` |
| Khởi tạo project ReactJS + Vite | ✅ Hoàn thành | TailwindCSS v4 tích hợp |
| Setup Backend NodeJS + Express | ✅ Hoàn thành | Server + routes + DB schema |
| Bàn cờ 15×15 với header A–O / 1–15 | ✅ Hoàn thành | Nền gỗ Amber-50 |
| Click đặt quân X / O luân phiên | ✅ Hoàn thành | Animation pop khi đặt |
| Kiểm tra thắng 5 quân (4 hướng) | ✅ Hoàn thành | Thuật toán O(1) |
| Highlight nước đi cuối (pulse glow) | ✅ Hoàn thành | Nền vàng + animation |
| Highlight đường thắng (blink) | ✅ Hoàn thành | Nền xanh + animation |
| Thông báo kết quả thắng/hòa | ✅ Hoàn thành | VictoryModal + banner |
| Restart / Back to Home | ✅ Hoàn thành | Reset state hoàn toàn |
| Giao diện đẹp, có animation | ✅ Hoàn thành | Pink/dark gradient + TailwindCSS |

### 5.2. Kế hoạch Milestone 2 (Tuần 31–33)

> **Nói:**
>
> "Cho kế hoạch milestone 2 — tuần 31 đến 33, em sẽ tập trung:
>
> - **Tuần 31**: Phát triển **AI level Easy** (đánh random) + xây dựng **Smart Hint System** cơ bản
> - **Tuần 32**: Phát triển **AI level Medium** (chiến thuật chặn chuỗi, tạo chuỗi, ưu tiên vị trí gần) + cải thiện giao diện + thêm animation
> - **Tuần 33**: Báo cáo Milestone 2 — hoàn thành chơi với AI (Easy, Medium), Smart Hint, Timer mỗi lượt
>
> Em xin kết thúc phần báo cáo. Thầy có câu hỏi gì không ạ?"

---

## 📎 PHỤ LỤC — CÂU HỎI CÓ THỂ GẶP & CÁCH TRẢ LỜI

### Q1: "Tại sao chọn SQLite thay vì MySQL?"
> **Trả lời:** "Dạ, ở giai đoạn development, SQLite tiện lợi vì không cần cài đặt server riêng, database là 1 file `.db` duy nhất. Khi deploy production, em có thể chuyển sang MySQL dễ dàng vì các query SQL tương thích. Việc này cũng phù hợp với nguyên tắc Progressive Enhancement của em ạ."

### Q2: "Thuật toán checkWin có scale được với bàn cờ lớn hơn không?"
> **Trả lời:** "Dạ có ạ. Thuật toán chỉ kiểm tra tuy nhiên tối đa 32 ô xung quanh vị trí vừa đặt, nên **độ phức tạp là O(1)**, không phụ thuộc kích thước bàn. Nếu mở rộng bàn lên 19×19 hay 30×30, thời gian kiểm tra vẫn không thay đổi."

### Q3: "Tại sao logic game để ở client mà không phải server?"
> **Trả lời:** "Dạ, em thiết kế theo nguyên tắc **Client-first**. Logic đặt quân và checkWin chạy trên client giúp game phản hồi ngay lập tức, không cần kết nối mạng, người chơi có trải nghiệm mượt mà. Backend chỉ bổ sung lưu lịch sử và AI — nếu mất kết nối, game vẫn chơi được bình thường."

### Q4: "AI sẽ implement thuật toán gì ở milestone 2?"
> **Trả lời:** "Dạ, em dự kiến:
> - **Easy**: Đánh random ô trống — đã có stub
> - **Medium**: Sử dụng heuristic đánh giá vị trí — chặn chuỗi đối thủ, tạo chuỗi có lợi, ưu tiên gần quân đã đánh
> - **Hard** (milestone 3): Thuật toán **Minimax** với **Alpha-Beta Pruning** để tìm nước đi tối ưu, kết hợp **heuristic evaluation** đánh giá điểm từng vị trí."

### Q5: "Có đưa lên server thực chưa?"
> **Trả lời:** "Dạ chưa ạ, hiện tại em đang chạy local. Em dự kiến sẽ deploy lên hosting ở giai đoạn cuối (tuần 38–39) khi hệ thống đã hoàn thiện."

---

> **⏱️ Tổng thời gian dự kiến: ~20 phút** (bao gồm demo và Q&A)

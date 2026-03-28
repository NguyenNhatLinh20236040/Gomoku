# Sơ đồ Thực thể Liên kết Cơ sở dữ liệu (ERD)

Sơ đồ này mô tả cấu trúc của bảng `matches` và `moves` trong cơ sở dữ liệu SQLite của project Gomoku được thiết kế ở Tuần 28.
Tương tự, có thể preview trực tiếp trong VS Code / Github, hoặc dùng web [Mermaid Live Editor](https://mermaid.live/).

```mermaid
erDiagram
    MATCHES {
        INTEGER id PK "Khóa chính, tự tăng (AUTOINCREMENT)"
        TEXT mode "Chế độ chơi: 'local' hoặc 'ai' (Default: 'local')"
        TEXT rule "Luật chơi: 'gomoku3/4/5', 'renju' (Default: 'gomoku5')"
        TEXT ai_level "Mức độ AI: 'easy', 'medium', 'hard'"
        TEXT winner "Kết quả: 'X', 'O', 'DRAW'"
        INTEGER total_moves "Tổng số lượt đã đi (Default: 0)"
        DATETIME started_at "Thời gian bắt đầu trận cờ"
        DATETIME ended_at "Thời gian kết thúc trận (null nếu chưa xong)"
    }

    MOVES {
        INTEGER id PK "Khóa chính, tự tăng (AUTOINCREMENT)"
        INTEGER match_id FK "Liên kết với id bảng MATCHES"
        INTEGER turn "Số thứ tự của lượt đi trong trận"
        TEXT player "Ai đánh nước này: 'X', 'O', hoặc 'AI'"
        INTEGER row "Tọa độ hàng ngang trên bàn (0 đến 14)"
        INTEGER col "Tọa độ cột dọc trên bàn (0 đến 14)"
        DATETIME played_at "Thời gian đánh quân cờ"
    }

    MATCHES ||--o{ MOVES : "Chứa (1 trận có nhiều nước đi)"
```

# Sơ đồ Kiến trúc Hệ thống (System Architecture)

Sơ đồ này mô tả chi tiết các thành phần trong hệ thống Gomoku và cách chúng tương tác với nhau, phân chia rõ Frontend (ReactJS), Backend (NodeJS) và Database.
Bạn có thể để file này trong IDE hỗ trợ Markdown (Github, VS Code) để xem trực tiếp dạng hình ảnh, hoặc copy đoạn mã dán vào [Mermaid Live Editor](https://mermaid.live/).

```mermaid
graph TD
    classDef frontend fill:#e0f2fe,stroke:#0284c7,stroke-width:2px;
    classDef backend fill:#fce7f3,stroke:#db2777,stroke-width:2px;
    classDef db fill:#dcfce3,stroke:#16a34a,stroke-width:2px;

    subgraph Client ["Frontend Client (Trình duyệt)"]
        React["ReactJS 19.x (Thư viện UI chính)"]
        Tailwind["TailwindCSS 4.x (Tạo CSS/Animation)"]
        Vite["Vite 8.x (Bundler & Dev Server)"]
        
        subgraph Pages ["Giao diện & Thành phần (src/)"]
            App["App.jsx (Router điều hướng)"]
            Home["HomePage.jsx (Trang chủ)"]
            Game["Game.jsx (Quản lý State ván cờ)"]
            Board["Board.jsx (Dựng khung bàn cờ)"]
            Cell["Cell.jsx (Từng ô cờ 15x15)"]
        end
        
        App --> Home
        App --> Game
        Game --> Board
        Board -- "Render Lưới 15x15" --> Cell
        React --- Pages
    end

    subgraph Server ["Backend API (NodeJS + Express) - Giai đoạn 2"]
        API["REST API Routes \n(/matches, /ai)"]
        Logic["Game Validation \n(Kiểm tra tính hợp lệ)"]
        AIService["AI Engine \n(Easy, Medium, Hard)"]
        HintService["Smart Hint System \n(Gợi ý nước đi)"]
        
        API --> Logic
        API --> AIService
        API --> HintService
    end

    subgraph Database ["Lưu Trữ (Database)"]
        DB[(SQLite \n Lưu lịch sử Matches & Moves)]
    end

    Game == "HTTP (Nước đi, Tạo trận, Hỏi AI)" ==> API
    API == "Truy vấn/Lưu thay đổi" ==> DB
    
    class Client,Pages frontend;
    class Server backend;
    class Database db;
```

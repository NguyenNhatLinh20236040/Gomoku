# 🧠 GIẢI THÍCH THUẬT TOÁN MINIMAX & ALPHA-BETA PRUNING (Dành cho báo cáo)

Tài liệu này được soạn thảo bằng ngôn ngữ đơn giản, dễ hiểu, kèm ví dụ thực tế để bạn có thể tự tin cầm đọc hoặc tóm tắt lại khi báo cáo với Giảng viên về cơ chế hoạt động của chế độ **AI Hard** trong project Gomoku.

---

## 1. Thuật toán Minimax: "Biết mình biết ta, trăm trận trăm thắng"

### Khái niệm cơ bản
Minimax là thuật toán cốt lõi cho mọi AI chơi cờ (Cờ caro, cờ vua, cờ tướng...). Nó mô phỏng lại cách suy nghĩ của hai cao thủ đang ngồi chơi với nhau: *"Nếu mình đi nước này, đối thủ sẽ đáp trả bằng nước nào đáng sợ nhất? Rồi sau đó mình sẽ đỡ ra sao?"*.

AI sẽ rẽ nhánh các khả năng (tạo thành một cái **Cây trò chơi - Game Tree**) và tính điểm cho từng nhánh.

### Cách AI chia vai trong Minimax
Thuật toán chia làm 2 phe xen kẽ nhau:
*   **Maximizer (Kẻ tối đa hóa - Chính là con AI):** AI luôn cố gắng tìm nước đi mang lại **số điểm cao nhất** (ví dụ: nước đi tạo thành 3 quân, 4 quân).
*   **Minimizer (Kẻ tối thiểu hóa - Giả định là Người chơi):** AI giả định rằng Người chơi cũng rất thông minh. Nên trong lượt của Người chơi, AI sẽ chọn nhánh có **số điểm thấp nhất** (vì điểm của AI càng thấp tức là Người chơi càng có lợi).

### Ví dụ báo cáo (Script):
> *"Thưa thầy, thuật toán Minimax của em hoạt động như một cái cây. Lượt của AI, nó rẽ nhánh tìm nước điểm cao. Lượt tiếp theo của người chơi, AI tự hạ thấp kỳ vọng của mình xuống vì nó tin rằng người chơi sẽ chọn nước chặn nó hoặc phản công. AI Hard của em có khả năng 'nhìn trước tương lai' 4 bước (Depth = 4), tức là AI đi, người đi, AI đi, người đi, sau đó mới quyết định nước đi đầu tiên."*

---

## 2. Cắt tỉa Alpha-Beta (Alpha-Beta Pruning): "Bí quyết để không bị treo máy"

### Tại sao phải có Alpha-Beta?
Bàn cờ caro 15x15 có 225 ô. Nếu AI nhìn trước 4 bước, số lượng thế cờ phải tính toán là: `225 × 224 × 223 × 222 ≈ 2.5 tỷ` thế cờ. Trình duyệt sẽ bị treo (đứng máy) ngay lập tức.
=> **Giải pháp:** Cắt tỉa Alpha-Beta.

### Khái niệm Alpha-Beta
Alpha-Beta là một bản nâng cấp của Minimax. Nó hoạt động theo nguyên lý: **"Nếu thấy một con đường chắc chắn tồi tệ hơn con đường mình đã tìm thấy trước đó, thì KHÔNG CẦN đi sâu vào con đường đó nữa (cắt tỉa nó đi)."**

### Ví dụ báo cáo (Script):
> *"Em tích hợp thêm Cắt tỉa Alpha-Beta để tăng tốc. Giả sử AI đang xét nhánh A và thấy sẽ được +10 điểm. Sau đó nó chuyển sang xét nhánh B. Ngay bước đầu tiên của nhánh B, AI phát hiện ra người chơi sẽ có cơ hội tạo ra 4 quân liên tiếp (bị âm điểm rất nặng). Thay vì phải ngồi tính tiếp xem nhánh B còn diễn biến gì nữa không, AI lập tức 'cắt tỉa' (vứt bỏ) toàn bộ nhánh B và chuyển sang nhánh C. Nhờ vậy, AI từ chỗ phải tính hàng tỷ thế cờ, giảm xuống chỉ còn vài ngàn thế cờ, giúp game chạy mượt mà."*

---

## 3. Những "Vũ khí bí mật" khác của AI Hard

Minimax và Alpha-beta là lý thuyết sách vở, để AI thực sự đánh hay và nhanh, em đã tích hợp thêm 2 cơ chế tối ưu cực kỳ quan trọng trong file `aiEngine.js`:

### A. Move Ordering (Sắp xếp nước đi)
*   **Vấn đề:** Alpha-Beta chỉ cắt tỉa hiệu quả nhất khi nó tìm thấy **nước đi ngon ngay từ đầu**. Nếu nước ngon nằm ở cuối danh sách, nó vẫn phải duyệt qua đống nước dở.
*   **Giải pháp:** Trước khi chạy Minimax, AI sẽ làm một bài "chấm điểm nháp" (heuristic score) cho tất cả các ô trống. Những ô có tiềm năng (gần quân của mình, chặn quân đối thủ) sẽ được đưa lên đầu danh sách để ưu tiên duyệt trước. 

### B. Threat Detection (Bắt mạch sát thủ)
*   **Vấn đề:** AI Minimax sâu 4 bước đôi khi bị "thiển cận" trước những thế cờ ép chết (Ví dụ: đối thủ tạo ra 2 đường 3 mở hai đầu cùng lúc - Double Threat).
*   **Giải pháp:** Em code thêm logic "phản xạ có điều kiện". Trước khi gọi Minimax tính toán lằng nhằng, AI sẽ quét xem người chơi có đang tạo *Double Threat* không. Nếu có, AI lập tức phải chặn lại ngay mà không cần suy nghĩ sâu xa.

---

## 4. Tóm tắt nhanh (Dùng để chốt lại bài thuyết trình)

> *"Tóm lại, sức mạnh của AI Hard trong game Gomoku của em đến từ sự kết hợp của 3 yếu tố: **Sự nhìn xa trông rộng** của thuật toán Minimax (Depth = 4), **Tốc độ phản hồi chớp nhoáng** nhờ Cắt tỉa Alpha-Beta và Move Ordering, cùng với **Trực giác phòng thủ bén nhạy** nhờ thuật toán Threat Detection."*

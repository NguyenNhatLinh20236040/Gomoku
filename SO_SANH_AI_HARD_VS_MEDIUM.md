# Phân tích & So sánh: AI Hard vs AI Medium

Tài liệu này giải thích chi tiết sự khác biệt về mặt thuật toán và tư duy giữa 2 chế độ AI trong dự án Gomoku. Bạn có thể sử dụng nội dung này để trả lời khi giảng viên hỏi "Độ khó Hard khác gì Medium?".

---

## 1. Tóm tắt nhanh (Quick Summary)

*   **AI Medium:** Phù hợp với người chơi trung bình. AI biết nhìn xa 3 bước, biết chặn khi bạn sắp thắng (4 quân) và đánh khi có cơ hội thắng ngay. Khá máy móc và có thể bị lừa bởi "thế cờ đôi" (đánh 1 nước tạo 2 đường thắng).
*   **AI Hard:** Cực kỳ khó nhằn. AI nhìn xa 4 bước, có tư duy "Sắp xếp ưu tiên" (Move Ordering) để tính toán nhanh hơn. Đặc biệt, nó được tích hợp Radar "Nhận diện hiểm họa" (Threat Detection) để không bao giờ rơi vào bẫy "thế cờ đôi" của người chơi.

---

## 2. Các điểm cải tiến cốt lõi của AI Hard

Dưới đây là 3 khác biệt lớn nhất về mặt kỹ thuật giữa `getHardMove` và `getMediumMove`:

### 2.1. Độ sâu tính toán (Depth Search) sâu hơn
*   **Medium:** Dùng `MINIMAX_DEPTH = 3`. Tức là AI tính trước: Mình đánh (1) → Người đánh (2) → Mình đánh (3).
*   **Hard:** Dùng `HARD_DEPTH = 4`. Tính thêm 1 bước phản hồi của người chơi. Trong Cờ Caro, nhìn xa hơn 1 bước tạo ra sự khác biệt vô cùng khổng lồ về chiến thuật dài hạn.

### 2.2. Nhận diện hiểm họa kép (Threat Detection)
*   **Vấn đề của Medium:** Medium chỉ check chặn khi người chơi **đã có 4 quân**. Nếu người chơi tạo ra thế "3 mở 2 đầu" (Open Three) kết hợp với một đường khác, Medium sẽ không nhận ra sự nguy hiểm ngay lập tức và thường bỏ qua.
*   **Cách Hard giải quyết:** Trong `getHardMove`, trước khi chạy thuật toán đệ quy phức tạp, AI chạy qua một vòng lặp `Threat Detection` (Bước 3). Nó quét tìm các nước đi có thể tạo ra **"Double-threat"** (ví dụ: tạo ra cùng lúc 2 đường "3 mở 2 đầu" hoặc 1 đường "4 mở" + 1 đường "3 mở"). 
    *   Nếu phát hiện người chơi có thể tạo thế đôi, AI Hard chặn ngay lập tức.
    *   Nếu phát hiện AI có thể tạo thế đôi, AI Hard tự đánh để ép người chơi vào thế thua.

### 2.3. Tối ưu hóa: Move Ordering (Sắp xếp nước đi)
*   Để chạy được Depth = 4 trên nền tảng Web (Javascript) mà trình duyệt không bị đơ (freeze), AI Hard áp dụng kỹ thuật **Move Ordering** (Hàm `orderMoves`).
*   **Cơ chế:** Thay vì thử nghiệm các ô trống theo thứ tự ngẫu nhiên (hoặc từ trên xuống dưới), thuật toán sẽ quét nhanh (bằng hàm Heuristic) và **chấm điểm sơ bộ** các ô trống.
    *   Những ô nào có vẻ ngon ăn nhất (như nằm sát cạnh cụm quân, tạo đường chéo đẹp) sẽ được đưa lên thử nghiệm trước.
    *   Khi những nước đi tốt nhất được đưa vào mô hình Alpha-Beta Pruning sớm, thuật toán sẽ "cắt tỉa" (loại bỏ) được hàng triệu nhánh nhánh vô nghĩa phía sau.
*   **Kết quả:** Nhờ Move Ordering, số lượng phép tính giảm đi hàng chục lần, cho phép AI suy nghĩ sâu (Depth 4) với thời gian phản hồi tương đương AI Medium (Depth 3).

---

## 3. Lời khuyên khi Demo

Nếu giảng viên muốn test xem Hard có thực sự thông minh hơn Medium không, hãy demo như sau:

1.  **Mở AI Medium:**
    *   Cố tình đánh theo kiểu tạo 2 đường "3 mở 2 đầu" cắt nhau (hình chữ L hoặc dấu cộng).
    *   AI Medium sẽ không nhận ra nguy hiểm và đi chặn một hướng không quan trọng.
    *   Kết quả: Bạn dễ dàng giành chiến thắng ở nước tiếp theo.
2.  **Mở AI Hard:**
    *   Thử thiết lập lại chính xác thế cờ đôi như trên.
    *   Lúc bạn vừa định hình cụm quân, AI Hard sẽ dùng *Threat Detection* phát hiện ra ý đồ và điền quân chặn đúng giao điểm hoặc chặn 1 trong 2 đường để vô hiệu hóa bẫy của bạn.

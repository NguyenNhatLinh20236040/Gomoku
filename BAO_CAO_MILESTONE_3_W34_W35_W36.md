# Báo Cáo Milestone 3 (Tuần 34, 35, 36) - Kịch Bản Trình Bày & Demo Gomoku

Tài liệu này được thiết kế để bạn sử dụng khi báo cáo tiến độ trực tiếp với giảng viên. Cấu trúc bao gồm **nội dung kỹ thuật đã làm**, **kịch bản lời nói (Script)**, và **hành động Demo (Action)** tương ứng trên màn hình.

---

## 1. Giới thiệu tổng quan (Mở đầu)

**🗣️ Script (Nói):**
> "Chào thầy/cô. Hôm nay em xin báo cáo tiến độ Milestone 3 của dự án game Gomoku, bao gồm các công việc thực hiện trong tuần 34, 35 và 36. Trong giai đoạn này, mục tiêu chính của em là nâng cấp trí tuệ nhân tạo (AI), xây dựng hệ thống luật chơi linh hoạt (Multiple Rule Systems), và hoàn thiện các tính năng điều khiển luồng game như Tạm dừng (Pause), Tiếp tục (Resume), Chơi lại (Restart) cùng với việc trau chuốt lại toàn bộ giao diện sang tiếng Anh để chuyên nghiệp hơn."

---

## 2. Tuần 34: Nâng cấp AI Level Hard & Tối ưu thuật toán

**💡 Kiến thức kỹ thuật đã làm:**
*   **Thuật toán lõi:** Sử dụng Minimax kết hợp cắt tỉa Alpha-Beta (Alpha-Beta Pruning) với độ sâu `MINIMAX_DEPTH = 3`.
*   **Hàm đánh giá (Heuristic):** AI có khả năng nhận diện các "thế cờ" quan trọng như 5 liên tiếp (FIVE), 4 mở 2 đầu (OPEN_FOUR), 3 mở 2 đầu (OPEN_THREE),... và chấm điểm (Score) để ưu tiên phòng thủ khi bị đe dọa hoặc tấn công khi có cơ hội.
*   **Tối ưu hiệu năng (Optimization):** Thay vì quét toàn bộ bàn cờ 15x15 (225 ô), AI chỉ tìm kiếm các "ô ứng viên" (`getCandidateMoves`) nằm trong bán kính 2 ô xung quanh các quân cờ đã đánh. Điều này giúp giảm Search Space đáng kể, giúp AI phản hồi nhanh và mượt mà.

**🗣️ Script (Nói):**
> "Vào tuần 34, em tập trung vào việc phát triển độ khó Hard cho AI. Để AI thông minh hơn nhưng không làm đơ trình duyệt, em sử dụng thuật toán Minimax kết hợp cắt tỉa Alpha-Beta. Quan trọng nhất là bước tối ưu: AI của em không quét toàn bộ bàn cờ mà chỉ tập trung tính toán các ô trống xung quanh những quân cờ đã đánh (với bán kính 2 ô). Đồng thời, em xây dựng hàm Heuristic chấm điểm các thế cờ từ cơ bản đến nguy hiểm (như 4 ô mở 2 đầu) để AI biết lúc nào cần tấn công, lúc nào bắt buộc phải phòng thủ."

**🖱️ Action (Demo):**
1. Ở trang chủ, bấm **Play vs AI**.
2. Chọn độ khó **Hard 🔴**.
3. Bắt đầu chơi vài nước. Cố tình đánh tạo thế "3 ô mở 2 đầu" hoặc "4 ô bịt 1 đầu" để giảng viên thấy AI lập tức chặn đường ngay.
4. Trỏ chuột vào dòng chữ `AI is thinking...` để cho thấy game xử lý bất đồng bộ mượt mà.

---

## 3. Tuần 35 & Nửa đầu Tuần 36: Triển khai Multiple Rule Systems

**💡 Kiến thức kỹ thuật đã làm:**
*   **Hệ thống luật:** Đơn giản hóa dự án, tập trung vào 2 luật chất lượng nhất:
    *   `3-in-a-row`: Thắng khi có 3 quân liên tiếp (chơi trên bàn 3x3).
    *   `5-in-a-row`: Gomoku tiêu chuẩn (chơi trên bàn 15x15).
*   **Dynamic Board (Bàn cờ động):** Cấu trúc lại toàn bộ components (`Board.jsx`, `Cell.jsx`) và logic kiểm tra thắng (`checkWin.js`, `aiEngine.js`) để không hardcode kích thước bàn cờ. Bàn cờ tự động lấy kích thước từ mảng truyền vào (`board.length`).
*   **Responsive UI:** Khi chọn luật 3x3, kích thước ô cờ (Cell) tự động to ra (100px) và font chữ X/O lớn hơn để tương xứng với không gian hiển thị, ngược lại bàn 15x15 giữ nguyên kích thước nhỏ (42px).

**🗣️ Script (Nói):**
> "Trong tuần 35 và đầu tuần 36, em xây dựng hệ thống đa luật chơi (Multiple Rule Systems). Thay vì gắn chết một bàn cờ 15x15, em đã refactor lại toàn bộ logic game — từ giao diện vẽ bàn cờ đến thuật toán kiểm tra thắng thua và AI — để hỗ trợ kích thước bàn cờ động (Dynamic Board Size). Hiện tại em đang cấu hình 2 chế độ: Gomoku tiêu chuẩn 15x15 (thắng 5) và chế độ đấu nhanh 3x3 (thắng 3). Tùy thuộc vào chế độ được chọn, giao diện bàn cờ tự động điều chỉnh kích thước ô cờ cho cân đối nhất."

**🖱️ Action (Demo):**
1. Quay lại trang chủ. Bấm vào nút **Rules** (đang hiển thị 15x15 ⭐).
2. Hiển thị Popup chọn luật. Chỉ vào 2 lựa chọn có icon và mô tả rõ ràng.
3. Chọn **3-in-a-row ⚡**.
4. Bấm **Local 2 Players**.
5. Hiển thị bàn cờ 3x3. Nhấn mạnh với giảng viên: *"Thầy/cô có thể thấy bàn cờ đã tự co lại thành 3x3, kích thước ô cờ tự động phóng to ra rất rõ ràng"*. Đánh thử 3 nước để kết thúc nhanh và hiển thị popup chiến thắng.

---

## 4. Cuối Tuần 36: Hoàn thiện Gameplay & Nâng cấp UI/UX

**💡 Kiến thức kỹ thuật đã làm:**
*   **Pause/Resume/Restart:** Xây dựng Component `PauseModal` hoạt động độc lập, làm mờ (blur) bàn cờ phía sau khi đang tạm dừng để ngăn người chơi bấm trộm.
*   **Chuyển ngữ sang Tiếng Anh (I18n):** Toàn bộ giao diện đã được chuyển đổi sang Tiếng Anh chuẩn giúp dự án có giao diện quốc tế và clean hơn. Nút bấm trong các modal được thiết kế đồng nhất.
*   **Win Line Animation (Hiệu ứng gạch ngang chiến thắng):** Khi người chơi gom đủ 3 hoặc 5 quân, hệ thống sử dụng SVG Overlay kết hợp với CSS Animation (`stroke-dasharray` và `stroke-dashoffset`) để tạo hiệu ứng "vẽ một đường thẳng" (draw line) mượt mà đi qua các quân cờ. Popup thông báo kết quả (VictoryModal) được thiết lập một độ trễ (delay) 1.5 giây thông qua `useEffect` để người chơi kịp nhìn thấy hiệu ứng chiến thắng trước khi bị che đi.

**🗣️ Script (Nói):**
> "Phần cuối cùng của Milestone này là hoàn thiện luồng trải nghiệm người dùng (UI/UX). Em đã thêm chức năng Pause có khả năng làm mờ bàn cờ nền để chống gian lận. Giao diện cũng được quy hoạch lại cân xứng, 100% tiếng Anh chuẩn mực.
> 
> Một tính năng UX nhỏ nhưng em rất tâm đắc là hiệu ứng vẽ đường gạch ngang (Win Line) qua các quân cờ khi chiến thắng. Thay vì hiển thị Popup kết quả ngay lập tức một cách hụt hẫng, em đã tính toán tọa độ để vẽ một đường SVG line nối các quân cờ lại, đồng thời delay (làm trễ) Popup 1.5 giây. Trải nghiệm mang lại cảm giác 'thỏa mãn' và trau chuốt hơn rất nhiều."

**🖱️ Action (Demo):**
1. Mở một ván đấu ở chế độ **3-in-a-row** (chọn luật này để đánh cho lẹ).
2. Nhanh chóng đánh thắng (chọn hàng ngang hoặc dọc).
3. Khi bạn vừa đặt quân thắng, lập tức buông chuột, nhường sự chú ý lên màn hình để giảng viên thấy rõ đường line màu hồng từ từ kẻ ngang qua 3 quân cờ.
4. Chờ 1.5s để Popup xổ xuống cùng pháo hoa.
5. Sau khi xem xong, bấm **Menu** để về trang chủ.
6. Vào game 15x15, đánh vài nước và test tiếp nút **⏸️ Pause**, chỉ cho giảng viên xem hiệu ứng blur phía sau.

---

## 5. Kết luận & Kế hoạch Tuần 37

**🗣️ Script (Nói):**
> "Đó là toàn bộ tính năng cốt lõi của game mà em đã hoàn thiện trong Milestone 3. Hệ thống gameplay hiện tại đã ổn định, logic linh hoạt và giao diện thân thiện.
> 
> Trong tuần 37 sắp tới, em sẽ chuyển sang xử lý phía dữ liệu: Xây dựng tính năng Lịch sử đấu (Match History) và thiết lập kết nối với Database để lưu trữ thông tin các ván cờ đã chơi.
> 
> Em xin kết thúc phần demo. Thầy/cô có nhận xét hay góp ý gì cho luồng game hiện tại không ạ?"

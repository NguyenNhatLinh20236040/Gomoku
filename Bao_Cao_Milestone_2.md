# BÁO CÁO TIẾN ĐỘ THỰC HIỆN PROJECT II - GOMOKU
**Giai đoạn:** Milestone 2
**Vai trò:** Dành cho người mới bắt đầu lập trình (Newbie friendly)

---

## 📑 Danh mục nội dung
1. [Tổng quan Milestone 2](#1-tổng-quan-milestone-2)
2. [AI Level Easy (Bot Dễ)](#2-ai-level-easy-bot-dễ)
3. [AI Level Medium (Bot Trung Bình)](#3-ai-level-medium-bot-trung-bình)
4. [Smart Hint System (Hệ thống gợi ý)](#4-smart-hint-system-hệ-thống-gợi-ý)
5. [Timer mỗi lượt (Bộ đếm thời gian)](#5-timer-mỗi-lượt-bộ-đếm-thời-gian)
6. [Cải thiện giao diện (UI/UX)](#6-cải-thiện-giao-diện-uiux)
7. [Animation (Hiệu ứng hoạt hình)](#7-animation-hiệu-ứng-hoạt-hình)
8. [Phụ lục: Vị trí Code (File & Hàm)](#8-phụ-lục-vị-trí-code-file--hàm)

---

## 1. Tổng quan Milestone 2

### 1.1 Mục tiêu của milestone
Mục tiêu chính trong Milestone 2 là biến một bàn cờ Gomoku (Cờ Caro) cơ bản thành một trò chơi hoàn chỉnh và thú vị hơn. Chúng ta không chỉ chơi được 2 người (Local) mà có thể chơi với máy (AI). Đồng thời, tập trung mạnh vào việc tạo cho người dùng cảm giác thoải mái, thích mắt (UX/UI) và thêm các hỗ trợ trong quá trình chơi.

### 1.2 Các chức năng đã hoàn thành
Trong giai đoạn này, các tính năng sau đã được code thành công:
1. **AI Level Easy (Máy dễ)**
2. **AI Level Medium (Máy trung bình)**
3. **Smart Hint System (Hệ thống gợi ý thông minh)**
4. **Cải thiện giao diện (UI/UX)**
5. **Thêm các hiệu ứng hoạt hình (Animation)**
6. **Thêm đồng hồ đếm ngược (Timer) cho mỗi lượt**

Tiếp theo, chúng ta sẽ đi sâu vào tìm hiểu từng chức năng xem chúng hoạt động ra sao nhé!

---

## 2. AI Level Easy (Bot Dễ)

### Cách hoạt động
Nếu để AI random (chọn ngẫu nhiên) chọn một ô bất kỳ trên bàn cờ 15x15 thì nhìn máy đánh ra sẽ rất "ngốc". Máy có thể đánh vào một góc xa tít tắp chẳng liên quan gì đến ván cờ. 

Vì vậy, AI Easy vẫn dùng thuật toán **random (ngẫu nhiên)**, nhưng được giới hạn ở khu vực "có ý nghĩa". Máy sẽ quét xem trên bàn cờ hiện tại đang có quân nào chưa, và chỉ tìm các **ô trống nằm sát bên cạnh (bán kính 1-2 ô)** các quân cờ đó. Sau đó, nó bốc thăm ngẫu nhiên một ô trong tập hợp này để đánh.

### Tại sao gọi là "Dễ"?
Bởi vì thuật toán hoàn toàn **không tính toán** xem bước đi đó có chặn được bạn hay không, hay nó có giúp máy thắng được hay không. Máy chỉ đánh vào vùng tranh chấp là chính.

### Ví dụ minh hoạ
Giả sử bạn đánh quân X, máy là O.
Bàn cờ hiện tại:
```text
. . . . . . .
. . * * * . .
. . * X * . .
. . * * * . .
. . . . . . .
```
*(Dấu chấm `.` là ô trống ngoài rìa, dấu sao `*` là các ô trống nằm sát X)*

Thay vì AI đánh tung tóe ở góc bàn cờ (các dấu chấm `.`), AI Easy sẽ gom tất cả ô `*` lại thành một mảng, sau đó dùng hàm `Math.random()` đẻ chọn bừa một ô `*` để đánh O xuống.

### Pseudo-code (Mã giả)
```javascript
Hàm Lấy_Nước_Đi_Easy(ban_co):
  // Bước 1: Tìm tất cả ô trống kề các quân cờ có trên bàn
  danh_sach_o_trong_ke = Tim_Cac_O_Ke(ban_co, ban_kinh = 1)
  
  // Bước 2: Chống lỗi chưa có quân nào
  Nếu danh_sach_o_trong_ke rỗng:
    Trả về vị trí MỞ MÀN (ở giữa bàn cờ)
    
  // Bước 3: Random
  chi_so_ngau_nhien = Math.floor(Math.random() * danh_sach_o_trong_ke.length)
  
  Trả về danh_sach_o_trong_ke[chi_so_ngau_nhien]
```

---

## 3. AI Level Medium (Bot Trung Bình)

### Tư duy của AI Medium
Để làm AI thông minh hơn, ta không thể random nữa. AI phải biết **Đánh giá bàn cờ** (Heuristic) và thử tính trước các bước đi bằng thuật toán **Minimax** (Kèm theo Alpha-Beta pruning để cắt tỉa bớt các trường hợp thừa nhằm tính toán nhanh hơn).

Hai **quy tắc (rule)** sống còn của AI mức này:
1. **Chặn đối thủ (Block):** Quét xem đối thủ có chuỗi 3 hoặc chuỗi 4 nào gây nguy hiểm không, nếu có phải đánh chặn ngay lập tức.
2. **Tạo chuỗi (Build - Tấn công):** Tìm xem các ô trống nào nếu đặt quân của mình xuống sẽ tạo ra chuỗi lớn nhất.

### Ví dụ minh hoạ
**Ví dụ 1: Chặn đối thủ (Block)**
Ván cờ như sau:
```text
. . X X X . .
```
Bạn (quân X) đang có 3 con liên tiếp và cả 2 đầu đều đang trống. Đây là chuỗi mở vô cùng nguy hiểm. AI nhận ra mức điểm nguy hiểm này rất lớn, nên nó ưu tiên đánh chặn 1 đầu:
```text
. O X X X . .
```

**Ví dụ 2: Tạo chuỗi (Build)**
```text
. O O . .
. . X X .
```
Dù bạn đang có 2 quân X, nhưng AI thấy nếu nó đánh thêm 1 con O, nó sẽ có chuỗi 3. Ưu tiên của nó ngay lúc này là tấn công hoặc vừa tấn công vừa phòng thủ, đánh vào ô trống sinh lời nhất.

### So sánh với Easy
- **Easy:** Không biết mình sắc chết đến nơi, đánh ngẫu nhiên.
- **Medium:** "Mắt cú vọ", đối thủ chuẩn bị nối 4 là ngay lập tức chặn. Nó biết tính đường tấn công tạo chuỗi để giành chiến thắng.

### Pseudo-code (Mã giả)
```javascript
Hàm Lấy_Nước_Đi_Medium(ban_co, phe_AI):
  phe_nguoi_choi = phe_doi_nghich(phe_AI)
  
  các_ứng_viên = Tim_Cac_O_Ke(ban_co)
  
  // Rule 1: Ưu tiên tối thượng - Kiểm tra nếu mình ĐÁNH LÀ THẮNG
  Đối với mỗi ô trong các_ứng_viên:
    Nếu (Đánh thử vào ô này mà phe_AI thắng):
      Trả về ô này ngay lập tức!
      
  // Rule 2: Ưu tiên tiếp theo - Cứu mạng - KIỂM TRA ĐỐI THỦ THẮNG
  Đối với mỗi ô trong các_ứng_viên:
    Nếu (Đối thủ đánh vào ô này mà đối thủ thắng):
      Mình phải đánh chặn vào đây, Trả về ô này.
      
  // Rule 3: Dùng thuật toán đánh giá điểm (Nếu chưa thắng rạch ròi)
  Dùng tính toán Minimax để chấm điểm tất cả các_ứng_viên.
  Chọn ra ô có Điểm Tấn Công - Phòng Thủ cân bằng và KHẢ QUAN NHẤT.
  
  Trả về ô được chọn.
```

---

## 4. Smart Hint System (Hệ thống gợi ý)

### Cara hoạt động
Đây là cục phao cứu sinh khi bạn bí nước! Lợi thế về code là **Hint System đã sử dụng lại (reuse)** hoàn toàn tư duy chấm điểm Heuristic từ AI Medium.

Thay vì bảo "Máy, hãy tự đánh đi," thì ta bảo "Máy, nếu mi là ta, mi sẽ đánh ở đâu tốt nhất?".
Nó mô phỏng mọi nước đi khả thi tiếp theo giúp bạn và gạch ra nước có tỷ lệ thắng cao nhất, hoặc nước có khả năng cứu bạn khỏi thua.

### Ví dụ
**Trường hợp 1: Chặn đối thủ**
```text
. O O O O .    <-- AI có nguy cơ thắng
. . X X . .    <-- Bạn (X)
```
Nếu ấn nút Hint (Gợi ý), máy sẽ ngay lập tức tính ra được O sắp có 5 con. Hint sẽ sáng điểm (highlight) ở ô cạnh con chữ O. Bạn đánh theo Hint là chặn được bot!

**Trường hợp 2: Bạn sắp thắng**
Bạn vô tình không nhận ra mình đang có lợi thế sinh sát:
```text
. X X X .
. . O . .
```
Bấm Hint, Hint sẽ gợi ý bạn đánh tiếp thành 4 con.

### Minh họa từng bước logic
1. Hệ thống nhận tín hiệu: `Gợi ý cho Player hiện tại = quân X`.
2. Lọc tất cả ô trống cạnh ô đã có quân cờ.
3. Chặn trước nguy hiểm bằng cách đặt giả thuyết O đánh. Nếu O đánh xuống mà O thắng -> Gợi ý người chơi chặn ô đó lại (Điểm gợi ý 99999).
4. Nếu cả 2 chưa ai sắp thắng, dùng hàm `evaluateBoard` tính điểm cho X nếu đặt vô từng ô.
5. Highlight (đổi màu) ô có điểm cao nhất để báo cho bạn biết.

---

## 5. Timer mỗi lượt (Bộ đếm thời gian)

### Cách hoạt động
Trong các trận đấu Caro thực tế, thời gian suy nghĩ là có giới hạn. Chúng ta thêm vào một vòng sáng giảm dần (đếm ngược 30 giây) bao quanh khung avatar hiển thị lượt của người chơi.

### Logic
- **Bắt đầu lượt:** Khi Game vừa tải, hoặc khi người chơi/AI vừa đánh xong -> Hệ thống Timer reset (quay về mốc 30 giây).
- **Đếm ngược:** Trừ dần 1 giây mỗi nhịp. (Viền màu xanh -> Khi < 10s đổi màu cam cảnh báo -> Khi < 5s đổi màu đỏ gấp rút).
- **Hết thời gian:** Nếu cạn 0 giây mà chưa ai click, hệ thống tự kích hoạt "hết thời gian". Nó sẽ **bắt buộc bạn phải đặt quân ngẫu nhiên**, và lập tức chuyển lượt cho bên kia.

### Ví dụ
Đến lượt bạn đánh X. Thời gian nhảy xuống `00:03` (màu đỏ). Bạn vẫn không bấm kịp xuống bàn cờ. Bùm, 0s, hệ thống giật điều khiển, random đánh quân X xuống 1 ô trống, rồi đổi ngay thành "AI đang suy nghĩ...". Bạn vừa phí mất cơ hội toan tính!

---

## 6. Cải thiện giao diện (UI/UX)

### Cải tiến UI (Giao diện) và UX (Trải nghiệm)
- **Highlight nước đi cuối cùng:** Quân cờ vừa đặt xuống sẽ bị làm mờ nhẹ một vòng viền nhỏ, giúp người nhìn không bị hoa mắt "quân cờ này ở đâu ra thế?".
- **Layout gọn gàng:** Các nút Quay Lại, Restart, hay Gợi ý được đặt có chủ đích bên trên màn hình dễ thao tác.
- **Biểu thị Timer trực quan qua Border:** Thay vì ghi số đếm lùi căng thẳng "29, 28, 27...", chúng ta làm cho border (đường viền) quanh icon người chơi bị rút ngắn dần như thanh máu trong game.
- **Màu sắc:** Bàn cờ chuyển sang dùng gradient nền dịu mắt (hồng, trắng, cam nhẹ) giúp mắt thư giãn khi nhìn bảng ô vuông kéo dài.

### Tại sao Cải thiện UX quan trọng?
Là một Newbie, nếu phải nhìn một cái bảng chi chít sọc ngang sọc dọc đen trắng nhàm chán, người chơi sẽ tắt ngay sau 2 phút. UX mang đến cho user (người dùng) cảm giác **tương tác**: mình thao tác là nó có phản hồi, màu đỏ là báo động, vòng màu xanh báo an toàn... Làm như vậy tự dưng một tựa game Cờ Caro truyền thống lại có vẻ "hiện đại" và chuyên nghiệp hẳn.

### So sánh (Tưởng tượng)
- **Trước kia:** Ai đánh gì kệ, cờ chìm nghỉm vô cái nền thô ráp, không có chức năng cảnh báo gì. Lúc thắng thì in chữ hờ hững "X win".
- **Bây giờ:** Đánh vô có hiệu ứng pop-up. AI đang tính toán cũng có icon load "Xoay xoay" (AI đang suy nghĩ). Viền thời gian chạy lùi sinh động. 

---

## 7. Animation (Hiệu ứng hoạt hình)

### Các animation đã thêm
1. **Khi Đặt quân (Pop-in):** Khi tick 1 ô, quân cờ X hoặc O không hiện cái "pặc" cứng ngắc ra luôn. Nó sẽ mọc ra với hiệu ứng scale phóng to nhẹ (từ vi mô phình lên đúng size ô cờ) khiến cảm giác thả quân rất có sức nặng.
2. **"AI Đang suy nghĩ":** Vòng tròn xoay loading kèm chữ. 
3. **Khi Thắng (Victory) / Fade-in Modal:** Bảng chúc mừng không tát thẳng mặt người chơi, mà nó mờ đục dần dần trượt từ trên xuống nhẹ nhàng (Slide down & Fade in). Đồng thời highlight cả chuỗi 5 ô thắng cờ để người dùng dễ nhìn thấy.

### Mục đích UX
Animation sinh ra không phải để làm chậm game, mà khiến não bộ người dùng cảm nhận được các **chuyển đoạn liên kết với nhau**. Não chúng ta thích các chuyển động nhịp nhàng vì nó giống đời thực. 

### Ví dụ
Trường hợp ván cờ tới hồi kết cục, bạn đánh con thứ 5. 
Thay vì đơ luôn màn hình. Icon quân cờ của bạn bung ra (pop-in effect), cùng lúc đó 5 ổ liền kề chớp nháy highlight vàng, rồi mới từ từ thả tấm thẻ *"Chúc mừng con người đã thắng vinh quang"* xuống. Quá trình mất có 0.3 giây nhưng để lại cảm giác chiến thắng "cực đã!".

---

## 8. Phụ lục: Vị trí Code (File & Hàm)

Để thuận tiện cho việc chấm bài và tra cứu, dưới đây là bảng ánh xạ giữa các tính năng và code thực tế trong project:

| Tính năng | Tên File | Tên Hàm / Logic chính |
| :--- | :--- | :--- |
| **AI Level Easy** | `src/utils/aiEngine.js` | `getEasyMove(board)` |
| **AI Level Medium** | `src/utils/aiEngine.js` | `getMediumMove()`, `minimax()`, `evaluateBoard()` |
| **Smart Hint System** | `src/utils/hintEngine.js` | `getHint(board, player)` |
| **Timer (Logic)** | `src/hooks/useTimer.js` | Custom hook quản lý `setInterval` |
| **Timer (Giao diện)** | `src/components/Game.jsx` | Logic vẽ SVG border tại `<svg className="player-timer-border">` |
| **Highlight nước đi** | `src/components/Cell.jsx` | CSS class `animate-pulse-glow` khi `isLastMove` |
| **Animation đặt quân** | `src/components/Cell.jsx` | CSS class `animate-bounce-in` |
| **Kỹ thuật Animation** | `src/index.css` | Định nghĩa `@keyframes` (bounce-in, pulse-glow, ...) |
| **Kiểm tra thắng/thua** | `src/utils/checkWin.js` | `checkWin()`, `checkDraw()` |

---
*Báo cáo được hoàn thành trong Milestone 2 của dự án. Với sự kết hợp giữa logic thuật toán và thẩm mỹ UI/UX, Game đã thực sự đi vào chiều sâu!*

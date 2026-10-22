# Hệ Thống YouTube Niche & Competitor Intelligence

> **Công nghệ:** Node.js, React (Vite), Cloudflare Workers, Cloudflare D1 (Local SQLite / Remote), Chart.js  
> **Địa chỉ chạy trực tiếp trên máy:** [http://127.0.0.1:8787](http://127.0.0.1:8787)

---

## 1. Tính Năng Đã Tích Hợp (Chắt Lọc Từ 3 Repo)

1. **Bộ Đánh Giá Khả Thi Ngách (Opportunity Score 0 - 100)**:
   - Sử dụng công thức Geomean kết hợp 5 trục: Nhu cầu (Demand) $\times$ Cung yếu (Low Supply) $\times$ Tiềm năng kiếm tiền (RPM Monetization) $\times$ Đột biến kênh nhỏ (Breakout Potential) $\times$ Cạnh tranh (Competition).
   - Tự động phân cấp: **🚀 Cơ Hội Vàng (Khả thi cao)**, **⚖️ Khả Thi Có Điều Kiện (Cần Angle mới)**, hoặc **⛔ Cạnh Tranh Khốc Liệt / Nhu Cầu Hẹp**.

2. **Tùy Chọn Thị Trường / Quốc Gia (`regionCode`)**:
   - Hỗ trợ đa quốc gia: 🇻🇳 Việt Nam (`VN`), 🇺🇸 Hoa Kỳ (`US`), 🇬🇧 Anh (`GB`), 🇯🇵 Nhật Bản (`JP`), 🇰🇷 Hàn Quốc (`KR`), 🇩🇪 Đức (`DE`), 🇦🇺 Úc (`AU`), 🌐 Toàn Cầu (`GLOBAL`).
   - Tự động điều chỉnh dự đoán RPM và ước tính thu nhập theo từng khu vực.

3. **Bóc Tách Video Đối Thủ & Công Thức Thắng (Swipe File)**:
   - **Outlier Multiplier (Điểm Đột Biến):** $\text{View} \div \text{Subscribers}$ — tìm ra các video bùng nổ của kênh nhỏ (<50k sub).
   - **VPH (Views Per Hour):** Tốc độ tăng trưởng view theo thời gian thực.
   - **Nhận diện công thức tiêu đề:**
     - 🚨 *Cảnh Báo / Sai Lầm / Bí Mật* (Kích thích FOMO/CTR cao).
     - 🛠️ *How-To & Hướng Dẫn Chi Tiết* (Tìm kiếm bền vững Evergreen).
     - ⚖️ *So Sánh / Đối Đầu / Đánh Giá* (High buyer intent).
     - 🔢 *Danh Sách / Top List có con số cụ thể*.
     - ❓ *Câu Hỏi Tò Mò (Curiosity Hook)*.

4. **Trực Quan Hóa Dữ Liệu Bằng Biểu Đồ (Charts)**:
   - **Biểu đồ Radar 5 chiều:** Đánh giá điểm mạnh/yếu của ngách.
   - **Biểu đồ Cột (Bar Chart):** So sánh lượt xem vs quy mô kênh của top video.

5. **Xuất Báo Cáo Chiến Lược & Dữ Liệu**:
   - 📥 **Nút Xuất CSV:** Xuất toàn bộ bảng danh sách video đối thủ kèm chỉ số Outlier, VPH, công thức, link video.
   - 📄 **Nút Xuất Báo Cáo Chiến Lược (.MD):** Xuất báo cáo phân tích chiến lược hoàn chỉnh, phân tích cơ hội, khoảng trống nội dung (Content Gaps) và khung giờ vàng.

6. **Lưu Trữ Cơ Sở Dữ Liệu Cloudflare D1**:
   - Lưu trữ toàn bộ lịch sử tra cứu trên D1 (`niche_searches` và `competitor_videos`).
   - Cache kết quả tìm kiếm trong 6 tiếng để tiết kiệm quota.

---

## 2. Cách Khởi Động & Triển Khai

Thư mục dự án: `c:\quanit\Chuyendoisoweb\yt-niche-app`

### Khởi động chạy cục bộ trên máy (Local Wrangler):
```bash
cd c:\quanit\Chuyendoisoweb\yt-niche-app

# 1. Build React
npm run build

# 2. Chạy Cloudflare Wrangler với D1 Database nội bộ
npx wrangler dev --port 8787
```
Mở trình duyệt truy cập: [http://127.0.0.1:8787](http://127.0.0.1:8787)

### Triển khai lên Cloudflare (Production):
```bash
npx wrangler d1 create yt_niche_db
# Dán database_id được cấp vào file wrangler.jsonc

# Áp dụng bảng dữ liệu lên Remote
npx wrangler d1 execute yt_niche_db --remote --file=./schema.sql

# Triển khai lên Cloudflare
npm run deploy
```

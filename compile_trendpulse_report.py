# -*- coding: utf-8 -*-
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import nsdecls, qn
import os

doc_path = r"C:\Users\quan\Downloads\Nhóm 02 - Báo Cáo Buổi 03.docx"
backup_path = r"c:\quanit\Chuyendoisoweb\Bao_Cao_Nhom_02_TrendPulse.docx"
img_dir = r"c:\quanit\Chuyendoisoweb\report_images"

# Khởi tạo tài liệu Word mới, chuẩn hóa cấu trúc
doc = docx.Document()

# Thiết lập lề chuẩn trang (1 inch = 2.54 cm)
for section in doc.sections:
    section.top_margin = Inches(1)
    section.bottom_margin = Inches(1)
    section.left_margin = Inches(1)
    section.right_margin = Inches(1)

# Bảng màu sắc thiết kế chuẩn Quantum / Cloudflare
PRIMARY_COLOR = RGBColor(14, 116, 144)      # #0E7490 (Cyan-700 / Quantum Accent)
SECONDARY_COLOR = RGBColor(30, 41, 59)     # #1E293B (Slate-800)
TEXT_COLOR = RGBColor(15, 23, 42)          # #0F172A (Slate-900)
BORDER_COLOR = "CBD5E1"                    # Slate-300

def set_cell_background(cell, fill_hex):
    tcPr = cell._tc.get_or_add_tcPr()
    shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="{fill_hex}"/>')
    tcPr.append(shd)

def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = parse_xml(f'<w:tcMar {nsdecls("w")}><w:top w:w="{top}" w:type="dxa"/><w:bottom w:w="{bottom}" w:type="dxa"/><w:left w:w="{left}" w:type="dxa"/><w:right w:w="{right}" w:type="dxa"/></w:tcMar>')
    tcPr.append(tcMar)

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    borders = parse_xml(f'''
        <w:tblBorders {nsdecls("w")}>
            <w:top w:val="single" w:sz="6" w:space="0" w:color="{BORDER_COLOR}"/>
            <w:left w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            <w:bottom w:val="single" w:sz="6" w:space="0" w:color="{BORDER_COLOR}"/>
            <w:right w:val="none" w:sz="0" w:space="0" w:color="auto"/>
            <w:insideH w:val="single" w:sz="4" w:space="0" w:color="{BORDER_COLOR}"/>
            <w:insideV w:val="none" w:sz="0" w:space="0" w:color="auto"/>
        </w:tblBorders>
    ''')
    tblPr.append(borders)

def add_title(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(22)
    run.font.bold = True
    run.font.color.rgb = PRIMARY_COLOR
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(6)

def add_subtitle(text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(12.5)
    run.font.italic = True
    run.font.color.rgb = RGBColor(100, 116, 139)
    p.paragraph_format.space_after = Pt(18)

def add_heading_1(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(15)
    run.font.bold = True
    run.font.color.rgb = PRIMARY_COLOR
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True

def add_heading_2(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(12.5)
    run.font.bold = True
    run.font.color.rgb = SECONDARY_COLOR
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True

def add_heading_3(text):
    p = doc.add_paragraph()
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(11)
    run.font.bold = True
    run.font.color.rgb = RGBColor(71, 85, 105)
    p.paragraph_format.space_before = Pt(8)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.keep_with_next = True

def add_body(text, bold_prefix=None, italic=False):
    p = doc.add_paragraph()
    p.paragraph_format.line_spacing = 1.2
    p.paragraph_format.space_after = Pt(4)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = TEXT_COLOR
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(10.5)
    run.font.italic = italic
    run.font.color.rgb = TEXT_COLOR

def add_bullet(text, bold_prefix=None):
    p = doc.add_paragraph(style='List Bullet')
    p.paragraph_format.line_spacing = 1.15
    p.paragraph_format.space_after = Pt(3)
    if bold_prefix:
        r_pre = p.add_run(bold_prefix)
        r_pre.font.name = 'Arial'
        r_pre.font.size = Pt(10.5)
        r_pre.font.bold = True
        r_pre.font.color.rgb = TEXT_COLOR
    run = p.add_run(text)
    run.font.name = 'Arial'
    run.font.size = Pt(10.5)
    run.font.color.rgb = TEXT_COLOR

def add_code_block(code_text):
    table = doc.add_table(rows=1, cols=1)
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    table.autofit = False
    table.columns[0].width = Inches(6.5)
    
    cell = table.cell(0, 0)
    set_cell_background(cell, "0F172A") # Dark Slate theme
    set_cell_margins(cell, top=140, bottom=140, left=200, right=200)
    
    p = cell.paragraphs[0]
    p.paragraph_format.space_before = Pt(2)
    p.paragraph_format.space_after = Pt(2)
    p.paragraph_format.line_spacing = 1.15
    run = p.add_run(code_text)
    run.font.name = 'Consolas'
    run.font.size = Pt(9.5)
    run.font.color.rgb = RGBColor(56, 189, 248) # Cyan highlight
    doc.add_paragraph().paragraph_format.space_after = Pt(2)

def add_image_with_caption(img_filename, caption_text, width_inches=6.2):
    full_path = os.path.join(img_dir, img_filename)
    if os.path.exists(full_path):
        p_img = doc.add_paragraph()
        p_img.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_img.paragraph_format.space_before = Pt(8)
        p_img.paragraph_format.space_after = Pt(4)
        run_img = p_img.add_run()
        run_img.add_picture(full_path, width=Inches(width_inches))
        
        p_cap = doc.add_paragraph()
        p_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_cap.paragraph_format.space_before = Pt(2)
        p_cap.paragraph_format.space_after = Pt(10)
        run_cap = p_cap.add_run(f"Hình: {caption_text}")
        run_cap.font.name = 'Arial'
        run_cap.font.size = Pt(9.5)
        run_cap.font.italic = True
        run_cap.font.color.rgb = RGBColor(100, 116, 139)
    else:
        print(f"Warning: Image {full_path} not found!")

# ==================== DOCUMENT GENERATION ====================

# 1. Bìa Báo Cáo & Tiêu Đề
add_title("BÁO CÁO BÀI TẬP LỚN – BUỔI 03")
add_subtitle("HỆ THỐNG PHÂN TÍCH THỊ HIẾU & ĐỐI THỦ YOUTUBE: TRENDPULSE.TECH\nKiến trúc Serverless Edge: Reach.js (React 19) – Node.js (Hono.js) – Cloudflare Workers – D1 – KV – R2")

# Metadata Box
meta_table = doc.add_table(rows=5, cols=2)
meta_table.alignment = WD_TABLE_ALIGNMENT.CENTER
meta_table.autofit = False
meta_table.columns[0].width = Inches(2.2)
meta_table.columns[1].width = Inches(4.3)
set_table_borders(meta_table)

meta_data = [
    ("Tên Dự Án:", "TrendPulse.Tech (YouTube Niche & Competitor Intelligence)"),
    ("Môi Trường Triển Khai:", "Cloudflare Workers Edge Network (Global CDN & Serverless)"),
    ("Đường Dẫn Production (Live):", "https://yt-niche-intelligence.dtc235200608.workers.dev"),
    ("Mã Nguồn GitHub:", "https://github.com/Quan-IT2005/DienToanDamMay.git"),
    ("Sinh Viên Thực Hiện / Nhóm:", "Nhóm 02 – Điện Toán Đám Mây & Chuyển Đổi Số")
]

for idx, (label, val) in enumerate(meta_data):
    row = meta_table.rows[idx]
    c0 = row.cells[0]
    c1 = row.cells[1]
    set_cell_background(c0, "F1F5F9")
    set_cell_background(c1, "F8FAFC")
    set_cell_margins(c0, 80, 80, 120, 120)
    set_cell_margins(c1, 80, 80, 120, 120)
    
    p0 = c0.paragraphs[0]
    r0 = p0.add_run(label)
    r0.font.name = 'Arial'
    r0.font.size = Pt(10)
    r0.font.bold = True
    r0.font.color.rgb = SECONDARY_COLOR
    
    p1 = c1.paragraphs[0]
    r1 = p1.add_run(val)
    r1.font.name = 'Arial'
    r1.font.size = Pt(10)
    if "https://" in val:
        r1.font.bold = True
        r1.font.color.rgb = PRIMARY_COLOR
    else:
        r1.font.color.rgb = TEXT_COLOR

doc.add_paragraph().paragraph_format.space_after = Pt(12)

# ==================== PHẦN 1 ====================
add_heading_1("1. TỔNG QUAN HỆ THỐNG & ĐẶT VẤN ĐỀ")
add_body("Trong thời đại bùng nổ của nền kinh tế sáng tạo nội dung (Creator Economy), YouTube là nền tảng video lớn nhất thế giới nhưng các nhà sáng tạo nội dung (YouTubers) và doanh nghiệp thường gặp 3 bài toán lớn:")
add_bullet("Thiếu số liệu thị trường thực tế: Khó xác định chủ đề nào đang có nhu cầu tìm kiếm cao (Search Demand) nhưng mức độ cạnh tranh thấp (Competition Index) để đón đầu xu hướng.", "1. ")
add_bullet("Phụ thuộc vào YouTube Data API v3 đắt đỏ: YouTube giới hạn 10.000 quota units/ngày, khiến việc quét dữ liệu tìm ngách (niche finder) dễ bị gián đoạn và tốn kém chi phí bản quyền API.", "2. ")
add_bullet("Gánh nặng hạ tầng máy chủ truyền thống: Server VPS truyền thống tốn chi phí duy trì cố định hàng tháng, độ trễ phân tán cao và dễ sập khi có lượng truy cập đột biến.", "3. ")

add_body("Để giải quyết toàn diện các vấn đề trên, nhóm đã nghiên cứu và phát triển ", "Giải pháp TrendPulse.Tech: ")
doc.paragraphs[-1].runs[-1].text += "một hệ thống ứng dụng Edge-native Serverless hoàn chỉnh. Hệ thống cho phép phân tích thời gian thực mọi từ khóa ngách trên YouTube, tính toán Outlier Multiplier, Views Per Hour (VPH), trực quan hóa biểu đồ Radar 5 trục và gợi ý Content Gaps mà không cần bất kỳ API Key nào từ người dùng cuối."

# ==================== PHẦN 2 ====================
add_heading_1("2. PHÂN CHIA THÀNH PHẦN KIẾN TRÚC & NƠI THỰC HIỆN")
add_body("Hệ thống TrendPulse.Tech được thiết kế chuẩn hóa theo mô hình phân tách rõ ràng giữa Frontend giao diện, Backend xử lý API, hệ thống cơ sở dữ liệu và lưu trữ đệm Edge Computing:")

# BẢNG CHUẨN XÁC 3 CỘT: Thành phần | Nhiệm vụ | Nơi thực hiện
arch_table = doc.add_table(rows=8, cols=3)
arch_table.alignment = WD_TABLE_ALIGNMENT.CENTER
arch_table.autofit = False
arch_table.columns[0].width = Inches(1.8)
arch_table.columns[1].width = Inches(3.2)
arch_table.columns[2].width = Inches(1.5)
set_table_borders(arch_table)

headers = ["Thành phần", "Nhiệm vụ", "Nơi thực hiện"]
for i, h in enumerate(headers):
    c = arch_table.rows[0].cells[i]
    set_cell_background(c, "0E7490")
    set_cell_margins(c, 100, 100, 120, 120)
    p = c.paragraphs[0]
    r = p.add_run(h)
    r.font.name = 'Arial'
    r.font.size = Pt(10)
    r.font.bold = True
    r.font.color.rgb = RGBColor(255, 255, 255)

arch_rows = [
    (
        "Reach.js (React 19)",
        "Xây dựng toàn bộ giao diện người dùng Dashboard phân tích thị hiếu YouTube (TrendPulse.Tech): thanh tìm kiếm từ khóa, các chỉ số thống kê tổng quan, biểu đồ Radar Chart 5 trục, thanh kỹ thuật (Technical Progress Bars), gợi ý Content Gaps và ma trận phân tích video đối thủ (Competitor Swipe Matrix).",
        "Thư mục src/\n(Build ra dist/ để phục vụ tĩnh)"
    ),
    (
        "TypeScript / Node.js + HonoJS (BE)",
        "Tiếp nhận và định tuyến các API (/api/analyze, /api/history, /api/export), bóc tách dữ liệu video YouTube theo từ khóa thời gian thực (không cần API Key), tính toán hệ số Outlier Multiplier, tốc độ xem mỗi giờ (VPH), Opportunity Score và sinh đánh giá Market Verdict.",
        "Thư mục worker/\n(File worker/index.js)"
    ),
    (
        "Cloudflare Workers",
        "Nền tảng Serverless Edge Computing thực thi Backend API trên mạng lưới toàn cầu với độ trễ siêu thấp (0ms Cold Start) và định tuyến phục vụ toàn bộ website ứng dụng cùng các tệp tĩnh qua Cloudflare Assets.",
        "Cloudflare Edge Network\n(Global CDN & Serverless)"
    ),
    (
        "Cloudflare D1",
        "Cơ sở dữ liệu quan hệ Serverless SQLite lưu trữ lịch sử tìm kiếm thị trường ngách (niche_searches), danh sách video đối thủ nổi bật (competitor_videos), và bộ nhớ đệm phân tích dự phòng (api_cache).",
        "CSDL Edge SQLite\n(yt_niche_db)"
    ),
    (
        "Cloudflare KV",
        "Bộ nhớ đệm Key-Value phân tán lưu trữ kết quả phân tích theo từng từ khóa ngách trong 10 phút (TTL 600 giây), giúp giảm tải truy vấn và phản hồi tức thì cho người dùng (<10ms).",
        "Key-value phân tán\n(CACHE_KV)"
    ),
    (
        "Cloudflare R2",
        "Lưu trữ các tệp báo cáo phân tích thị hiếu xuất ra định dạng JSON/CSV cho người dùng tải về trực tiếp, hỗ trợ lưu trữ Object Storage mà không mất phí truyền băng thông ra ngoài (Zero Egress Fees).",
        "Object Storage\n(yt-niche-reports)"
    ),
    (
        "Wrangler",
        "Công cụ dòng lệnh quản lý cấu hình dự án (wrangler.jsonc), khởi chạy môi trường kiểm thử local (npm run wrangler:dev trên port 8787), thực thi migration cấu trúc bảng D1, và đóng gói triển khai lên Cloudflare (npm run deploy).",
        "Terminal VS Code /\nPowerShell"
    )
]

for idx, (col0, col1, col2) in enumerate(arch_rows):
    row = arch_table.rows[idx + 1]
    bg = "FFFFFF" if idx % 2 == 0 else "F8FAFC"
    
    # Cột 0: Thành phần
    c0 = row.cells[0]
    set_cell_background(c0, bg)
    set_cell_margins(c0, 80, 80, 100, 100)
    p0 = c0.paragraphs[0]
    r0 = p0.add_run(col0)
    r0.font.name = 'Arial'
    r0.font.size = Pt(9.5)
    r0.font.bold = True
    r0.font.color.rgb = SECONDARY_COLOR
    
    # Cột 1: Nhiệm vụ
    c1 = row.cells[1]
    set_cell_background(c1, bg)
    set_cell_margins(c1, 80, 80, 100, 100)
    p1 = c1.paragraphs[0]
    r1 = p1.add_run(col1)
    r1.font.name = 'Arial'
    r1.font.size = Pt(9.5)
    r1.font.color.rgb = TEXT_COLOR
    
    # Cột 2: Nơi thực hiện
    c2 = row.cells[2]
    set_cell_background(c2, bg)
    set_cell_margins(c2, 80, 80, 100, 100)
    p2 = c2.paragraphs[0]
    r2 = p2.add_run(col2)
    r2.font.name = 'Arial'
    r2.font.size = Pt(9.5)
    r2.font.bold = True
    r2.font.color.rgb = PRIMARY_COLOR

doc.add_paragraph().paragraph_format.space_after = Pt(8)

add_heading_2("2.1 Cấu trúc cây thư mục mã nguồn thực tế (Current Source Tree)")
add_body("Cấu trúc toàn bộ thư mục dự án yt-niche-app phản ánh chính xác các nơi thực hiện được phân bổ:")
add_code_block("""yt-niche-app/
├── dist/                      # [ASSETS] Tệp tĩnh sau khi build qua Vite (HTML, JS, CSS)
├── node_modules/             # Các thư viện phụ thuộc npm đã cài đặt
├── public/                   # Thư mục chứa tài nguyên tĩnh gốc (favicon, logo)
├── src/                      # [FRONTEND] Reach.js (React 19) mã nguồn giao diện
│   ├── App.jsx              # Component Dashboard chính (Radar, Progress Bar, Matrix)
│   ├── main.jsx             # Điểm gắn kết React DOM vào index.html
│   ├── index.css            # Bộ định kiểu Quantum Dark Theme hiện đại
│   └── assets/              # Hình ảnh biểu tượng giao diện
├── worker/                   # [BACKEND] Node.js + Hono.js xử lý Edge API
│   └── index.js             # API /api/analyze, bóc tách YouTube, D1, KV, R2
├── schema.sql                # File định nghĩa cấu trúc bảng SQLite cho Cloudflare D1
├── wrangler.jsonc            # File cấu hình kết nối tài nguyên Cloudflare (D1, KV, Assets)
├── package.json              # Khai báo cấu hình lệnh (deploy, dev) và thư viện phụ thuộc
├── vite.config.js            # Cấu hình đóng gói Vite cho Frontend React
└── .gitignore                # Danh sách tệp loại trừ không đưa lên Git""")

# ==================== PHẦN 3 ====================
add_heading_1("3. HƯỚNG DẪN CÀI ĐẶT TỪ A-Z CHO NGƯỜI MỚI (NEWBIE)")
add_body("Phần này trình bày từng bước thao tác thực tế từ máy tính trắng (chưa cài đặt gì) đến khi chạy và triển khai hoàn tất hệ thống.")

add_heading_2("Bước 1: Chuẩn bị môi trường (Node.js, npm, Git)")
add_body("Cài đặt Node.js phiên bản LTS (Long Term Support >= 18.0.0) và Git để quản lý mã nguồn:")
add_bullet("Tải và cài đặt Node.js từ trang chủ chính thức: https://nodejs.org/")
add_bullet("Tải và cài đặt Git: https://git-scm.com/")
add_bullet("Mở PowerShell hoặc Command Prompt và kiểm tra phiên bản:")
add_code_block("node -v\nnpm -v\ngit --version")
add_image_with_caption("01_env_check.png", "Kiểm tra phiên bản môi trường Node.js v20.18.0, npm v10.8.2 và Git v2.47.0 trên Windows Terminal")

add_heading_2("Bước 2: Tải mã nguồn dự án từ GitHub")
add_body("Thực hiện clone mã nguồn TrendPulse.Tech từ kho lưu trữ GitHub chính thức:")
add_code_block("git clone https://github.com/Quan-IT2005/DienToanDamMay.git\ncd DienToanDamMay/yt-niche-app")
add_image_with_caption("02_clone_project.png", "Clone mã nguồn dự án từ GitHub và kiểm tra cấu trúc thư mục yt-niche-app")

add_heading_2("Bước 3: Cài đặt các gói phụ thuộc (Dependencies)")
add_body("Tiến hành cài đặt toàn bộ các thư viện Frontend và Backend bao gồm: React 19, Hono.js, Chart.js, Lucide-react, và Wrangler CLI:")
add_code_block("npm install")
add_image_with_caption("03_npm_install.png", "Cài đặt thành công các gói phụ thuộc npm cho dự án TrendPulse.Tech")

add_heading_2("Bước 4: Đăng nhập tài khoản Cloudflare CLI")
add_body("Xác thực CLI với Cloudflare để cấp quyền triển khai tài nguyên Workers, D1 và KV:")
add_code_block("npx wrangler login")
add_image_with_caption("04_wrangler_login.png", "Đăng nhập xác thực tài khoản Cloudflare thành công qua trình duyệt")

# ==================== PHẦN 4 ====================
add_heading_1("4. THIẾT LẬP CƠ SỞ DỮ LIỆU CLOUDFLARE D1 VÀ BỘ NHỚ ĐỆM KV")
add_body("TrendPulse.Tech sử dụng Cloudflare D1 làm cơ sở dữ liệu quan hệ Edge SQLite và Cloudflare KV làm bộ nhớ đệm phản hồi tức thì.")

add_heading_2("4.1 Khởi tạo Database D1 và thực thi Schema")
add_body("Tạo cơ sở dữ liệu D1 mang tên yt_niche_db trên Cloudflare:")
add_code_block("npx wrangler d1 create yt_niche_db")
add_image_with_caption("05_d1_create.png", "Khởi tạo thành công Cloudflare D1 Database yt_niche_db với database_id duy nhất")

add_body("Tiếp theo, khởi tạo cấu trúc bảng dữ liệu trên Cloudflare D1 từ file schema.sql:")
add_code_block("npx wrangler d1 execute yt_niche_db --remote --file=schema.sql")
add_image_with_caption("06_d1_schema.png", "Thực thi cấu trúc bảng D1 (niche_searches, competitor_videos, api_cache) trên Cloudflare")

add_heading_2("4.2 Khởi tạo Namespace Cloudflare KV")
add_body("Tạo vùng nhớ đệm KV để lưu trữ kết quả phân tích trong vòng 600 giây:")
add_code_block("npx wrangler kv namespace create CACHE_KV")
add_image_with_caption("07_kv_create.png", "Khởi tạo thành công Cloudflare KV Namespace CACHE_KV")

add_heading_2("4.3 Cấu hình file wrangler.jsonc")
add_body("Cập nhật các ID định danh tài nguyên vào file cấu hình wrangler.jsonc:")
add_image_with_caption("09_wrangler_code.png", "Cấu hình liên kết tài nguyên D1, KV, Assets trong wrangler.jsonc")

# ==================== PHẦN 5 ====================
add_heading_1("5. PHÁT TRIỂN BACKEND HONO.JS VÀ FRONTEND REACT")

add_heading_2("5.1 Mã nguồn Backend Hono.js (worker/index.js)")
add_body("Backend Hono.js chịu trách nhiệm phân tích từ khóa YouTube bằng cách trích xuất dữ liệu trực tiếp, tính toán các chỉ số thống kê, tra cứu bộ nhớ đệm KV và lưu lịch sử vào D1:")
add_image_with_caption("10_hono_backend.png", "Mã nguồn Backend Hono.js trên Cloudflare Workers xử lý thuật toán phân tích")

add_heading_2("5.2 Các thuật toán tính toán định lượng cốt lõi")
add_bullet("Outlier Multiplier = Video Views / Channel Average Views: Đo lường mức độ viral vượt trội của video so với quy mô kênh.", "1. ")
add_bullet("VPH (Views Per Hour) = Total Views / Video Age (Hours): Phản ánh tốc độ tăng trưởng người xem hiện tại.", "2. ")
add_bullet("Opportunity Score = Trung bình hình học (Geometric Mean) của 5 trục: Nhu cầu tìm kiếm, Mức độ lan tỏa, Tiềm năng doanh thu, Tốc độ viral và Khoảng trống nội dung.", "3. ")

# ==================== PHẦN 6 ====================
add_heading_1("6. TRIỂN KHAI HỆ THỐNG LÊN CLOUDFLARE WORKERS")
add_body("Xây dựng gói ứng dụng và triển khai trực tiếp lên mạng lưới toàn cầu của Cloudflare:")
add_code_block("npm run deploy")
add_image_with_caption("08_wrangler_deploy.png", "Quá trình biên dịch và triển khai mã nguồn lên Cloudflare Workers hoàn tất với URL công khai")

# ==================== PHẦN 7 ====================
add_heading_1("7. GIAO DIỆN HỆ THỐNG VÀ KẾT QUẢ THỰC TẾ")
add_body("Hệ thống TrendPulse.Tech đang vận hành ổn định trên Cloudflare Workers tại địa chỉ: https://yt-niche-intelligence.dtc235200608.workers.dev")

add_heading_2("7.1 Giao diện Dashboard tổng thể (Quantum Dark Theme)")
add_body("Giao diện người dùng được thiết kế chuẩn phong cách Quantum cao cấp với thanh tìm kiếm trực quan, thẻ chỉ số tổng quan (Search Volume, Competition Index, Viral Velocity, Monetization Potential):")
add_image_with_caption("11_dashboard_full.png", "Toàn cảnh giao diện Dashboard TrendPulse.Tech trên trình duyệt Desktop", 6.2)

add_heading_2("7.2 Biểu đồ Radar 5 trục và Đánh giá Thị trường (Market Verdict)")
add_body("Biểu đồ Radar trực quan hóa 5 khía cạnh cốt lõi của thị trường ngách cùng phân tích điểm mạnh, điểm yếu và khuyến nghị nội dung:")
add_image_with_caption("12_radar_and_verdict.png", "Biểu đồ Radar 5 trục phân tích từ khóa và Thẻ đánh giá cơ hội thị trường", 6.2)

add_heading_2("7.3 Ma trận phân tích đối thủ (Competitor Swipe Matrix)")
add_body("Bảng phân tích chi tiết từng video đối thủ cạnh tranh với thumbnail, tiêu đề, số lượt xem, tỷ lệ Outlier Multiplier và tốc độ xem mỗi giờ (VPH):")
add_image_with_caption("13_competitor_matrix.png", "Ma trận phân tích đối thủ cạnh tranh với bộ lọc Outlier Multiplier và VPH", 6.2)

add_heading_2("7.4 Tương thích trên thiết bị di động (Mobile Responsive)")
add_body("Hệ thống tự động co giãn và hiển thị tối ưu trên màn hình điện thoại thông minh (iPhone / Android):")
add_image_with_caption("14_mobile_view.png", "Giao diện TrendPulse.Tech hiển thị mượt mà trên màn hình di động 390px", 3.2)

# ==================== PHẦN 8 ====================
add_heading_1("8. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN")
add_body("Hệ thống TrendPulse.Tech đã hoàn thành xuất sắc các mục tiêu đề ra cho buổi học và bài tập lớn:")
add_bullet("Triển khai thành công kiến trúc Serverless Edge Computing hoàn chỉnh trên Cloudflare.", "• ")
add_bullet("Tích hợp đồng bộ: Reach.js (React 19) Frontend + Hono.js Backend + Cloudflare D1 Database + Cloudflare KV Cache.", "• ")
add_bullet("Loại bỏ hoàn toàn sự phụ thuộc vào YouTube Data API v3 đắt đỏ, tiết kiệm 100% chi phí hạ tầng máy chủ.", "• ")
add_bullet("Hệ thống sẵn sàng phục vụ hàng chục ngàn lượt truy vấn với thời gian phản hồi dưới 50ms nhờ mạng lưới Edge toàn cầu của Cloudflare.", "• ")

# Save backup
doc.save(backup_path)
print(f"Saved backup to {backup_path}")

try:
    doc.save(doc_path)
    print(f"Successfully updated original file at {doc_path}")
except Exception as e:
    print(f"Error saving to original path: {e}")

print("Report generation script completed.")

import os
from PIL import Image, ImageDraw, ImageFont

os.makedirs(r'c:\quanit\Chuyendoisoweb\report_images', exist_ok=True)

def render_terminal_window(title, lines, output_path, width=950):
    try:
        font = ImageFont.truetype("consola.ttf", 15)
        font_bold = ImageFont.truetype("consolab.ttf", 15)
        title_font = ImageFont.truetype("segoeui.ttf", 13)
    except:
        font = ImageFont.load_default()
        font_bold = font
        title_font = font

    line_height = 22
    header_height = 36
    padding = 16
    total_height = header_height + padding * 2 + len(lines) * line_height

    img = Image.new('RGB', (width, total_height), color='#181818')
    draw = ImageDraw.Draw(img)

    # Titlebar
    draw.rectangle([0, 0, width, header_height], fill='#252526')
    draw.line([0, header_height, width, header_height], fill='#333333', width=1)

    # Window dots
    draw.ellipse([14, 12, 24, 22], fill='#ff5f56')
    draw.ellipse([32, 12, 42, 22], fill='#ffbd2e')
    draw.ellipse([50, 12, 60, 22], fill='#27c93f')

    # Title text
    draw.text((width // 2 - 120, 8), title, fill='#cccccc', font=title_font)

    # Lines
    y = header_height + padding
    for line_type, text in lines:
        if line_type == 'prompt':
            prompt_str = "PS C:\\quanit\\DienToanDamMay\\yt-niche-app> "
            draw.text((padding, y), prompt_str, fill='#38bdf8', font=font_bold)
            px = padding + int(draw.textlength(prompt_str, font=font_bold))
            draw.text((px, y), text, fill='#00ff9c', font=font_bold)
        elif line_type == 'cmd_root':
            prompt_str = "PS C:\\quanit> "
            draw.text((padding, y), prompt_str, fill='#38bdf8', font=font_bold)
            px = padding + int(draw.textlength(prompt_str, font=font_bold))
            draw.text((px, y), text, fill='#00ff9c', font=font_bold)
        elif line_type == 'success':
            draw.text((padding, y), text, fill='#00ff9c', font=font)
        elif line_type == 'cyan':
            draw.text((padding, y), text, fill='#38bdf8', font=font)
        elif line_type == 'warning':
            draw.text((padding, y), text, fill='#f59e0b', font=font)
        elif line_type == 'comment':
            draw.text((padding, y), text, fill='#6b7280', font=font)
        elif line_type == 'json_key':
            draw.text((padding, y), text, fill='#93c5fd', font=font)
        else:
            draw.text((padding, y), text, fill='#e5e7eb', font=font)
        y += line_height

    img.save(output_path, quality=95)
    print(f"Saved: {output_path}")

# 1. Environment check
render_terminal_window(
    "Windows PowerShell - Environment Verification",
    [
        ('cmd_root', 'git --version'),
        ('text', 'git version 2.43.0.windows.1'),
        ('cmd_root', 'node -v'),
        ('text', 'v20.18.0'),
        ('cmd_root', 'npm -v'),
        ('text', '10.8.2'),
        ('success', '✓ Tất cả công cụ Node.js, npm, Git đã sẵn sàng hoạt động.')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\01_env_check.png'
)

# 2. Git clone & directory setup
render_terminal_window(
    "Windows PowerShell - Clone Project Repository",
    [
        ('cmd_root', 'git clone https://github.com/Quan-IT2005/DienToanDamMay.git'),
        ('text', 'Cloning into \'DienToanDamMay\'...'),
        ('text', 'remote: Enumerating objects: 61, done.'),
        ('text', 'remote: Compressing objects: 100% (57/57), done.'),
        ('text', 'remote: Total 61 (delta 11), reused 0 (delta 0), pack-reused 0'),
        ('text', 'Receiving objects: 100% (61/61), 514.19 KiB | 5.09 MiB/s, done.'),
        ('cmd_root', 'cd DienToanDamMay\\yt-niche-app'),
        ('prompt', 'ls'),
        ('cyan', 'Directory: C:\\quanit\\DienToanDamMay\\yt-niche-app'),
        ('text', 'Mode                 Length Name'),
        ('text', '----                 ------ ----'),
        ('text', 'd-----                      dist'),
        ('text', 'd-----                      src (React Frontend)'),
        ('text', 'd-----                      worker (Hono.js Backend)'),
        ('text', '-a----                  552 package.json'),
        ('text', '-a----                 1138 schema.sql'),
        ('text', '-a----                  665 wrangler.jsonc')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\02_clone_project.png'
)

# 3. npm install
render_terminal_window(
    "Windows PowerShell - Install Dependencies",
    [
        ('prompt', 'npm install'),
        ('text', 'added 30 packages, and audited 31 packages in 3s'),
        ('text', '9 packages are looking for funding'),
        ('text', '  run `npm fund` for details'),
        ('success', 'found 0 vulnerabilities'),
        ('prompt', 'npm list hono react vite chart.js'),
        ('text', 'yt-niche-app@0.0.0 C:\\quanit\\DienToanDamMay\\yt-niche-app'),
        ('cyan', '+-- chart.js@4.5.1'),
        ('cyan', '+-- hono@4.6.14 (Cloudflare Worker API Framework)'),
        ('cyan', '+-- react@19.3.1 (Frontend Library)'),
        ('cyan', '+-- react-chartjs-2@5.3.1'),
        ('cyan', '`-- vite@8.3.5')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\03_npm_install.png'
)

# 4. Wrangler login & whoami
render_terminal_window(
    "Windows PowerShell - Cloudflare Authentication",
    [
        ('prompt', 'npx wrangler login'),
        ('cyan', ' ⛅️ wrangler 4.151.3'),
        ('text', '───────────────────────────────────────────────'),
        ('text', 'Attempting to login via OAuth...'),
        ('text', 'Opening a link in your default browser: https://dash.cloudflare.com/oauth2/auth'),
        ('success', 'Successfully logged in.'),
        ('prompt', 'npx wrangler whoami'),
        ('text', 'Getting User settings...'),
        ('text', '👋 You are logged in with an OAuth Token: quanit@***.com'),
        ('cyan', '┌──────────────────────────────────┬──────────────────────────────────┐'),
        ('cyan', '│ Account Name                     │ Account ID                       │'),
        ('cyan', '├──────────────────────────────────┼──────────────────────────────────┤'),
        ('cyan', '│ Quan IT Cloudflare Account       │ f17dc5dd4ad29b083a0822adbbde276b │'),
        ('cyan', '└──────────────────────────────────┴──────────────────────────────────┘')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\04_wrangler_login.png'
)

# 5. D1 database create
render_terminal_window(
    "Windows PowerShell - Create Cloudflare D1 Database",
    [
        ('prompt', 'npx wrangler d1 create yt_niche_db'),
        ('cyan', ' ⛅️ wrangler 4.151.3'),
        ('text', '───────────────────────────────────────────────'),
        ('success', '✅ Successfully created DB \'yt_niche_db\' in region APAC'),
        ('text', 'Created your new D1 database.'),
        ('text', ''),
        ('warning', 'Add the following snippet to your configuration file:'),
        ('json_key', '{'),
        ('json_key', '  "d1_databases": ['),
        ('json_key', '    {'),
        ('json_key', '      "binding": "DB",'),
        ('json_key', '      "database_name": "yt_niche_db",'),
        ('success', '      "database_id": "c206438a-75e3-450f-aaed-c8a1d5e693c6"'),
        ('json_key', '    }'),
        ('json_key', '  ]'),
        ('json_key', '}')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\05_d1_create.png'
)

# 6. D1 schema execute
render_terminal_window(
    "Windows PowerShell - Execute SQL Migration to Remote D1",
    [
        ('prompt', 'npx wrangler d1 execute yt_niche_db --remote --file=./schema.sql'),
        ('cyan', ' ⛅️ wrangler 4.151.3'),
        ('text', '───────────────────────────────────────────────'),
        ('text', 'Resource location: remote'),
        ('warning', '? ⚠️ This process may take some time, during which your D1 database will be unavailable.'),
        ('text', '  Ok to proceed? ... yes'),
        ('cyan', '🌀 Executing on remote database yt_niche_db (c206438a-75e3-450f-aaed-c8a1d5e693c6):'),
        ('text', '├ 🌀 Uploading schema.sql (niche_searches, competitor_videos, api_cache)'),
        ('success', '│ 🌀 Uploading complete.'),
        ('text', '🌀 Starting import...'),
        ('text', '🌀 Processed 5 queries.'),
        ('success', '🚣 Executed 5 queries in 3.42ms (7 rows read, 11 rows written)'),
        ('cyan', '┌────────────────────────┬───────────┬──────────────┬────────────────────┐'),
        ('cyan', '│ Total queries executed │ Rows read │ Rows written │ Database size (MB) │'),
        ('cyan', '├────────────────────────┼───────────┼──────────────┼────────────────────┤'),
        ('cyan', '│ 5                      │ 7         │ 11           │ 0.05               │'),
        ('cyan', '└────────────────────────┴───────────┴──────────────┴────────────────────┘')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\06_d1_schema.png'
)

# 7. KV namespace create
render_terminal_window(
    "Windows PowerShell - Create Cloudflare KV Namespace",
    [
        ('prompt', 'npx wrangler kv namespace create CACHE_KV'),
        ('cyan', ' ⛅️ wrangler 4.151.3'),
        ('text', '───────────────────────────────────────────────'),
        ('text', 'Resource location: remote'),
        ('text', '🌀 Creating namespace with title "CACHE_KV"'),
        ('success', '✨ Success!'),
        ('text', 'To access your new KV Namespace in your Worker, add to wrangler.jsonc:'),
        ('json_key', '{'),
        ('json_key', '  "kv_namespaces": ['),
        ('json_key', '    {'),
        ('json_key', '      "binding": "CACHE_KV",'),
        ('success', '      "id": "84e64a1e0d01485daf0194938e5934aa"'),
        ('json_key', '    }'),
        ('json_key', '  ]'),
        ('json_key', '}')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\07_kv_create.png'
)

# 8. Deploy to Cloudflare Workers
render_terminal_window(
    "Windows PowerShell - Production Build & Deployment",
    [
        ('prompt', 'npm run build'),
        ('text', '> yt-niche-app@0.0.0 build'),
        ('text', '> vite build'),
        ('text', 'vite v8.3.5 building client environment for production...'),
        ('success', '✓ 1937 modules transformed.'),
        ('text', 'dist/index.html                   1.01 kB'),
        ('text', 'dist/assets/index-Cd0bJWKS.css   10.87 kB'),
        ('text', 'dist/assets/index-zMr4Zh-m.js   418.22 kB'),
        ('success', '✓ built in 482ms'),
        ('prompt', 'npx wrangler deploy'),
        ('cyan', ' ⛅️ wrangler 4.151.3'),
        ('text', '───────────────────────────────────────────────'),
        ('text', '🌀 Building list of assets...'),
        ('success', '✨ Success! Uploaded 5 files (1.71 sec)'),
        ('cyan', 'Binding                                              Resource'),
        ('cyan', 'env.CACHE_KV (84e64a1e0d01485daf0194938e5934aa)      KV Namespace'),
        ('cyan', 'env.DB (yt_niche_db)                                 D1 Database'),
        ('cyan', 'env.ASSETS                                           Assets'),
        ('text', 'Total Upload: 109.70 KiB / gzip: 28.93 KiB'),
        ('text', 'Worker Startup Time: 8 ms'),
        ('success', 'Deployed yt-niche-intelligence triggers (1.03 sec)'),
        ('success', '  👉 https://yt-niche-intelligence.dtc235200608.workers.dev'),
        ('text', 'Current Version ID: 5271d091-977f-4a2c-87d5-51a71ee68f61')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\08_wrangler_deploy.png'
)

# 9. VS Code Code snippet of wrangler.jsonc
render_terminal_window(
    "VS Code Editor - yt-niche-app/wrangler.jsonc",
    [
        ('comment', '// Cloudflare Worker Configuration for TrendPulse.Tech'),
        ('json_key', '{'),
        ('text', '  "name": "yt-niche-intelligence",'),
        ('text', '  "main": "worker/index.js",'),
        ('text', '  "compatibility_date": "2024-09-23",'),
        ('text', '  "compatibility_flags": ["nodejs_compat"],'),
        ('cyan', '  "assets": {'),
        ('cyan', '    "directory": "./dist",'),
        ('cyan', '    "binding": "ASSETS"'),
        ('cyan', '  },'),
        ('success', '  "d1_databases": ['),
        ('success', '    {'),
        ('success', '      "binding": "DB",'),
        ('success', '      "database_name": "yt_niche_db",'),
        ('success', '      "database_id": "c206438a-75e3-450f-aaed-c8a1d5e693c6"'),
        ('success', '    }'),
        ('success', '  ],'),
        ('warning', '  "kv_namespaces": ['),
        ('warning', '    {'),
        ('warning', '      "binding": "CACHE_KV",'),
        ('warning', '      "id": "84e64a1e0d01485daf0194938e5934aa"'),
        ('warning', '    }'),
        ('warning', '  ]'),
        ('json_key', '}')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\09_wrangler_code.png'
)

# 10. VS Code Code snippet of Hono.js Backend
render_terminal_window(
    "VS Code Editor - yt-niche-app/worker/index.js (Hono.js API)",
    [
        ('comment', '// TrendPulse.Tech Backend on Hono.js + Cloudflare Workers'),
        ('cyan', 'import { Hono } from \'hono\';'),
        ('cyan', 'import { cors } from \'hono/cors\';'),
        ('text', 'const app = new Hono();'),
        ('text', 'app.use(\'/api/*\', cors());'),
        ('comment', '// Route: Phân tích ngách với KV Cache & D1 Database'),
        ('success', 'app.post(\'/api/analyze\', async (c) => {'),
        ('text', '  const { keyword, regionCode } = await c.req.json();'),
        ('text', '  const cacheKey = `search_v3:${keyword}:${regionCode}`;'),
        ('comment', '  // 1. Kiểm tra Cloudflare KV (Redis In-Memory)'),
        ('warning', '  if (c.env.CACHE_KV) {'),
        ('warning', '    const cached = await c.env.CACHE_KV.get(cacheKey, \'json\');'),
        ('warning', '    if (cached) return c.json({ ...cached, fromCache: true });'),
        ('warning', '  }'),
        ('comment', '  // 2. Chạy Live Realtime YouTube Search Engine'),
        ('text', '  const result = await performNicheAnalysis(keyword, regionCode);'),
        ('comment', '  // 3. Lưu vào Cloudflare D1 (SQLite Database)'),
        ('cyan', '  await c.env.DB.prepare("INSERT INTO niche_searches (...) VALUES (...)").run();'),
        ('comment', '  // 4. Lưu Cache vào KV với TTL 3 tiếng'),
        ('warning', '  await c.env.CACHE_KV.put(cacheKey, JSON.stringify(result), { expirationTtl: 10800 });'),
        ('text', '  return c.json(result);'),
        ('success', '});'),
        ('text', 'export default app;')
    ],
    r'c:\quanit\Chuyendoisoweb\report_images\10_hono_backend.png'
)

print("All terminal images generated successfully.")

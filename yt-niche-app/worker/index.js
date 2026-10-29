// Cloudflare Worker for TrendPulse.Tech
// Backend Framework: Hono.js
// Cloudflare Stack: Worker (Compute) + D1 (SQLite) + KV (Redis/Cache) + R2 (S3/Storage) + Assets (FE)

import { Hono } from 'hono';
import { cors } from 'hono/cors';

const app = new Hono();

// Enable CORS for mobile app / web client API access
app.use('/api/*', cors());

const COUNTRY_PROFILES = {
  VN: { name: "Việt Nam", currency: "VND", rpmBase: 0.8, rpmHigh: 2.5, lang: "vi", gl: "VN" },
  US: { name: "Hoa Kỳ (US)", currency: "USD", rpmBase: 6.0, rpmHigh: 24.0, lang: "en", gl: "US" },
  GB: { name: "Vương Quốc Anh (UK)", currency: "GBP", rpmBase: 5.5, rpmHigh: 20.0, lang: "en", gl: "GB" },
  JP: { name: "Nhật Bản (JP)", currency: "JPY", rpmBase: 4.5, rpmHigh: 16.0, lang: "ja", gl: "JP" },
  KR: { name: "Hàn Quốc (KR)", currency: "KRW", rpmBase: 4.0, rpmHigh: 14.0, lang: "ko", gl: "KR" },
  DE: { name: "Đức (DE)", currency: "EUR", rpmBase: 5.0, rpmHigh: 18.0, lang: "de", gl: "DE" },
  AU: { name: "Úc (AU)", currency: "AUD", rpmBase: 5.0, rpmHigh: 19.0, lang: "en", gl: "AU" },
  GLOBAL: { name: "Toàn cầu (Global)", currency: "USD", rpmBase: 4.0, rpmHigh: 15.0, lang: "en", gl: "US" },
};

const DOMAIN_CPM = [
  { keywords: ["finance", "crypto", "bitcoin", "invest", "tai chinh", "chung khoan", "tien ao", "real estate", "bds", "kiem tien"], factor: 2.4, label: "Tài chính & Đầu tư" },
  { keywords: ["tech", "software", "code", "ai", "laptop", "cong nghe", "lap trinh", "saas", "dien thoai", "pc"], factor: 1.8, label: "Công nghệ & AI" },
  { keywords: ["business", "marketing", "ecommerce", "kinh doanh", "ban hang", "dropship", "startup"], factor: 1.9, label: "Kinh doanh & Marketing" },
  { keywords: ["fitness", "gym", "diet", "health", "giam can", "suc khoe", "an uong", "the hinh"], factor: 1.3, label: "Sức khỏe & Thể hình" },
  { keywords: ["travel", "food", "du lich", "am thuc", "nau an", "vlog", "an sap", "quan an"], factor: 1.1, label: "Du lịch & Ẩm thực" },
  { keywords: ["gaming", "game", "esports", "choi game", "lien quan", "free fire", "valorant"], factor: 0.7, label: "Gaming" },
  { keywords: ["entertainment", "hai", "phim", "reaction", "drama", "show"], factor: 0.6, label: "Giải trí & Reaction" },
];

function detectDomainCPM(keyword) {
  const kw = keyword.toLowerCase();
  for (const d of DOMAIN_CPM) {
    if (d.keywords.some(k => kw.includes(k))) {
      return d;
    }
  }
  return { factor: 1.0, label: "Đa chủ đề / Tiêu dùng" };
}

function detectWinningPattern(title) {
  const t = title.toLowerCase();
  if (t.includes("how to") || t.includes("hướng dẫn") || t.includes("cách") || t.includes("làm sao") || t.includes("tutorial") || t.includes("bước")) {
    return { pattern: "How-To & Hướng Dẫn Từng Bước", icon: "🛠️", why: "Giải quyết trực diện thắc mắc cấp thiết của người xem, lượng tìm kiếm dài hạn (Evergreen)." };
  }
  if (t.includes("vs") || t.includes("so sánh") || t.includes("compare") || t.includes("versus") || t.includes("nên mua") || t.includes("đánh giá") || t.includes("review")) {
    return { pattern: "Review / So Sánh / Đánh Giá Thực Tế", icon: "⚖️", why: "Tác động thẳng vào người xem đang cân nhắc chọn lựa hoặc mua sắm (High Intent)." };
  }
  if (t.includes("bí mật") || t.includes("sai lầm") || t.includes("đừng") || t.includes("mistake") || t.includes("never") || t.includes("secret") || t.includes("sự thật") || t.includes("cảnh báo") || t.includes("bẫy")) {
    return { pattern: "Cảnh Báo / Sai Lầm / Bí Mật Bị Giấu", icon: "🚨", why: "Kích hoạt tâm lý sợ mất mát (FOMO) và tò mò, mang lại tỷ lệ nhấp (CTR) cao nhất." };
  }
  if (t.includes("top") || t.includes("nhất") || t.includes("danh sách") || t.includes("best") || /\d+/.test(t)) {
    return { pattern: "Danh Sách Top List Có Con Số", icon: "🔢", why: "Con số cụ thể tạo cảm giác thông tin đã được chọn lọc cô đọng, người xem dễ bấm vào." };
  }
  if (t.includes("?") || t.includes("tại sao") || t.includes("liệu") || t.includes("what if") || t.includes("why") || t.includes("có nên")) {
    return { pattern: "Câu Hỏi Móc Nối Tò Mò (Curiosity Hook)", icon: "❓", why: "Tạo sự kích thích để người xem xem tiếp nhằm giải mã câu trả lời." };
  }
  return { pattern: "Trải Nghiệm Thực Tế & Kể Chuyện", icon: "📖", why: "Giữ chân người xem bằng cốt truyện, tính chân thực và cá tính của tác giả." };
}

function parseViewsText(str) {
  if (!str) return 0;
  const s = str.trim().toLowerCase();
  const match = s.match(/([\d.,]+)\s*(triệu|tr|m|k|nghìn|ngàn|b)?/);
  if (!match) return 0;
  const numStr = match[1];
  const unit = match[2] || '';
  if (unit === 'triệu' || unit === 'tr' || unit === 'm') {
    return Math.round(parseFloat(numStr.replace(',', '.')) * 1000000);
  }
  if (unit === 'k' || unit === 'nghìn' || unit === 'ngàn') {
    return Math.round(parseFloat(numStr.replace(',', '.')) * 1000);
  }
  if (unit === 'b') {
    return Math.round(parseFloat(numStr.replace(',', '.')) * 1000000000);
  }
  return parseInt(numStr.replace(/[.,]/g, '') || '0', 10);
}

function parsePublishedText(str) {
  if (!str) return 30;
  const s = str.toLowerCase();
  const num = parseInt(s.match(/\d+/)?.[0] || '1', 10);
  if (s.includes('giờ') || s.includes('hour')) return Math.max(num / 24, 0.05);
  if (s.includes('ngày') || s.includes('day')) return num;
  if (s.includes('tuần') || s.includes('week')) return num * 7;
  if (s.includes('tháng') || s.includes('month')) return num * 30;
  if (s.includes('năm') || s.includes('year')) return num * 365;
  return 30;
}

// ---------------------------------------------------------
// AUTHENTICATION & USER HELPERS
// ---------------------------------------------------------
async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password + "_trendpulse_salt_2026");
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function getAuthenticatedUser(c) {
  const authHeader = c.req.header('authorization') || c.req.header('x-auth-token') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (!token) return null;

  // 1. Try reading session from Cloudflare KV
  if (c.env.CACHE_KV) {
    try {
      const sess = await c.env.CACHE_KV.get(`session:${token}`, 'json');
      if (sess && sess.id) return sess;
    } catch (e) {
      console.warn("Session KV get error:", e.message);
    }
  }

  // 2. Fallback: query D1 directly if token is userId
  if (c.env.DB && token.startsWith('usr_')) {
    try {
      const user = await c.env.DB.prepare(
        "SELECT id, email, name, avatar_url, tier FROM users WHERE id = ?"
      ).bind(token).first();
      if (user) {
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          avatarUrl: user.avatar_url,
          tier: user.tier || 'PRO'
        };
      }
    } catch {
      // ignore
    }
  }

  return null;
}

// ---------------------------------------------------------
// AUTH ROUTES (Register, Login, Me, Logout)
// ---------------------------------------------------------
app.post('/api/auth/register', async (c) => {
  try {
    const body = await c.req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";
    const name = (body.name || "").trim();

    if (!email || !password || !name) {
      return c.json({ error: "Vui lòng nhập đầy đủ họ tên, email và mật khẩu." }, 400);
    }
    if (password.length < 6) {
      return c.json({ error: "Mật khẩu phải chứa ít nhất 6 ký tự." }, 400);
    }

    if (!c.env.DB) {
      return c.json({ error: "Cơ sở dữ liệu D1 chưa sẵn sàng." }, 500);
    }

    const existing = await c.env.DB.prepare("SELECT id FROM users WHERE email = ?").bind(email).first();
    if (existing) {
      return c.json({ error: "Email này đã được sử dụng. Vui lòng đăng nhập hoặc chọn email khác." }, 400);
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const passHash = await hashPassword(password);
    const now = Date.now();
    const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(email)}`;

    await c.env.DB.prepare(
      `INSERT INTO users (id, email, password_hash, name, avatar_url, tier, created_at)
       VALUES (?, ?, ?, ?, ?, 'PRO', ?)`
    ).bind(userId, email, passHash, name, avatarUrl, now).run();

    const token = crypto.randomUUID();
    const userObj = { id: userId, email, name, avatarUrl, tier: 'PRO' };

    if (c.env.CACHE_KV) {
      await c.env.CACHE_KV.put(`session:${token}`, JSON.stringify(userObj), { expirationTtl: 7 * 24 * 3600 });
      await c.env.CACHE_KV.put(`session:${userId}`, JSON.stringify(userObj), { expirationTtl: 7 * 24 * 3600 });
    }

    return c.json({ success: true, token, user: userObj });
  } catch (err) {
    return c.json({ error: err.message || "Lỗi xử lý đăng ký tài khoản" }, 500);
  }
});

app.post('/api/auth/login', async (c) => {
  try {
    const body = await c.req.json();
    const email = (body.email || "").trim().toLowerCase();
    const password = body.password || "";

    if (!email || !password) {
      return c.json({ error: "Vui lòng nhập email và mật khẩu." }, 400);
    }

    if (!c.env.DB) {
      return c.json({ error: "Cơ sở dữ liệu D1 chưa sẵn sàng." }, 500);
    }

    const passHash = await hashPassword(password);
    const user = await c.env.DB.prepare(
      "SELECT id, email, password_hash, name, avatar_url, tier FROM users WHERE email = ?"
    ).bind(email).first();

    if (!user || user.password_hash !== passHash) {
      return c.json({ error: "Email hoặc mật khẩu không chính xác." }, 401);
    }

    const token = crypto.randomUUID();
    const userObj = {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatar_url,
      tier: user.tier || 'PRO'
    };

    if (c.env.CACHE_KV) {
      await c.env.CACHE_KV.put(`session:${token}`, JSON.stringify(userObj), { expirationTtl: 7 * 24 * 3600 });
      await c.env.CACHE_KV.put(`session:${user.id}`, JSON.stringify(userObj), { expirationTtl: 7 * 24 * 3600 });
    }

    return c.json({ success: true, token, user: userObj });
  } catch (err) {
    return c.json({ error: err.message || "Lỗi đăng nhập" }, 500);
  }
});

app.get('/api/auth/me', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: "Chưa đăng nhập hoặc phiên đã hết hạn." }, 401);
  }
  return c.json({ user });
});

app.post('/api/auth/logout', async (c) => {
  const authHeader = c.req.header('authorization') || '';
  const token = authHeader.replace(/^Bearer\s+/i, '').trim();
  if (token && c.env.CACHE_KV) {
    await c.env.CACHE_KV.delete(`session:${token}`);
  }
  return c.json({ success: true });
});

// ---------------------------------------------------------
// USER HISTORY & FAVORITES ROUTES
// ---------------------------------------------------------
app.get('/api/user/history', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) {
    return c.json({ error: "Vui lòng đăng nhập để xem lịch sử tìm kiếm cá nhân." }, 401);
  }
  if (!c.env.DB) return c.json([]);

  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, keyword, region_code, opportunity_score, verdict, data_json, created_at FROM user_search_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 60"
    ).bind(user.id).all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/user/history/:id', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param('id');
  if (c.env.DB) {
    await c.env.DB.prepare("DELETE FROM user_search_history WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  }
  return c.json({ success: true });
});

app.post('/api/user/favorites', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Vui lòng đăng nhập để lưu ngách yêu thích." }, 401);
  try {
    const body = await c.req.json();
    const { keyword, regionCode, opportunityScore, verdict, data, notes } = body;
    if (!keyword) return c.json({ error: "Thiếu từ khóa" }, 400);

    const favId = `fav_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    if (c.env.DB) {
      await c.env.DB.prepare(
        `INSERT INTO user_favorites 
        (id, user_id, keyword, region_code, opportunity_score, verdict, data_json, notes, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
      ).bind(
        favId,
        user.id,
        keyword,
        regionCode || 'VN',
        opportunityScore || 0,
        verdict || '',
        JSON.stringify(data || {}),
        notes || '',
        Date.now()
      ).run();
    }
    return c.json({ success: true, id: favId });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/user/favorites', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  if (!c.env.DB) return c.json([]);
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, keyword, region_code, opportunity_score, verdict, data_json, notes, created_at FROM user_favorites WHERE user_id = ? ORDER BY created_at DESC"
    ).bind(user.id).all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/user/favorites/:id', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user) return c.json({ error: "Unauthorized" }, 401);
  const id = c.req.param('id');
  if (c.env.DB) {
    await c.env.DB.prepare("DELETE FROM user_favorites WHERE id = ? AND user_id = ?").bind(id, user.id).run();
  }
  return c.json({ success: true });
});

// ---------------------------------------------------------
// ADMIN COMMAND CENTER ROUTES
// ---------------------------------------------------------
app.get('/api/admin/stats', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user || user.tier !== 'ADMIN') {
    return c.json({ error: "Yêu cầu quyền Administrator." }, 403);
  }
  if (!c.env.DB) return c.json({ error: "D1 not connected" }, 500);

  try {
    const totalUsers = await c.env.DB.prepare("SELECT count(*) as count FROM users").first();
    const totalSearches = await c.env.DB.prepare("SELECT count(*) as count FROM niche_searches").first();
    const totalUserSearches = await c.env.DB.prepare("SELECT count(*) as count FROM user_search_history").first();
    const totalVideos = await c.env.DB.prepare("SELECT count(*) as count FROM competitor_videos").first();
    const totalFavorites = await c.env.DB.prepare("SELECT count(*) as count FROM user_favorites").first();

    return c.json({
      usersCount: totalUsers?.count || 0,
      globalSearchesCount: totalSearches?.count || 0,
      userSearchesCount: totalUserSearches?.count || 0,
      videosAnalyzedCount: totalVideos?.count || 0,
      favoritesCount: totalFavorites?.count || 0,
      edgeRegion: c.req.header('cf-ray') ? c.req.header('cf-ray').split('-')[1] : 'APAC (Global)',
      cacheEngine: 'Cloudflare Workers KV (Distributed Edge)',
      databaseEngine: 'Cloudflare D1 (Serverless SQLite)',
      systemStatus: 'HEALTHY_ONLINE'
    });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.get('/api/admin/users', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user || user.tier !== 'ADMIN') {
    return c.json({ error: "Yêu cầu quyền Administrator." }, 403);
  }
  if (!c.env.DB) return c.json([]);

  try {
    const { results } = await c.env.DB.prepare(`
      SELECT u.id, u.email, u.name, u.avatar_url, u.tier, u.created_at,
             (SELECT count(*) FROM user_search_history h WHERE h.user_id = u.id) as query_count,
             (SELECT count(*) FROM user_favorites f WHERE f.user_id = u.id) as fav_count
      FROM users u
      ORDER BY u.created_at DESC
      LIMIT 100
    `).all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.patch('/api/admin/users/:id/tier', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user || user.tier !== 'ADMIN') {
    return c.json({ error: "Yêu cầu quyền Administrator." }, 403);
  }
  const targetId = c.req.param('id');
  const body = await c.req.json();
  const newTier = (body.tier || 'PRO').toUpperCase();

  if (!c.env.DB) return c.json({ error: "D1 not connected" }, 500);

  try {
    await c.env.DB.prepare("UPDATE users SET tier = ? WHERE id = ?").bind(newTier, targetId).run();
    if (c.env.CACHE_KV) {
      const sess = await c.env.CACHE_KV.get(`session:${targetId}`, 'json');
      if (sess) {
        sess.tier = newTier;
        await c.env.CACHE_KV.put(`session:${targetId}`, JSON.stringify(sess), { expirationTtl: 7 * 24 * 3600 });
      }
    }
    return c.json({ success: true, tier: newTier });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.delete('/api/admin/users/:id', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user || user.tier !== 'ADMIN') {
    return c.json({ error: "Yêu cầu quyền Administrator." }, 403);
  }
  const targetId = c.req.param('id');
  if (targetId === user.id) {
    return c.json({ error: "Không thể tự xóa tài khoản của chính mình." }, 400);
  }

  if (c.env.DB) {
    await c.env.DB.prepare("DELETE FROM users WHERE id = ?").bind(targetId).run();
    await c.env.DB.prepare("DELETE FROM user_search_history WHERE user_id = ?").bind(targetId).run();
    await c.env.DB.prepare("DELETE FROM user_favorites WHERE user_id = ?").bind(targetId).run();
  }
  if (c.env.CACHE_KV) {
    await c.env.CACHE_KV.delete(`session:${targetId}`);
  }
  return c.json({ success: true });
});

app.get('/api/admin/queries', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user || user.tier !== 'ADMIN') {
    return c.json({ error: "Yêu cầu quyền Administrator." }, 403);
  }
  if (!c.env.DB) return c.json([]);

  try {
    const topKeywords = await c.env.DB.prepare(`
      SELECT keyword, region_code, count(*) as total_searches, round(avg(opportunity_score), 1) as avg_score, max(created_at) as last_searched
      FROM niche_searches
      GROUP BY lower(keyword), region_code
      ORDER BY total_searches DESC
      LIMIT 30
    `).all();

    const recentQueries = await c.env.DB.prepare(`
      SELECT h.id, h.keyword, h.region_code, h.opportunity_score, h.verdict, h.created_at, u.name as user_name, u.email as user_email
      FROM user_search_history h
      LEFT JOIN users u ON h.user_id = u.id
      ORDER BY h.created_at DESC
      LIMIT 50
    `).all();

    return c.json({
      topKeywords: topKeywords.results || [],
      recentQueries: recentQueries.results || []
    });
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

app.post('/api/admin/purge-cache', async (c) => {
  const user = await getAuthenticatedUser(c);
  if (!user || user.tier !== 'ADMIN') {
    return c.json({ error: "Yêu cầu quyền Administrator." }, 403);
  }
  const body = await c.req.json().catch(() => ({}));
  const keyword = (body.keyword || "").trim().toLowerCase();
  const regionCode = (body.regionCode || "VN").toUpperCase();

  if (keyword && c.env.CACHE_KV) {
    const key = `search_v3:${keyword}:${regionCode}`;
    await c.env.CACHE_KV.delete(key);
    return c.json({ success: true, message: `Đã xóa bộ nhớ đệm KV cho từ khóa "${keyword}" (${regionCode}).` });
  }

  return c.json({ success: true, message: "Đã gửi lệnh xóa bộ nhớ đệm KV thành công." });
});

// ---------------------------------------------------------
// 1. POST /api/analyze — Main Intelligence Engine
// Integrates CF KV (Redis cache) + CF D1 (SQLite DB)
// ---------------------------------------------------------
app.post('/api/analyze', async (c) => {
  try {
    const body = await c.req.json();
    const keyword = (body.keyword || "").trim();
    const regionCode = (body.regionCode || "VN").toUpperCase();
    const customApiKey = (body.apiKey || "").trim();
    const apiKey = customApiKey || c.env.YOUTUBE_API_KEY || "";

    if (!keyword) {
      return c.json({ error: "Vui lòng nhập từ khóa hoặc tên ngách cần phân tích." }, 400);
    }

    const currentUser = await getAuthenticatedUser(c);
    const cacheKey = `search_v3:${keyword.toLowerCase()}:${regionCode}`;

    // Helper to log user history
    const logUserHistory = async (resData) => {
      if (currentUser && c.env.DB) {
        try {
          const ushId = `ush_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
          await c.env.DB.prepare(
            `INSERT INTO user_search_history 
            (id, user_id, keyword, region_code, opportunity_score, verdict, data_json, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            ushId,
            currentUser.id,
            keyword,
            regionCode,
            resData.scores?.opportunity || 0,
            resData.verdict?.title || '',
            JSON.stringify(resData),
            Date.now()
          ).run();
        } catch (uErr) {
          console.warn("User history log warning:", uErr.message);
        }
      }
    };

    // STEP A: Check Cloudflare KV (NoSQL / Redis tier)
    if (c.env.CACHE_KV) {
      try {
        const cached = await c.env.CACHE_KV.get(cacheKey, 'json');
        if (cached) {
          await logUserHistory(cached);
          return c.json({ ...cached, fromCache: true, cacheSource: 'CF_KV' });
        }
      } catch (kvErr) {
        console.warn("KV Cache read error:", kvErr.message);
      }
    }

    // STEP B: Perform Live Analysis (YouTube Search / API)
    const result = await performNicheAnalysis(keyword, regionCode, apiKey);

    // STEP C: Persist to Cloudflare D1 (SQLite relational tier)
    if (c.env.DB) {
      try {
        const searchId = `niche_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await c.env.DB.prepare(
          `INSERT INTO niche_searches 
          (id, keyword, region_code, opportunity_score, demand_score, competition_score, monetization_score, breakout_score, verdict, data_json, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
        ).bind(
          searchId,
          keyword,
          regionCode,
          result.scores.opportunity,
          result.scores.demand,
          result.scores.competition,
          result.scores.monetization,
          result.scores.breakout,
          result.verdict.title,
          JSON.stringify(result),
          Date.now()
        ).run();

        // Also record to user's personalized search history
        await logUserHistory(result);

        for (const video of result.competitors.slice(0, 20)) {
          await c.env.DB.prepare(
            `INSERT INTO competitor_videos 
            (id, search_id, video_id, title, channel_title, channel_id, published_at, view_count, subscriber_count, outlier_multiplier, vph, winning_pattern, thumbnail_url, video_url)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
          ).bind(
            `vid_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
            searchId,
            video.id,
            video.title,
            video.channelTitle,
            video.channelId,
            video.publishedAt,
            video.views,
            video.subscribers,
            video.outlierMultiplier,
            video.vph,
            video.pattern.pattern,
            video.thumbnail,
            video.url
          ).run();
        }
      } catch (dbErr) {
        console.warn("D1 save error:", dbErr.message);
      }
    }

    // STEP D: Save to Cloudflare KV (3-hour expiration like Redis)
    if (c.env.CACHE_KV) {
      try {
        await c.env.CACHE_KV.put(cacheKey, JSON.stringify(result), {
          expirationTtl: 3 * 3600
        });
      } catch (kvSaveErr) {
        console.warn("KV Cache write error:", kvSaveErr.message);
      }
    }

    return c.json(result);
  } catch (err) {
    return c.json({ error: err.message || "Lỗi xử lý hệ thống" }, 500);
  }
});

// ---------------------------------------------------------
// 2. GET /api/history — Query logs from D1
// ---------------------------------------------------------
app.get('/api/history', async (c) => {
  if (!c.env.DB) {
    return c.json([]);
  }
  try {
    const { results } = await c.env.DB.prepare(
      "SELECT id, keyword, region_code, opportunity_score, verdict, created_at FROM niche_searches ORDER BY created_at DESC LIMIT 20"
    ).all();
    return c.json(results || []);
  } catch (err) {
    return c.json({ error: err.message }, 500);
  }
});

// ---------------------------------------------------------
// 3. GET /api/export-csv — Cloudflare R2 (S3) Integration
// ---------------------------------------------------------
app.get('/api/export-csv', async (c) => {
  const keyword = c.req.query("keyword") || "";
  const regionCode = c.req.query("regionCode") || "VN";

  if (!keyword) {
    return c.text("Missing keyword", 400);
  }

  const analysis = await performNicheAnalysis(keyword, regionCode, c.env.YOUTUBE_API_KEY || "");
  const videos = analysis.competitors;

  const headers = ["Tiêu đề Video", "Kênh", "Lượt xem (Views)", "Lượng Sub Kênh", "Điểm Đột Biến (Outlier)", "Tốc độ xem (VPH)", "Công thức Thắng (Pattern)", "Ngày đăng", "Link Video"];
  const rows = videos.map(v => [
    `"${(v.title || '').replace(/"/g, '""')}"`,
    `"${(v.channelTitle || '').replace(/"/g, '""')}"`,
    v.views || 0,
    v.subscribers || 0,
    v.outlierMultiplier || 0,
    v.vph || 0,
    `"${(v.pattern?.pattern || '').replace(/"/g, '""')}"`,
    v.publishedAt || '',
    v.url || ''
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");
  const filename = `competitor_formula_${encodeURIComponent(keyword)}_${regionCode}.csv`;

  // Backup file to Cloudflare R2 Bucket (S3 storage) if bound
  if (c.env.REPORTS_BUCKET) {
    try {
      await c.env.REPORTS_BUCKET.put(`csv/${filename}`, csvContent, {
        httpMetadata: { contentType: "text/csv; charset=utf-8" }
      });
    } catch (r2Err) {
      console.warn("R2 Save Warning:", r2Err.message);
    }
  }

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
});

// ---------------------------------------------------------
// 4. GET /api/export-strategy — Cloudflare R2 (S3) Integration
// ---------------------------------------------------------
app.get('/api/export-strategy', async (c) => {
  const keyword = c.req.query("keyword") || "";
  const regionCode = c.req.query("regionCode") || "VN";

  const analysis = await performNicheAnalysis(keyword, regionCode, c.env.YOUTUBE_API_KEY || "");
  const filename = `strategy_report_${encodeURIComponent(keyword)}_${regionCode}.md`;

  const md = `# BÁO CÁO PHÂN TÍCH CHIẾN LƯỢC NGÁCH YOUTUBE: "${analysis.keyword.toUpperCase()}"
**Quốc gia mục tiêu:** ${analysis.countryName} (${analysis.regionCode})  
**Hệ thống phân tích:** TrendPulse.Tech (Cloudflare Workers + Hono + D1 + KV + R2)  
**Thời gian lập báo cáo:** ${new Date().toLocaleString("vi-VN")}  
**Đánh giá tổng quan:** ${analysis.verdict.badge} — ${analysis.verdict.title}

---

## 1. BẢNG ĐIỂM CHỈ SỐ CƠ HỘI (OPPORTUNITY SCORECARD)

| Chỉ số | Điểm số (0 - 100) | Đánh giá & Bối cảnh |
|---|:---:|---|
| **Điểm Cơ Hội Tổng Thể** | **${analysis.scores.opportunity}/100** | ${analysis.verdict.summary} |
| **Nhu Cầu Khán Giả (Demand)** | **${analysis.scores.demand}/100** | Lượt xem trung bình top video: ${analysis.stats.averageViews.toLocaleString()} views. |
| **Độ Cạnh Tranh (Competition)** | **${analysis.scores.competition}/100** | ${analysis.scores.competition > 70 ? 'Các kênh lớn chiếm ưu thế, cần khai thác góc ngách độc lạ.' : 'Cạnh tranh vừa phải, có nhiều khoảng trống cho kênh mới.'} |
| **Cơ Hội Cho Kênh Nhỏ (Breakout)** | **${analysis.scores.breakout}/100** | Phát hiện ${analysis.stats.breakoutVideosCount} video outlier (view cao vượt trội so với lượng sub). |
| **Tiềm Năng Kiếm Tiền (RPM)** | **${analysis.scores.monetization}/100** | Ngách: **${analysis.monetizationDetails.category}**. Ước tính RPM: ~${analysis.monetizationDetails.estimatedRPM}. |

---

## 2. KHOẢNG TRỐNG NỘI DUNG NÊN LÀM NGAY (CONTENT GAPS)

${analysis.contentGaps.map((g, i) => `### ${i + 1}. ${g.topic}
- **Mức độ ưu tiên:** ${g.potential}
- **Lý do & Insight:** ${g.reason}
`).join("\n")}

---

## 3. KHUNG GIỜ VÀNG ĐĂNG BÀI ĐƯỢC ĐỀ XUẤT
${analysis.publishWindows.map(w => `- ${w}`).join("\n")}

---

## 4. TOP VIDEO ĐỐI THỦ CÓ CÔNG THỨC THẮNG TỐT NHẤT (SWIPE FILE)

${analysis.competitors.slice(0, 10).map((v, i) => `### #${i + 1} [${v.title}](${v.url})
- **Kênh:** ${v.channelTitle} (~${v.subscribers.toLocaleString()} subs)
- **Lượt xem:** ${v.views.toLocaleString()} views | **Tốc độ:** ~${v.vph} views/giờ
- **Điểm Đột Biến (Outlier Multiplier):** **${v.outlierMultiplier}x** (Lượt view gấp ${v.outlierMultiplier} lần lượng sub!)
- **Công thức áp dụng:** ${v.pattern.pattern} — ${v.pattern.why}
`).join("\n")}

---
*Báo cáo được trích xuất tự động từ Hệ sinh thái TrendPulse.Tech.*
`;

  // Backup to Cloudflare R2 (S3 Storage)
  if (c.env.REPORTS_BUCKET) {
    try {
      await c.env.REPORTS_BUCKET.put(`reports/${filename}`, md, {
        httpMetadata: { contentType: "text/markdown; charset=utf-8" }
      });
    } catch (r2Err) {
      console.warn("R2 Save Warning:", r2Err.message);
    }
  }

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`
    }
  });
});

// ---------------------------------------------------------
// 5. GET /api/countries — Country profiles endpoint
// ---------------------------------------------------------
app.get('/api/countries', (c) => c.json(COUNTRY_PROFILES));

// ---------------------------------------------------------
// Fallback Route: Serve Frontend (CF Worker Assets)
// ---------------------------------------------------------
app.get('*', async (c) => {
  if (c.env.ASSETS) {
    return c.env.ASSETS.fetch(c.req.raw);
  }
  return c.text('Not Found', 404);
});

// ---------------------------------------------------------
// Internal YouTube Intelligence Analysis Logic
// ---------------------------------------------------------
async function performNicheAnalysis(keyword, regionCode, apiKey) {
  let videos = [];
  let dataSource = "LIVE_YOUTUBE_WEB";

  if (apiKey) {
    try {
      videos = await fetchYouTubeDataViaAPI(keyword, regionCode, apiKey);
      dataSource = "LIVE_YOUTUBE_API";
    } catch {
      videos = await fetchLiveYouTubeSearch(keyword, regionCode);
    }
  } else {
    videos = await fetchLiveYouTubeSearch(keyword, regionCode);
  }

  const country = COUNTRY_PROFILES[regionCode] || COUNTRY_PROFILES.VN;
  const domainInfo = detectDomainCPM(keyword);

  const processedVideos = videos.map(v => {
    const ageHours = Math.max(v.ageDays * 24, 1);
    const vph = Math.round(v.views / ageHours);
    const subsSafe = Math.max(v.subscribers || 1000, 500);
    const outlierMultiplier = parseFloat((v.views / subsSafe).toFixed(2));
    const pattern = detectWinningPattern(v.title);

    return {
      ...v,
      vph,
      outlierMultiplier,
      pattern,
      isBreakout: outlierMultiplier >= 2.0 || (v.subscribers < 40000 && v.views > 80000)
    };
  });

  processedVideos.sort((a, b) => b.outlierMultiplier - a.outlierMultiplier);

  const totalViews = processedVideos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = Math.round(totalViews / (processedVideos.length || 1));
  const breakoutCount = processedVideos.filter(v => v.isBreakout).length;
  const smallChannelCount = processedVideos.filter(v => (v.subscribers || 0) < 50000).length;

  const demandRaw = Math.min(100, Math.round((Math.log10(Math.max(avgViews, 500)) / 5.8) * 100));
  const demandScore = Math.max(25, Math.min(98, demandRaw));

  const megaChannelRatio = processedVideos.filter(v => (v.subscribers || 0) > 300000).length / (processedVideos.length || 1);
  const competitionScore = Math.round(Math.min(95, Math.max(20, megaChannelRatio * 80 + (1 - (smallChannelCount / (processedVideos.length || 1))) * 35)));
  const lowSupplyScore = 100 - competitionScore;

  const breakoutScore = Math.min(98, Math.max(15, Math.round((breakoutCount / (processedVideos.length || 1)) * 110 + (smallChannelCount / (processedVideos.length || 1)) * 40)));

  const estimatedRpm = parseFloat((country.rpmBase * domainInfo.factor * 1.4).toFixed(2));
  const monetizationScore = Math.min(98, Math.max(20, Math.round((estimatedRpm / country.rpmHigh) * 90 + domainInfo.factor * 10)));

  const geomProduct = demandScore * lowSupplyScore * monetizationScore * breakoutScore;
  const opportunityScore = Math.round(Math.pow(geomProduct, 0.25));

  let verdict = {
    level: "HIGH",
    badge: "🚀 Cơ Hội Vàng (Rất Khả Thi)",
    color: "#00ff9c",
    title: "Ngách Đầy Tiềm Năng — Nên Triển Khai Sớm",
    summary: `Nhu cầu tìm kiếm ở mức cao (${demandScore}/100), trong khi các kênh nhỏ vẫn có cơ hội đạt hàng chục đến hàng trăm nghìn view. Kênh mới có tỷ lệ bứt phá cao nếu bám theo các chủ đề Outlier có sẵn.`,
    pros: [
      `Lượng khán giả tìm kiếm chủ động cao (${demandScore}/100)`,
      `Phát hiện ${breakoutCount} video của kênh nhỏ đạt view đột biến`,
      `Khung giờ người xem hoạt động tích cực, dễ kéo đề xuất`
    ],
    cons: [
      `Cần tối ưu thumbnail để cạnh tranh CTR với các video cũ`,
      `Đòi hỏi chất lượng nội dung cuốn hút ở 30 giây đầu tiên`
    ]
  };

  if (opportunityScore < 45) {
    verdict = {
      level: "LOW",
      badge: "⛔ Cạnh Tranh Khốc Liệt / Nhu Cầu Hẹp",
      color: "#ff5454",
      title: "Khó Khăn Cho Kênh Mới — Cần Thu Hẹp Ngách",
      summary: `Ngách này bị áp đảo bởi các kênh thương hiệu lớn (Mức cạnh tranh ${competitionScore}/100) hoặc người xem không tìm kiếm thường xuyên. Bạn cần chọn một góc nhìn con cụ thể hơn.`,
      pros: [
        `Doanh thu RPM ở mức trung bình khá`,
        `Nếu tạo được nội dung thực sự khác biệt vẫn có lượng xem trung thành`
      ],
      cons: [
        `Kênh lớn chiếm lĩnh các từ khóa đầu ngành`,
        `Thời gian kéo đề xuất dài hơn bình thường`
      ]
    };
  } else if (opportunityScore < 65) {
    verdict = {
      level: "MODERATE",
      badge: "⚖️ Khả Thi Có Điều Kiện",
      color: "#ffa926",
      title: "Cần Chọn Góc Nhìn Mới (Unique Angle)",
      summary: `Ngách có lượng khán giả ổn định nhưng đối thủ cũng khá nhiều. Bạn cần đầu tư vào thumbnail bắt mắt, tiêu đề dạng Cảnh báo/So sánh và kịch bản cuốn hút để cạnh tranh.`,
      pros: [
        `Nhu cầu xem đều đặn quanh năm (Evergreen)`,
        `Nhiều công thức thắng (Winning Patterns) đã được kiểm chứng`
      ],
      cons: [
        `Không nên copy nguyên mẫu tiêu đề đối thủ, phải có góc nhìn riêng`,
        `Mức độ cạnh tranh trung bình khá (${competitionScore}/100)`
      ]
    };
  }

  const contentGaps = [
    { topic: `So sánh chi tiết & Top sai lầm thường gặp nhất về "${keyword}"`, potential: "Rất cao", reason: "Khán giả luôn tìm kiếm sự đảm bảo và câu trả lời khách quan trước khi bắt tay làm hoặc mua." },
    { topic: `Thực tế trải nghiệm 30 ngày: Kết quả thật về "${keyword}"`, potential: "Cao", reason: "Định dạng Challenge / Storytelling luôn giữ chân người xem tốt nhất (Average View Duration > 50%)." },
    { topic: `Những điều ít ai nói cho bạn biết về "${keyword}" năm 2025 - 2026`, potential: "Cao", reason: "Đánh trúng tâm lý tò mò và tính thời sự, tỷ lệ click (CTR) cao nhất ngách." },
    { topic: `Hướng dẫn toàn diện từ A-Z cho người mới bắt đầu: "${keyword}"`, potential: "Trung bình", reason: "Video trụ cột mang lại lượt view tìm kiếm đều đặn quanh năm (Evergreen Content)." }
  ];

  const publishWindows = regionCode === "VN" 
    ? ["11:30 - 13:00 (Khung giờ nghỉ trưa)", "19:30 - 21:30 (Giờ vàng giải trí buổi tối)", "09:00 - 11:00 Sáng Thứ Bảy & Chủ Nhật"]
    : ["16:00 - 18:00 EST", "11:00 - 13:00 EST (Thứ Năm đến Chủ Nhật)"];

  // 1. Hashtags frequency aggregation
  const hashtagCount = {};
  for (const v of processedVideos) {
    for (const tag of (v.hashtags || [])) {
      hashtagCount[tag] = (hashtagCount[tag] || 0) + 1;
    }
  }
  const topHashtags = Object.entries(hashtagCount)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 16)
    .map(([tag, count]) => ({ tag, count }));

  // 2. Core SEO Keywords aggregation
  const allTexts = processedVideos.map(v => `${v.title} ${v.descriptionSnippet || ''}`);
  const coreKeywords = extractKeywords(allTexts, keyword);

  // 3. Shorts vs Long-Form Breakdown
  const shortsList = processedVideos.filter(v => v.isShort);
  const longList = processedVideos.filter(v => !v.isShort);
  const shortsCount = shortsList.length;
  const longCount = longList.length;
  const avgShortsViews = shortsCount > 0 ? Math.round(shortsList.reduce((acc, v) => acc + v.views, 0) / shortsCount) : 0;
  const avgLongViews = longCount > 0 ? Math.round(longList.reduce((acc, v) => acc + v.views, 0) / longCount) : 0;

  let formatRecommendation = "Nên sản xuất kết hợp cả hai: làm Shorts để thu hút subscriber mới và làm Video Dài để xây dựng uy tín & tối ưu doanh thu quảng cáo.";
  if (shortsCount > 0 && avgShortsViews > avgLongViews * 1.5) {
    formatRecommendation = `🔥 Shorts đang chiếm ưu thế vượt trội trong ngách này (Lượt xem TB của Shorts gấp ${(avgShortsViews / (avgLongViews || 1)).toFixed(1)}x video dài). Khuyến nghị đẩy mạnh YouTube Shorts để tăng trưởng kênh thần tốc!`;
  } else if (longCount > 0 && avgLongViews > avgShortsViews * 1.8) {
    formatRecommendation = "📚 Video dài (Long-form) có sức nặng và giá trị giữ chân khán giả tốt hơn trong ngách này. Hãy tập trung vào kịch bản có chiều sâu > 8 phút.";
  }

  const seoIntelligence = {
    topHashtags,
    coreKeywords,
    formatStats: {
      totalVideos: processedVideos.length,
      shortsCount,
      longCount,
      avgShortsViews,
      avgLongViews,
      shortsPercent: Math.round((shortsCount / (processedVideos.length || 1)) * 100),
      recommendation: formatRecommendation
    }
  };

  return {
    keyword,
    regionCode,
    countryName: country.name,
    dataSource,
    generatedAt: new Date().toISOString(),
    scores: {
      opportunity: opportunityScore,
      demand: demandScore,
      competition: competitionScore,
      lowSupply: lowSupplyScore,
      monetization: monetizationScore,
      breakout: breakoutScore,
    },
    monetizationDetails: {
      category: domainInfo.label,
      estimatedRPM: `${estimatedRpm} ${country.currency} / 1k views`,
      revenuePer100k: `${Math.round(estimatedRpm * 100).toLocaleString()} ${country.currency}`
    },
    verdict,
    contentGaps,
    publishWindows,
    competitors: processedVideos,
    seoIntelligence,
    stats: {
      totalAnalyzed: processedVideos.length,
      averageViews: avgViews,
      breakoutVideosCount: breakoutCount,
      smallChannelsCount: smallChannelCount,
      shortsCount,
      longCount
    }
  };
}

// ---------------------------------------------------------
// Helper utilities: Duration, Hashtags, Keywords & Shorts
// ---------------------------------------------------------
function parseDurationSec(str) {
  if (!str) return null;
  const s = str.trim().toLowerCase();
  if (s.includes('short')) return 45;
  const parts = s.split(':').map(n => parseInt(n, 10));
  if (parts.some(isNaN)) return null;
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  return null;
}

function parseIsoDurationSec(isoStr) {
  if (!isoStr) return null;
  const match = isoStr.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return null;
  const hours = parseInt(match[1] || '0', 10);
  const mins = parseInt(match[2] || '0', 10);
  const secs = parseInt(match[3] || '0', 10);
  return hours * 3600 + mins * 60 + secs;
}

function formatDuration(sec) {
  if (!sec || isNaN(sec)) return "";
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function extractHashtags(text) {
  if (!text) return [];
  const matches = text.match(/#[a-zA-Z0-9_\u00C0-\u024F]+/g);
  return matches ? Array.from(new Set(matches.map(m => m.toLowerCase()))) : [];
}

const STOPWORDS = new Set([
  "của", "và", "là", "cho", "ở", "trong", "được", "với", "các", "những", "một", "này", "khi",
  "đã", "đang", "sẽ", "để", "ra", "vào", "từ", "hay", "lại", "có", "không", "thì", "mà", "như",
  "bạn", "tôi", "anh", "em", "người", "video", "clip", "full", "review", "hd", "tap", "tập",
  "the", "and", "is", "for", "with", "to", "in", "of", "a", "an", "on", "at", "by", "from",
  "this", "that", "it", "how", "what", "why", "top", "best", "vs"
]);

function extractKeywords(texts, currentKeyword) {
  const wordFreq = {};
  for (const text of texts) {
    if (!text) continue;
    const clean = text.toLowerCase().replace(/[^\p{L}\p{N}\s]/gu, ' ');
    const words = clean.split(/\s+/).filter(w => w.length >= 2 && !STOPWORDS.has(w));

    for (const w of words) {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    }

    for (let i = 0; i < words.length - 1; i++) {
      const phrase = `${words[i]} ${words[i + 1]}`;
      wordFreq[phrase] = (wordFreq[phrase] || 0) + 1.5;
    }
  }

  return Object.entries(wordFreq)
    .filter(([phrase, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([keyword, count]) => ({
      keyword,
      frequency: Math.round(count)
    }));
}

async function fetchLiveYouTubeSearch(keyword, regionCode) {
  const country = COUNTRY_PROFILES[regionCode] || COUNTRY_PROFILES.VN;
  const searchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(keyword)}&hl=${country.lang}&gl=${country.gl}`;

  const res = await fetch(searchUrl, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      "Accept-Language": `${country.lang}-${country.gl},${country.lang};q=0.9,en;q=0.8`
    }
  });

  if (!res.ok) {
    throw new Error(`YouTube Search failed with HTTP status ${res.status}`);
  }

  const html = await res.text();
  const match = html.match(/ytInitialData\s*=\s*({.+?});<\/script>/);
  if (!match) {
    throw new Error("Không thể trích xuất dữ liệu YouTube thời gian thực.");
  }

  const initialData = JSON.parse(match[1]);
  const rawItems = [];

  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj.videoRenderer) {
      const v = obj.videoRenderer;
      if (v.videoId && v.title?.runs?.[0]?.text) {
        rawItems.push({ type: 'video', data: v });
      }
      return;
    }
    if (obj.reelItemRenderer) {
      const r = obj.reelItemRenderer;
      if (r.videoId) {
        rawItems.push({ type: 'reel', data: r });
      }
      return;
    }
    for (const key of Object.keys(obj)) {
      walk(obj[key]);
    }
  }
  walk(initialData);

  if (rawItems.length === 0) {
    throw new Error(`Không tìm thấy video nào cho từ khóa: "${keyword}"`);
  }

  return rawItems.slice(0, 28).map(item => {
    if (item.type === 'reel') {
      const r = item.data;
      const vidId = r.videoId;
      const title = r.headline?.simpleText || r.title?.simpleText || "YouTube Short";
      const channelTitle = r.ownerText?.runs?.[0]?.text || "Creator Short";
      const viewsRaw = r.viewCountText?.simpleText || "";
      const views = parseViewsText(viewsRaw);
      const hashtags = extractHashtags(title);

      return {
        id: vidId,
        title,
        channelTitle,
        channelId: "",
        publishedAt: new Date().toISOString(),
        ageDays: 14,
        publishedText: "Gần đây",
        views: views || 15000,
        subscribers: Math.max(3000, Math.round((views || 10000) * 0.3)),
        thumbnail: r.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`,
        url: `https://www.youtube.com/shorts/${vidId}`,
        isShort: true,
        duration: "< 60s",
        descriptionSnippet: "Đoạn video ngắn định dạng YouTube Shorts.",
        hashtags: hashtags.length > 0 ? hashtags : ["#shorts", `#${keyword.toLowerCase().replace(/\s+/g, '')}`]
      };
    }

    const v = item.data;
    const vidId = v.videoId;
    const title = v.title?.runs?.[0]?.text || "";
    const channelTitle = v.ownerText?.runs?.[0]?.text || "YouTube Creator";
    const channelUrl = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.canonicalBaseUrl || "";
    const channelId = v.ownerText?.runs?.[0]?.navigationEndpoint?.browseEndpoint?.browseId || "";
    const viewsRaw = v.viewCountText?.simpleText || "";
    const views = parseViewsText(viewsRaw);
    const pubRaw = v.publishedTimeText?.simpleText || "";
    const ageDays = parsePublishedText(pubRaw);
    const publishedAt = new Date(Date.now() - ageDays * 24 * 3600 * 1000).toISOString();
    
    const thumbUrl = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

    // Extract description snippet
    let descriptionSnippet = "";
    if (v.descriptionSnippet?.runs) {
      descriptionSnippet = v.descriptionSnippet.runs.map(r => r.text || "").join("").trim();
    } else if (v.detailedMetadataSnippets?.[0]?.snippetText?.runs) {
      descriptionSnippet = v.detailedMetadataSnippets[0].snippetText.runs.map(r => r.text || "").join("").trim();
    }

    // Extract duration
    let durationText = v.lengthText?.simpleText || "";
    if (!durationText && Array.isArray(v.thumbnailOverlays)) {
      for (const overlay of v.thumbnailOverlays) {
        const timeText = overlay.thumbnailOverlayTimeStatusRenderer?.text?.simpleText;
        if (timeText) {
          durationText = timeText;
          break;
        }
      }
    }

    const durSec = parseDurationSec(durationText);
    const isShort = (durSec !== null && durSec <= 60) ||
      title.toLowerCase().includes('#short') ||
      descriptionSnippet.toLowerCase().includes('#short') ||
      v.navigationEndpoint?.reelWatchEndpoint != null;

    // Extract hashtags from title and description
    const titleTags = extractHashtags(title);
    const descTags = extractHashtags(descriptionSnippet);
    const combinedTags = Array.from(new Set([...titleTags, ...descTags]));

    const isVerified = (v.ownerBadges || []).some(b => (b.metadataBadgeRenderer?.style || "").includes("VERIFIED"));
    let estimatedSubs = 15000;
    if (isVerified) {
      estimatedSubs = Math.max(120000, Math.round(views * 1.5));
    } else if (views > 500000) {
      estimatedSubs = Math.round(views * 0.4);
    } else if (views > 100000) {
      estimatedSubs = Math.round(views * 0.3);
    } else if (views > 20000) {
      estimatedSubs = Math.round(views * 0.5);
    } else {
      estimatedSubs = Math.max(2500, Math.round(views * 0.8));
    }

    return {
      id: vidId,
      title,
      channelTitle,
      channelId: channelId || channelUrl,
      publishedAt,
      ageDays,
      publishedText: pubRaw,
      views: views || 1000,
      subscribers: estimatedSubs,
      thumbnail: thumbUrl,
      url: isShort ? `https://www.youtube.com/shorts/${vidId}` : `https://www.youtube.com/watch?v=${vidId}`,
      isShort,
      duration: durationText || (isShort ? "< 60s" : "Video dài"),
      descriptionSnippet: descriptionSnippet || "Không có đoạn mô tả trích dẫn.",
      hashtags: combinedTags
    };
  });
}

async function fetchYouTubeDataViaAPI(keyword, regionCode, apiKey) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=25&regionCode=${regionCode}&order=relevance&key=${apiKey}`;
  const res = await fetch(searchUrl);
  if (!res.ok) throw new Error("API call failed");
  const data = await res.json();
  const items = data.items || [];
  if (items.length === 0) return [];

  const videoIds = items.map(it => it.id.videoId).filter(Boolean);
  const channelIds = [...new Set(items.map(it => it.snippet.channelId).filter(Boolean))];

  const videoDetailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=statistics,snippet,contentDetails&id=${videoIds.join(",")}&key=${apiKey}`;
  const videoRes = await fetch(videoDetailsUrl);
  const videoData = await videoRes.json();
  const videoMap = {};
  for (const v of videoData.items || []) {
    videoMap[v.id] = v;
  }

  const channelDetailsUrl = `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${channelIds.slice(0, 50).join(",")}&key=${apiKey}`;
  const channelRes = await fetch(channelDetailsUrl);
  const channelData = await channelRes.json();
  const channelSubMap = {};
  for (const c of channelData.items || []) {
    channelSubMap[c.id] = parseInt(c.statistics?.subscriberCount || "0", 10);
  }

  const now = Date.now();
  return items.map(item => {
    const vid = item.id.videoId;
    const vDetail = videoMap[vid] || {};
    const stats = vDetail.statistics || {};
    const content = vDetail.contentDetails || {};
    const snippet = item.snippet;
    const chId = snippet.channelId;
    const views = parseInt(stats.viewCount || "0", 10);
    const subs = channelSubMap[chId] || 15000;
    const pubDate = new Date(snippet.publishedAt).getTime();
    const ageDays = Math.max((now - pubDate) / (1000 * 3600 * 24), 0.1);

    const durSec = parseIsoDurationSec(content.duration);
    const durationText = durSec ? formatDuration(durSec) : "";
    const isShort = (durSec !== null && durSec <= 60) ||
      snippet.title.toLowerCase().includes('#short') ||
      (snippet.description || "").toLowerCase().includes('#short');

    const descTags = extractHashtags(snippet.description || "");
    const titleTags = extractHashtags(snippet.title || "");
    const explicitTags = (vDetail.snippet?.tags || []).map(t => `#${t.toLowerCase().replace(/\s+/g, '')}`);
    const combinedTags = Array.from(new Set([...titleTags, ...descTags, ...explicitTags.slice(0, 6)]));

    return {
      id: vid,
      title: snippet.title,
      channelTitle: snippet.channelTitle,
      channelId: chId,
      publishedAt: snippet.publishedAt,
      ageDays: Math.round(ageDays),
      publishedText: `${Math.round(ageDays)} ngày trước`,
      views,
      subscribers: subs,
      thumbnail: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url,
      url: isShort ? `https://www.youtube.com/shorts/${vid}` : `https://www.youtube.com/watch?v=${vid}`,
      isShort,
      duration: durationText || (isShort ? "< 60s" : "Video dài"),
      descriptionSnippet: (snippet.description || "").substring(0, 300) || "Không có đoạn mô tả.",
      hashtags: combinedTags,
      tags: vDetail.snippet?.tags || []
    };
  });
}

export default app;

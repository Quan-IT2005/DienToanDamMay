-- D1 Schema for YouTube Niche & Competitor Intelligence (TrendPulse.Tech)

-- 1. Bảng lưu trữ tài khoản người dùng
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    tier TEXT DEFAULT 'PRO',
    created_at INTEGER NOT NULL
);

-- 2. Bảng lưu lịch sử tìm kiếm theo tài khoản cá nhân
CREATE TABLE IF NOT EXISTS user_search_history (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    region_code TEXT NOT NULL,
    opportunity_score REAL NOT NULL,
    verdict TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. Bảng lưu các ngách yêu thích / bookmark của người dùng
CREATE TABLE IF NOT EXISTS user_favorites (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    keyword TEXT NOT NULL,
    region_code TEXT NOT NULL,
    opportunity_score REAL NOT NULL,
    verdict TEXT NOT NULL,
    data_json TEXT NOT NULL,
    notes TEXT,
    created_at INTEGER NOT NULL,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. Bảng lưu lịch sử tìm kiếm chung (Global)
CREATE TABLE IF NOT EXISTS niche_searches (
    id TEXT PRIMARY KEY,
    keyword TEXT NOT NULL,
    region_code TEXT NOT NULL,
    opportunity_score REAL NOT NULL,
    demand_score REAL NOT NULL,
    competition_score REAL NOT NULL,
    monetization_score REAL NOT NULL,
    breakout_score REAL NOT NULL,
    verdict TEXT NOT NULL,
    data_json TEXT NOT NULL,
    created_at INTEGER NOT NULL
);

-- 5. Bảng video đối thủ cạnh tranh
CREATE TABLE IF NOT EXISTS competitor_videos (
    id TEXT PRIMARY KEY,
    search_id TEXT NOT NULL,
    video_id TEXT NOT NULL,
    title TEXT NOT NULL,
    channel_title TEXT NOT NULL,
    channel_id TEXT NOT NULL,
    published_at TEXT NOT NULL,
    view_count INTEGER NOT NULL,
    subscriber_count INTEGER NOT NULL,
    outlier_multiplier REAL NOT NULL,
    vph REAL NOT NULL,
    winning_pattern TEXT NOT NULL,
    thumbnail_url TEXT,
    video_url TEXT NOT NULL,
    FOREIGN KEY(search_id) REFERENCES niche_searches(id) ON DELETE CASCADE
);

-- 6. Bảng Cache dự phòng
CREATE TABLE IF NOT EXISTS api_cache (
    cache_key TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

-- Chỉ mục (Indexes) tăng tốc độ truy vấn
CREATE INDEX IF NOT EXISTS idx_user_history ON user_search_history(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_user_favorites ON user_favorites(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_searches_keyword ON niche_searches(keyword, region_code);
CREATE INDEX IF NOT EXISTS idx_competitor_search ON competitor_videos(search_id);

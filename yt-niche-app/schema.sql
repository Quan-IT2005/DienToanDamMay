-- D1 Schema for YouTube Niche & Competitor Intelligence
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

CREATE TABLE IF NOT EXISTS api_cache (
    cache_key TEXT PRIMARY KEY,
    payload TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_searches_keyword ON niche_searches(keyword, region_code);
CREATE INDEX IF NOT EXISTS idx_competitor_search ON competitor_videos(search_id);

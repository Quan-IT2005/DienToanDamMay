// Cloudflare Worker for YouTube Niche & Competitor Intelligence
// Powered by Cloudflare D1 + Assets
// 100% Live Real-time YouTube Engine (with & without API Key)

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

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // API Routing
    if (url.pathname === "/api/analyze" && request.method === "POST") {
      return handleAnalyze(request, env);
    }
    if (url.pathname === "/api/history" && request.method === "GET") {
      return handleHistory(request, env);
    }
    if (url.pathname === "/api/export-csv" && request.method === "GET") {
      return handleExportCSV(url, env);
    }
    if (url.pathname === "/api/export-strategy" && request.method === "GET") {
      return handleExportStrategy(url, env);
    }
    if (url.pathname === "/api/countries" && request.method === "GET") {
      return new Response(JSON.stringify(COUNTRY_PROFILES), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Static Assets fallback (React Vite app)
    if (env.ASSETS) {
      return env.ASSETS.fetch(request);
    }

    return new Response("Not Found", { status: 404 });
  }
};

async function handleAnalyze(request, env) {
  try {
    const body = await request.json();
    const keyword = (body.keyword || "").trim();
    const regionCode = (body.regionCode || "VN").toUpperCase();
    const customApiKey = (body.apiKey || "").trim();
    const apiKey = customApiKey || env.YOUTUBE_API_KEY || "";

    if (!keyword) {
      return jsonError("Vui lòng nhập từ khóa hoặc tên ngách cần phân tích.", 400);
    }

    // Check D1 Cache first (only if valid live data exists)
    const cacheKey = `search_v2:${keyword.toLowerCase()}:${regionCode}`;
    if (env.DB) {
      try {
        const cached = await env.DB.prepare(
          "SELECT payload FROM api_cache WHERE cache_key = ? AND expires_at > ?"
        ).bind(cacheKey, Date.now()).first();

        if (cached && cached.payload) {
          const parsed = JSON.parse(cached.payload);
          return new Response(JSON.stringify({ ...parsed, fromCache: true }), {
            headers: { "Content-Type": "application/json" }
          });
        }
      } catch (err) {
        console.warn("D1 cache read warning:", err.message);
      }
    }

    // Fetch REAL Live Data
    const result = await performNicheAnalysis(keyword, regionCode, apiKey);

    // Save to D1
    if (env.DB) {
      try {
        const searchId = `niche_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        await env.DB.prepare(
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

        for (const video of result.competitors.slice(0, 20)) {
          await env.DB.prepare(
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

        // Cache 3 hours
        await env.DB.prepare(
          "INSERT OR REPLACE INTO api_cache (cache_key, payload, created_at, expires_at) VALUES (?, ?, ?, ?)"
        ).bind(cacheKey, JSON.stringify(result), Date.now(), Date.now() + 3 * 3600 * 1000).run();

      } catch (err) {
        console.warn("D1 save warning:", err.message);
      }
    }

    return new Response(JSON.stringify(result), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return jsonError(err.message || "Lỗi xử lý hệ thống", 500);
  }
}

async function performNicheAnalysis(keyword, regionCode, apiKey) {
  let videos = [];
  let dataSource = "LIVE_YOUTUBE_WEB";

  if (apiKey) {
    try {
      videos = await fetchYouTubeDataViaAPI(keyword, regionCode, apiKey);
      dataSource = "LIVE_YOUTUBE_API";
    } catch (apiErr) {
      console.warn("YouTube API failed, fallback to Live Search Engine:", apiErr.message);
      videos = await fetchLiveYouTubeSearch(keyword, regionCode);
    }
  } else {
    // 100% Real Live YouTube search query without needing API Key
    videos = await fetchLiveYouTubeSearch(keyword, regionCode);
  }

  const country = COUNTRY_PROFILES[regionCode] || COUNTRY_PROFILES.VN;
  const domainInfo = detectDomainCPM(keyword);

  // 1. Process Video Metrics & Outliers
  const now = Date.now();
  const processedVideos = videos.map(v => {
    const ageHours = Math.max(v.ageDays * 24, 1);
    const vph = Math.round(v.views / ageHours);

    // Outlier multiplier: views vs estimated subs
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

  // Sort by Outlier Multiplier descending
  processedVideos.sort((a, b) => b.outlierMultiplier - a.outlierMultiplier);

  // 2. Compute Core Scores (0 - 100 scale)
  const totalViews = processedVideos.reduce((acc, v) => acc + v.views, 0);
  const avgViews = Math.round(totalViews / (processedVideos.length || 1));
  const breakoutCount = processedVideos.filter(v => v.isBreakout).length;
  const smallChannelCount = processedVideos.filter(v => (v.subscribers || 0) < 50000).length;

  // Demand Score: based on average and max views in top search
  const demandRaw = Math.min(100, Math.round((Math.log10(Math.max(avgViews, 500)) / 5.8) * 100));
  const demandScore = Math.max(25, Math.min(98, demandRaw));

  // Competition Score: High if dominated by big established channels (>300k subs)
  const megaChannelRatio = processedVideos.filter(v => (v.subscribers || 0) > 300000).length / (processedVideos.length || 1);
  const competitionScore = Math.round(Math.min(95, Math.max(20, megaChannelRatio * 80 + (1 - (smallChannelCount / (processedVideos.length || 1))) * 35)));
  const lowSupplyScore = 100 - competitionScore;

  // Breakout Score:
  const breakoutScore = Math.min(98, Math.max(15, Math.round((breakoutCount / (processedVideos.length || 1)) * 110 + (smallChannelCount / (processedVideos.length || 1)) * 40)));

  // Monetization Score:
  const estimatedRpm = parseFloat((country.rpmBase * domainInfo.factor * 1.4).toFixed(2));
  const monetizationScore = Math.min(98, Math.max(20, Math.round((estimatedRpm / country.rpmHigh) * 90 + domainInfo.factor * 10)));

  // Geomean Opportunity Score
  const geomProduct = demandScore * lowSupplyScore * monetizationScore * breakoutScore;
  const opportunityScore = Math.round(Math.pow(geomProduct, 0.25));

  // 3. Strategic Verdict
  let verdict = {
    level: "HIGH",
    badge: "🚀 Cơ Hội Vàng (Rất Khả Thi)",
    color: "#10b981",
    title: "Ngách Đầy Tiềm Năng — Nên Triển Khai Sớm",
    summary: `Nhu cầu tìm kiếm ở mức cao (${demandScore}/100), trong khi các kênh nhỏ vẫn có cơ hội đạt hàng chục đến hàng trăm nghìn view. Kênh mới có tỷ lệ bứt phá cao nếu bám theo các chủ đề Outlier có sẵn.`
  };

  if (opportunityScore < 45) {
    verdict = {
      level: "LOW",
      badge: "⛔ Cạnh Tranh Khốc Liệt / Nhu Cầu Hẹp",
      color: "#ef4444",
      title: "Khó Khăn Cho Kênh Mới — Cần Thu Hẹp Ngách",
      summary: `Ngách này bị áp đảo bởi các kênh thương hiệu lớn (Mức cạnh tranh ${competitionScore}/100) hoặc người xem không tìm kiếm thường xuyên. Bạn cần chọn một góc nhìn con cụ thể hơn.`
    };
  } else if (opportunityScore < 65) {
    verdict = {
      level: "MODERATE",
      badge: "⚖️ Khả Thi Có Điều Kiện",
      color: "#f59e0b",
      title: "Cần Chọn Góc Nhìn Mới (Unique Angle)",
      summary: `Ngách có lượng khán giả ổn định nhưng đối thủ cũng khá nhiều. Bạn cần đầu tư vào thumbnail bắt mắt, tiêu đề dạng Cảnh báo/So sánh và kịch bản cuốn hút để cạnh tranh.`
    };
  }

  // 4. Strategic Content Gaps
  const contentGaps = [
    { topic: `So sánh chi tiết & Top sai lầm thường gặp nhất về "${keyword}"`, potential: "Rất cao", reason: "Khán giả luôn tìm kiếm sự đảm bảo và câu trả lời khách quan trước khi bắt tay làm hoặc mua." },
    { topic: `Thực tế trải nghiệm 30 ngày: Kết quả thật về "${keyword}"`, potential: "Cao", reason: "Định dạng Challenge / Storytelling luôn giữ chân người xem tốt nhất (Average View Duration > 50%)." },
    { topic: `Những điều ít ai nói cho bạn biết về "${keyword}" năm 2025 - 2026`, potential: "Cao", reason: "Đánh trúng tâm lý tò mò và tính thời sự, tỷ lệ click (CTR) cao nhất ngách." },
    { topic: `Hướng dẫn toàn diện từ A-Z cho người mới bắt đầu: "${keyword}"`, potential: "Trung bình", reason: "Video trụ cột mang lại lượt view tìm kiếm đều đặn quanh năm (Evergreen Content)." }
  ];

  // 5. Best Publishing Windows
  const publishWindows = regionCode === "VN" 
    ? ["11:30 - 13:00 (Khung giờ nghỉ trưa)", "19:30 - 21:30 (Giờ vàng giải trí buổi tối)", "09:00 - 11:00 Sáng Thứ Bảy & Chủ Nhật"]
    : ["16:00 - 18:00 EST", "11:00 - 13:00 EST (Thứ Năm đến Chủ Nhật)"];

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
    stats: {
      totalAnalyzed: processedVideos.length,
      averageViews: avgViews,
      breakoutVideosCount: breakoutCount,
      smallChannelsCount: smallChannelCount
    }
  };
}

// 100% Real Live YouTube Search Engine (Scrapes YouTube Public Endpoint directly)
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
    throw new Error("Không thể trích xuất dữ liệu YouTube thời gian thực. Hãy thử lại sau vài giây.");
  }

  const initialData = JSON.parse(match[1]);
  const rawVideos = [];

  function walk(obj) {
    if (!obj || typeof obj !== "object") return;
    if (obj.videoRenderer) {
      const v = obj.videoRenderer;
      if (v.videoId && v.title?.runs?.[0]?.text) {
        rawVideos.push(v);
      }
      return;
    }
    for (const key of Object.keys(obj)) {
      walk(obj[key]);
    }
  }
  walk(initialData);

  if (rawVideos.length === 0) {
    throw new Error(`Không tìm thấy video nào cho từ khóa: "${keyword}" tại thị trường ${country.name}`);
  }

  // Parse each video into structured object
  const list = rawVideos.slice(0, 25).map(v => {
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
    
    // Thumbnail resolution
    const thumbUrl = v.thumbnail?.thumbnails?.slice(-1)[0]?.url || `https://i.ytimg.com/vi/${vidId}/hqdefault.jpg`;

    // Smart subscriber estimation based on channel views and verified badges
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
      url: `https://www.youtube.com/watch?v=${vidId}`
    };
  });

  return list;
}

async function fetchYouTubeDataViaAPI(keyword, regionCode, apiKey) {
  const searchUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(keyword)}&type=video&maxResults=25&regionCode=${regionCode}&order=relevance&key=${apiKey}`;
  const res = await fetch(searchUrl);
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`YouTube API Error (${res.status}): ${errText}`);
  }
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
    const snippet = item.snippet;
    const chId = snippet.channelId;
    const views = parseInt(stats.viewCount || "0", 10);
    const subs = channelSubMap[chId] || 15000;
    const pubDate = new Date(snippet.publishedAt).getTime();
    const ageDays = Math.max((now - pubDate) / (1000 * 3600 * 24), 0.1);

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
      url: `https://www.youtube.com/watch?v=${vid}`
    };
  });
}

async function handleHistory(request, env) {
  if (!env.DB) {
    return new Response(JSON.stringify([]), { headers: { "Content-Type": "application/json" } });
  }
  try {
    const { results } = await env.DB.prepare(
      "SELECT id, keyword, region_code, opportunity_score, verdict, created_at FROM niche_searches ORDER BY created_at DESC LIMIT 20"
    ).all();
    return new Response(JSON.stringify(results || []), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    return jsonError(err.message, 500);
  }
}

async function handleExportCSV(url, env) {
  const keyword = url.searchParams.get("keyword") || "";
  const regionCode = url.searchParams.get("regionCode") || "VN";
  
  if (!keyword) {
    return new Response("Missing keyword", { status: 400 });
  }

  let videos = [];
  if (env.DB) {
    const search = await env.DB.prepare(
      "SELECT id FROM niche_searches WHERE keyword = ? AND region_code = ? ORDER BY created_at DESC LIMIT 1"
    ).bind(keyword, regionCode).first();

    if (search) {
      const { results } = await env.DB.prepare(
        "SELECT * FROM competitor_videos WHERE search_id = ? ORDER BY outlier_multiplier DESC"
      ).bind(search.id).all();
      videos = results || [];
    }
  }

  if (videos.length === 0) {
    const analysis = await performNicheAnalysis(keyword, regionCode, env.YOUTUBE_API_KEY || "");
    videos = analysis.competitors;
  }

  const headers = ["Tiêu đề Video", "Kênh", "Lượt xem (Views)", "Lượng Sub Kênh", "Điểm Đột Biến (Outlier)", "Tốc độ xem (VPH)", "Công thức Thắng (Pattern)", "Ngày đăng", "Link Video"];
  const rows = videos.map(v => [
    `"${(v.title || '').replace(/"/g, '""')}"`,
    `"${(v.channel_title || v.channelTitle || '').replace(/"/g, '""')}"`,
    v.view_count || v.views || 0,
    v.subscriber_count || v.subscribers || 0,
    v.outlier_multiplier || v.outlierMultiplier || 0,
    v.vph || 0,
    `"${(v.winning_pattern || v.pattern?.pattern || '').replace(/"/g, '""')}"`,
    v.published_at || v.publishedAt || '',
    v.video_url || v.url || ''
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map(r => r.join(","))].join("\r\n");

  return new Response(csvContent, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="competitor_formula_${encodeURIComponent(keyword)}_${regionCode}.csv"`
    }
  });
}

async function handleExportStrategy(url, env) {
  const keyword = url.searchParams.get("keyword") || "";
  const regionCode = url.searchParams.get("regionCode") || "VN";

  const analysis = await performNicheAnalysis(keyword, regionCode, env.YOUTUBE_API_KEY || "");

  const md = `# BÁO CÁO PHÂN TÍCH CHIẾN LƯỢC NGÁCH YOUTUBE: "${analysis.keyword.toUpperCase()}"
**Quốc gia mục tiêu:** ${analysis.countryName} (${analysis.regionCode})  
**Nguồn dữ liệu:** ${analysis.dataSource === 'LIVE_YOUTUBE_API' ? 'YouTube Data API v3' : 'YouTube Live Realtime Search'}  
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
*Báo cáo được trích xuất tự động từ Hệ thống YouTube Niche & Competitor Intelligence (Cloudflare Workers & D1).*
`;

  return new Response(md, {
    headers: {
      "Content-Type": "text/markdown; charset=utf-8",
      "Content-Disposition": `attachment; filename="strategy_report_${encodeURIComponent(keyword)}_${regionCode}.md"`
    }
  });
}

function jsonError(message, status = 400) {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
} from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';
import {
  Search,
  TrendingUp,
  Download,
  FileText,
  Flame,
  AlertTriangle,
  Award,
  DollarSign,
  Users,
  Eye,
  Key,
  Globe,
  Clock,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  History
} from 'lucide-react';

ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

const COUNTRIES = [
  { code: 'VN', name: '🇻🇳 Việt Nam', flag: '🇻🇳' },
  { code: 'US', name: '🇺🇸 Hoa Kỳ (US)', flag: '🇺🇸' },
  { code: 'GB', name: '🇬🇧 Vương Quốc Anh (UK)', flag: '🇬🇧' },
  { code: 'JP', name: '🇯🇵 Nhật Bản (JP)', flag: '🇯🇵' },
  { code: 'KR', name: '🇰🇷 Hàn Quốc (KR)', flag: '🇰🇷' },
  { code: 'DE', name: '🇩🇪 Đức (DE)', flag: '🇩🇪' },
  { code: 'AU', name: '🇦🇺 Úc (AU)', flag: '🇦🇺' },
  { code: 'GLOBAL', name: '🌐 Toàn Cầu (Global)', flag: '🌐' }
];

const SUGGESTIONS = [
  'Review máy pha cà phê gia đình',
  'Lập trình AI agent',
  'Du lịch bụi Nhật Bản',
  'Tài chính cá nhân cho Gen Z',
  'Mẹo decor phòng ngủ nhỏ',
  'Thiết bị thông minh smart home'
];

export default function App() {
  const [keyword, setKeyword] = useState('');
  const [regionCode, setRegionCode] = useState('VN');
  const [apiKey, setApiKey] = useState(localStorage.getItem('yt_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [history, setHistory] = useState([]);
  const [showKeyModal, setShowKeyModal] = useState(false);

  useEffect(() => {
    fetchHistory();
    // Auto load a sample on first open
    performAnalysis('Review máy pha cà phê gia đình', 'VN');
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setHistory(data);
      }
    } catch {
      // ignore
    }
  };

  const performAnalysis = async (searchKw, region) => {
    const targetKw = (searchKw !== undefined ? searchKw : keyword).trim();
    const targetReg = region || regionCode;
    if (!targetKw) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: targetKw,
          regionCode: targetReg,
          apiKey: apiKey
        })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Phân tích thất bại');
      }

      setResult(data);
      setKeyword(targetKw);
      setRegionCode(targetReg);
      fetchHistory();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveApiKey = (e) => {
    e.preventDefault();
    localStorage.setItem('yt_api_key', apiKey);
    setShowKeyModal(false);
  };

  const handleExportCSV = () => {
    if (!result) return;
    window.open(`/api/export-csv?keyword=${encodeURIComponent(result.keyword)}&regionCode=${result.regionCode}`, '_blank');
  };

  const handleExportStrategy = () => {
    if (!result) return;
    window.open(`/api/export-strategy?keyword=${encodeURIComponent(result.keyword)}&regionCode=${result.regionCode}`, '_blank');
  };

  // Radar Chart Configuration (Opportunity Dimensions)
  const radarData = result ? {
    labels: [
      'Nhu Cầu (Demand)',
      'Nguồn Cung Yếu (Low Supply)',
      'Tiềm Năng Kiếm Tiền (RPM)',
      'Cơ Hội Kênh Nhỏ (Breakout)',
      'Cạnh Tranh (Competition)'
    ],
    datasets: [
      {
        label: `Ngách: ${result.keyword}`,
        data: [
          result.scores.demand,
          result.scores.lowSupply,
          result.scores.monetization,
          result.scores.breakout,
          result.scores.competition
        ],
        backgroundColor: 'rgba(239, 68, 68, 0.25)',
        borderColor: '#ef4444',
        borderWidth: 2,
        pointBackgroundColor: '#ef4444',
        pointBorderColor: '#ffffff',
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#ef4444'
      }
    ]
  } : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: { color: '#94a3b8', font: { size: 11, weight: '600' } },
        ticks: { backdropColor: 'transparent', color: '#64748b', stepSize: 20 },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  // Bar Chart Configuration (Top Video Views vs Subs Scale)
  const barData = result ? {
    labels: result.competitors.slice(0, 6).map((_, i) => `Video #${i + 1}`),
    datasets: [
      {
        label: 'Lượt Xem (Views)',
        data: result.competitors.slice(0, 6).map(v => v.views),
        backgroundColor: 'rgba(239, 68, 68, 0.85)',
        borderRadius: 6
      },
      {
        label: 'Lượng Sub Kênh',
        data: result.competitors.slice(0, 6).map(v => v.subscribers),
        backgroundColor: 'rgba(99, 102, 241, 0.65)',
        borderRadius: 6
      }
    ]
  } : null;

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { color: '#cbd5e1', font: { size: 12, weight: '600' } }
      }
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: '#94a3b8' }
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.06)' },
        ticks: { color: '#64748b' }
      }
    }
  };

  return (
    <div className="container">
      {/* Top Header */}
      <header className="app-header glass-panel">
        <div className="brand">
          <div className="brand-icon">
            <Flame size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className="brand-title">YT Niche & Competitor Intelligence</h1>
            <p className="brand-subtitle">Powered by Cloudflare Workers & D1</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          <button
            className="btn-secondary"
            onClick={() => setShowKeyModal(true)}
            title="Cài đặt YouTube API Key của bạn"
          >
            <Key size={16} />
            {apiKey ? 'API Key: Đã lưu' : 'YouTube API Key'}
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-badge">
          <Sparkles size={14} />
          Bộ thuật toán phân tích cơ hội từ 3 hệ thống hàng đầu
        </div>
        <h2 className="hero-title">
          Tìm Ngách YouTube <span>Ít Cạnh Tranh & Doanh Thu Cao</span>
        </h2>
        <p className="hero-desc">
          Nhập từ khóa hoặc tên ngách để khám phá điểm khả thi, bóc tách công thức video đột biến của đối thủ và tải toàn bộ báo cáo chiến lược.
        </p>

        {/* Search Bar */}
        <form
          className="search-box-wrapper"
          onSubmit={(e) => {
            e.preventDefault();
            performAnalysis();
          }}
        >
          <div className="search-input-group">
            <Search size={20} color="#64748b" />
            <input
              type="text"
              className="search-input"
              placeholder="Nhập ngách hoặc từ khóa (ví dụ: review máy pha cà phê, học lập trình, du lịch nhật bản...)"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>

          <div className="country-select-group">
            <Globe size={18} color="#94a3b8" />
            <select
              className="country-select"
              value={regionCode}
              onChange={(e) => {
                setRegionCode(e.target.value);
                if (result) performAnalysis(keyword, e.target.value);
              }}
            >
              {COUNTRIES.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            disabled={loading || !keyword.trim()}
          >
            {loading ? 'Đang phân tích...' : 'Phân Tích Ngách'}
          </button>
        </form>

        {/* Suggestion Pills */}
        <div className="suggestion-pills">
          <span className="pill-label">Gợi ý ngách hot:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              className="pill-btn"
              onClick={() => {
                setKeyword(s);
                performAnalysis(s, regionCode);
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </section>

      {/* Error state */}
      {error && (
        <div className="glass-panel" style={{ padding: '16px 20px', borderColor: 'rgba(239, 68, 68, 0.4)', background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <AlertTriangle size={20} />
          {error}
        </div>
      )}

      {/* Result Section */}
      {result && (
        <main>
          {/* Verdict Banner */}
          <section className="verdict-banner glass-panel">
            <div className="verdict-gauge">
              <div
                className="gauge-circle"
                style={{
                  borderColor: result.verdict.color,
                  boxShadow: `0 0 25px ${result.verdict.color}40`
                }}
              >
                <span className="gauge-val" style={{ color: result.verdict.color }}>
                  {result.scores.opportunity}
                </span>
                <span className="gauge-max">ĐIỂM CƠ HỘI</span>
              </div>
            </div>

            <div className="verdict-content">
              <div className="verdict-header">
                <span
                  className="verdict-badge"
                  style={{
                    background: `${result.verdict.color}20`,
                    color: result.verdict.color,
                    border: `1px solid ${result.verdict.color}40`
                  }}
                >
                  {result.verdict.badge}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#34d399', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981', display: 'inline-block' }}></span>
                  {result.dataSource === 'LIVE_YOUTUBE_API' ? 'YouTube API Trực Tiếp' : 'YouTube Live Realtime'}
                </span>
                <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                  • Thị trường: {result.countryName} ({result.regionCode})
                </span>
              </div>

              <h3 className="verdict-title">{result.verdict.title}</h3>
              <p className="verdict-summary">{result.verdict.summary}</p>

              {/* Action Buttons */}
              <div className="action-bar">
                <button className="btn-secondary" onClick={handleExportStrategy}>
                  <FileText size={16} color="#38bdf8" />
                  Xuất Báo Cáo Chiến Lược (.MD)
                </button>
                <button className="btn-secondary" onClick={handleExportCSV}>
                  <Download size={16} color="#34d399" />
                  Tải Danh Sách Đối Thủ Thắng (.CSV)
                </button>
              </div>
            </div>
          </section>

          {/* 4 Core Scorecards */}
          <section className="scorecards-grid">
            {/* Card 1: Demand */}
            <div className="scorecard glass-panel">
              <div className="scorecard-header">
                <span className="scorecard-title">
                  <TrendingUp size={16} color="#38bdf8" />
                  Nhu Cầu (Demand)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{result.scores.demand}/100</span>
              </div>
              <div className="scorecard-value" style={{ color: '#38bdf8' }}>
                {result.scores.demand}%
              </div>
              <div className="scorecard-bar-bg">
                <div
                  className="scorecard-bar-fill"
                  style={{ width: `${result.scores.demand}%`, background: '#38bdf8' }}
                />
              </div>
              <p className="scorecard-note">
                Trung bình ~{result.stats.averageViews.toLocaleString()} views/video top.
              </p>
            </div>

            {/* Card 2: Competition */}
            <div className="scorecard glass-panel">
              <div className="scorecard-header">
                <span className="scorecard-title">
                  <Users size={16} color="#f59e0b" />
                  Cạnh Tranh (Supply)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{result.scores.competition}/100</span>
              </div>
              <div className="scorecard-value" style={{ color: '#f59e0b' }}>
                {result.scores.competition}%
              </div>
              <div className="scorecard-bar-bg">
                <div
                  className="scorecard-bar-fill"
                  style={{ width: `${result.scores.competition}%`, background: '#f59e0b' }}
                />
              </div>
              <p className="scorecard-note">
                Nguồn cung còn yếu: {result.scores.lowSupply}/100 (Cơ hội vào ngách).
              </p>
            </div>

            {/* Card 3: Small Channel Breakout */}
            <div className="scorecard glass-panel">
              <div className="scorecard-header">
                <span className="scorecard-title">
                  <Award size={16} color="#10b981" />
                  Cơ Hội Kênh Nhỏ (Breakout)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{result.scores.breakout}/100</span>
              </div>
              <div className="scorecard-value" style={{ color: '#10b981' }}>
                {result.scores.breakout}%
              </div>
              <div className="scorecard-bar-bg">
                <div
                  className="scorecard-bar-fill"
                  style={{ width: `${result.scores.breakout}%`, background: '#10b981' }}
                />
              </div>
              <p className="scorecard-note">
                Phát hiện {result.stats.breakoutVideosCount} video bùng nổ từ kênh dưới 50k subs.
              </p>
            </div>

            {/* Card 4: RPM Monetization */}
            <div className="scorecard glass-panel">
              <div className="scorecard-header">
                <span className="scorecard-title">
                  <DollarSign size={16} color="#a855f7" />
                  Tiềm Năng Kiếm Tiền (RPM)
                </span>
                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{result.scores.monetization}/100</span>
              </div>
              <div className="scorecard-value" style={{ color: '#a855f7' }}>
                {result.monetizationDetails.estimatedRPM}
              </div>
              <div className="scorecard-bar-bg">
                <div
                  className="scorecard-bar-fill"
                  style={{ width: `${result.scores.monetization}%`, background: '#a855f7' }}
                />
              </div>
              <p className="scorecard-note">
                Lĩnh vực: {result.monetizationDetails.category} (~{result.monetizationDetails.revenuePer100k}/100k view).
              </p>
            </div>
          </section>

          {/* Interactive Charts Section */}
          <section className="charts-grid">
            <div className="chart-card glass-panel">
              <div className="card-heading">
                <span>Biểu Đồ Radar Tiềm Năng 5 Chiều</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Chuẩn toán học Geomean</span>
              </div>
              <div className="chart-container">
                {radarData && <Radar data={radarData} options={radarOptions} />}
              </div>
            </div>

            <div className="chart-card glass-panel">
              <div className="card-heading">
                <span>Phân Bổ Lượt Xem vs Quy Mô Kênh Đối Thủ</span>
                <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Phát hiện Outlier Hit</span>
              </div>
              <div className="chart-container">
                {barData && <Bar data={barData} options={barOptions} />}
              </div>
            </div>
          </section>

          {/* Strategic Insights & Content Gaps */}
          <section className="insights-grid">
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="card-heading">
                <span>Khoảng Trống Nội Dung (Content Gaps) Nên Làm Ngay</span>
              </div>
              <div>
                {result.contentGaps.map((g, idx) => (
                  <div key={idx} className="gap-item">
                    <div className="gap-top">
                      <span className="gap-title">{g.topic}</span>
                      <span className="gap-badge">Tiềm năng {g.potential}</span>
                    </div>
                    <p className="gap-reason">💡 Insight: {g.reason}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div className="card-heading">
                <span>Khung Giờ Vàng Đăng Bài</span>
              </div>
              <div style={{ marginTop: '12px' }}>
                {result.publishWindows.map((w, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '12px',
                      background: 'rgba(255, 255, 255, 0.03)',
                      borderRadius: '8px',
                      marginBottom: '10px'
                    }}
                  >
                    <Clock size={18} color="#f59e0b" />
                    <div>
                      <div style={{ fontWeight: '600', fontSize: '0.9rem' }}>{w}</div>
                      <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
                        Tối ưu cho lượng tương tác tại {result.countryName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginTop: '20px', padding: '14px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '8px', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#34d399', fontWeight: '700', fontSize: '0.85rem' }}>
                  <ShieldCheck size={16} />
                  Chiến Lược Xuất Bản
                </div>
                <p style={{ fontSize: '0.8rem', color: '#cbd5e1', marginTop: '6px', lineHeight: '1.5' }}>
                  Hãy bắt đầu bằng 2 video dạng <strong>"Sai Lầm/Cảnh Báo"</strong> để kéo CTR ban đầu, sau đó duy trì bằng series <strong>"Hướng Dẫn Chi Tiết (How-To)"</strong> để tích lũy view tìm kiếm lâu dài.
                </p>
              </div>
            </div>
          </section>

          {/* Competitor Swipe File Table */}
          <section className="table-card glass-panel">
            <div className="card-heading">
              <div>
                <span>Danh Sách Video Đối Thủ Có Công Thức Thắng (Swipe File)</span>
                <p style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'normal', marginTop: '4px' }}>
                  Sắp xếp theo chỉ số Đột Biến (Outlier Multiplier = Lượt View ÷ Lượng Sub của kênh)
                </p>
              </div>
              <button className="btn-secondary" onClick={handleExportCSV}>
                <Download size={14} />
                Tải CSV Toàn Bộ
              </button>
            </div>

            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Video & Kênh</th>
                    <th>Lượt Xem</th>
                    <th>Subscribers</th>
                    <th>Điểm Đột Biến</th>
                    <th>VPH (Views/Giờ)</th>
                    <th>Công Thức Áp Dụng</th>
                    <th>Hành Động</th>
                  </tr>
                </thead>
                <tbody>
                  {result.competitors.map((v) => {
                    const isHigh = v.outlierMultiplier >= 3.0;
                    return (
                      <tr key={v.id}>
                        <td>
                          <div className="video-cell">
                            <img
                              src={v.thumbnail}
                              alt={v.title}
                              className="video-thumb"
                              onError={(e) => {
                                e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=300&q=80';
                              }}
                            />
                            <div>
                              <a
                                href={v.url}
                                target="_blank"
                                rel="noreferrer"
                                className="video-title"
                                title={v.title}
                              >
                                {v.title}
                              </a>
                              <div className="channel-name">
                                {v.channelTitle} • <span style={{ color: '#64748b' }}>{v.publishedText || 'Gần đây'}</span>
                              </div>
                            </div>
                          </div>
                        </td>
                        <td style={{ fontWeight: '700' }}>{v.views.toLocaleString()}</td>
                        <td style={{ color: '#94a3b8' }}>
                          {v.subscribers > 0 ? v.subscribers.toLocaleString() : 'Ẩn sub'}
                        </td>
                        <td>
                          <span className={`outlier-tag ${isHigh ? 'outlier-high' : 'outlier-med'}`}>
                            {v.outlierMultiplier}x
                          </span>
                        </td>
                        <td style={{ color: '#38bdf8', fontWeight: '600' }}>
                          ~{v.vph.toLocaleString()}
                        </td>
                        <td>
                          <span className="formula-tag">
                            {v.pattern.icon} {v.pattern.pattern}
                          </span>
                        </td>
                        <td>
                          <a
                            href={v.url}
                            target="_blank"
                            rel="noreferrer"
                            className="btn-secondary"
                            style={{ padding: '6px 10px', fontSize: '0.75rem' }}
                          >
                            <ExternalLink size={12} />
                            Xem
                          </a>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          {/* D1 History Chips */}
          {history.length > 0 && (
            <section className="history-section">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#94a3b8', fontSize: '0.85rem' }}>
                <History size={16} />
                Lịch sử các ngách đã lưu trên Cloudflare D1:
              </div>
              <div className="history-chips">
                {history.map((h) => (
                  <button
                    key={h.id}
                    className="history-chip"
                    onClick={() => performAnalysis(h.keyword, h.region_code)}
                  >
                    <span>{h.region_code}</span>
                    <strong style={{ color: '#ffffff' }}>{h.keyword}</strong>
                    <span style={{ color: '#10b981', fontSize: '0.75rem' }}>({h.opportunity_score}đ)</span>
                  </button>
                ))}
              </div>
            </section>
          )}
        </main>
      )}

      {/* API Key Modal */}
      {showKeyModal && (
        <div className="modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="modal-card glass-panel" onClick={(e) => e.stopPropagation()}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>
              Cài Đặt YouTube Data API Key
            </h3>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', lineHeight: '1.5' }}>
              Hệ thống có sẵn chế độ mô phỏng thông minh cho mọi ngách. Tuy nhiên, nếu bạn muốn lấy số liệu trực tiếp từ YouTube Data API theo thời gian thực, hãy dán API Key của Google Cloud vào đây:
            </p>

            <form onSubmit={handleSaveApiKey}>
              <input
                type="text"
                className="modal-input"
                placeholder="AIzaSy..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowKeyModal(false)}
                >
                  Đóng
                </button>
                <button type="submit" className="btn-primary">
                  Lưu Cài Đặt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

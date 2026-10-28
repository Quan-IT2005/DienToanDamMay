import React, { useState, useEffect, useMemo } from 'react';
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
import { Radar } from 'react-chartjs-2';
import {
  Search,
  Activity,
  Download,
  FileText,
  Key,
  Globe,
  Clock,
  ExternalLink,
  ShieldCheck,
  History,
  TrendingUp,
  Award,
  DollarSign,
  Users,
  Eye,
  Crosshair,
  Layers,
  Terminal,
  Cpu,
  BarChart2,
  Sliders,
  CheckCircle2,
  X,
  Bookmark,
  BookmarkCheck,
  User,
  LogIn,
  LogOut,
  Trash2,
  Sparkles,
  RefreshCw,
  FolderHeart,
  ChevronDown,
  Filter,
  ArrowUpDown
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
  { code: 'VN', name: 'VN - VIETNAM', flag: '🇻🇳' },
  { code: 'US', name: 'US - UNITED STATES', flag: '🇺🇸' },
  { code: 'GB', name: 'GB - UNITED KINGDOM', flag: '🇬🇧' },
  { code: 'JP', name: 'JP - JAPAN', flag: '🇯🇵' },
  { code: 'KR', name: 'KR - KOREA', flag: '🇰🇷' },
  { code: 'DE', name: 'DE - GERMANY', flag: '🇩🇪' },
  { code: 'AU', name: 'AU - AUSTRALIA', flag: '🇦🇺' },
  { code: 'GLOBAL', name: 'GL - GLOBAL MARKET', flag: '🌐' }
];

const SUGGESTIONS = [
  'review máy pha cà phê gia đình',
  'lập trình ai agent',
  'du lịch bụi nhật bản',
  'tài chính cá nhân gen z',
  'thiết bị thông minh smart home',
  'đầu tư chứng khoán cho người mới'
];

export default function App() {
  const [keyword, setKeyword] = useState('review máy pha cà phê gia đình');
  const [regionCode, setRegionCode] = useState('VN');
  const [apiKey, setApiKey] = useState(localStorage.getItem('yt_api_key') || '');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [globalHistory, setGlobalHistory] = useState([]);
  const [showKeyModal, setShowKeyModal] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('DASHBOARD');

  // Matrix Filter & Sort
  const [matrixSort, setMatrixSort] = useState('OUTLIER_DESC');
  const [matrixSearch, setMatrixSearch] = useState('');

  // Authentication & Account State
  const [authToken, setAuthToken] = useState(localStorage.getItem('tp_auth_token') || '');
  const [user, setUser] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState('LOGIN'); // 'LOGIN' | 'REGISTER'
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // User-specific data
  const [userHistory, setUserHistory] = useState([]);
  const [userFavorites, setUserFavorites] = useState([]);
  const [savingFav, setSavingFav] = useState(false);

  // Initialize
  useEffect(() => {
    fetchGlobalHistory();
    if (authToken) {
      fetchCurrentUser(authToken);
      fetchUserHistory(authToken);
      fetchUserFavorites(authToken);
    }
    performAnalysis('review máy pha cà phê gia đình', 'VN');
  }, []);

  // Fetch Current User Profile
  const fetchCurrentUser = async (token) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      } else {
        // Token expired
        setAuthToken('');
        setUser(null);
        localStorage.removeItem('tp_auth_token');
      }
    } catch {
      // offline / ignore
    }
  };

  const fetchGlobalHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setGlobalHistory(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchUserHistory = async (token) => {
    const t = token || authToken;
    if (!t) return;
    try {
      const res = await fetch('/api/user/history', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserHistory(data);
      }
    } catch {
      // ignore
    }
  };

  const fetchUserFavorites = async (token) => {
    const t = token || authToken;
    if (!t) return;
    try {
      const res = await fetch('/api/user/favorites', {
        headers: { Authorization: `Bearer ${t}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUserFavorites(data);
      }
    } catch {
      // ignore
    }
  };

  // Perform Analysis
  const performAnalysis = async (searchKw, region) => {
    const targetKw = (searchKw !== undefined ? searchKw : keyword).trim();
    const targetReg = region || regionCode;
    if (!targetKw) return;

    setLoading(true);
    setError('');

    try {
      const headers = { 'Content-Type': 'application/json' };
      if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers,
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
      fetchGlobalHistory();
      if (authToken) {
        fetchUserHistory(authToken);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Auth Handlers
  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');

    try {
      const url = authMode === 'LOGIN' ? '/api/auth/login' : '/api/auth/register';
      const body = authMode === 'LOGIN'
        ? { email: authEmail, password: authPassword }
        : { email: authEmail, password: authPassword, name: authName };

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Xác thực thất bại');
      }

      setAuthToken(data.token);
      setUser(data.user);
      localStorage.setItem('tp_auth_token', data.token);
      setShowAuthModal(false);
      setAuthPassword('');
      fetchUserHistory(data.token);
      fetchUserFavorites(data.token);
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setAuthEmail('demo@trendpulse.tech');
    setAuthPassword('demo123456');
    setAuthName('Demo Operator');
    setAuthLoading(true);
    setAuthError('');

    try {
      // Try login first
      let res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'demo@trendpulse.tech', password: 'demo123456' })
      });
      let data = await res.json();

      // If not registered yet, auto register demo
      if (!res.ok) {
        res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: 'demo@trendpulse.tech',
            password: 'demo123456',
            name: 'Demo Operator (Nhóm 02)'
          })
        });
        data = await res.json();
      }

      if (data.token) {
        setAuthToken(data.token);
        setUser(data.user);
        localStorage.setItem('tp_auth_token', data.token);
        setShowAuthModal(false);
        fetchUserHistory(data.token);
        fetchUserFavorites(data.token);
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` }
      });
    } catch {
      // ignore
    }
    setAuthToken('');
    setUser(null);
    localStorage.removeItem('tp_auth_token');
    setShowUserDropdown(false);
    setUserHistory([]);
    setUserFavorites([]);
  };

  // Toggle Favorite
  const isCurrentFavorite = useMemo(() => {
    if (!result) return false;
    return userFavorites.some(
      (f) => f.keyword.toLowerCase() === result.keyword.toLowerCase() && f.region_code === result.regionCode
    );
  }, [result, userFavorites]);

  const handleToggleFavorite = async () => {
    if (!user) {
      setAuthMode('LOGIN');
      setShowAuthModal(true);
      return;
    }
    if (!result) return;

    setSavingFav(true);
    try {
      if (isCurrentFavorite) {
        const existing = userFavorites.find(
          (f) => f.keyword.toLowerCase() === result.keyword.toLowerCase() && f.region_code === result.regionCode
        );
        if (existing) {
          await fetch(`/api/user/favorites/${existing.id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${authToken}` }
          });
        }
      } else {
        await fetch('/api/user/favorites', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${authToken}`
          },
          body: JSON.stringify({
            keyword: result.keyword,
            regionCode: result.regionCode,
            opportunityScore: result.scores.opportunity,
            verdict: result.verdict.title,
            data: result,
            notes: `Ngách tiềm năng phát hiện lúc ${new Date().toLocaleDateString('vi-VN')}`
          })
        });
      }
      fetchUserFavorites(authToken);
    } catch {
      // ignore
    } finally {
      setSavingFav(false);
    }
  };

  const handleDeleteFavorite = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/user/favorites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchUserFavorites(authToken);
    } catch {
      // ignore
    }
  };

  const handleDeleteUserHistory = async (id, e) => {
    e.stopPropagation();
    try {
      await fetch(`/api/user/history/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` }
      });
      fetchUserHistory(authToken);
    } catch {
      // ignore
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

  // Filtered & Sorted Competitors
  const processedCompetitors = useMemo(() => {
    if (!result?.competitors) return [];
    let list = [...result.competitors];

    // Filter
    if (matrixSearch.trim()) {
      const q = matrixSearch.toLowerCase();
      list = list.filter(
        (v) => v.title.toLowerCase().includes(q) || v.channelTitle.toLowerCase().includes(q)
      );
    }

    // Sort
    list.sort((a, b) => {
      if (matrixSort === 'OUTLIER_DESC') return b.outlierMultiplier - a.outlierMultiplier;
      if (matrixSort === 'VIEWS_DESC') return b.views - a.views;
      if (matrixSort === 'VPH_DESC') return b.vph - a.vph;
      if (matrixSort === 'SUBS_ASC') return a.subscribers - b.subscribers;
      return 0;
    });

    return list;
  }, [result, matrixSearch, matrixSort]);

  // Quantum Radar Chart Setup
  const radarData = result ? {
    labels: [
      'DEMAND VELOCITY',
      'SUPPLY VACANCY',
      'MONETIZATION CPM',
      'BREAKOUT RATE',
      'COMPETITOR DENSITY'
    ],
    datasets: [
      {
        label: result.keyword.toUpperCase(),
        data: [
          result.scores.demand,
          result.scores.lowSupply,
          result.scores.monetization,
          result.scores.breakout,
          result.scores.competition
        ],
        backgroundColor: 'rgba(0, 255, 156, 0.18)',
        borderColor: '#00ff9c',
        borderWidth: 1.5,
        pointBackgroundColor: '#00ff9c',
        pointBorderColor: '#000000',
        pointBorderWidth: 1,
        pointHoverBackgroundColor: '#ffffff',
        pointHoverBorderColor: '#00ff9c',
        pointRadius: 3
      }
    ]
  } : null;

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        angleLines: { color: 'rgba(255, 255, 255, 0.12)' },
        grid: { color: 'rgba(255, 255, 255, 0.08)' },
        pointLabels: {
          color: 'rgba(255, 255, 255, 0.65)',
          font: { family: 'Chakra Petch', size: 9, weight: '600' }
        },
        ticks: {
          backdropColor: 'transparent',
          color: 'rgba(255, 255, 255, 0.3)',
          stepSize: 20,
          font: { size: 8 }
        },
        suggestedMin: 0,
        suggestedMax: 100
      }
    },
    plugins: {
      legend: { display: false }
    }
  };

  return (
    <div className="quantum-app">
      {/* ===================================================================
          QUANTUM HEADER
          =================================================================== */}
      <header className="app-header">
        {/* Brand */}
        <div className="header-brand">
          <button
            className="brand-toggle-btn"
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            title="Toggle Sidebar"
          >
            <Sliders size={14} />
          </button>
          <div className="brand-logo" onClick={() => setActiveTab('DASHBOARD')} style={{ cursor: 'pointer' }}>
            <span className="brand-accent">TREND</span>PULSE
            <span className="brand-sub">.TECH</span>
          </div>
          <span className="brand-badge">EDGE V3.2</span>
        </div>

        {/* Global Search Bar */}
        <div className="header-search-bar">
          <Search size={14} className="search-icon" />
          <input
            type="text"
            className="header-search-input"
            placeholder="Nhập ngách hoặc từ khóa YouTube cần bóc tách (VD: affiliate marketing, làm video ai, review máy ảnh...)"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') performAnalysis();
            }}
          />
        </div>

        {/* Right Header Navigation */}
        <div className="header-right-menu">
          <select
            className="header-select"
            value={regionCode}
            onChange={(e) => {
              setRegionCode(e.target.value);
              performAnalysis(keyword, e.target.value);
            }}
          >
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn-quantum btn-quantum-sm"
            onClick={() => performAnalysis()}
            disabled={loading || !keyword.trim()}
          >
            {loading ? 'PROCESSING...' : 'ANALYZE'}
          </button>

          <div className="live-badge d-none d-md-flex">
            <span className="live-dot"></span>
            {result?.dataSource === 'LIVE_YOUTUBE_API' ? 'API STREAM' : 'LIVE YT STREAM'}
          </div>

          <button
            type="button"
            className="header-btn"
            onClick={() => setShowKeyModal(true)}
            title="Configure YouTube API Key"
          >
            <Key size={13} />
            <span style={{ fontSize: '10px' }} className="d-none d-lg-inline">{apiKey ? 'KEY ACTIVE' : 'SET KEY'}</span>
          </button>

          {/* USER ACCOUNT AREA */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="user-avatar-btn"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
              >
                <img src={user.avatarUrl} alt={user.name} className="user-avatar-img" />
                <span className="d-none d-md-inline" style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {user.name}
                </span>
                <span className="badge-quantum badge-theme fs-9px">{user.tier || 'PRO'}</span>
                <ChevronDown size={11} />
              </button>

              {showUserDropdown && (
                <div className="user-dropdown-menu" onClick={() => setShowUserDropdown(false)}>
                  <div className="user-dropdown-header">
                    <div className="text-white fw-bold fs-11px">{user.name}</div>
                    <div className="text-muted fs-9px">{user.email}</div>
                  </div>
                  <button
                    className="user-dropdown-item"
                    onClick={() => setActiveTab('MY_HISTORY')}
                  >
                    <History size={13} className="text-theme" />
                    Lịch sử tìm kiếm ({userHistory.length})
                  </button>
                  <button
                    className="user-dropdown-item"
                    onClick={() => setActiveTab('FAVORITES')}
                  >
                    <FolderHeart size={13} className="text-primary" />
                    Ngách đã lưu ({userFavorites.length})
                  </button>
                  <button
                    className="user-dropdown-item"
                    onClick={() => setActiveTab('ACCOUNT')}
                  >
                    <User size={13} />
                    Hồ sơ tài khoản
                  </button>
                  <div style={{ borderTop: '1px solid var(--bs-border-subtle)', margin: '4px 0' }} />
                  <button
                    className="user-dropdown-item text-danger"
                    onClick={handleLogout}
                  >
                    <LogOut size={13} />
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              className="btn-quantum btn-quantum-sm btn-quantum-secondary"
              onClick={() => {
                setAuthMode('LOGIN');
                setShowAuthModal(true);
              }}
            >
              <LogIn size={12} />
              <span>ĐĂNG NHẬP</span>
            </button>
          )}
        </div>
      </header>

      {/* ===================================================================
          APP BODY: SIDEBAR + CONTENT
          =================================================================== */}
      <div className="app-body">
        {/* Quantum Sidebar */}
        <aside className={`app-sidebar ${sidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="app-sidebar-content">
            <div className="sidebar-header">{!sidebarCollapsed && 'CORE INTELLIGENCE'}</div>

            <div
              className={`sidebar-menu-item ${activeTab === 'DASHBOARD' ? 'active' : ''}`}
              onClick={() => setActiveTab('DASHBOARD')}
            >
              <div className="sidebar-icon">
                <BarChart2 size={15} />
              </div>
              {!sidebarCollapsed && <span>DASHBOARD</span>}
            </div>

            <div
              className={`sidebar-menu-item ${activeTab === 'SWIPE' ? 'active' : ''}`}
              onClick={() => setActiveTab('SWIPE')}
            >
              <div className="sidebar-icon">
                <Crosshair size={15} />
              </div>
              {!sidebarCollapsed && <span>SWIPE FILE MATRIX</span>}
            </div>

            <div
              className={`sidebar-menu-item ${activeTab === 'RADAR' ? 'active' : ''}`}
              onClick={() => setActiveTab('RADAR')}
            >
              <div className="sidebar-icon">
                <Layers size={15} />
              </div>
              {!sidebarCollapsed && <span>FEASIBILITY RADAR</span>}
            </div>

            <div
              className={`sidebar-menu-item ${activeTab === 'GAPS' ? 'active' : ''}`}
              onClick={() => setActiveTab('GAPS')}
            >
              <div className="sidebar-icon">
                <Cpu size={15} />
              </div>
              {!sidebarCollapsed && <span>CONTENT GAPS</span>}
            </div>

            <div className="sidebar-header">{!sidebarCollapsed && 'TÀI KHOẢN & LỊCH SỬ'}</div>

            <div
              className={`sidebar-menu-item ${activeTab === 'MY_HISTORY' ? 'active' : ''}`}
              onClick={() => {
                if (!user) {
                  setAuthMode('LOGIN');
                  setShowAuthModal(true);
                } else {
                  setActiveTab('MY_HISTORY');
                }
              }}
            >
              <div className="sidebar-icon text-theme">
                <History size={15} />
              </div>
              {!sidebarCollapsed && (
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>LỊCH SỬ CỦA TÔI</span>
                  {user && <span className="badge-quantum badge-theme fs-9px">{userHistory.length}</span>}
                </div>
              )}
            </div>

            <div
              className={`sidebar-menu-item ${activeTab === 'FAVORITES' ? 'active' : ''}`}
              onClick={() => {
                if (!user) {
                  setAuthMode('LOGIN');
                  setShowAuthModal(true);
                } else {
                  setActiveTab('FAVORITES');
                }
              }}
            >
              <div className="sidebar-icon text-primary">
                <FolderHeart size={15} />
              </div>
              {!sidebarCollapsed && (
                <div className="d-flex justify-content-between align-items-center w-100">
                  <span>NGÁCH ĐÃ LƯU</span>
                  {user && <span className="badge-quantum badge-primary fs-9px">{userFavorites.length}</span>}
                </div>
              )}
            </div>

            <div
              className={`sidebar-menu-item ${activeTab === 'ACCOUNT' ? 'active' : ''}`}
              onClick={() => {
                if (!user) {
                  setAuthMode('LOGIN');
                  setShowAuthModal(true);
                } else {
                  setActiveTab('ACCOUNT');
                }
              }}
            >
              <div className="sidebar-icon">
                <User size={15} />
              </div>
              {!sidebarCollapsed && <span>HỒ SƠ TÀI KHOẢN</span>}
            </div>

            <div className="sidebar-header">{!sidebarCollapsed && 'DATA EXPORT'}</div>

            <div className="sidebar-menu-item" onClick={handleExportCSV}>
              <div className="sidebar-icon text-theme">
                <Download size={15} />
              </div>
              {!sidebarCollapsed && <span>EXPORT CSV</span>}
            </div>

            <div className="sidebar-menu-item" onClick={handleExportStrategy}>
              <div className="sidebar-icon text-primary">
                <FileText size={15} />
              </div>
              {!sidebarCollapsed && <span>EXPORT STRATEGY (.MD)</span>}
            </div>

            <div className="sidebar-footer">
              {!sidebarCollapsed ? (
                <div>
                  <div className="fs-9px text-muted fw-600 mb-1">SYSTEM STATUS</div>
                  <div className="d-flex align-items-center gap-2">
                    <span className="live-dot"></span>
                    <span className="fs-10px text-white fw-bold">ONLINE D1 + KV ACTIVE</span>
                  </div>
                </div>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <span className="live-dot" style={{ margin: '0 auto' }}></span>
                </div>
              )}
            </div>
          </div>
        </aside>

        {/* Quantum Content */}
        <main className="app-content">
          {/* Query Suggestion Pills */}
          <div className="query-pills-bar">
            <span className="fs-10px fw-bold text-muted me-2">RAPID TARGETS:</span>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                className="pill-tag"
                onClick={() => {
                  setKeyword(s);
                  performAnalysis(s, regionCode);
                  if (activeTab !== 'DASHBOARD') setActiveTab('DASHBOARD');
                }}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div
              className="card"
              style={{
                borderColor: 'var(--bs-danger)',
                background: 'rgba(255, 84, 84, 0.08)',
                marginBottom: '16px'
              }}
            >
              <div className="card-body d-flex align-items-center gap-2 text-danger">
                <X size={16} />
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="quantum-loading-card card">
              <div className="loading-spinner"></div>
              <div className="fs-13px fw-bold text-theme">REALTIME STREAMING & D1 VECTOR PARSING</div>
              <div className="fs-10px text-muted">
                Bóc tách dữ liệu video trực tiếp, tính toán Outlier Multiplier, VPH và kiểm tra bộ nhớ đệm Cloudflare KV...
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB VIEW 1: MY SEARCH HISTORY
              =================================================================== */}
          {activeTab === 'MY_HISTORY' && (
            <div className="card mb-4">
              <div className="card-header with-btn">
                <span>LỊCH SỬ TÌM KIẾM CÁ NHÂN CỦA BẠN (D1 CLOUD CLUSTER)</span>
                <span className="fs-9px text-muted">{userHistory.length} TỔNG LƯỢT TRUY VẤN</span>
              </div>
              <div className="card-body p-0">
                {userHistory.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <History size={28} className="mb-2 text-theme" />
                    <div>Chưa có lịch sử tìm kiếm nào được ghi nhận.</div>
                    <div className="fs-10px mt-1">Mọi từ khóa bạn phân tích khi đã đăng nhập sẽ tự động lưu trữ tại đây.</div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="quantum-table">
                      <thead>
                        <tr>
                          <th>TỪ KHÓA NGÁCH</th>
                          <th>QUỐC GIA</th>
                          <th className="text-center">ĐIỂM CƠ HỘI</th>
                          <th>ĐÁNH GIÁ THỊ TRƯỜNG</th>
                          <th>THỜI GIAN</th>
                          <th className="text-end">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userHistory.map((item) => (
                          <tr key={item.id}>
                            <td className="fw-bold text-white">{item.keyword}</td>
                            <td>
                              <span className="badge-quantum badge-primary">{item.region_code}</span>
                            </td>
                            <td className="text-center">
                              <span className={`badge-quantum ${item.opportunity_score >= 60 ? 'badge-theme' : 'badge-warning'}`}>
                                {item.opportunity_score}/100
                              </span>
                            </td>
                            <td className="text-muted">{item.verdict}</td>
                            <td className="text-muted fs-10px">
                              {new Date(item.created_at).toLocaleString('vi-VN')}
                            </td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  className="btn-quantum btn-quantum-sm"
                                  onClick={() => {
                                    setKeyword(item.keyword);
                                    setRegionCode(item.region_code);
                                    performAnalysis(item.keyword, item.region_code);
                                    setActiveTab('DASHBOARD');
                                  }}
                                >
                                  <RefreshCw size={10} /> XEM LẠI
                                </button>
                                <button
                                  className="btn-quantum btn-quantum-sm btn-quantum-secondary text-danger"
                                  onClick={(e) => handleDeleteUserHistory(item.id, e)}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB VIEW 2: SAVED FAVORITES / BOOKMARKS
              =================================================================== */}
          {activeTab === 'FAVORITES' && (
            <div className="card mb-4">
              <div className="card-header with-btn">
                <span>DANH MỤC NGÁCH ĐÃ LƯU & CHIẾN LƯỢC THEO DÕI</span>
                <span className="fs-9px text-muted">{userFavorites.length} NGÁCH YÊU THÍCH</span>
              </div>
              <div className="card-body p-0">
                {userFavorites.length === 0 ? (
                  <div className="p-4 text-center text-muted">
                    <FolderHeart size={28} className="mb-2 text-primary" />
                    <div>Bạn chưa đánh dấu lưu ngách nào.</div>
                    <div className="fs-10px mt-1">Khi phân tích từ khóa, nhấn nút "LƯU NGÁCH NÀY" để đưa vào danh mục theo dõi.</div>
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="quantum-table">
                      <thead>
                        <tr>
                          <th>NGÁCH NỘI DUNG</th>
                          <th>THỊ TRƯỜNG</th>
                          <th className="text-center">ĐIỂM CƠ HỘI</th>
                          <th>KẾT LUẬN CHIẾN LƯỢC</th>
                          <th>GHI CHÚ</th>
                          <th className="text-end">THAO TÁC</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userFavorites.map((fav) => (
                          <tr key={fav.id}>
                            <td className="fw-bold text-white fs-12px">{fav.keyword}</td>
                            <td>
                              <span className="badge-quantum badge-primary">{fav.region_code}</span>
                            </td>
                            <td className="text-center">
                              <span className={`badge-quantum ${fav.opportunity_score >= 60 ? 'badge-theme' : 'badge-warning'}`}>
                                {fav.opportunity_score}đ
                              </span>
                            </td>
                            <td className="text-white">{fav.verdict}</td>
                            <td className="text-muted fs-10px">{fav.notes || '—'}</td>
                            <td className="text-end">
                              <div className="d-flex justify-content-end gap-1">
                                <button
                                  className="btn-quantum btn-quantum-sm"
                                  onClick={() => {
                                    setKeyword(fav.keyword);
                                    setRegionCode(fav.region_code);
                                    performAnalysis(fav.keyword, fav.region_code);
                                    setActiveTab('DASHBOARD');
                                  }}
                                >
                                  MỞ NGÁCH
                                </button>
                                <button
                                  className="btn-quantum btn-quantum-sm btn-quantum-secondary text-danger"
                                  onClick={(e) => handleDeleteFavorite(fav.id, e)}
                                >
                                  <Trash2 size={10} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ===================================================================
              TAB VIEW 3: ACCOUNT PROFILE & SETTINGS
              =================================================================== */}
          {activeTab === 'ACCOUNT' && user && (
            <div className="card mb-4">
              <div className="card-header with-btn">
                <span>HỒ SƠ TÀI KHOẢN NGƯỜI DÙNG</span>
                <span className="badge-quantum badge-theme">ACTIVE SESSION</span>
              </div>
              <div className="card-body">
                <div className="d-flex align-items-center gap-3 mb-4 p-3" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--bs-border-subtle)' }}>
                  <img src={user.avatarUrl} alt={user.name} style={{ width: '56px', height: '56px', borderRadius: '50%', border: '2px solid var(--bs-theme)' }} />
                  <div>
                    <div className="fs-16px fw-bold text-white d-flex align-items-center gap-2">
                      {user.name}
                      <span className="badge-quantum badge-theme">{user.tier || 'PRO OPERATOR'}</span>
                    </div>
                    <div className="text-muted fs-11px">{user.email}</div>
                    <div className="fs-9px text-muted mt-1">ID: <code className="text-theme">{user.id}</code></div>
                  </div>
                </div>

                <div className="row g-3">
                  <div className="col-12 col-md-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="text-muted fs-10px">TỔNG LƯỢT TRUY VẤN D1</div>
                        <div className="fs-24px fw-bold text-theme mt-1">{userHistory.length}</div>
                        <div className="fs-9px text-muted mt-1">Lưu trữ phân tán trên Cloudflare D1</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="text-muted fs-10px">NGÁCH ĐÃ BOOKMARK</div>
                        <div className="fs-24px fw-bold text-primary mt-1">{userFavorites.length}</div>
                        <div className="fs-9px text-muted mt-1">Sẵn sàng xuất báo cáo Markdown / CSV</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-12 col-md-4">
                    <div className="card h-100">
                      <div className="card-body">
                        <div className="text-muted fs-10px">HẠ TẦNG KẾT NỐI</div>
                        <div className="fs-14px fw-bold text-white mt-1">CLOUDFLARE WORKERS</div>
                        <div className="fs-9px text-muted mt-1">V8 Isolates Edge, Zero Cold Start</div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex justify-content-end gap-2 mt-4 pt-3" style={{ borderTop: '1px solid var(--bs-border-subtle)' }}>
                  <button className="btn-quantum btn-quantum-secondary text-danger" onClick={handleLogout}>
                    <LogOut size={12} /> ĐĂNG XUẤT TÀI KHOẢN
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ===================================================================
              MAIN DASHBOARD VIEW (ACTIVE TAB === 'DASHBOARD' OR OTHER CORE TABS)
              =================================================================== */}
          {(activeTab === 'DASHBOARD' || activeTab === 'SWIPE' || activeTab === 'RADAR' || activeTab === 'GAPS') && result && !loading && (
            <div className="quantum-dashboard">
              {/* TOP HEADER CONTROLS (BOOKMARK & EXPORT) */}
              <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-2 p-2" style={{ background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--bs-border-subtle)' }}>
                <div className="d-flex align-items-center gap-2">
                  <span className="fs-10px text-muted">TARGET NICHE:</span>
                  <span className="fs-13px fw-bold text-white">{result.keyword.toUpperCase()}</span>
                  <span className="badge-quantum badge-primary">{result.regionCode}</span>
                  {result.fromCache && (
                    <span className="badge-quantum badge-theme fs-9px">
                      ⚡ CACHED ({result.cacheSource})
                    </span>
                  )}
                </div>

                <div className="d-flex align-items-center gap-2">
                  <button
                    className={`btn-quantum btn-quantum-sm ${isCurrentFavorite ? 'btn-quantum-secondary' : ''}`}
                    onClick={handleToggleFavorite}
                    disabled={savingFav}
                  >
                    {isCurrentFavorite ? (
                      <>
                        <BookmarkCheck size={12} className="text-theme" />
                        <span className="text-theme">ĐÃ LƯU NGÁCH</span>
                      </>
                    ) : (
                      <>
                        <Bookmark size={12} />
                        <span>LƯU VÀO TÀI KHOẢN</span>
                      </>
                    )}
                  </button>

                  <button className="btn-quantum btn-quantum-sm" onClick={handleExportCSV}>
                    <Download size={11} /> CSV
                  </button>
                  <button className="btn-quantum btn-quantum-sm btn-quantum-secondary" onClick={handleExportStrategy}>
                    <FileText size={11} /> BÁO CÁO MD
                  </button>
                </div>
              </div>

              {/* ===================================================================
                  ROW 1: QUANTUM METRIC CARDS (4 COLS)
                  =================================================================== */}
              <div className="row g-2 mb-2">
                {/* 1. Demand Velocity */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100">
                    <div className="card-header with-btn">
                      <span>DEMAND VELOCITY</span>
                      <div className="card-header-btn">
                        <Activity size={12} className="text-theme" />
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="metric-score text-theme">{result.scores.demand}</div>
                      <div className="metric-label">SEARCH VOLUME & AUDIENCE APPETITE</div>
                      <div className="fs-10px text-muted mt-2">
                        Avg Views: <strong className="text-white">{result.stats.averageViews.toLocaleString()}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Supply Vacancy */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100">
                    <div className="card-header with-btn">
                      <span>SUPPLY VACANCY</span>
                      <div className="card-header-btn">
                        <Crosshair size={12} className="text-cyan" />
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="metric-score text-cyan">{result.scores.lowSupply}</div>
                      <div className="metric-label">OPPORTUNITY GAP (LOW COMPETITOR LOCK)</div>
                      <div className="fs-10px text-muted mt-2">
                        Comp Index: <strong className="text-white">{result.scores.competition}/100</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Monetization CPM */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100">
                    <div className="card-header with-btn">
                      <span>MONETIZATION CPM</span>
                      <div className="card-header-btn">
                        <DollarSign size={12} className="text-warning" />
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="metric-score text-warning">{result.scores.monetization}</div>
                      <div className="metric-label">COMMERCIAL AD VALUE & AFFILIATE</div>
                      <div className="fs-10px text-muted mt-2">
                        Est. RPM: <strong className="text-warning">~{result.monetizationDetails.estimatedRPM}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 4. Breakout Rate */}
                <div className="col-12 col-sm-6 col-lg-3">
                  <div className="card h-100">
                    <div className="card-header with-btn">
                      <span>BREAKOUT RATE</span>
                      <div className="card-header-btn">
                        <Award size={12} className="text-primary" />
                      </div>
                    </div>
                    <div className="card-body">
                      <div className="metric-score text-primary">{result.scores.breakout}</div>
                      <div className="metric-label">SMALL CHANNEL VIRAL CHANCE</div>
                      <div className="fs-10px text-muted mt-2">
                        Outliers: <strong className="text-theme">{result.stats.breakoutVideosCount} videos</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ===================================================================
                  ROW 2: RADAR CHART + MARKET VERDICT
                  =================================================================== */}
              {(activeTab === 'DASHBOARD' || activeTab === 'RADAR') && (
                <div className="row g-2 mb-2">
                  {/* Radar Chart */}
                  <div className="col-12 col-lg-5">
                    <div className="card h-100">
                      <div className="card-header with-btn">
                        <span>5-AXIS NICHE FEASIBILITY RADAR</span>
                        <div className="card-header-btn">
                          <Layers size={12} />
                        </div>
                      </div>
                      <div className="card-body d-flex align-items-center justify-content-center p-2" style={{ minHeight: '260px' }}>
                        {radarData && <Radar data={radarData} options={radarOptions} />}
                      </div>
                    </div>
                  </div>

                  {/* Market Verdict & Strategic Opportunities */}
                  <div className="col-12 col-lg-7">
                    <div className="card h-100">
                      <div className="card-header with-btn">
                        <span>QUANTUM MARKET VERDICT & STRATEGIC ADVISORY</span>
                        <span className={`badge-quantum ${result.scores.opportunity >= 60 ? 'badge-theme' : 'badge-warning'}`}>
                          {result.verdict.badge}
                        </span>
                      </div>
                      <div className="card-body">
                        <div className="d-flex align-items-baseline gap-2 mb-2">
                          <span className="fs-20px fw-bold text-white">{result.verdict.title}</span>
                          <span className="fs-12px text-muted">
                            (Composite Opportunity Score: <strong className="text-theme">{result.scores.opportunity}/100</strong>)
                          </span>
                        </div>

                        <p className="fs-11px text-muted mb-3" style={{ lineHeight: '1.6' }}>
                          {result.verdict.summary}
                        </p>

                        <div className="row g-2 mb-3">
                          <div className="col-12 col-md-6">
                            <div className="insight-card">
                              <div className="insight-title text-theme">
                                <CheckCircle2 size={12} /> THẾ MẠNH KHAI THÁC (EDGES)
                              </div>
                              <ul className="insight-list">
                                {(result.verdict?.pros || [
                                  `Nhu cầu khán giả tìm kiếm ở mức cao (${result.scores?.demand || 60}/100)`,
                                  `Phát hiện ${result.stats?.breakoutVideosCount || 0} video outlier đột biến view`,
                                  'Nhiều góc khai thác nội dung chưa bị các kênh lớn chiếm lĩnh'
                                ]).map((p, idx) => (
                                  <li key={idx}>{p}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div className="col-12 col-md-6">
                            <div className="insight-card">
                              <div className="insight-title text-warning">
                                <ShieldCheck size={12} /> THÁCH THỨC CẦN LƯU Ý
                              </div>
                              <ul className="insight-list">
                                {(result.verdict?.cons || [
                                  'Cần tối ưu tỷ lệ click CTR với thumbnail bắt mắt và tiêu đề ấn tượng',
                                  'Cần duy trì tốc độ xuất bản video đều đặn để kéo đề xuất thuật toán'
                                ]).map((c, idx) => (
                                  <li key={idx}>{c}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                        </div>

                        <div className="publish-window-bar">
                          <Clock size={12} className="text-theme" />
                          <span className="fs-10px text-muted">KHUNG GIỜ VÀNG ĐĂNG BÀI:</span>
                          <span className="fs-10px fw-bold text-white">
                            {(result.publishWindows || ['11:30 - 13:00 (Nghỉ trưa)', '19:30 - 21:30 (Buổi tối)']).join(' • ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  CONTENT GAPS ROW
                  =================================================================== */}
              {(activeTab === 'DASHBOARD' || activeTab === 'GAPS') && (
                <div className="card mb-2">
                  <div className="card-header with-btn">
                    <span>UNCLAIMED CONTENT GAPS (KHOẢNG TRỐNG NỘI DUNG ĐƯỢC ĐỀ XUẤT)</span>
                    <span className="fs-9px text-muted">TIỀM NĂNG VIRAL CAO</span>
                  </div>
                  <div className="card-body">
                    <div className="row g-2">
                      {result.contentGaps.map((gap, i) => (
                        <div key={i} className="col-12 col-md-4">
                          <div className="gap-card">
                            <div className="d-flex justify-content-between align-items-start mb-1">
                              <span className="gap-topic">{gap.topic}</span>
                              <span className="badge-quantum badge-theme shrink-0">{gap.potential}</span>
                            </div>
                            <div className="gap-reason">{gap.reason}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  ROW 3: COMPETITOR SWIPE MATRIX (FILTER & SORT)
                  =================================================================== */}
              {(activeTab === 'DASHBOARD' || activeTab === 'SWIPE') && (
                <div className="card mb-2">
                  <div className="card-header with-btn flex-wrap gap-2">
                    <div className="d-flex align-items-center gap-2">
                      <span>COMPETITOR SWIPE MATRIX — HIGH-OUTLIER WINNING FORMULAS</span>
                      <span className="badge-quantum badge-primary">{processedCompetitors.length} VIDEOS</span>
                    </div>

                    <div className="d-flex align-items-center gap-2">
                      {/* Search in table */}
                      <div className="d-flex align-items-center" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid var(--bs-border-subtle)', padding: '2px 6px' }}>
                        <Filter size={11} className="text-muted me-1" />
                        <input
                          type="text"
                          placeholder="Lọc video..."
                          value={matrixSearch}
                          onChange={(e) => setMatrixSearch(e.target.value)}
                          style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '10px', outline: 'none', width: '100px' }}
                        />
                      </div>

                      {/* Sort Selector */}
                      <div className="d-flex align-items-center gap-1">
                        <ArrowUpDown size={11} className="text-muted" />
                        <select
                          className="header-select"
                          style={{ height: '26px', fontSize: '10px' }}
                          value={matrixSort}
                          onChange={(e) => setMatrixSort(e.target.value)}
                        >
                          <option value="OUTLIER_DESC">Outlier (Cao nhất)</option>
                          <option value="VIEWS_DESC">Lượt xem (Nhiều nhất)</option>
                          <option value="VPH_DESC">Tốc độ VPH (Nhanh nhất)</option>
                          <option value="SUBS_ASC">Kênh nhỏ trước</option>
                        </select>
                      </div>

                      <button className="btn-quantum btn-quantum-sm" onClick={handleExportCSV}>
                        <Download size={11} /> CSV
                      </button>
                    </div>
                  </div>

                  <div className="card-body p-0">
                    <div className="table-responsive">
                      <table className="quantum-table">
                        <thead>
                          <tr>
                            <th style={{ width: '40%' }}>VIDEO TITLE & CHANNEL</th>
                            <th className="text-end">VIEWS</th>
                            <th className="text-end">EST. SUBS</th>
                            <th className="text-end">OUTLIER</th>
                            <th className="text-end">VPH</th>
                            <th>WINNING HOOK FORMULA</th>
                            <th className="text-end">ACTION</th>
                          </tr>
                        </thead>
                        <tbody>
                          {processedCompetitors.map((v) => {
                            const isHigh = v.outlierMultiplier >= 2.5;
                            return (
                              <tr key={v.id}>
                                <td>
                                  <div className="table-video-cell">
                                    <img
                                      src={v.thumbnail}
                                      alt={v.title}
                                      className="table-video-thumb"
                                      onError={(e) => {
                                        e.target.src = 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=160&q=80';
                                      }}
                                    />
                                    <div>
                                      <a
                                        href={v.url}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="table-video-title"
                                        title={v.title}
                                      >
                                        {v.title}
                                      </a>
                                      <div className="fs-9px text-muted mt-1">
                                        <strong className="text-white">{v.channelTitle}</strong> • {v.publishedText || 'Gần đây'}
                                      </div>
                                    </div>
                                  </div>
                                </td>
                                <td className="text-end fw-bold text-white">
                                  {v.views.toLocaleString()}
                                </td>
                                <td className="text-end text-muted">
                                  {v.subscribers.toLocaleString()}
                                </td>
                                <td className="text-end">
                                  <span className={`badge-quantum ${isHigh ? 'badge-theme' : 'badge-warning'}`}>
                                    {v.outlierMultiplier}x
                                  </span>
                                </td>
                                <td className="text-end text-cyan fw-bold">
                                  ~{v.vph.toLocaleString()}
                                </td>
                                <td>
                                  <span className="badge-quantum badge-primary">
                                    {v.pattern.icon} {v.pattern.pattern}
                                  </span>
                                </td>
                                <td className="text-end">
                                  <a
                                    href={v.url}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn-quantum btn-quantum-sm btn-quantum-secondary"
                                  >
                                    WATCH <ExternalLink size={10} />
                                  </a>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* ===================================================================
                  GLOBAL D1 RECENT SEARCHES
                  =================================================================== */}
              {globalHistory.length > 0 && (
                <div className="card mt-2">
                  <div className="card-header with-btn">
                    <span>CLOUDFLARE D1 DATABASE GLOBAL QUERY LOGS</span>
                    <span className="fs-9px text-muted">LIVE EDGE PERSISTENCE</span>
                  </div>
                  <div className="card-body">
                    <div className="d-flex gap-2 flex-wrap">
                      {globalHistory.map((h) => (
                        <button
                          key={h.id}
                          className="pill-tag"
                          onClick={() => performAnalysis(h.keyword, h.region_code)}
                        >
                          <span className="text-theme fw-bold">[{h.region_code}]</span> {h.keyword}
                          <span className="text-muted ms-1">({h.opportunity_score}đ)</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* ===================================================================
          QUANTUM AUTH MODAL (LOGIN / REGISTER)
          =================================================================== */}
      {showAuthModal && (
        <div className="quantum-modal-backdrop" onClick={() => setShowAuthModal(false)}>
          <div className="quantum-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header with-btn">
              <span>HỆ THỐNG XÁC THỰC TÀI KHOẢN (EDGE D1 CLUSTER)</span>
              <div className="card-header-btn">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowAuthModal(false); }}>
                  <X size={12} />
                </a>
              </div>
            </div>
            <div className="card-body">
              {/* Nav Tabs */}
              <div className="auth-nav-tabs">
                <button
                  type="button"
                  className={`auth-nav-tab ${authMode === 'LOGIN' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('LOGIN'); setAuthError(''); }}
                >
                  ĐĂNG NHẬP (LOGIN)
                </button>
                <button
                  type="button"
                  className={`auth-nav-tab ${authMode === 'REGISTER' ? 'active' : ''}`}
                  onClick={() => { setAuthMode('REGISTER'); setAuthError(''); }}
                >
                  ĐĂNG KÝ (REGISTER)
                </button>
              </div>

              {authError && (
                <div className="p-2 mb-3 text-danger fs-10px" style={{ background: 'rgba(255, 84, 84, 0.1)', border: '1px solid rgba(255, 84, 84, 0.3)' }}>
                  {authError}
                </div>
              )}

              <form onSubmit={handleAuthSubmit}>
                {authMode === 'REGISTER' && (
                  <div style={{ marginBottom: '12px' }}>
                    <label className="fs-10px text-muted d-block mb-1">HỌ VÀ TÊN / TÊN HIỂN THỊ:</label>
                    <input
                      type="text"
                      className="quantum-input"
                      placeholder="VD: Trần Anh Quân"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      required
                    />
                  </div>
                )}

                <div style={{ marginBottom: '12px' }}>
                  <label className="fs-10px text-muted d-block mb-1">ĐỊA CHỈ EMAIL:</label>
                  <input
                    type="email"
                    className="quantum-input"
                    placeholder="name@company.com"
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    required
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label className="fs-10px text-muted d-block mb-1">MẬT KHẨU (TỐI THIỂU 6 KÝ TỰ):</label>
                  <input
                    type="password"
                    className="quantum-input"
                    placeholder="••••••••"
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    required
                  />
                </div>

                <div className="d-flex flex-column gap-2">
                  <button type="submit" className="btn-quantum w-100 justify-content-center" disabled={authLoading}>
                    {authLoading ? 'ĐANG XỬ LÝ...' : authMode === 'LOGIN' ? 'XÁC NHẬN ĐĂNG NHẬP' : 'TẠO TÀI KHOẢN MỚI'}
                  </button>

                  {/* 1-Click Demo Button */}
                  <button
                    type="button"
                    className="btn-quantum btn-quantum-secondary w-100 justify-content-center text-theme"
                    onClick={handleDemoLogin}
                    disabled={authLoading}
                  >
                    <Sparkles size={12} /> TÀI KHOẢN TEST 1-CLICK (DEMO PRO)
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* ===================================================================
          QUANTUM MODAL: API KEY SETTINGS
          =================================================================== */}
      {showKeyModal && (
        <div className="quantum-modal-backdrop" onClick={() => setShowKeyModal(false)}>
          <div className="quantum-modal card" onClick={(e) => e.stopPropagation()}>
            <div className="card-header with-btn">
              <span>YOUTUBE DATA API CONFIGURATION</span>
              <div className="card-header-btn">
                <a href="#" onClick={(e) => { e.preventDefault(); setShowKeyModal(false); }}>
                  <X size={12} />
                </a>
              </div>
            </div>
            <div className="card-body">
              <p className="fs-11px text-muted mb-3" style={{ lineHeight: '1.5' }}>
                TrendPulse.Tech uses a live realtime YouTube crawler by default. To unlock higher quota and direct API access from Google Cloud, enter your YouTube Data API v3 key below:
              </p>

              <form onSubmit={handleSaveApiKey}>
                <div style={{ marginBottom: '14px' }}>
                  <input
                    type="text"
                    className="quantum-input"
                    placeholder="AIzaSy..."
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                  />
                </div>

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn-quantum btn-quantum-secondary btn-quantum-sm"
                    onClick={() => setShowKeyModal(false)}
                  >
                    CANCEL
                  </button>
                  <button type="submit" className="btn-quantum btn-quantum-sm">
                    SAVE CONFIG
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

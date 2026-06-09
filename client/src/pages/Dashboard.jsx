import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import customersData from '../data/customers.json';
import logo from '../logo.svg';

const Dashboard = () => {
  const navigate = useNavigate();
  const [matchmaker, setMatchmaker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Authentication Guard
  useEffect(() => {
    const authData = localStorage.getItem('tdc_auth');
    if (!authData) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(authData);
      if (!parsed.loggedIn) {
        navigate('/login');
      } else {
        setMatchmaker(parsed);
      }
    } catch (e) {
      localStorage.removeItem('tdc_auth');
      navigate('/login');
    }
  }, [navigate]);

  // Load clients data from backend dynamically to ensure session notes and stage updates sync, with a static fallback
  useEffect(() => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    setIsLoading(true);
    fetch(`${API_URL}/customers`)
      .then(res => {
        if (!res.ok) throw new Error('API request failed');
        return res.json();
      })
      .then(data => {
        setClients(data);
        setIsLoading(false);
      })
      .catch(err => {
        console.warn('API unavailable, falling back to offline static data:', err.message);
        setClients(customersData);
        setIsLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('tdc_auth');
    navigate('/login');
  };

  // Helper to map journey stage integer to label text
  const getStageLabel = (stage) => {
    const stages = {
      1: 'Profile Created',
      2: 'Preferences Set',
      3: 'Matches Shared',
      4: 'Meeting Scheduled',
      5: 'Matched'
    };
    return stages[stage] || 'Unknown';
  };

  // Filter clients based on search query and status filter dropdown
  const filteredClients = clients.filter((client) => {
    const fullName = `${client.firstName} ${client.lastName}`.toLowerCase();
    const city = client.city.toLowerCase();
    const religion = client.religion.toLowerCase();
    const query = searchQuery.toLowerCase();

    const matchesSearch = 
      fullName.includes(query) ||
      city.includes(query) ||
      religion.includes(query);

    const matchesStatus = statusFilter === 'All' || client.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  if (!matchmaker) {
    return (
      <div className="flex h-screen items-center justify-center" style={{ backgroundColor: '#FDFBF9' }}>
        <div className="flex flex-col items-center gap-3">
          <div 
            className="w-10 h-10 rounded-xl flex items-center justify-center animate-pulse"
            style={{ backgroundColor: '#F2E0E3' }}
          >
            <img src={logo} className="w-5 h-5 object-contain" alt="TDC Logo" />
          </div>
          <span className="text-xs font-semibold tracking-widest uppercase" style={{ color: '#9A8A82' }}>
            Verifying session...
          </span>
        </div>
      </div>
    );
  }

  // Get initials for profile avatar
  const getInitials = (name) => {
    if (!name) return 'MM';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Status config for consistent styling
  const statusConfig = {
    Active: { color: '#2D7D5F', bg: '#E8F5EE', border: '#C2E5D3' },
    Matched: { color: '#3B6FB5', bg: '#E5EFF9', border: '#C2D9F0' },
    'On Hold': { color: '#B5873B', bg: '#FDF3E5', border: '#F0DFC2' },
  };

  const filterTabs = [
    { key: 'All', label: 'All Clients', count: clients.length },
    { key: 'Active', label: 'Active', count: clients.filter(c => c.status === 'Active').length },
    { key: 'Matched', label: 'Matched', count: clients.filter(c => c.status === 'Matched').length },
    { key: 'On Hold', label: 'On Hold', count: clients.filter(c => c.status === 'On Hold').length },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFBF9' }}>
      
      {/* Sidebar Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/40 z-20 md:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ===== SIDEBAR ===== */}
      <aside 
        className={`w-[240px] fixed left-0 top-0 bottom-0 flex flex-col z-30 transition-transform duration-300 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ 
          backgroundColor: '#4A1525',
        }}
      >
        {/* Brand Header */}
        <div 
          className="px-6 h-[81px] flex items-center gap-3"
          style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}
        >
          <div 
            className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
          >
            <img src={logo} className="w-5 h-5 object-contain" alt="TDC Logo" />
          </div>
          <div>
            <div 
              className="text-base font-semibold"
              style={{ color: '#FFFFFF' }}
            >
              TDC Portal
            </div>
            <div className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Matchmaker Console
            </div>
          </div>
        </div>

        {/* User Profile (Clean & Borderless) */}
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div 
            className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
            style={{ 
              background: 'linear-gradient(135deg, #FAF5F0 0%, #EDE4DD 100%)',
              color: '#A4243B',
              border: '1.5px solid #EDE4DD',
            }}
          >
            {getInitials(matchmaker.name)}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold truncate text-white">
              {matchmaker.name}
            </p>
            <p className="text-[10px] font-medium text-white/50">
              Senior Matchmaker
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => {
              navigate('/dashboard');
              setSidebarOpen(false);
            }}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150"
            style={{ 
              backgroundColor: 'transparent',
              color: '#FFFFFF',
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
            My Clients
          </button>
        </nav>

        {/* Status Filters */}
        <div className="px-3 py-5 flex-1">
          <div className="text-[10px] font-bold tracking-widest uppercase px-3 mb-3" style={{ color: 'rgba(255,255,255,0.35)' }}>
            Filter by Status
          </div>
          <div className="space-y-1">
            {filterTabs.map(tab => {
              const isActive = statusFilter === tab.key;
              return (
                <button
                  key={tab.key}
                  onClick={() => {
                    setStatusFilter(tab.key);
                    setSidebarOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all duration-150"
                  style={{
                    backgroundColor: isActive ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.55)',
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = '#FFFFFF';
                      e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.04)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {tab.key !== 'All' ? (
                      <span 
                        className="w-1.5 h-1.5 rounded-full"
                        style={{ 
                          backgroundColor: statusConfig[tab.key]?.color || '#9A8A82',
                        }}
                      />
                    ) : (
                      <span 
                        className="w-1.5 h-1.5 rounded-full bg-white opacity-30"
                      />
                    )}
                    <span>{tab.label}</span>
                  </div>
                  <span 
                    className="text-[10px] px-1.5 py-0.5 rounded font-bold"
                    style={{
                      backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.04)',
                      color: isActive ? '#FFFFFF' : 'rgba(255,255,255,0.4)',
                    }}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Logout */}
        <div 
          className="px-3 py-4"
          style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
        >
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.45)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.08)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.45)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Sign out
          </button>
        </div>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-0 md:ml-[240px] transition-all duration-300">
        
        {/* Top Header Bar */}
        <header 
          className="sticky top-0 z-10 px-4 sm:px-8 h-[81px] flex items-center justify-between gap-4"
          style={{ 
            backgroundColor: 'rgba(253, 251, 249, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #EDE4DD',
          }}
        >
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Toggle */}
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 -ml-2 rounded-lg text-[#9A8A82] hover:bg-[#FAF5F0] md:hidden"
              aria-label="Open navigation menu"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            </button>
            <div className="hidden sm:block">
              <p className="text-sm" style={{ color: '#9A8A82' }}>
                {getGreeting()}, <span className="font-semibold" style={{ color: '#4A3830' }}>{matchmaker.name?.split(' ')[0]}</span>
              </p>
            </div>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-[280px] sm:max-w-xs md:w-80">
            <svg 
              className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4"
              fill="none" viewBox="0 0 24 24" stroke="#9A8A82" strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input
              type="text"
              placeholder="Search by name, city, religion..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200"
              style={{
                backgroundColor: '#FAF5F0',
                border: '1.5px solid #EDE4DD',
                color: '#2C1810',
                outline: 'none',
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#A4243B';
                e.target.style.backgroundColor = '#FFFFFF';
                e.target.style.boxShadow = '0 0 0 3px rgba(164, 36, 59, 0.06)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#EDE4DD';
                e.target.style.backgroundColor = '#FAF5F0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </header>

        {/* Content Area */}
        <div className="px-4 sm:px-8 py-6 max-w-6xl">
          
          {/* Page Title */}
          <div className="mb-6">
            <h1 
              className="text-3xl font-semibold"
              style={{ color: '#2C1810' }}
            >
              Your Clients, {matchmaker.name?.split(' ')[0]}
            </h1>
            <p className="text-sm mt-1" style={{ color: '#9A8A82' }}>
              {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} assigned to you
            </p>
          </div>



          {/* Client Cards List */}
          <div className="space-y-4 stagger-children">
            {isLoading ? (
              /* Loading Spinner centered */
              <div className="py-24 text-center space-y-4 flex flex-col items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#A4243B]" />
                <p className="text-xs font-semibold text-[#9A8A82] font-body">
                  Retrieving your assigned clients...
                </p>
              </div>
            ) : filteredClients.length > 0 ? (
              filteredClients.map((client) => {
                return (
                  <div
                    key={client.id}
                    onClick={() => navigate(`/customer/${client.id}`)}
                    className="group rounded-2xl p-5 transition-all duration-300 cursor-pointer"
                    style={{
                      backgroundColor: '#FFFFFF',
                      border: '1px solid #EDE4DD',
                      boxShadow: '0 1px 2px rgba(44, 24, 16, 0.03), 0 2px 8px rgba(44, 24, 16, 0.04)',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(44, 24, 16, 0.06), 0 12px 32px rgba(164, 36, 59, 0.06)';
                      e.currentTarget.style.borderColor = '#D4586A40';
                      e.currentTarget.style.transform = 'translateY(-1px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = '0 1px 2px rgba(44, 24, 16, 0.03), 0 2px 8px rgba(44, 24, 16, 0.04)';
                      e.currentTarget.style.borderColor = '#EDE4DD';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                  >
                    {/* Row 1: Identity + Status + Action */}
                    <div className="flex items-center justify-between gap-4 mb-4">
                      {/* Left: Avatar + Name */}
                      <div className="flex items-center gap-3.5 min-w-0">
                        {/* Color-coded avatar */}
                        <div 
                          className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{
                            background: 'linear-gradient(135deg, #FAF5F0 0%, #EDE4DD 100%)',
                            color: '#A4243B',
                            border: '1.5px solid #EDE4DD',
                            boxShadow: '0 1px 3px rgba(164, 36, 59, 0.05)',
                          }}
                        >
                          {client.firstName[0]}{client.lastName[0]}
                        </div>
                        
                        <div>
                          <h3 
                            className="text-[15px] font-bold transition-colors duration-150"
                            style={{ color: '#2C1810' }}
                          >
                            {client.firstName} {client.lastName}
                          </h3>
                          <p className="text-xs font-medium mt-0.5" style={{ color: '#9A8A82' }}>
                            {client.gender} · {client.age} yrs · {client.religion}
                          </p>
                        </div>
                      </div>

                      {/* Right: View */}
                      <div className="flex items-center gap-3 flex-shrink-0">

                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/customer/${client.id}`); }}
                          className="px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200"
                          style={{
                            backgroundColor: 'transparent',
                            color: '#A4243B',
                            border: '1.5px solid #EDE4DD',
                          }}
                          onMouseEnter={(e) => {
                            e.target.style.backgroundColor = '#A4243B';
                            e.target.style.color = '#FFFFFF';
                            e.target.style.borderColor = '#A4243B';
                          }}
                          onMouseLeave={(e) => {
                            e.target.style.backgroundColor = 'transparent';
                            e.target.style.color = '#A4243B';
                            e.target.style.borderColor = '#EDE4DD';
                          }}
                        >
                          View Profile
                        </button>
                      </div>
                    </div>

                    {/* Separator */}
                    <div className="h-px mb-4" style={{ backgroundColor: '#F3EDE8' }} />

                    {/* Row 2: Details + Journey Progress */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-6">
                      {/* Demographics — flat inline text */}
                      <p className="text-xs font-medium" style={{ color: '#9A8A82' }}>
                        {client.city} · {client.maritalStatus} · {client.income}
                      </p>

                      {/* Journey Progress */}
                      <div className="w-full sm:w-48 sm:flex-shrink-0">
                        <div className="mb-1.5">
                          <span className="text-[10px] font-semibold" style={{ color: '#9A8A82' }}>
                            {getStageLabel(client.journeyStage)}
                          </span>
                        </div>
                        <div 
                          className="w-full h-1.5 rounded-full overflow-hidden"
                          style={{ backgroundColor: '#EDE4DD' }}
                        >
                          <div 
                            className="h-full rounded-full transition-all duration-500"
                            style={{ 
                              width: `${(client.journeyStage / 5) * 100}%`,
                              background: client.journeyStage === 5 
                                ? 'linear-gradient(90deg, #2D7D5F, #3DA87A)' 
                                : 'linear-gradient(90deg, #A4243B, #D4586A)',
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Centered Empty State */
              <div className="flex justify-center py-6">
                <div 
                  className="rounded-2xl p-16 text-center max-w-md w-full"
                  style={{
                    backgroundColor: '#FFFFFF',
                    border: '1px solid #EDE4DD',
                    boxShadow: '0 1px 2px rgba(44, 24, 16, 0.03)',
                  }}
                >
                  <div 
                    className="w-14 h-14 rounded-2xl mx-auto flex items-center justify-center mb-4"
                    style={{ backgroundColor: '#FAF5F0' }}
                  >
                    <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="#9A8A82" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                    </svg>
                  </div>
                  <h3 
                    className="text-xl font-semibold mb-1.5"
                    style={{ color: '#2C1810' }}
                  >
                    No matching clients
                  </h3>
                  <p className="text-sm mb-5" style={{ color: '#9A8A82' }}>
                    Try broadening your search or selecting a different filter.
                  </p>
                  <button
                    onClick={() => { setSearchQuery(''); setStatusFilter('All'); }}
                    className="text-sm font-semibold transition-colors duration-150"
                    style={{ color: '#A4243B' }}
                    onMouseEnter={(e) => e.target.style.color = '#7B1A2E'}
                    onMouseLeave={(e) => e.target.style.color = '#A4243B'}
                  >
                    Reset all filters ↩
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
};

export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { calculateCompatibility } from '../utils/matchingLogic';
import logo from '../logo.svg';

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Authentication & Session data
  const [matchmaker, setMatchmaker] = useState(null);
  
  // Data State
  const [customer, setCustomer] = useState(null);
  const [allCustomers, setAllCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Matchmaker interactive inputs
  const [journeyStage, setJourneyStage] = useState(1);
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion matches state (index of matches list)
  const [expandedMatchId, setExpandedMatchId] = useState(null);

  // Suggest status tracker (mock state for assignment)
  const [suggestedMatchIds, setSuggestedMatchIds] = useState(new Set());

  // AI Pitch Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeMatch, setActiveMatch] = useState(null);
  const [pitchText, setPitchText] = useState('');
  const [isGeneratingPitch, setIsGeneratingPitch] = useState(false);
  const [copied, setCopied] = useState(false);

  // Email Composer state
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [showToast, setShowToast] = useState(false);

  // Auth check
  useEffect(() => {
    const authData = localStorage.getItem('tdc_auth');
    if (!authData) {
      navigate('/login');
      return;
    }
    try {
      const parsed = JSON.parse(authData);
      if (parsed.loggedIn) {
        setMatchmaker(parsed);
      } else {
        navigate('/login');
      }
    } catch (e) {
      navigate('/login');
    }
  }, [navigate]);

  // Fetch Customer & All profiles
  useEffect(() => {
    const fetchData = async () => {
      const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
      setIsLoading(true);
      try {
        // Fetch customer profile
        const custRes = await fetch(`${API_URL}/customers/${id}`);
        if (!custRes.ok) throw new Error('Client profile not found');
        const custData = await custRes.json();
        setCustomer(custData);
        setJourneyStage(custData.journeyStage || 1);
        setNotes(custData.notes || '');

        // Fetch all candidates
        const allRes = await fetch(`${API_URL}/customers`);
        if (!allRes.ok) throw new Error('Failed to load matchmaking pool');
        const allData = await allRes.json();
        setAllCustomers(allData);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  // Handle saving notes and journey stage back to backend
  const handleSaveNotesAndStage = async () => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_URL}/customers/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          journeyStage,
          notes,
        }),
      });

      if (!res.ok) throw new Error('Failed to update details on server');
      const updated = await res.json();
      
      setCustomer(updated);
      setSaveSuccess(true);
      // Fade success banner after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      alert(`Save failed: ${err.message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Trigger Backend Route for Gemini AI Match Pitch
  const handleGeneratePitch = async (match) => {
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    setActiveMatch(match.candidate);
    setIsModalOpen(true);
    setIsGeneratingPitch(true);
    setPitchText('');
    setCopied(false);
    
    try {
      const res = await fetch(`${API_URL}/score-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer,
          candidate: match.candidate,
          score: match.score,
        }),
      });

      if (!res.ok) throw new Error('Server returned an error generating pitch');
      const data = await res.json();
      setPitchText(data.pitch);
    } catch (err) {
      setPitchText(`⚠️ Error generating pitch: ${err.message}. Reverting to fallback analysis.`);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  const handleCopyPitch = () => {
    navigator.clipboard.writeText(pitchText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Open the Email Composer card, pre-loaded with candidate data and the AI Match pitch
  const handleOpenEmailComposer = async (match) => {
    setActiveMatch(match.candidate);
    setIsEmailModalOpen(true);
    setIsGeneratingPitch(true);
    setCopied(false);
    
    const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
    
    // Default mail fields
    const mockTo = `${customer.firstName}'s parents <${customer.firstName.toLowerCase()}.family@example.com>`;
    const mockSubject = `TDC Matrimonial Suggestion: connection profile for ${customer.firstName}`;
    
    setEmailTo(mockTo);
    setEmailSubject(mockSubject);
    setEmailBody(`Crafting personalized AI email draft, please wait...`);

    try {
      const res = await fetch(`${API_URL}/score-match`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customer,
          candidate: match.candidate,
          score: match.score,
        }),
      });

      if (!res.ok) throw new Error('Server returned an error generating pitch');
      const data = await res.json();
      
      const draftBody = `Dear Mr. & Mrs. ${customer.lastName},

Hope you are doing well.

I am writing to share a highly compatible matrimonial profile for ${customer.firstName} that I believe aligns beautifully with his/her lifestyle and expectations.

Suggested Match details:
- Name: ${match.candidate.firstName} ${match.candidate.lastName}
- Age/Height: ${match.candidate.age} yrs · ${match.candidate.height}
- Location: ${match.candidate.city}
- Education: ${match.candidate.degree} (${match.candidate.ugCollege})
- Profession: ${match.candidate.designation} at ${match.candidate.company} (Income: ${match.candidate.income})
- Diet/Lifestyle: ${match.candidate.diet} diet · ${match.candidate.drinking === 'Never' && match.candidate.smoking === 'Never' ? 'Non-drinker / Non-smoker' : 'Social lifestyle'}

---
COMPATIBILITY ANALYSIS & MATCHMAKER PITCH:
${data.pitch}
---

Please let me know if you would like to proceed with sharing biodatas or coordinating a virtual introduction.

Warm regards,
Priya Sharma
Senior Matchmaker, TDC (The Divine Connection)
matchmaker@tdc.com`;

      setEmailBody(draftBody);
    } catch (err) {
      const fallbackBody = `Dear Mr. & Mrs. ${customer.lastName},

Hope you are doing well.

I am writing to share a highly compatible matrimonial profile for ${customer.firstName} that I believe aligns beautifully with his/her lifestyle and expectations.

Suggested Match details:
- Name: ${match.candidate.firstName} ${match.candidate.lastName}
- Age/Height: ${match.candidate.age} yrs · ${match.candidate.height}
- Location: ${match.candidate.city}
- Education: ${match.candidate.degree} (${match.candidate.ugCollege})
- Profession: ${match.candidate.designation} at ${match.candidate.company} (Income: ${match.candidate.income})
- Diet/Lifestyle: ${match.candidate.diet} diet · ${match.candidate.drinking === 'Never' && match.candidate.smoking === 'Never' ? 'Non-drinker / Non-smoker' : 'Social lifestyle'}

---
COMPATIBILITY ANALYSIS:
- Compatibility score: ${match.score}%
- Diet: Compatible dietary preferences (${customer.diet} vs ${match.candidate.diet})
- Gotra Check: Compatible Gotra spacing (${customer.gotra} vs ${match.candidate.gotra})
---

Please let me know if you would like to proceed.

Warm regards,
Priya Sharma
Senior Matchmaker, TDC
matchmaker@tdc.com`;

      setEmailBody(fallbackBody);
    } finally {
      setIsGeneratingPitch(false);
    }
  };

  // Mock sending email flow with flying envelope animation
  const handleSendEmail = () => {
    setIsSendingEmail(true);
    setTimeout(() => {
      setIsSendingEmail(false);
      setIsEmailModalOpen(false);
      
      // Persist in suggested tracker
      if (activeMatch) {
        setSuggestedMatchIds(prev => {
          const next = new Set(prev);
          next.add(activeMatch.id);
          return next;
        });
      }
      
      // Trigger success toast
      setToastMessage(`Match suggestion email successfully sent to ${customer.firstName}'s family!`);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 4000);
    }, 1500);
  };

  // Generate opposite gender active matches list
  const getMatchesList = () => {
    if (!customer || allCustomers.length === 0) return [];
    
    // Matrimonial constraint: Match opposite gender only
    const pool = allCustomers.filter(c => c.gender !== customer.gender && c.status === 'Active');
    
    return pool.map(candidate => {
      const compatResult = calculateCompatibility(customer, candidate);
      return {
        candidate,
        score: compatResult.score,
        breakdown: compatResult.breakdown
      };
    })
    .filter(match => match.score > 0) // Filter out zero compatibility matches
    .sort((a, b) => b.score - a.score); // Sort by highest score descending
  };

  // Custom Markdown Parser to avoid external dependencies
  const parseBoldText = (text) => {
    const parts = text.split(/\*\*(.*?)\*\*/g);
    return parts.map((part, idx) => 
      idx % 2 === 1 ? <strong key={idx} className="font-bold text-[#2C1810]">{part}</strong> : part
    );
  };

  const renderMarkdown = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('### ')) {
        return <h3 key={idx} className="text-base font-bold mt-4 mb-2 text-[#4A3830] font-display">{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('#### ')) {
        return <h4 key={idx} className="text-sm font-bold mt-3 mb-1 text-[#A4243B] font-display">{line.replace('#### ', '')}</h4>;
      }
      if (line.trim().startsWith('- ')) {
        const formatted = line.trim().replace('- ', '');
        return (
          <li key={idx} className="ml-4 list-disc text-xs text-[#6B5B54] mb-1 font-body">
            {parseBoldText(formatted)}
          </li>
        );
      }
      if (line.trim() === '---') {
        return <hr key={idx} className="my-4 border-[#EDE4DD]" />;
      }
      if (line.trim().length > 0) {
        return <p key={idx} className="text-xs text-[#6B5B54] leading-relaxed mb-2.5 font-body">{parseBoldText(line)}</p>;
      }
      return <div key={idx} className="h-1" />;
    });
  };

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

  // Loading indicator
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFBF9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#A4243B] mx-auto mb-4" />
          <p className="text-sm font-semibold" style={{ color: '#6B5B54' }}>Retrieving client profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !customer) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FDFBF9' }}>
        <div className="max-w-md p-8 bg-white border border-[#EDE4DD] rounded-2xl text-center shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FDF2F4] flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="#A4243B" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold mb-2" style={{ color: '#2C1810' }}>Unable to retrieve profile</h2>
          <p className="text-sm mb-6" style={{ color: '#9A8A82' }}>{error || 'The profile ID specified does not exist.'}</p>
          <button 
            onClick={() => navigate('/dashboard')}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-150"
            style={{ backgroundColor: '#A4243B', color: '#FFFFFF' }}
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const matches = getMatchesList();
  const isMale = customer.gender === 'Male';

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFBF9' }}>
      
      {/* ===== SIDEBAR ===== */}
      <aside 
        className="w-[240px] fixed left-0 top-0 bottom-0 flex flex-col z-20"
        style={{ backgroundColor: '#5C2434' }}
      >
        {/* Header */}
        <div className="px-6 py-6 flex items-center gap-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}>
            <img src={logo} className="w-5 h-5 object-contain" alt="TDC Logo" />
          </div>
          <div>
            <div className="text-base font-semibold" style={{ color: '#FFFFFF' }}>TDC Portal</div>
            <div className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.4)' }}>Matchmaker Console</div>
          </div>
        </div>

        {/* Navigation - Return Home */}
        <nav className="px-3 py-6 flex-1">
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{ color: 'rgba(255,255,255,0.65)' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = 'rgba(255,255,255,0.65)';
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
            Back to Clients
          </button>
        </nav>
      </aside>

      {/* ===== MAIN CONTENT ===== */}
      <main className="flex-1 ml-[240px]">
        
        {/* Header Bar */}
        <header 
          className="sticky top-0 z-10 px-8 py-5 flex items-center justify-between"
          style={{ 
            backgroundColor: 'rgba(253, 251, 249, 0.85)',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid #EDE4DD',
          }}
        >
          <button 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-colors duration-150"
            style={{ color: '#9A8A82' }}
            onMouseEnter={(e) => e.target.style.color = '#A4243B'}
            onMouseLeave={(e) => e.target.style.color = '#9A8A82'}
          >
            ← Back to My Clients
          </button>
          
          <p className="text-xs" style={{ color: '#9A8A82' }}>
            Matchmaker: <span className="font-semibold text-[#4A3830]">{matchmaker?.name}</span>
          </p>
        </header>

        {/* Content Details Grid */}
        <div className="px-8 py-6 max-w-6xl">
          
          {/* Main Title & Action Alert */}
          {saveSuccess && (
            <div 
              className="mb-4 p-4 rounded-xl text-sm font-semibold flex items-center gap-2 animate-fade-in"
              style={{ backgroundColor: '#E8F5EE', color: '#2D7D5F', border: '1px solid #C2E5D3' }}
            >
              <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Notes and journey stage saved successfully!
            </div>
          )}

          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
            
            {/* Left Column: Client Dossier & Interactive Console */}
            <div className="xl:col-span-7 space-y-6">
              
              {/* Dossier Card Header */}
              <div 
                className="p-6 rounded-2xl bg-white shadow-sm flex flex-col md:flex-row gap-5 items-center md:items-start"
                style={{ border: '1px solid #EDE4DD' }}
              >
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0"
                  style={{
                    background: isMale 
                      ? 'linear-gradient(135deg, #3B6FB5 0%, #5B8FD5 100%)'
                      : 'linear-gradient(135deg, #A4243B 0%, #D4586A 100%)',
                    color: '#FFFFFF',
                    boxShadow: isMale ? '0 4px 12px rgba(59, 111, 181, 0.2)' : '0 4px 12px rgba(164, 36, 59, 0.2)'
                  }}
                >
                  {customer.firstName[0]}{customer.lastName[0]}
                </div>
                
                <div className="flex-1 text-center md:text-left min-w-0">
                  <div className="flex flex-col md:flex-row md:items-center gap-2">
                    <h2 className="text-2xl font-bold text-[#2C1810] font-display">
                      {customer.firstName} {customer.lastName}
                    </h2>
                    <span 
                      className="px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase self-center"
                      style={{ 
                        backgroundColor: customer.status === 'Active' ? '#E8F5EE' : '#FDF3E5', 
                        color: customer.status === 'Active' ? '#2D7D5F' : '#B5873B',
                        border: `1px solid ${customer.status === 'Active' ? '#C2E5D3' : '#F0DFC2'}`
                      }}
                    >
                      {customer.status}
                    </span>
                  </div>
                  
                  <p className="text-sm font-medium mt-1 text-[#9A8A82] font-body">
                    {customer.age} years · {customer.gender} · {customer.maritalStatus}
                  </p>
                  
                  {/* Highlight Specs */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4 pt-4 border-t border-[#F3EDE8]">
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#9A8A82] font-body">Location</p>
                      <p className="text-xs font-semibold text-[#4A3830] font-body mt-0.5">{customer.city}, {customer.country}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#9A8A82] font-body">Income</p>
                      <p className="text-xs font-semibold text-[#4A3830] font-body mt-0.5">{customer.income}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#9A8A82] font-body">Gotra</p>
                      <p className="text-xs font-semibold text-[#4A3830] font-body mt-0.5">{customer.gotra || 'N/A'}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase font-bold tracking-wider text-[#9A8A82] font-body">Community</p>
                      <p className="text-xs font-semibold text-[#4A3830] font-body mt-0.5">{customer.religion} · {customer.caste}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CRM Interactive Action Console */}
              <div 
                className="p-6 rounded-2xl bg-white shadow-sm space-y-6"
                style={{ border: '1px solid #EDE4DD' }}
              >
                <h3 className="text-lg font-bold text-[#2C1810] font-display">Matchmaker CRM Console</h3>
                
                {/* Journey stage slider progress timeline */}
                <div>
                  <div className="flex justify-between items-center mb-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#9A8A82] font-body">Matrimonial Stage</p>
                    <span className="text-xs font-bold text-[#A4243B] font-body">
                      {getStageLabel(journeyStage)} (Stage {journeyStage}/5)
                    </span>
                  </div>
                  
                  {/* Dynamic Timeline Selector */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    {[1, 2, 3, 4, 5].map((stageNum) => {
                      const isSelected = journeyStage === stageNum;
                      const isPassed = journeyStage > stageNum;
                      
                      return (
                        <button
                          key={stageNum}
                          onClick={() => setJourneyStage(stageNum)}
                          className="flex-1 py-2 rounded-lg text-xs font-bold transition-all duration-200"
                          style={{
                            backgroundColor: isSelected 
                              ? '#A4243B' 
                              : isPassed 
                                ? '#F2E0E3' 
                                : '#FAF5F0',
                            color: isSelected 
                              ? '#FFF8F5' 
                              : isPassed 
                                ? '#A4243B' 
                                : '#9A8A82',
                            border: `1.5px solid ${isSelected ? '#A4243B' : isPassed ? '#E8C4CB' : '#EDE4DD'}`
                          }}
                        >
                          Step {stageNum}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Notes Input */}
                <div>
                  <label htmlFor="notes" className="block text-xs font-bold uppercase tracking-wider text-[#9A8A82] font-body mb-2">
                    Client Matchmaking Notes
                  </label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Enter preferences details, family guidelines, or matchmaking status updates..."
                    className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                    style={{
                      backgroundColor: '#FAF5F0',
                      border: '1.5px solid #EDE4DD',
                      color: '#2C1810',
                      outline: 'none',
                      resize: 'none'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#A4243B';
                      e.target.style.backgroundColor = '#FFFFFF';
                      e.target.style.boxShadow = '0 0 0 3px rgba(164, 36, 59, 0.08)';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = '#EDE4DD';
                      e.target.style.backgroundColor = '#FAF5F0';
                      e.target.style.boxShadow = 'none';
                    }}
                  />
                </div>

                {/* Save button */}
                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleSaveNotesAndStage}
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold tracking-wide uppercase transition-all duration-200 flex items-center gap-2"
                    style={{
                      backgroundColor: isSaving ? '#D4586A' : '#A4243B',
                      color: '#FFF8F5',
                      boxShadow: '0 2px 8px rgba(164, 36, 59, 0.15)',
                      cursor: isSaving ? 'not-allowed' : 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      if (!isSaving) {
                        e.target.style.backgroundColor = '#7B1A2E';
                        e.target.style.transform = 'translateY(-1px)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSaving) {
                        e.target.style.backgroundColor = '#A4243B';
                        e.target.style.transform = 'translateY(0)';
                      }
                    }}
                  >
                    {isSaving ? (
                      <>
                        <div className="animate-spin rounded-full h-3.5 w-3.5 border-t border-b border-white" />
                        Saving...
                      </>
                    ) : 'Save Notes & Stage'}
                  </button>
                </div>
              </div>

              {/* Section Grid: Bio Profile Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Gotra / Astrological Info */}
                <div 
                  className="p-5 rounded-2xl bg-white shadow-sm space-y-4"
                  style={{ border: '1px solid #EDE4DD' }}
                >
                  <h4 className="text-sm font-bold text-[#A4243B] uppercase tracking-wider font-display">Gotra & Astrologicals</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Gotra</span>
                      <span className="font-semibold text-[#4A3830]">{customer.gotra || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Manglik Status</span>
                      <span className="font-semibold text-[#4A3830]">{customer.manglik}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Horoscope Match</span>
                      <span className="font-semibold text-[#4A3830]">{customer.horoscopeMatch}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#9A8A82]">Mother Tongue</span>
                      <span className="font-semibold text-[#4A3830]">{customer.motherTongue}</span>
                    </div>
                  </div>
                </div>

                {/* Professional Info */}
                <div 
                  className="p-5 rounded-2xl bg-white shadow-sm space-y-4"
                  style={{ border: '1px solid #EDE4DD' }}
                >
                  <h4 className="text-sm font-bold text-[#A4243B] uppercase tracking-wider font-display">Profession & Education</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Designation</span>
                      <span className="font-semibold text-[#4A3830] truncate max-w-[150px]">{customer.designation}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Company</span>
                      <span className="font-semibold text-[#4A3830] truncate max-w-[150px]">{customer.company}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Degree</span>
                      <span className="font-semibold text-[#4A3830] truncate max-w-[150px]">{customer.degree}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#9A8A82]">College</span>
                      <span className="font-semibold text-[#4A3830] truncate max-w-[150px]">{customer.ugCollege}</span>
                    </div>
                  </div>
                </div>

                {/* Lifestyle Choice Info */}
                <div 
                  className="p-5 rounded-2xl bg-white shadow-sm space-y-4"
                  style={{ border: '1px solid #EDE4DD' }}
                >
                  <h4 className="text-sm font-bold text-[#A4243B] uppercase tracking-wider font-display">Lifestyle Habits</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Diet Preference</span>
                      <span className="font-semibold text-[#4A3830]">{customer.diet}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Drinking</span>
                      <span className="font-semibold text-[#4A3830]">{customer.drinking}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Smoking</span>
                      <span className="font-semibold text-[#4A3830]">{customer.smoking}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#9A8A82]">Relocate readiness</span>
                      <span className="font-semibold text-[#4A3830]">{customer.openToRelocate}</span>
                    </div>
                  </div>
                </div>

                {/* Partner Preferences */}
                <div 
                  className="p-5 rounded-2xl bg-white shadow-sm space-y-4"
                  style={{ border: '1px solid #EDE4DD' }}
                >
                  <h4 className="text-sm font-bold text-[#A4243B] uppercase tracking-wider font-display">Target Partner Specs</h4>
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Partner Age Range</span>
                      <span className="font-semibold text-[#4A3830]">{customer.partnerAgeMin} to {customer.partnerAgeMax} yrs</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Want Children?</span>
                      <span className="font-semibold text-[#4A3830]">{customer.wantKids}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#F3EDE8]">
                      <span className="text-[#9A8A82]">Family Type preference</span>
                      <span className="font-semibold text-[#4A3830]">{customer.familyType}</span>
                    </div>
                    <div className="flex justify-between py-1.5">
                      <span className="text-[#9A8A82]">Open to Pets?</span>
                      <span className="font-semibold text-[#4A3830]">{customer.openToPets}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Dynamic Matrimonial Matches Pool */}
            <div className="xl:col-span-5 space-y-6">
              
              <div className="mb-2">
                <h3 className="text-xl font-bold text-[#2C1810] font-display">
                  Compatible Matches ({matches.length})
                </h3>
                <p className="text-xs text-[#9A8A82] font-body mt-1">
                  Sorted by compatibility score · opposite gender active profiles
                </p>
              </div>

              {/* Candidate Matches List */}
              <div className="space-y-4">
                {matches.length > 0 ? (
                  matches.map((match, idx) => {
                    const cand = match.candidate;
                    const isExpanded = expandedMatchId === cand.id;
                    const isSuggested = suggestedMatchIds.has(cand.id);
                    
                    return (
                      <div
                        key={cand.id}
                        onClick={() => setExpandedMatchId(isExpanded ? null : cand.id)}
                        className="rounded-2xl bg-white shadow-sm overflow-hidden transition-all duration-300 border cursor-pointer hover:shadow-md"
                        style={{ 
                          borderColor: isExpanded ? '#D4586A' : '#EDE4DD',
                          transform: isExpanded ? 'translateY(-1px)' : 'none'
                        }}
                      >
                        {/* Summary Header */}
                        <div className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            {/* Avatar */}
                            <div 
                              className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs text-white"
                              style={{
                                background: isMale 
                                  ? 'linear-gradient(135deg, #A4243B 0%, #D4586A 100%)' // Females seeking are red
                                  : 'linear-gradient(135deg, #3B6FB5 0%, #5B8FD5 100%)', // Males seeking are blue
                              }}
                            >
                              {cand.firstName[0]}{cand.lastName[0]}
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-bold text-[#2C1810] font-display">
                                {cand.firstName} {cand.lastName}
                              </h4>
                              <p className="text-[11px] text-[#9A8A82] font-body mt-0.5">
                                {cand.age} yrs · {cand.city} · {cand.income}
                              </p>
                            </div>
                          </div>

                          {/* Score Badge Progress */}
                          <div className="flex flex-col items-end gap-1 flex-shrink-0">
                            <span 
                              className="text-xs font-bold"
                              style={{ 
                                color: match.score >= 75 ? '#2D7D5F' : match.score >= 50 ? '#B5873B' : '#A4243B' 
                              }}
                            >
                              {match.score}% Compatible
                            </span>
                            <div className="w-20 h-1.5 bg-[#FAF5F0] rounded-full overflow-hidden border border-[#EDE4DD]">
                              <div 
                                className="h-full rounded-full"
                                style={{
                                  width: `${match.score}%`,
                                  background: match.score >= 75 
                                    ? 'linear-gradient(90deg, #2D7D5F, #3DA87A)'
                                    : 'linear-gradient(90deg, #B5873B, #D8A054)',
                                }}
                              />
                            </div>
                          </div>
                        </div>

                        {/* Accordion expanded breakdown detail */}
                        {isExpanded && (
                          <div 
                            className="px-4 pb-4 pt-3 border-t bg-[#FAF5F0]"
                            style={{ borderColor: '#EDE4DD' }}
                            onClick={(e) => e.stopPropagation()} // Prevent closing accordion when clicking inside details
                          >
                            <h5 className="text-[10px] uppercase font-bold tracking-wider text-[#9A8A82] font-body mb-3">
                              Matching Parameters Breakdown
                            </h5>
                            
                            <div className="space-y-3">
                              {Object.entries(match.breakdown).map(([key, category]) => (
                                <div key={key} className="flex gap-2">
                                  <div className="w-4 h-4 rounded-full bg-white flex items-center justify-center flex-shrink-0 mt-0.5">
                                    {category.score > 0 ? (
                                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#2D7D5F" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                      </svg>
                                    ) : (
                                      <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="#A4243B" strokeWidth={3}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                      </svg>
                                    )}
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-1.5">
                                      <p className="text-xs font-bold text-[#4A3830] font-body">{category.label}</p>
                                      <span className="text-[10px] text-[#9A8A82]">({category.score}/{category.max} pts)</span>
                                    </div>
                                    <p className="text-[11px] text-[#6B5B54] font-body mt-0.5">{category.desc}</p>
                                  </div>
                                </div>
                              ))}

                              {/* Suggest and Generate AI Pitch Buttons */}
                              <div className="flex items-center justify-between gap-3 mt-4 pt-3 border-t border-[#EDE4DD]">
                                {/* Send Match Composer Trigger */}
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenEmailComposer(match); }}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: isSuggested ? '#E8F5EE' : 'transparent',
                                    color: isSuggested ? '#2D7D5F' : '#6B5B54',
                                    border: `1px solid ${isSuggested ? '#C2E5D3' : '#EDE4DD'}`
                                  }}
                                >
                                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                  </svg>
                                  {isSuggested ? '✓ Profile Sent' : 'Send Match'}
                                </button>

                                {/* AI Pitch Trigger Button */}
                                <button
                                  onClick={() => handleGeneratePitch(match)}
                                  className="px-3.5 py-1.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-150 flex items-center gap-1.5"
                                  style={{
                                    backgroundColor: '#A4243B',
                                    color: '#FFFFFF',
                                    boxShadow: '0 2px 4px rgba(164, 36, 59, 0.15)'
                                  }}
                                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7B1A2E'}
                                  onMouseLeave={(e) => e.target.style.backgroundColor = '#A4243B'}
                                >
                                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 21l8.982-11.761a2.25 2.25 0 00-1.802-3.626h-4.32a.75.75 0 01-.649-1.124L12.7 5.25H18" />
                                  </svg>
                                  Generate AI Pitch
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  /* Empty state */
                  <div className="p-8 text-center bg-white border border-[#EDE4DD] rounded-2xl">
                    <p className="text-sm font-semibold text-[#9A8A82]">No matching profiles found</p>
                    <p className="text-xs text-[#9A8A82] mt-1">
                      No active {isMale ? 'female' : 'male'} candidates match Aarav's parameters.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ===== PITCH GENERATION GLASSMORPHIC MODAL ===== */}
        {isModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
            style={{ backgroundColor: 'rgba(44, 24, 16, 0.35)' }}
          >
            <div 
              className="bg-white border border-[#EDE4DD] rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#EDE4DD] flex items-center justify-between bg-[#FAF5F0]">
                <div>
                  <h3 className="text-base font-bold text-[#2C1810] font-display">
                    Gemini AI Match Pitch
                  </h3>
                  <p className="text-[11px] text-[#9A8A82] font-body mt-0.5">
                    Matchmaker Priya Sharma \'s pitch guidelines for {customer?.firstName} & {activeMatch?.firstName}
                  </p>
                </div>
                
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-full text-[#9A8A82] hover:bg-[#EDE4DD] hover:text-[#4A3830]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-y-auto flex-1 bg-[#FDFBF9]">
                {isGeneratingPitch ? (
                  /* Loading Spinner */
                  <div className="py-16 text-center space-y-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#A4243B] mx-auto" />
                    <p className="text-xs font-semibold text-[#9A8A82] font-body">
                      Gemini is evaluating compatibility backgrounds & writing matchmaking pitch...
                    </p>
                  </div>
                ) : (
                  /* Rendered Pitch Text */
                  <div className="space-y-1">
                    {renderMarkdown(pitchText)}
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-[#EDE4DD] flex justify-end gap-3 bg-[#FAF5F0]">
                {/* Copy Button */}
                {!isGeneratingPitch && pitchText && (
                  <button
                    onClick={handleCopyPitch}
                    className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5"
                    style={{
                      backgroundColor: copied ? '#E8F5EE' : 'transparent',
                      color: copied ? '#2D7D5F' : '#6B5B54',
                      border: `1.5px solid ${copied ? '#C2E5D3' : '#EDE4DD'}`
                    }}
                  >
                    {copied ? '✓ Copied!' : 'Copy to Clipboard'}
                  </button>
                )}

                {/* Close Button */}
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                  style={{
                    backgroundColor: '#A4243B',
                    color: '#FFF8F5',
                  }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#7B1A2E'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#A4243B'}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== EMAIL COMPOSE CONSOLE GLASSMORPHIC MODAL ===== */}
        {isEmailModalOpen && (
          <div 
            className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md animate-fade-in"
            style={{ backgroundColor: 'rgba(44, 24, 16, 0.35)' }}
          >
            <div 
              className="bg-white border border-[#EDE4DD] rounded-2xl shadow-xl w-full max-w-2xl max-h-[85vh] overflow-hidden flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="px-6 py-4 border-b border-[#EDE4DD] flex items-center justify-between bg-[#FAF5F0]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#F2E0E3] flex items-center justify-center">
                    <svg className="w-4.5 h-4.5" fill="none" viewBox="0 0 24 24" stroke="#A4243B" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#2C1810] font-display">
                      Send Matrimonial Suggestion Email
                    </h3>
                    <p className="text-[11px] text-[#9A8A82] font-body mt-0.5">
                      Draft connection proposal to {customer?.firstName}\'s parents
                    </p>
                  </div>
                </div>
                
                <button 
                  onClick={() => setIsEmailModalOpen(false)}
                  className="p-1 rounded-full text-[#9A8A82] hover:bg-[#EDE4DD] hover:text-[#4A3830]"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Content Form */}
              <div className="p-6 overflow-y-auto flex-1 bg-[#FDFBF9] space-y-4">
                {/* To Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9A8A82] font-body mb-1.5">
                    To (Recipient Family)
                  </label>
                  <input
                    type="text"
                    value={emailTo}
                    disabled
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold"
                    style={{
                      backgroundColor: '#FAF5F0',
                      border: '1.5px solid #EDE4DD',
                      color: '#6B5B54',
                    }}
                  />
                </div>

                {/* Subject Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9A8A82] font-body mb-1.5">
                    Subject Line
                  </label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    className="w-full rounded-xl px-4 py-2.5 text-xs font-semibold transition-all duration-200"
                    style={{
                      backgroundColor: '#FAF5F0',
                      border: '1.5px solid #EDE4DD',
                      color: '#2C1810',
                      outline: 'none',
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#A4243B'}
                    onBlur={(e) => e.target.style.borderColor = '#EDE4DD'}
                  />
                </div>

                {/* Message Body Field */}
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-[#9A8A82] font-body mb-1.5">
                    Email Message Body (Editable)
                  </label>
                  
                  {isGeneratingPitch ? (
                    <div className="w-full rounded-xl border border-[#EDE4DD] p-16 flex flex-col items-center justify-center bg-white space-y-3">
                      <div className="animate-spin rounded-full h-7 w-7 border-t-2 border-b-2 border-[#A4243B]" />
                      <p className="text-xs font-semibold text-[#9A8A82] font-body">
                        Gemini is compiling biodatas & writing matching pitch introduction...
                      </p>
                    </div>
                  ) : (
                    <textarea
                      value={emailBody}
                      onChange={(e) => setEmailBody(e.target.value)}
                      rows={12}
                      className="w-full rounded-xl px-4 py-3 text-xs font-medium leading-relaxed transition-all duration-200"
                      style={{
                        backgroundColor: '#FFFFFF',
                        border: '1.5px solid #EDE4DD',
                        color: '#4A3830',
                        outline: 'none',
                        resize: 'none',
                        fontFamily: 'monospace'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#A4243B'}
                      onBlur={(e) => e.target.style.borderColor = '#EDE4DD'}
                    />
                  )}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="px-6 py-3.5 border-t border-[#EDE4DD] flex justify-end gap-3 bg-[#FAF5F0]">
                <button
                  onClick={() => setIsEmailModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150"
                  style={{
                    backgroundColor: 'transparent',
                    color: '#6B5B54',
                    border: '1px solid #EDE4DD'
                  }}
                >
                  Cancel
                </button>

                <button
                  onClick={handleSendEmail}
                  disabled={isGeneratingPitch || isSendingEmail}
                  className="px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 flex items-center gap-1.5"
                  style={{
                    backgroundColor: isGeneratingPitch || isSendingEmail ? '#D4586A' : '#A4243B',
                    color: '#FFF8F5',
                    cursor: isGeneratingPitch || isSendingEmail ? 'not-allowed' : 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    if (!isGeneratingPitch && !isSendingEmail) e.target.style.backgroundColor = '#7B1A2E';
                  }}
                  onMouseLeave={(e) => {
                    if (!isGeneratingPitch && !isSendingEmail) e.target.style.backgroundColor = '#A4243B';
                  }}
                >
                  {isSendingEmail ? (
                    <>
                      <div className="animate-spin rounded-full h-3 w-3 border-t border-b border-white" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5 transform rotate-45" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                      </svg>
                      Send Suggestion Email
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ===== TOAST SUCCESS NOTIFICATION ===== */}
        {showToast && (
          <div 
            className="fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-lg border text-xs font-bold flex items-center gap-2.5 animate-slide-up"
            style={{ 
              backgroundColor: '#E8F5EE', 
              color: '#2D7D5F', 
              borderColor: '#C2E5D3',
              boxShadow: '0 4px 12px rgba(45, 125, 95, 0.15)'
            }}
          >
            <div className="w-5 h-5 rounded-full bg-[#2D7D5F] flex items-center justify-center text-white text-[10px]">✓</div>
            <span>{toastMessage}</span>
          </div>
        )}
      </main>
    </div>
  );
};

export default CustomerDetail;

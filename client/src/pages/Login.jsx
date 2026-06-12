import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logo from '../logo.svg';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect to dashboard if already logged in
  useEffect(() => {
    const authData = localStorage.getItem('tdc_auth');
    if (authData) {
      try {
        const parsed = JSON.parse(authData);
        if (parsed.loggedIn) {
          navigate('/dashboard');
        }
      } catch (e) {
        localStorage.removeItem('tdc_auth');
      }
    }
  }, [navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    // Simulate network delay for premium feel & to prevent spam
    setTimeout(() => {
      // Hardcoded credentials matchmaker@tdc.com / tdc2024
      if (email.toLowerCase() === 'matchmaker@tdc.com' && password === 'tdc2024') {
        const sessionData = {
          loggedIn: true,
          name: 'Priya Sharma',
          email: 'matchmaker@tdc.com',
          loginTime: new Date().toISOString()
        };
        localStorage.setItem('tdc_auth', JSON.stringify(sessionData));
        setIsLoading(false);
        navigate('/dashboard');
      } else {
        setIsLoading(false);
        setError('Invalid credentials. Please check your email and password.');
      }
    }, 600);
  };

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFBF9' }}>
      
      {/* LEFT PANEL — Brand & Trust with Hero Image */}
      <div 
        className="hidden lg:flex lg:w-[60%] relative flex-col justify-between p-12 overflow-hidden"
      >
        {/* Full-bleed hero image */}
        <img 
          src="/login-hero.png" 
          alt="" 
          className="absolute inset-0 w-full h-full object-cover"
          aria-hidden="true"
        />
        
        {/* Dark gradient overlay for text readability */}
        <div 
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(180deg, rgba(74, 21, 37, 0.75) 0%, rgba(74, 21, 37, 0.45) 50%, rgba(74, 21, 37, 0.75) 100%)',
          }}
        />
        
        {/* Top: Brand */}
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: 'rgba(255, 255, 255, 0.12)', backdropFilter: 'blur(8px)' }}
            >
              <img src={logo} className="w-5 h-5 object-contain" alt="TDC Logo" />
            </div>
            <span 
              className="text-xl font-semibold tracking-wide"
              style={{ color: '#FAF5F0' }}
            >
              TDC Matchmaker
            </span>
          </div>
        </div>
        
        {/* Center: Hero text */}
        <div className="relative z-10 max-w-md">
          <h1 
            className="text-5xl font-light leading-[1.15] mb-6"
            style={{ color: '#FAF5F0' }}
          >
            Where trusted hands
            <br />
            <span className="font-semibold italic" style={{ color: '#F0B4C0' }}>
              guide hearts home.
            </span>
          </h1>
          <p 
            className="text-base leading-relaxed max-w-sm"
            style={{ color: 'rgba(250, 245, 240, 0.6)' }}
          >
            A dedicated portal for our matchmakers to manage client journeys, 
            suggest compatible matches, and nurture meaningful connections.
          </p>
        </div>
        
        {/* Bottom: Trust indicators */}
        <div className="relative z-10 flex items-center justify-between w-full max-w-md">
          <div>
            <div 
              className="text-2xl font-bold"
              style={{ color: '#F0B4C0' }}
            >
              500+
            </div>
            <div 
              className="text-xs font-medium mt-0.5"
              style={{ color: 'rgba(250, 245, 240, 0.5)' }}
            >
              Successful matches
            </div>
          </div>
          <div 
            className="w-px h-8"
            style={{ backgroundColor: 'rgba(250, 245, 240, 0.15)' }}
          />
          <div>
            <div 
              className="text-2xl font-bold"
              style={{ color: '#F0B4C0' }}
            >
              12+
            </div>
            <div 
              className="text-xs font-medium mt-0.5"
              style={{ color: 'rgba(250, 245, 240, 0.5)' }}
            >
              Years of trust
            </div>
          </div>
          <div 
            className="w-px h-8"
            style={{ backgroundColor: 'rgba(250, 245, 240, 0.15)' }}
          />
          <div>
            <div 
              className="text-2xl font-bold"
              style={{ color: '#F0B4C0' }}
            >
              98%
            </div>
            <div 
              className="text-xs font-medium mt-0.5"
              style={{ color: 'rgba(250, 245, 240, 0.5)' }}
            >
              Client satisfaction
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL — Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 lg:px-16 relative overflow-hidden">
        
        {/* Subtle romantic/warm radial glow */}
        <div 
          className="absolute pointer-events-none z-0 w-[500px] h-[500px] rounded-full blur-[120px]"
          style={{
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'radial-gradient(circle, rgba(164, 36, 59, 0.05) 0%, rgba(253, 251, 249, 0) 70%)',
          }}
        />

        {/* Decorative overlapping rings background illustration - Top Right (Lil Darker) */}
        <div className="absolute top-[-50px] right-[-50px] pointer-events-none z-0 opacity-[0.14] transform rotate-12">
          <svg width="320" height="240" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="65" stroke="url(#ringGold)" strokeWidth="3" />
            <circle cx="150" cy="90" r="65" stroke="url(#ringBurgundy)" strokeWidth="3" />
            <defs>
              <linearGradient id="ringGold" x1="25" y1="25" x2="155" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#C9A063" />
                <stop offset="100%" stopColor="#E6C594" />
              </linearGradient>
              <linearGradient id="ringBurgundy" x1="85" y1="25" x2="215" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#A4243B" />
                <stop offset="100%" stopColor="#4A1525" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Decorative overlapping rings background illustration - Bottom Left (Lil Darker) */}
        <div className="absolute bottom-[-80px] left-[-80px] pointer-events-none z-0 opacity-[0.10] transform -rotate-45">
          <svg width="400" height="300" viewBox="0 0 240 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="75" stroke="url(#ringBurgundy2)" strokeWidth="2" />
            <circle cx="155" cy="90" r="75" stroke="url(#ringGold2)" strokeWidth="2" />
            <defs>
              <linearGradient id="ringGold2" x1="25" y1="25" x2="155" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#E6C594" />
                <stop offset="100%" stopColor="#C9A063" />
              </linearGradient>
              <linearGradient id="ringBurgundy2" x1="85" y1="25" x2="215" y2="155" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#4A1525" />
                <stop offset="100%" stopColor="#A4243B" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        <div className="w-full max-w-[400px] animate-fade-in relative z-10">
          
          {/* Mobile-only brand header */}
          <div className="lg:hidden text-center mb-8">
            <div 
              className="w-12 h-12 rounded-xl mx-auto flex items-center justify-center mb-4"
              style={{ backgroundColor: '#F2E0E3' }}
            >
              <img src={logo} className="w-6 h-6 object-contain animate-pulse" alt="TDC Logo" />
            </div>
            <h1 className="text-2xl font-semibold" style={{ color: '#2C1810' }}>
              TDC Matchmaker
            </h1>
          </div>

          {/* Desktop elegant brand tag */}
          <div className="hidden lg:flex items-center gap-2 mb-6">
            <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg" className="opacity-80">
              <circle cx="10" cy="10" r="7.5" stroke="#A4243B" strokeWidth="1.5" />
              <circle cx="18" cy="10" r="7.5" stroke="#C9A063" strokeWidth="1.5" />
            </svg>
            <span className="text-xs font-semibold tracking-[0.2em] uppercase" style={{ color: '#A4243B' }}>
              THE DECENT CONNECTIONS
            </span>
          </div>

          {/* Welcome text */}
          <div className="mb-8">
            <p 
              className="text-sm font-medium mb-1.5"
              style={{ color: '#9A8A82' }}
            >
              Welcome back
            </p>
            <h2 
              className="text-3xl font-semibold"
              style={{ color: '#2C1810' }}
            >
              Sign in to your portal
            </h2>
          </div>

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit} noValidate>
            
            {/* Error Message */}
            {error && (
              <div 
                className="rounded-xl px-4 py-3 text-sm flex items-start gap-2.5"
                style={{ 
                  backgroundColor: '#FDF2F4', 
                  color: '#A4243B',
                  border: '1px solid #F2E0E3'
                }}
              >
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label 
                htmlFor="email" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#4A3830' }}
              >
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                required
                placeholder="matchmaker@tdc.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200"
                style={{
                  backgroundColor: '#FAF5F0',
                  border: '1.5px solid #EDE4DD',
                  color: '#2C1810',
                  outline: 'none',
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

            {/* Password Field */}
            <div>
              <label 
                htmlFor="current-password" 
                className="block text-sm font-semibold mb-2"
                style={{ color: '#4A3830' }}
              >
                Password
              </label>
              <div className="relative">
                <input
                  id="current-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  enterKeyHint="done"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl px-4 py-3 pr-11 text-sm font-medium transition-all duration-200"
                  style={{
                    backgroundColor: '#FAF5F0',
                    border: '1.5px solid #EDE4DD',
                    color: '#2C1810',
                    outline: 'none',
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
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3.5"
                  style={{ color: '#9A8A82' }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                    </svg>
                  ) : (
                    <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password */}
            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded"
                  style={{ accentColor: '#A4243B' }}
                />
                <label 
                  htmlFor="remember-me" 
                  className="text-sm"
                  style={{ color: '#6B5B54' }}
                >
                  Remember me
                </label>
              </div>
              <a 
                href="#forgot" 
                className="text-sm font-semibold transition-colors duration-150"
                style={{ color: '#A4243B' }}
                onMouseEnter={(e) => e.target.style.color = '#7B1A2E'}
                onMouseLeave={(e) => e.target.style.color = '#A4243B'}
              >
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-xl px-4 py-3.5 text-sm font-bold tracking-wide transition-all duration-200 mt-2"
              style={{
                backgroundColor: isLoading ? '#D4586A' : '#A4243B',
                color: '#FFF8F5',
                boxShadow: '0 1px 3px rgba(164, 36, 59, 0.2), 0 4px 12px rgba(164, 36, 59, 0.15)',
                cursor: isLoading ? 'not-allowed' : 'pointer',
                opacity: isLoading ? 0.8 : 1,
              }}
              onMouseEnter={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#7B1A2E';
                  e.target.style.transform = 'translateY(-1px)';
                  e.target.style.boxShadow = '0 2px 4px rgba(164, 36, 59, 0.2), 0 8px 20px rgba(164, 36, 59, 0.2)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isLoading) {
                  e.target.style.backgroundColor = '#A4243B';
                  e.target.style.transform = 'translateY(0)';
                  e.target.style.boxShadow = '0 1px 3px rgba(164, 36, 59, 0.2), 0 4px 12px rgba(164, 36, 59, 0.15)';
                }
              }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Signing in...
                </span>
              ) : (
                'Sign in'
              )}
            </button>
          </form>

          {/* Demo Credentials — subtle inline hint */}
          <div 
            className="mt-8 pt-6"
            style={{ borderTop: '1px solid #EDE4DD' }}
          >
            <div 
              className="rounded-xl px-4 py-3.5 cursor-pointer transition-all duration-200"
              style={{
                backgroundColor: '#FAF5F0',
                border: '1px dashed #EDE4DD',
              }}
              onClick={() => {
                setEmail('matchmaker@tdc.com');
                setPassword('tdc2024');
                setError('');
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#F2E0E3';
                e.currentTarget.style.borderColor = '#D4586A';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#FAF5F0';
                e.currentTarget.style.borderColor = '#EDE4DD';
              }}
            >
              <p 
                className="text-xs font-semibold mb-1.5 flex items-center gap-1.5"
                style={{ color: '#6B5B54' }}
              >
                <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="#A4243B">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                Click to auto-fill demo credentials
              </p>
              <div className="flex gap-4 text-xs" style={{ color: '#9A8A82' }}>
                <span>
                  Email: <span className="font-semibold" style={{ color: '#4A3830' }}>matchmaker@tdc.com</span>
                </span>
                <span>
                  Pass: <span className="font-semibold" style={{ color: '#4A3830' }}>tdc2024</span>
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default Login;

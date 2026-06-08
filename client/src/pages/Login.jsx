import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

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
    <div className="flex min-h-screen items-center justify-center bg-rose-50/30 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        
        {/* Header branding */}
        <div className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-rose-100 shadow-inner">
            <span className="text-2xl font-bold text-rose-600">♥️</span>
          </div>
          <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-gray-900">
            TDC <span className="text-rose-600">Matchmaker</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Internal Matrimonial Portal
          </p>
        </div>

        {/* Card Body */}
        <div className="bg-white px-8 py-10 shadow-xl rounded-2xl border border-rose-100/50">
          <form className="space-y-6" onSubmit={handleSubmit} noValidate>
            
            {/* Error Message */}
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600 border border-red-100 animate-pulse">
                <div className="flex">
                  <span className="mr-2 font-bold">⚠️</span>
                  <span>{error}</span>
                </div>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="matchmaker@tdc.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 placeholder-gray-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm transition duration-150 ease-in-out"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="current-password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div className="mt-1 relative">
                <input
                  id="current-password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  enterKeyHint="done"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-lg border border-gray-300 px-3 py-2.5 pr-10 placeholder-gray-400 shadow-sm focus:border-rose-500 focus:outline-none focus:ring-1 focus:ring-rose-500 sm:text-sm transition duration-150 ease-in-out"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-sm text-gray-400 hover:text-gray-600 focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Remember Me and Forgot Password Placeholders */}
            <div className="flex items-center justify-between text-xs text-gray-500">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  Remember me
                </label>
              </div>
              <a href="#forgot" className="font-medium text-rose-600 hover:text-rose-500 transition duration-150">
                Forgot password?
              </a>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex w-full justify-center rounded-lg bg-rose-600 px-4 py-3 text-sm font-semibold text-white shadow hover:bg-rose-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 transition duration-150 ease-in-out ${
                  isLoading ? 'opacity-70 cursor-not-allowed' : ''
                }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Demo Credentials Help Box */}
        <div 
          onClick={() => {
            setEmail('matchmaker@tdc.com');
            setPassword('tdc2024');
            setError(''); // Clear error if auto-filling
          }}
          className="rounded-lg bg-rose-50 hover:bg-rose-100/70 border border-rose-200 p-4 text-xs text-rose-800 text-center cursor-pointer transition duration-150 ease-in-out group shadow-sm hover:shadow-md"
          title="Click to automatically fill credentials"
        >
          <p className="font-semibold mb-1.5 flex items-center justify-center gap-1 text-rose-700">
            <span>💡</span> Click here to auto-fill demo credentials
          </p>
          <div className="flex flex-col gap-1 sm:flex-row sm:justify-center sm:gap-4 font-mono mt-1 text-rose-900">
            <span>Email: <strong className="underline group-hover:text-rose-700">matchmaker@tdc.com</strong></span>
            <span>Password: <strong className="underline group-hover:text-rose-700">tdc2024</strong></span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;

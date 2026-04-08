import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Mail, Lock, ArrowRight, Sun } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter both email and password');
      return;
    }
    
    setIsLoading(true);
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Welcome back to Inspire Holdings!');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-base)] flex items-center justify-center p-6 md:p-8 lg:p-12">
      
      {/* Top right floating tracker */}
      <div className="absolute top-8 right-8 hidden md:block">
        <div className="text-[var(--color-text-tertiary)] text-xs font-semibold tracking-widest uppercase">
          IT Inventory System
        </div>
      </div>

      {/* Main Login Card - Generous max-width and min-height for proportions */}
      <div className="w-full max-w-5xl min-h-[600px] bg-[var(--color-bg-surface)] rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row border border-[var(--color-border)]">
        
        {/* Left Side: Branding / Marketing */}
        <div className="w-full md:w-5/12 bg-[var(--color-bg-header)] p-12 lg:p-16 flex flex-col justify-between border-b md:border-b-0 md:border-r border-[var(--color-border)] relative overflow-hidden">
          
          {/* Decorative ambient lighting targeting the Inspire brand colors (Yellow, Red, Orange) */}
          <div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-500 rounded-full mix-blend-screen filter blur-[128px] opacity-10 pointer-events-none"></div>
          <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#e86c30] rounded-full mix-blend-screen filter blur-[100px] opacity-10 pointer-events-none"></div>
          
          <div className="relative z-10 pt-4">
            {/* Serif font matching the company logo feel */}
            <h1 className="text-4xl lg:text-5xl font-serif tracking-widest mb-3" style={{ color: 'var(--color-text-primary)' }}>
              INSPIRE
            </h1>
            <h2 className="text-xs font-bold tracking-[0.3em] uppercase" style={{ color: 'var(--accent)' }}>
              Holdings Incorporated
            </h2>
          </div>

          <div className="relative z-10 mt-16 md:mt-0">
            <div className="flex items-start gap-5">
              <div className="p-3.5 rounded-2xl bg-[var(--accent-bg-strong)] text-[var(--accent)] mt-1 shadow-inner">
                <ShieldCheck size={28} />
              </div>
              <div>
                <h3 className="font-semibold text-lg lg:text-xl" style={{ color: 'var(--color-text-primary)' }}>
                  Secure Monitoring
                </h3>
                <p className="text-sm mt-3 leading-relaxed" style={{ color: 'var(--color-text-secondary)' }}>
                  Enterprise-grade tracking and asset lifecycle management for the Inspire Holdings network.
                </p>
              </div>
            </div>
          </div>

          <div className="relative z-10 mt-16 pt-8 border-t border-[var(--color-border)] text-xs font-medium" style={{ color: 'var(--color-text-tertiary)' }}>
            &copy; {new Date().getFullYear()} Inspire Holdings Inc.
          </div>
        </div>

        {/* Right Side: Login Form strict padding container */}
        <div className="w-full md:w-7/12 p-10 md:p-16 lg:p-24 flex items-center justify-center bg-[var(--color-bg-surface-hover)]">
          
          <div className="w-full max-w-sm">
            <div className="mb-10 text-center md:text-left">
              <h2 className="text-3xl font-bold mb-3" style={{ color: 'var(--color-text-primary)' }}>Welcome Back</h2>
              <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
                Please sign in to access the system.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                  Work Email
                </label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="filter-input w-full !pl-12 !py-3.5 text-sm transition-all focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent rounded-xl" 
                    placeholder="admin@inspireholdings.ph"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center pr-1">
                  <label className="text-sm font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                    Password
                  </label>
                  <a href="#" className="text-xs font-medium hover:underline transition-colors" style={{ color: 'var(--accent)' }}>
                    Forgot password?
                  </a>
                </div>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="filter-input w-full !pl-12 !py-3.5 text-sm transition-all focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent rounded-xl" 
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 mt-4 rounded-xl font-semibold text-sm transition-all transform active:scale-[0.98] shadow-md hover:shadow-lg"
                style={{
                  background: 'var(--accent)',
                  color: '#fff',
                  opacity: isLoading ? 0.7 : 1
                }}
              >
                {isLoading ? 'Authenticating...' : 'Sign In'}
                {!isLoading && <ArrowRight size={18} />}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-[var(--color-border)] text-center">
              <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                Need system access? <br className="md:hidden" />
                <a href="#" className="font-semibold hover:underline ml-1" style={{ color: 'var(--color-text-secondary)' }}>
                  Contact IT Service Desk
                </a>
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

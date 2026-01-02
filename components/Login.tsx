
import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { MOCK_USERS } from '../constants';
import { ShieldCheck, Lock, User as UserIcon, Key, AlertCircle, Building2, Fingerprint, Crown, Terminal, ShieldAlert, Cpu } from 'lucide-react';
// Added missing format import from date-fns
import { format } from 'date-fns';

interface LoginProps {
  onLogin: (user: User) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [systemLogs, setSystemLogs] = useState<string[]>(['Initializing kernel...', 'Mounting secure storage...']);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    
    // Add periodic fake system logs for immersion
    const logPool = [
      'Synchronizing node 04-A...',
      'Validating E2E encryption...',
      'Checking hardware integrity...',
      'Fetching latest audit trail...',
      'Handshake successful with DB-PROD...',
      'Biometric module ready...',
    ];
    
    const logTimer = setInterval(() => {
      setSystemLogs(prev => [logPool[Math.floor(Math.random() * logPool.length)], ...prev].slice(0, 10));
    }, 4000);

    return () => {
      clearInterval(timer);
      clearInterval(logTimer);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    setTimeout(() => {
      const user = MOCK_USERS.find(u => u.id.toLowerCase() === employeeId.toLowerCase());
      if (user && password.length >= 4) {
        onLogin(user);
      } else if (!user) {
        setError("Invalid Employee Identity. Verification failed.");
      } else {
        setError("Invalid Security Key. Unauthorized access detected.");
      }
      setIsSubmitting(false);
    }, 1200);
  };

  const handleQuickAccess = () => {
    setEmployeeId('u100');
    setPassword('chairman');
  };

  return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      
      {/* Procedural Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, #1e293b 1px, transparent 0)', backgroundSize: '40px 40px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-t from-[#05070a] via-transparent to-[#05070a]"></div>
      </div>

      {/* Cinematic Glowing Blobs - Changed to Emerald Theme */}
      <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-emerald-500/10 rounded-full blur-[160px] animate-pulse"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-indigo-500/5 rounded-full blur-[160px]"></div>

      <div className="w-full max-w-6xl z-10 flex flex-col lg:flex-row gap-0 items-stretch animate-in fade-in zoom-in-95 duration-1000 shadow-[0_0_100px_rgba(0,0,0,0.5)] rounded-[48px] overflow-hidden border border-white/5 bg-white/[0.02] backdrop-blur-2xl">
        
        {/* Left Side: Command Center Info */}
        <div className="lg:w-2/5 flex flex-col justify-between p-12 lg:p-16 text-white border-r border-white/5 relative group">
          <div className="absolute inset-0 bg-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-12">
               <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center shadow-[0_0_30px_rgba(16,185,129,0.4)]">
                <div className="text-white font-black text-2xl italic">S</div>
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tighter uppercase leading-none">SWISS</h1>
                <p className="text-[10px] text-emerald-400 font-black tracking-[0.4em] uppercase mt-1">Pharmaceuticals (Pvt) Ltd</p>
              </div>
            </div>

            <div className="space-y-2 mb-16">
              <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
                Swiss<br />
                Global<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400">Excellence</span>
              </h2>
              <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-xs pt-4 border-t border-white/10 mt-6">
                Official enterprise access for SWISS Pharmaceuticals (Pvt) Ltd. Managing core operations, research, and global distribution.
              </p>
            </div>

            {/* Terminal Feed */}
            <div className="bg-black/40 rounded-3xl p-6 border border-white/5 font-mono text-[10px] space-y-2 overflow-hidden h-44 shadow-inner">
              <div className="flex items-center gap-2 text-emerald-400 mb-2 border-b border-white/10 pb-2">
                <Terminal size={14} />
                <span className="font-bold uppercase tracking-widest">Swiss_Kernel_Log_v5.0</span>
              </div>
              {systemLogs.map((log, i) => (
                <div key={i} className={`flex gap-3 transition-all duration-500 ${i === 0 ? 'text-white' : 'text-slate-500'}`}>
                  <span className="opacity-30">[{format(new Date(), 'HH:mm:ss')}]</span>
                  <span>{log}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-8 flex items-center justify-between relative z-10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Local Standard Time</span>
              <span className="text-lg font-bold text-slate-200 tabular-nums">{format(currentTime, 'HH:mm:ss')}</span>
            </div>
            <div className="flex items-center gap-2 text-emerald-400">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></div>
              <span className="text-[10px] font-black uppercase tracking-widest">Link Active</span>
            </div>
          </div>
        </div>

        {/* Right Side: Authentication Panel */}
        <div className="lg:w-3/5 bg-[#0a0c10]/40 backdrop-blur-3xl flex flex-col p-8 lg:p-24 relative overflow-hidden">
          {/* Subtle Scanning Light Effect */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500/20 to-transparent animate-[scan_4s_ease-in-out_infinite]"></div>

          <div className="max-w-md mx-auto w-full relative z-10">
            <div className="mb-12">
              <div className="flex items-center gap-3 mb-4">
                 <ShieldAlert size={20} className="text-emerald-400" />
                 <h3 className="text-xs font-black text-emerald-400 uppercase tracking-[0.4em]">Secure Authentication</h3>
              </div>
              <h2 className="text-3xl font-black text-white tracking-tight mb-3">Identity Verification</h2>
              <p className="text-slate-400 font-medium text-sm">Input your employee credentials to initialize session.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-2xl flex items-center gap-3 text-rose-400 animate-in fade-in slide-in-from-top-2 duration-300">
                  <AlertCircle size={20} className="shrink-0" />
                  <p className="text-[10px] font-black uppercase tracking-widest">{error}</p>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Universal Identity ID</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <UserIcon size={18} />
                    </div>
                    <input 
                      type="text"
                      required
                      placeholder="e.g., u100"
                      value={employeeId}
                      onChange={(e) => setEmployeeId(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/10 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-bold text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block ml-1">Cryptographic Key</label>
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-emerald-400 transition-colors">
                      <Key size={18} />
                    </div>
                    <input 
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-14 pr-6 py-5 bg-white/[0.03] border border-white/10 rounded-3xl focus:ring-4 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none transition-all font-bold text-white placeholder:text-slate-700"
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-1">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <div className="w-5 h-5 rounded-lg border border-white/10 flex items-center justify-center group-hover:border-emerald-500/50 transition-all bg-white/[0.02]">
                    <div className="w-2.5 h-2.5 rounded-sm bg-emerald-500 scale-0 group-hover:scale-50 transition-transform"></div>
                  </div>
                  <span className="text-xs font-bold text-slate-500 group-hover:text-slate-300 transition-colors">Remember Station</span>
                </label>
                <button 
                  type="button" 
                  onClick={handleQuickAccess}
                  className="text-[10px] font-black uppercase tracking-widest text-emerald-400 hover:text-emerald-300 hover:underline flex items-center gap-2"
                >
                  <Crown size={12} />
                  Privileged Bypass
                </button>
              </div>

              <button 
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 bg-white text-black rounded-[32px] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 hover:bg-slate-200 shadow-[0_20px_40px_rgba(255,255,255,0.05)] transition-all active:scale-[0.98] disabled:opacity-50 relative group overflow-hidden"
              >
                {/* Button Scan Line */}
                <div className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-black/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                    Validating...
                  </>
                ) : (
                  <>
                    <Fingerprint size={18} />
                    Establish Connection
                  </>
                )}
              </button>
            </form>

            <div className="mt-16 pt-8 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-help group">
                <Building2 size={16} className="text-slate-600 group-hover:text-emerald-400" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Secure Node:<br /><span className="text-white">Main Office</span></span>
              </div>
              <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all cursor-help group">
                <Cpu size={16} className="text-slate-600 group-hover:text-emerald-400" />
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest leading-tight">Engine:<br /><span className="text-white">Gemini-Flash</span></span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Absolute Bottom Footer */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-center pointer-events-none">
        <p className="text-[9px] font-black text-slate-800 uppercase tracking-[0.5em] opacity-50">
          SWISS PHARMACEUTICALS (PVT) LTD // GOVERNANCE PROTOCOL // NO UNAUTHORIZED ACCESS
        </p>
      </div>

      <style>{`
        @keyframes scan {
          0%, 100% { opacity: 0.1; transform: translateY(0); }
          50% { opacity: 0.5; transform: translateY(100vh); }
        }
      `}</style>
    </div>
  );
};

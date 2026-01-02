
import React, { useState, useRef, useEffect } from 'react';
import { User, Role, AppNotification, NotificationType } from '../types';
import { MOCK_USERS } from '../constants';
import { 
  Calendar, 
  CheckSquare, 
  Users, 
  LogOut, 
  Bell, 
  LayoutDashboard,
  Building2,
  Briefcase,
  History,
  Activity,
  Layers,
  Crown,
  ChevronDown,
  UserCog,
  ShieldCheck,
  Globe,
  Trash2,
  X,
  Target,
  Zap,
  AlertTriangle,
  Clock,
  ShieldAlert,
  Menu,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

interface LayoutProps {
  user: User;
  onLogout: () => void;
  activeTab: 'dashboard' | 'calendar' | 'tasks' | 'directory' | 'logs' | 'activity' | 'dept-calendar' | 'exec-sync';
  setActiveTab: (tab: any) => void;
  children: React.ReactNode;
  onSwitchUser?: (user: User) => void;
  notifications: AppNotification[];
  onClearNotification: (id: string) => void;
  onMarkNotificationsRead: () => void;
  onQuickTask?: () => void;
  onQuickMeeting?: () => void;
}

export const Layout: React.FC<LayoutProps> = ({ 
  user, 
  onLogout, 
  activeTab, 
  setActiveTab, 
  children, 
  onSwitchUser, 
  notifications,
  onClearNotification,
  onMarkNotificationsRead,
  onQuickTask,
  onQuickMeeting
}) => {
  const [showUserSwitcher, setShowUserSwitcher] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const isExecutive = user.role === Role.Chairman || user.role === Role.CEO || user.role === Role.COO || user.role === Role.MD || user.role === Role.CFO;
  const canSeeAuditTrail = user.role === Role.Chairman || user.role === Role.CEO;

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggleNotifications = () => {
    if (!showNotifications) {
      onMarkNotificationsRead();
    }
    setShowNotifications(!showNotifications);
  };

  const menuItems = [
    { id: 'dashboard', label: 'Hub', icon: LayoutDashboard },
    { id: 'calendar', label: 'Schedule', icon: Calendar },
    ...(isExecutive ? [{ id: 'exec-sync', label: 'Executive', icon: Crown }] : []),
    { id: 'dept-calendar', label: isExecutive ? 'Ops Sync' : 'Dept Sync', icon: isExecutive ? Globe : Layers },
    { id: 'tasks', label: 'Manifest', icon: CheckSquare },
    { id: 'logs', label: 'Logs', icon: History },
    ...(canSeeAuditTrail ? [{ id: 'activity', label: 'Audit', icon: Activity }] : []),
    { id: 'directory', label: 'Directory', icon: Building2 },
  ];

  const getNotificationIcon = (type: NotificationType) => {
    switch (type) {
      case NotificationType.Task: return <Target size={14} className="text-emerald-500" />;
      case NotificationType.Meeting: return <Clock size={14} className="text-amber-500" />;
      case NotificationType.Rejection: return <AlertTriangle size={14} className="text-rose-500" />;
      default: return <Zap size={14} className="text-blue-500" />;
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-slate-900 text-white">
      <div className="p-8 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <div className="text-white font-black text-xl italic">S</div>
          </div>
          <div>
            <h1 className="font-black text-lg leading-tight tracking-tight text-emerald-50">SWISS</h1>
            <p className="text-[8px] text-emerald-500 font-black uppercase tracking-widest">Pharmaceuticals</p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-slate-500">
          <X size={24} />
        </button>
      </div>

      <nav className="flex-1 p-6 space-y-2 overflow-y-auto custom-scrollbar">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          const isExecItem = item.id === 'exec-sync';
          
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as any);
                setIsSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-5 py-3.5 rounded-2xl transition-all group ${
                isActive 
                  ? (isExecItem ? 'bg-amber-500 text-white shadow-xl shadow-amber-500/20' : 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20') 
                  : 'text-slate-500 hover:text-white hover:bg-slate-800'
              }`}
            >
              <Icon size={18} className={isActive ? 'text-white' : (isExecItem ? 'group-hover:text-amber-400' : 'group-hover:text-emerald-400')} />
              <span className="font-bold text-xs truncate uppercase tracking-widest">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-6 border-t border-slate-800">
        <div className="bg-slate-800/40 rounded-[28px] p-5 border border-white/5">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-slate-900 font-black ${isExecutive ? 'bg-amber-400 shadow-amber-400/20' : 'bg-emerald-400 shadow-emerald-400/20'} shadow-lg`}>
                {user.name.charAt(0)}
              </div>
              {isExecutive && (
                <div className="absolute -top-1 -right-1 bg-amber-500 text-white rounded-full p-1 border-2 border-slate-900 shadow-sm">
                  <Crown size={8} />
                </div>
              )}
            </div>
            <div className="overflow-hidden">
              <p className="font-black text-xs truncate text-slate-100">{user.name}</p>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest truncate">{user.role}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            className="w-full mt-4 flex items-center justify-center gap-2 py-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
          >
            <LogOut size={12} />
            Disconnect
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:flex w-64 flex-col shrink-0 shadow-2xl z-40">
        <SidebarContent />
      </aside>

      {/* Sidebar - Mobile Drawer */}
      {isSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setIsSidebarOpen(false)} />
          <aside className="absolute inset-y-0 left-0 w-72 animate-in slide-in-from-left duration-300">
            <SidebarContent />
          </aside>
        </div>
      )}

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 lg:h-20 bg-white border-b border-slate-100 px-4 lg:px-10 flex items-center justify-between z-30 shrink-0">
          <div className="flex items-center gap-3 lg:gap-4">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 text-slate-400 hover:bg-slate-50 rounded-xl">
              <Menu size={20} />
            </button>
            <h2 className="text-sm lg:text-xl font-black text-slate-900 tracking-tight uppercase truncate max-w-[120px] lg:max-w-none">
              {activeTab === 'exec-sync' ? 'Strategic Council' : 
               activeTab === 'dept-calendar' ? (isExecutive ? 'Ops Sync' : 'Dept Sync') : 
               activeTab.replace('-', ' ')}
            </h2>
            {isExecutive && (
              <span className={`text-[8px] lg:text-[9px] font-black px-2 lg:px-3 py-1 lg:py-1.5 rounded-full border uppercase tracking-[0.1em] lg:tracking-[0.2em] flex items-center gap-1.5 ${activeTab === 'exec-sync' ? 'bg-amber-500 text-white border-amber-600' : 'bg-amber-100 text-amber-700 border-amber-200'}`}>
                <Crown size={10} className="hidden lg:block" /> {activeTab === 'exec-sync' ? 'Sovereign' : 'Executive'}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2 lg:gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowUserSwitcher(!showUserSwitcher)}
                className="flex items-center gap-2 lg:gap-3 px-3 lg:px-5 py-2 lg:py-2.5 bg-slate-50 border border-slate-100 rounded-xl lg:rounded-2xl hover:bg-slate-100 transition-all group shadow-sm"
              >
                <UserCog size={16} className="text-slate-400 group-hover:text-emerald-600" />
                <span className="hidden lg:inline text-[10px] font-black uppercase tracking-widest text-slate-500">Identity Master</span>
                <ChevronDown size={14} className={`text-slate-400 transition-transform ${showUserSwitcher ? 'rotate-180' : ''}`} />
              </button>
              
              {showUserSwitcher && (
                <div className="absolute right-0 mt-3 w-72 lg:w-80 bg-white rounded-[32px] shadow-2xl border border-slate-100 py-4 z-50 animate-in zoom-in-95 duration-200 overflow-hidden">
                  <div className="px-6 py-2 border-b border-slate-50 mb-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Quick Switch Portal</p>
                  </div>
                  <div className="max-h-96 overflow-y-auto custom-scrollbar px-3 space-y-1">
                    {MOCK_USERS.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          onSwitchUser?.(u);
                          setShowUserSwitcher(false);
                        }}
                        className={`w-full flex items-center gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-all text-left ${u.id === user.id ? 'bg-emerald-50 border border-emerald-100' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-black ${u.role === Role.Chairman ? 'bg-amber-400' : 'bg-slate-200'} text-slate-800`}>
                          {u.name.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <p className="text-xs font-black text-slate-900 truncate">{u.name}</p>
                          <p className="text-[9px] text-slate-500 uppercase font-black truncate tracking-tighter">{u.role} &bull; {u.department}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={handleToggleNotifications}
                className={`p-2 lg:p-3 rounded-xl lg:rounded-2xl transition-all relative ${showNotifications ? 'bg-emerald-50 text-emerald-600 shadow-inner' : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'}`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 lg:top-2.5 right-1.5 lg:right-2.5 w-4 h-4 bg-red-500 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-black text-white">
                    {unreadCount}
                  </span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-3 w-80 lg:w-96 bg-white rounded-[32px] lg:rounded-[40px] shadow-[0_32px_64px_rgba(0,0,0,0.15)] border border-slate-100 py-6 z-50 animate-in zoom-in-95 duration-200 overflow-hidden flex flex-col max-h-[500px]">
                  <div className="px-8 pb-4 border-b border-slate-50 flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-black text-slate-900 tracking-tight">Activity</h3>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Live Updates</p>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {notifications.length > 0 ? (
                      <div className="divide-y divide-slate-50">
                        {notifications.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map(notif => (
                          <div 
                            key={notif.id} 
                            onClick={() => {
                              if (notif.linkTo) setActiveTab(notif.linkTo);
                              setShowNotifications(false);
                            }}
                            className={`p-6 flex gap-4 hover:bg-slate-50/50 transition-all cursor-pointer group relative ${!notif.read ? 'bg-emerald-50/20' : ''}`}
                          >
                            <div className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center shrink-0">
                              {getNotificationIcon(notif.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-black text-slate-900 truncate">{notif.title}</p>
                              <p className="text-xs text-slate-500 font-medium leading-relaxed line-clamp-2">{notif.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="py-20 flex flex-col items-center justify-center text-slate-300">
                         <Zap size={32} strokeWidth={1} className="mb-3 opacity-20" />
                         <p className="text-[10px] font-black uppercase tracking-widest">Idle Feed</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-24 lg:pb-10">
          {children}
        </div>

        {/* Bottom Navigation for Mobile */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-100 flex items-center justify-around z-40 px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.05)]">
          {menuItems.slice(0, 5).map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`flex flex-col items-center gap-1 transition-all ${isActive ? 'text-emerald-600' : 'text-slate-400'}`}
              >
                <Icon size={18} strokeWidth={isActive ? 3 : 2} />
                <span className="text-[8px] font-black uppercase tracking-widest">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Global Floating Action Button for Mobile/Small Screens */}
        <div className="lg:hidden fixed bottom-20 right-4 z-40">
          <div className="relative">
            {showFabMenu && (
              <div className="absolute bottom-16 right-0 space-y-3 animate-in slide-in-from-bottom-4 duration-200">
                <button 
                  onClick={() => { onQuickMeeting?.(); setShowFabMenu(false); }}
                  className="w-12 h-12 bg-white border border-slate-100 rounded-full shadow-2xl flex items-center justify-center text-amber-500 hover:scale-110 transition-transform"
                >
                  <Calendar size={20} />
                </button>
                <button 
                  onClick={() => { onQuickTask?.(); setShowFabMenu(false); }}
                  className="w-12 h-12 bg-white border border-slate-100 rounded-full shadow-2xl flex items-center justify-center text-emerald-500 hover:scale-110 transition-transform"
                >
                  <CheckSquare size={20} />
                </button>
              </div>
            )}
            <button 
              onClick={() => setShowFabMenu(!showFabMenu)}
              className={`w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all active:scale-90 ${showFabMenu ? 'bg-slate-900 rotate-45' : 'bg-emerald-600'}`}
            >
              <Plus size={24} strokeWidth={3} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};

import { useState, useRef, useEffect } from 'react';
import { Search, Bell, Menu, Zap, Plus, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { useNavigate } from 'react-router-dom';
import { classNames } from '@/lib/utils';

interface TopbarProps {
  onMenuClick?: () => void;
  onQuickAdd?: () => void;
}

export function Topbar({ onMenuClick, onQuickAdd }: TopbarProps) {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <header className="sticky top-0 z-30 glass border-b border-slate-200/60">
      <div className="flex items-center gap-3 px-4 lg:px-8 h-16">
        <button onClick={onMenuClick} className="lg:hidden p-2 -ml-2 rounded-lg hover:bg-slate-100 text-slate-600">
          <Menu size={20} />
        </button>

        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <Zap size={16} className="text-white" />
          </div>
        </div>

        {/* Search */}
        <div className="flex-1 max-w-md relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search customers, estimates..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100/80 border border-transparent rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 ml-auto">
          <button onClick={onQuickAdd} className="lg:hidden p-2 rounded-xl bg-primary-600 text-white hover:bg-primary-700 transition-colors">
            <Plus size={20} />
          </button>

          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button onClick={() => setNotifOpen(!notifOpen)} className="relative p-2 rounded-xl hover:bg-slate-100 text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-secondary-500 rounded-full ring-2 ring-white" />
            </button>
            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl card-shadow-lg border border-slate-100 animate-scale-in overflow-hidden">
                <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Notifications</span>
                  <button onClick={() => setNotifOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <div className="py-2">
                  {['New estimate created', 'Payment received: ₹5,000', 'Customer added: Rajesh Kumar'].map((n, i) => (
                    <div key={i} className="px-4 py-2.5 hover:bg-slate-50 cursor-pointer">
                      <div className="text-sm text-slate-700">{n}</div>
                      <div className="text-xs text-slate-400 mt-0.5">2 hours ago</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative" ref={profileRef}>
            <button onClick={() => setProfileOpen(!profileOpen)} className="flex items-center gap-2 p-1 pr-2 rounded-xl hover:bg-slate-100 transition-colors">
              <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
                {(profile?.full_name || 'U').charAt(0).toUpperCase()}
              </div>
              <span className="hidden sm:block text-sm font-medium text-slate-700 max-w-[100px] truncate">{profile?.full_name || 'User'}</span>
            </button>
            {profileOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl card-shadow-lg border border-slate-100 animate-scale-in overflow-hidden py-1">
                <div className="px-4 py-3 border-b border-slate-100">
                  <div className="text-sm font-semibold text-slate-900 truncate">{profile?.full_name || 'User'}</div>
                  <div className="text-xs text-slate-400 truncate">{profile?.business_name || 'Electrician'}</div>
                </div>
                <button onClick={() => { setProfileOpen(false); navigate('/app/settings'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Settings</button>
                <button onClick={() => { setProfileOpen(false); navigate('/app/help'); }} className="w-full text-left px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50">Help & Support</button>
                <div className="border-t border-slate-100 mt-1 pt-1">
                  <button onClick={() => navigate('/login')} className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50">Sign Out</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

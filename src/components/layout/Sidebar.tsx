import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Receipt, CreditCard, BarChart3, Settings, HelpCircle, Zap, Crown, LogOut } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { classNames } from '@/lib/utils';

const navItems = [
  { to: '/app/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/estimates', label: 'Estimates', icon: FileText },
  { to: '/app/invoices', label: 'Invoices', icon: Receipt },
  { to: '/app/payments', label: 'Payments', icon: CreditCard },
  { to: '/app/reports', label: 'Reports', icon: BarChart3 },
  { to: '/app/settings', label: 'Settings', icon: Settings },
  { to: '/app/help', label: 'Help', icon: HelpCircle },
];

export function Sidebar() {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <aside className="hidden lg:flex flex-col w-64 bg-white border-r border-slate-100 h-screen sticky top-0 shrink-0">
      <div className="flex items-center gap-2.5 px-6 py-5">
        <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
          <Zap size={20} className="text-white" />
        </div>
        <div>
          <div className="text-sm font-bold text-slate-900 leading-tight">Electrical Estimate</div>
          <div className="text-xs text-slate-400 leading-tight">Pro</div>
        </div>
      </div>

      <nav className="flex-1 px-3 py-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => classNames(
              'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
              isActive ? 'bg-primary-50 text-primary-700' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900',
            )}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="px-3 pb-3 space-y-0.5">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors" onClick={handleSignOut}>
          <LogOut size={18} /> Sign Out
        </button>
      </div>

      <div className="p-3">
        <div className="rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-4 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Crown size={18} className="text-secondary-300" />
            <span className="text-sm font-bold">Upgrade to Pro</span>
          </div>
          <p className="text-xs text-primary-100 mb-3">Unlock unlimited estimates, invoices & more.</p>
          <button className="w-full bg-white text-primary-700 text-sm font-semibold py-2 rounded-lg hover:bg-primary-50 transition-colors">
            Upgrade Now
          </button>
        </div>
      </div>

      {profile && (
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">
              {(profile.full_name || 'U').charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <div className="text-sm font-semibold text-slate-900 truncate">{profile.full_name || 'User'}</div>
              <div className="text-xs text-slate-400 truncate">{profile.business_name || profile.city || 'Electrician'}</div>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}

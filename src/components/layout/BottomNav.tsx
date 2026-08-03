import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, FileText, Menu, Plus, Zap } from 'lucide-react';
import { useState } from 'react';
import { classNames } from '@/lib/utils';

const bottomNav = [
  { to: '/app/dashboard', label: 'Home', icon: LayoutDashboard },
  { to: '/app/customers', label: 'Customers', icon: Users },
  { to: '/app/estimates', label: 'Estimates', icon: FileText },
];

export function BottomNav({ onQuickAdd }: { onQuickAdd?: () => void }) {
  const [moreOpen, setMoreOpen] = useState(false);

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 glass border-t border-slate-200/60 px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {bottomNav.slice(0, 2).map((item) => (
            <NavItem key={item.to} {...item} />
          ))}

          {/* Center FAB */}
          <button
            onClick={onQuickAdd}
            className="w-12 h-12 -mt-6 rounded-2xl bg-primary-600 text-white flex items-center justify-center shadow-lg shadow-primary-600/30 hover:bg-primary-700 transition-colors"
          >
            <Plus size={24} />
          </button>

          <NavItem {...bottomNav[2]} />
          <button
            onClick={() => setMoreOpen(true)}
            className="flex flex-col items-center gap-0.5 text-slate-500 px-3 py-1.5"
          >
            <Menu size={22} />
            <span className="text-[10px] font-medium">More</span>
          </button>
        </div>
      </nav>

      {moreOpen && (
        <div className="lg:hidden fixed inset-0 z-50" onClick={() => setMoreOpen(false)}>
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-6 animate-slide-up">
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-4" />
            <h3 className="text-sm font-semibold text-slate-500 mb-3">More Options</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { to: '/app/invoices', label: 'Invoices', icon: '🧾' },
                { to: '/app/payments', label: 'Payments', icon: '💳' },
                { to: '/app/reports', label: 'Reports', icon: '📊' },
                { to: '/app/settings', label: 'Settings', icon: '⚙️' },
                { to: '/app/help', label: 'Help', icon: '❓' },
                { to: '/app/future', label: 'Coming Soon', icon: '✨' },
              ].map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => setMoreOpen(false)}
                  className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-slate-50 hover:bg-slate-100 transition-colors"
                >
                  <span className="text-2xl">{item.icon}</span>
                  <span className="text-xs font-medium text-slate-700">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NavItem({ to, label, icon: Icon }: { to: string; label: string; icon: typeof LayoutDashboard }) {
  return (
    <NavLink to={to} className={({ isActive }) => classNames(
      'flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors',
      isActive ? 'text-primary-600' : 'text-slate-500',
    )}>
      <Icon size={22} />
      <span className="text-[10px] font-medium">{label}</span>
    </NavLink>
  );
}

export function MobileLogo() {
  return (
    <div className="lg:hidden flex items-center gap-2">
      <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
        <Zap size={16} className="text-white" />
      </div>
    </div>
  );
}

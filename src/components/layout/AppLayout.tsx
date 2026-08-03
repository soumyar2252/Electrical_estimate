import { Outlet, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { UserPlus, FileText, Receipt, Share2 } from 'lucide-react';

export function AppLayout() {
  const navigate = useNavigate();
  const [quickAdd, setQuickAdd] = useState(false);

  const quickActions = [
    { label: 'Add Customer', icon: UserPlus, action: () => { setQuickAdd(false); navigate('/app/customers?new=true'); } },
    { label: 'Create Estimate', icon: FileText, action: () => { setQuickAdd(false); navigate('/app/estimates?new=true'); } },
    { label: 'Generate Invoice', icon: Receipt, action: () => { setQuickAdd(false); navigate('/app/invoices?new=true'); } },
    { label: 'Share Estimate', icon: Share2, action: () => { setQuickAdd(false); navigate('/app/estimates'); } },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onQuickAdd={() => setQuickAdd(true)} />
        <main className="flex-1 p-4 lg:p-8 pb-24 lg:pb-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
        <BottomNav onQuickAdd={() => setQuickAdd(true)} />
      </div>

      <Modal open={quickAdd} onClose={() => setQuickAdd(false)} title="Quick Actions" size="sm">
        <div className="p-4 space-y-2">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                <action.icon size={20} />
              </div>
              <span className="text-sm font-medium text-slate-900">{action.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    </div>
  );
}

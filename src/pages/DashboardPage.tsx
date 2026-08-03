import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, FileText, CreditCard, TrendingUp, UserPlus, Receipt, Share2, Plus, ArrowUpRight, Clock } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Customer, Estimate } from '@/lib/types';
import { formatCurrency, formatDate, timeAgo } from '@/lib/utils';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { EmptyState } from '@/components/ui/EmptyState';

export function DashboardPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stats, setStats] = useState({ customers: 0, estimates: 0, pending: 0, revenue: 0 });
  const [recentCustomers, setRecentCustomers] = useState<Customer[]>([]);
  const [recentEstimates, setRecentEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [{ count: customerCount }, { count: estimateCount }, { data: payments }, { data: estimates }, { data: customers }] = await Promise.all([
        supabase.from('customers').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('estimates').select('*', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('payments').select('amount,status').eq('user_id', user.id).eq('status', 'paid'),
        supabase.from('estimates').select('*, customer:customers(*)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
        supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5),
      ]);

      const revenue = (payments || []).reduce((sum, p) => sum + Number(p.amount), 0);
      const pending = (estimates || []).filter((e) => e.status === 'draft' || e.status === 'sent').length;
      setStats({ customers: customerCount || 0, estimates: estimateCount || 0, pending, revenue });
      setRecentEstimates(estimates as Estimate[] || []);
      setRecentCustomers(customers as Customer[] || []);
      setLoading(false);
    })();
  }, [user]);

  const statCards = [
    { label: 'Total Customers', value: stats.customers, icon: Users, color: 'bg-primary-50 text-primary-600', trend: '+12%' },
    { label: 'Total Estimates', value: stats.estimates, icon: FileText, color: 'bg-secondary-50 text-secondary-600', trend: '+8%' },
    { label: 'Pending Payments', value: stats.pending, icon: CreditCard, color: 'bg-amber-50 text-amber-600', trend: 'Active' },
    { label: 'Total Revenue', value: formatCurrency(stats.revenue), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600', trend: '+24%' },
  ];

  const quickActions = [
    { label: 'Add Customer', icon: UserPlus, action: () => navigate('/app/customers?new=true'), color: 'bg-primary-600' },
    { label: 'Create Estimate', icon: FileText, action: () => navigate('/app/estimates?new=true'), color: 'bg-secondary-500' },
    { label: 'Generate Invoice', icon: Receipt, action: () => navigate('/app/invoices?new=true'), color: 'bg-emerald-600' },
    { label: 'Share Estimate', icon: Share2, action: () => navigate('/app/estimates'), color: 'bg-slate-700' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-0.5">Welcome back, here's what's happening with your business.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl card-shadow p-4 lg:p-5 border border-slate-100">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <span className="text-xs font-semibold text-emerald-600 flex items-center gap-0.5">
                <ArrowUpRight size={12} /> {stat.trend}
              </span>
            </div>
            <div className="text-2xl font-bold text-slate-900">{loading ? '—' : stat.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-slate-700 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <button
              key={action.label}
              onClick={action.action}
              className="group bg-white rounded-2xl card-shadow p-4 border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all text-left"
            >
              <div className={`w-10 h-10 rounded-xl ${action.color} text-white flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                <action.icon size={20} />
              </div>
              <div className="text-sm font-semibold text-slate-900">{action.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Estimates */}
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Estimates</h2>
            <button onClick={() => navigate('/app/estimates')} className="text-xs text-primary-600 font-medium hover:text-primary-700">View all</button>
          </div>
          {recentEstimates.length === 0 && !loading ? (
            <EmptyState icon={<FileText size={24} />} title="No estimates yet" description="Create your first estimate to get started." action={<button onClick={() => navigate('/app/estimates?new=true')} className="text-sm text-primary-600 font-medium">Create Estimate →</button>} />
          ) : (
            <div className="divide-y divide-slate-50">
              {recentEstimates.map((est) => (
                <div key={est.id} className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer" onClick={() => navigate(`/app/estimates/${est.id}/preview`)}>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{est.estimate_number}</div>
                      <div className="text-xs text-slate-500 truncate">{est.customer?.name || 'Unknown'} · {formatDate(est.estimate_date)}</div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-sm font-semibold text-slate-900">{formatCurrency(est.grand_total)}</span>
                      <Badge variant={statusBadgeVariant(est.status)}>{est.status}</Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Customers */}
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900">Recent Customers</h2>
            <button onClick={() => navigate('/app/customers')} className="text-xs text-primary-600 font-medium hover:text-primary-700">View all</button>
          </div>
          {recentCustomers.length === 0 && !loading ? (
            <EmptyState icon={<Users size={24} />} title="No customers yet" description="Add your first customer to get started." action={<button onClick={() => navigate('/app/customers?new=true')} className="text-sm text-primary-600 font-medium">Add Customer →</button>} />
          ) : (
            <div className="divide-y divide-slate-50">
              {recentCustomers.map((cust) => (
                <div key={cust.id} className="px-5 py-3.5 hover:bg-slate-50 cursor-pointer" onClick={() => navigate('/app/customers')}>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold shrink-0">
                      {cust.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-slate-900 truncate">{cust.name}</div>
                      <div className="text-xs text-slate-500 truncate">{cust.project_name || cust.phone || 'No project'}</div>
                    </div>
                    <span className="text-xs text-slate-400 flex items-center gap-1"><Clock size={12} /> {timeAgo(cust.created_at)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Button - Desktop */}
      <button
        onClick={() => navigate('/app/customers?new=true')}
        className="hidden lg:flex fixed bottom-8 right-8 w-14 h-14 rounded-2xl bg-primary-600 text-white items-center justify-center shadow-xl shadow-primary-600/30 hover:bg-primary-700 hover:scale-105 transition-all z-30"
      >
        <Plus size={24} />
      </button>
    </div>
  );
}

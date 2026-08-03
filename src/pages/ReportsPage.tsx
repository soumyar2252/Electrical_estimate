import { useEffect, useState } from 'react';
import { TrendingUp, FileText, Clock, CheckCircle2, Users, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { formatCurrency } from '@/lib/utils';

export function ReportsPage() {
  const { user } = useAuth();
  const [data, setData] = useState({
    monthlyRevenue: 0,
    totalEstimates: 0,
    pendingPayments: 0,
    completedProjects: 0,
    topCustomers: [] as { name: string; total: number }[],
    mostUsedItems: [] as { name: string; count: number }[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [payments, estimates, customers, items] = await Promise.all([
        supabase.from('payments').select('amount,status,payment_date').eq('user_id', user.id),
        supabase.from('estimates').select('status,grand_total,customer_id').eq('user_id', user.id),
        supabase.from('customers').select('id,name').eq('user_id', user.id),
        supabase.from('estimate_items').select('name,quantity,estimate:estimates(user_id)').eq('estimate.user_id', user.id),
      ]);

      const now = new Date();
      const monthlyRev = (payments.data || []).filter((p) => p.status === 'paid' && new Date(p.payment_date).getMonth() === now.getMonth()).reduce((s, p) => s + Number(p.amount), 0);
      const pending = (estimates.data || []).filter((e) => e.status === 'draft' || e.status === 'sent').length;
      const completed = (estimates.data || []).filter((e) => e.status === 'accepted').length;

      // Top customers by estimate value
      const custMap = new Map<string, number>();
      (estimates.data || []).forEach((e) => {
        if (e.customer_id) custMap.set(e.customer_id, (custMap.get(e.customer_id) || 0) + Number(e.grand_total));
      });
      const custList = (customers.data || []).map((c) => ({ name: c.name, total: custMap.get(c.id) || 0 })).sort((a, b) => b.total - a.total).slice(0, 5);

      // Most used items
      const itemMap = new Map<string, number>();
      (items.data || []).forEach((i) => {
        itemMap.set(i.name, (itemMap.get(i.name) || 0) + Number(i.quantity));
      });
      const itemList = Array.from(itemMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count).slice(0, 5);

      setData({ monthlyRevenue: monthlyRev, totalEstimates: estimates.data?.length || 0, pendingPayments: pending, completedProjects: completed, topCustomers: custList, mostUsedItems: itemList });
      setLoading(false);
    })();
  }, [user]);

  const cards = [
    { label: 'Monthly Revenue', value: formatCurrency(data.monthlyRevenue), icon: TrendingUp, color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Total Estimates', value: data.totalEstimates, icon: FileText, color: 'bg-primary-50 text-primary-600' },
    { label: 'Pending Payments', value: data.pendingPayments, icon: Clock, color: 'bg-amber-50 text-amber-600' },
    { label: 'Completed Projects', value: data.completedProjects, icon: CheckCircle2, color: 'bg-secondary-50 text-secondary-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports</h1>
        <p className="text-sm text-slate-500 mt-0.5">Business insights and analytics</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-2xl card-shadow border border-slate-100 p-4 lg:p-5">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${card.color}`}><card.icon size={20} /></div>
            <div className="text-2xl font-bold text-slate-900">{loading ? '—' : card.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{card.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Top Customers */}
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Users size={18} className="text-primary-600" />
            <h2 className="text-sm font-semibold text-slate-900">Top Customers</h2>
          </div>
          {data.topCustomers.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">No data yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {data.topCustomers.map((c, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    <span className="text-sm font-medium text-slate-900">{c.name}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900">{formatCurrency(c.total)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Most Used Items */}
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
            <Package size={18} className="text-secondary-600" />
            <h2 className="text-sm font-semibold text-slate-900">Most Used Items</h2>
          </div>
          {data.mostUsedItems.length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-slate-400">No data yet</div>
          ) : (
            <div className="divide-y divide-slate-50">
              {data.mostUsedItems.map((item, i) => (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-7 h-7 rounded-full bg-secondary-100 text-secondary-700 flex items-center justify-center text-xs font-bold">{i + 1}</div>
                    <span className="text-sm font-medium text-slate-900">{item.name}</span>
                  </div>
                  <span className="text-sm text-slate-500">{item.count} units</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

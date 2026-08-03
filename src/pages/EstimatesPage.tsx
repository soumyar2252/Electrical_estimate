import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, FileText, Search, Eye, Pencil, Trash2, Share2, Receipt } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Customer, Estimate } from '@/lib/types';
import { formatCurrency, formatDate, generateNumber } from '@/lib/utils';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export function EstimatesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [deleteTarget, setDeleteTarget] = useState<Estimate | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [estData, custData] = await Promise.all([
        supabase.from('estimates').select('*, customer:customers(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setEstimates(estData.data as Estimate[] || []);
      setCustomers(custData.data as Customer[] || []);
      setLoading(false);

      if (searchParams.get('new') === 'true') {
        const custId = searchParams.get('customer');
        if (custId) {
          setSelectedCustomer(custId);
        }
        setShowNew(true);
        searchParams.delete('new');
        searchParams.delete('customer');
        setSearchParams(searchParams, { replace: true });
      }
    })();
  }, [user, searchParams, setSearchParams]);

  const handleCreateEstimate = async () => {
    if (!user || !selectedCustomer) return;
    const count = estimates.length;
    const estimateNumber = generateNumber('EST', count);
    const { data, error } = await supabase.from('estimates').insert({
      user_id: user.id,
      customer_id: selectedCustomer,
      estimate_number: estimateNumber,
      estimate_date: new Date().toISOString().split('T')[0],
      status: 'draft',
    }).select().single();
    if (error) return;
    navigate(`/app/estimates/${data.id}/build`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('estimates').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    setEstimates(estimates.filter((e) => e.id !== deleteTarget.id));
  };

  const filtered = estimates.filter((e) =>
    e.estimate_number.toLowerCase().includes(search.toLowerCase()) ||
    e.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Estimates</h1>
          <p className="text-sm text-slate-500 mt-0.5">{estimates.length} total estimates</p>
        </div>
        <Button onClick={() => { setSelectedCustomer(''); setShowNew(true); }}><Plus size={18} /> Create Estimate</Button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search estimates..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl card-shadow border border-slate-100">
          <EmptyState
            icon={<FileText size={24} />}
            title="No estimates yet"
            description="Create your first estimate by selecting a customer and adding items."
            action={<Button onClick={() => { setSelectedCustomer(''); setShowNew(true); }}><Plus size={18} /> Create Estimate</Button>}
          />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((est) => (
            <div key={est.id} className="bg-white rounded-2xl card-shadow border border-slate-100 p-5 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center">
                  <FileText size={20} />
                </div>
                <Badge variant={statusBadgeVariant(est.status)}>{est.status}</Badge>
              </div>
              <div className="text-sm font-bold text-slate-900">{est.estimate_number}</div>
              <div className="text-sm text-slate-500 mb-1">{est.customer?.name || 'Unknown customer'}</div>
              <div className="text-xs text-slate-400 mb-3">{formatDate(est.estimate_date)}</div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="text-lg font-bold text-slate-900">{formatCurrency(est.grand_total)}</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/app/estimates/${est.id}/preview`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => navigate(`/app/estimates/${est.id}/build`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit"><Pencil size={16} /></button>
                  <button onClick={() => setDeleteTarget(est)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* New Estimate Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="Create New Estimate" size="sm">
        <div className="p-6 space-y-4">
          {customers.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-4">You need to add a customer first before creating an estimate.</p>
              <Button onClick={() => { setShowNew(false); navigate('/app/customers?new=true'); }}><Plus size={16} /> Add Customer</Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Select Customer</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
                >
                  <option value="">Choose a customer...</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.name} — {c.project_name || c.phone}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreateEstimate} disabled={!selectedCustomer}>Start Building</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Estimate?" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.estimate_number}</span>? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

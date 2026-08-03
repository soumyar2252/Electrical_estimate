import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Receipt, Search, Eye, Trash2, FileText } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Invoice, Customer, Estimate } from '@/lib/types';
import { formatCurrency, formatDate, generateNumber } from '@/lib/utils';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export function InvoicesPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [estimates, setEstimates] = useState<Estimate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Invoice | null>(null);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const [invData, custData, estData] = await Promise.all([
        supabase.from('invoices').select('*, customer:customers(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('estimates').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setInvoices(invData.data as Invoice[] || []);
      setCustomers(custData.data as Customer[] || []);
      setEstimates(estData.data as Estimate[] || []);
      setLoading(false);

      if (searchParams.get('new') === 'true') {
        setShowNew(true);
        searchParams.delete('new');
        setSearchParams(searchParams, { replace: true });
      }
    })();
  }, [user, searchParams, setSearchParams]);

  const handleCreateInvoice = async () => {
    if (!user || !selectedEstimate) return;
    const est = estimates.find((e) => e.id === selectedEstimate);
    if (!est) return;
    const count = invoices.length;
    const invoiceNumber = generateNumber('INV', count);
    const { data, error } = await supabase.from('invoices').insert({
      user_id: user.id,
      estimate_id: est.id,
      customer_id: est.customer_id,
      invoice_number: invoiceNumber,
      invoice_date: new Date().toISOString().split('T')[0],
      status: 'unpaid',
      subtotal: est.subtotal, discount: est.discount, gst: est.gst,
      labour: est.labour, transport: est.transport, grand_total: est.grand_total,
      advance: est.advance, balance: est.balance, notes: est.notes, terms: est.terms,
    }).select().single();
    if (data) navigate(`/app/invoices/${data.id}/preview`);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('invoices').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    setInvoices(invoices.filter((i) => i.id !== deleteTarget.id));
  };

  const filtered = invoices.filter((i) =>
    i.invoice_number.toLowerCase().includes(search.toLowerCase()) ||
    i.customer?.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Invoices</h1>
          <p className="text-sm text-slate-500 mt-0.5">{invoices.length} total invoices</p>
        </div>
        <Button onClick={() => setShowNew(true)}><Plus size={18} /> Generate Invoice</Button>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search invoices..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl card-shadow border border-slate-100">
          <EmptyState icon={<Receipt size={24} />} title="No invoices yet" description="Generate an invoice from an existing estimate." action={<Button onClick={() => setShowNew(true)}><Plus size={18} /> Generate Invoice</Button>} />
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((inv) => (
            <div key={inv.id} className="bg-white rounded-2xl card-shadow border border-slate-100 p-5 hover:border-primary-200 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center"><Receipt size={20} /></div>
                <Badge variant={statusBadgeVariant(inv.status)}>{inv.status}</Badge>
              </div>
              <div className="text-sm font-bold text-slate-900">{inv.invoice_number}</div>
              <div className="text-sm text-slate-500 mb-1">{inv.customer?.name || 'Unknown'}</div>
              <div className="text-xs text-slate-400 mb-3">{formatDate(inv.invoice_date)}</div>
              <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="text-lg font-bold text-slate-900">{formatCurrency(inv.grand_total)}</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => navigate(`/app/invoices/${inv.id}/preview`)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Preview"><Eye size={16} /></button>
                  <button onClick={() => setDeleteTarget(inv)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={16} /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={showNew} onClose={() => setShowNew(false)} title="Generate Invoice" size="sm">
        <div className="p-6 space-y-4">
          {estimates.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-slate-500 mb-4">You need to create an estimate first before generating an invoice.</p>
              <Button onClick={() => { setShowNew(false); navigate('/app/estimates?new=true'); }}><Plus size={16} /> Create Estimate</Button>
            </div>
          ) : (
            <>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Select Estimate</label>
                <select value={selectedEstimate} onChange={(e) => setSelectedEstimate(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all">
                  <option value="">Choose an estimate...</option>
                  {estimates.map((e) => <option key={e.id} value={e.id}>{e.estimate_number} — {formatCurrency(e.grand_total)}</option>)}
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setShowNew(false)}>Cancel</Button>
                <Button className="flex-1" onClick={handleCreateInvoice} disabled={!selectedEstimate}>Generate</Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Invoice?" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Delete <span className="font-semibold text-slate-900">{deleteTarget?.invoice_number}</span>? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

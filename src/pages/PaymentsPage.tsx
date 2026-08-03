import { useEffect, useState } from 'react';
import { Plus, CreditCard, Search, Trash2, TrendingUp, Clock, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Payment, Customer, Invoice, PaymentMethod, PaymentStatus } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Payment | null>(null);
  const [form, setForm] = useState({ customer_id: '', invoice_id: '', amount: 0, method: 'Cash' as PaymentMethod, status: 'pending' as PaymentStatus, payment_date: new Date().toISOString().split('T')[0], notes: '' });

  const load = async () => {
    if (!user) return;
    const [payData, custData, invData] = await Promise.all([
      supabase.from('payments').select('*, customer:customers(*), invoice:invoices(*)').eq('user_id', user.id).order('created_at', { ascending: false }),
      supabase.from('customers').select('*').eq('user_id', user.id),
      supabase.from('invoices').select('*').eq('user_id', user.id),
    ]);
    setPayments(payData.data as Payment[] || []);
    setCustomers(custData.data as Customer[] || []);
    setInvoices(invData.data as Invoice[] || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [user]);

  const handleSave = async () => {
    if (!user || !form.customer_id || !form.amount) return;
    await supabase.from('payments').insert({
      user_id: user.id,
      customer_id: form.customer_id,
      invoice_id: form.invoice_id || null,
      amount: form.amount,
      method: form.method,
      status: form.status,
      payment_date: form.payment_date,
      notes: form.notes,
    });
    setShowForm(false);
    setForm({ customer_id: '', invoice_id: '', amount: 0, method: 'Cash', status: 'pending', payment_date: new Date().toISOString().split('T')[0], notes: '' });
    load();
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('payments').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    load();
  };

  const totalReceived = payments.filter((p) => p.status === 'paid').reduce((sum, p) => sum + Number(p.amount), 0);
  const totalPending = payments.filter((p) => p.status === 'pending' || p.status === 'partial').reduce((sum, p) => sum + Number(p.amount), 0);
  const paidCount = payments.filter((p) => p.status === 'paid').length;

  const filtered = payments.filter((p) =>
    p.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.invoice?.invoice_number?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-sm text-slate-500 mt-0.5">Track payments and outstanding balances</p>
        </div>
        <Button onClick={() => setShowForm(true)}><Plus size={18} /> Record Payment</Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-4">
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2"><TrendingUp size={18} /></div>
          <div className="text-lg font-bold text-slate-900">{formatCurrency(totalReceived)}</div>
          <div className="text-xs text-slate-500">Total Received</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-4">
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-2"><Clock size={18} /></div>
          <div className="text-lg font-bold text-slate-900">{formatCurrency(totalPending)}</div>
          <div className="text-xs text-slate-500">Pending</div>
        </div>
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-4">
          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-2"><CheckCircle2 size={18} /></div>
          <div className="text-lg font-bold text-slate-900">{paidCount}</div>
          <div className="text-xs text-slate-500">Paid Records</div>
        </div>
      </div>

      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input type="text" placeholder="Search payments..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all" />
      </div>

      {filtered.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl card-shadow border border-slate-100">
          <EmptyState icon={<CreditCard size={24} />} title="No payments recorded" description="Record your first payment to start tracking." action={<Button onClick={() => setShowForm(true)}><Plus size={18} /> Record Payment</Button>} />
        </div>
      ) : (
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
          <div className="divide-y divide-slate-50">
            {filtered.map((p) => (
              <div key={p.id} className="px-5 py-4 hover:bg-slate-50/50 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0"><CreditCard size={18} /></div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.customer?.name || 'Unknown'}</div>
                    <div className="text-xs text-slate-500">{p.method} · {formatDate(p.payment_date)} {p.invoice?.invoice_number ? `· ${p.invoice.invoice_number}` : ''}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div className="text-sm font-bold text-slate-900">{formatCurrency(p.amount)}</div>
                    <Badge variant={statusBadgeVariant(p.status)}>{p.status}</Badge>
                  </div>
                  <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Payment Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title="Record Payment" size="md">
        <div className="p-6 space-y-4">
          <Select label="Customer *" value={form.customer_id} onChange={(e) => setForm({ ...form, customer_id: e.target.value })}>
            <option value="">Select customer...</option>
            {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </Select>
          <Select label="Invoice (optional)" value={form.invoice_id} onChange={(e) => setForm({ ...form, invoice_id: e.target.value })}>
            <option value="">No invoice linked</option>
            {invoices.filter((i) => i.customer_id === form.customer_id).map((i) => <option key={i.id} value={i.id}>{i.invoice_number} — {formatCurrency(i.balance)}</option>)}
          </Select>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Amount (₹)" type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })} />
            <Input label="Payment Date" type="date" value={form.payment_date} onChange={(e) => setForm({ ...form, payment_date: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Payment Method" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value as PaymentMethod })}>
              {(['Cash', 'UPI', 'Bank', 'Cheque'] as PaymentMethod[]).map((m) => <option key={m} value={m}>{m}</option>)}
            </Select>
            <Select label="Payment Status" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as PaymentStatus })}>
              {(['pending', 'paid', 'partial'] as PaymentStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} placeholder="Payment notes..." />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!form.customer_id || !form.amount}>Save Payment</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Payment?" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Delete this payment record? This cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Share2, Mail, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Invoice, Customer, EstimateItem, Profile } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function InvoicePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: inv } = await supabase.from('invoices').select('*, customer:customers(*)').eq('id', id).single();
      if (inv) {
        setInvoice(inv as Invoice);
        setCustomer(inv.customer as Customer);
        if (inv.estimate_id) {
          const { data: itemData } = await supabase.from('estimate_items').select('*').eq('estimate_id', inv.estimate_id).order('created_at', { ascending: true });
          setItems(itemData as EstimateItem[] || []);
        }
      }
      setLoading(false);
    })();
  }, [id]);

  const handlePrint = () => window.print();
  const handleWhatsApp = () => {
    if (!customer) return;
    const msg = `Hello ${customer.name}\n\nYour invoice ${invoice?.invoice_number} is ready.\nAmount: ${formatCurrency(invoice?.grand_total || 0)}\n\nThank you for your business.`;
    window.open(`https://wa.me/${customer.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };
  const handleEmail = () => {
    if (!customer?.email) return;
    const subject = `Invoice ${invoice?.invoice_number}`;
    const body = `Hello ${customer.name},\n\nYour invoice is ready.\nAmount: ${formatCurrency(invoice?.grand_total || 0)}\n\nThank you.`;
    window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/invoices')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600"><ArrowLeft size={20} /></button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Invoice Preview</h1>
            <p className="text-xs text-slate-500">{invoice?.invoice_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Share2 size={16} /> Export</Button>
          <Button size="sm" onClick={handlePrint}><Printer size={16} /> Print</Button>
        </div>
      </div>

      {showExport && (
        <div className="fixed inset-0 z-50 no-print" onClick={() => setShowExport(false)}>
          <div className="absolute inset-0 bg-slate-900/20" />
          <div className="absolute top-20 right-8 w-56 bg-white rounded-2xl card-shadow-lg border border-slate-100 animate-scale-in py-1">
            <button onClick={() => { setShowExport(false); handlePrint(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Download size={16} /> Download PDF</button>
            <button onClick={() => { setShowExport(false); handlePrint(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Printer size={16} /> Print</button>
            <button onClick={() => { setShowExport(false); handleWhatsApp(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Share2 size={16} /> Share on WhatsApp</button>
            <button onClick={() => { setShowExport(false); handleEmail(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Mail size={16} /> Send Email</button>
          </div>
        </div>
      )}

      <div className="print-area bg-white rounded-2xl card-shadow border border-slate-100 p-6 lg:p-10 max-w-4xl mx-auto">
        <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center"><Zap size={24} className="text-white" /></div>
            <div>
              <div className="text-lg font-bold text-slate-900">{profile?.business_name || profile?.full_name || 'Electrical Estimate Pro'}</div>
              {profile?.address && <div className="text-xs text-slate-500 max-w-xs">{profile.address}</div>}
              {profile?.phone && <div className="text-xs text-slate-500">{profile.phone}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">INVOICE</div>
            <div className="text-sm text-slate-500 mt-1">{invoice?.invoice_number}</div>
            <div className="text-xs text-slate-400">{formatDate(invoice?.invoice_date || '')}</div>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 py-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Bill To</div>
            <div className="text-base font-bold text-slate-900">{customer?.name}</div>
            {customer?.address && <div className="text-sm text-slate-500">{customer.address}</div>}
            {customer?.phone && <div className="text-sm text-slate-500">{customer.phone}</div>}
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Project</div>
            <div className="text-sm text-slate-700">{customer?.project_name || '—'}</div>
          </div>
        </div>

        <table className="w-full mb-6">
          <thead>
            <tr className="bg-slate-50">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 rounded-l-xl">#</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Item Name</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Qty</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Rate</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3 rounded-r-xl">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-50">
                <td className="px-4 py-3 text-sm text-slate-400">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.quantity} {item.unit}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-medium text-slate-900">{formatCurrency(invoice?.subtotal || 0)}</span></div>
            {invoice?.discount ? <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="font-medium text-slate-900">{formatCurrency(invoice.discount)}</span></div> : null}
            {invoice?.gst ? <div className="flex justify-between text-sm"><span className="text-slate-500">GST ({invoice.gst}%)</span><span className="font-medium text-slate-900">{formatCurrency((invoice.subtotal - invoice.discount) * invoice.gst / 100)}</span></div> : null}
            {invoice?.labour ? <div className="flex justify-between text-sm"><span className="text-slate-500">Labour</span><span className="font-medium text-slate-900">{formatCurrency(invoice.labour)}</span></div> : null}
            {invoice?.transport ? <div className="flex justify-between text-sm"><span className="text-slate-500">Transport</span><span className="font-medium text-slate-900">{formatCurrency(invoice.transport)}</span></div> : null}
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Grand Total</span><span className="text-lg font-bold text-primary-600">{formatCurrency(invoice?.grand_total || 0)}</span></div>
            {invoice?.advance ? <div className="flex justify-between text-sm"><span className="text-slate-500">Advance Received</span><span className="font-medium text-slate-900">{formatCurrency(invoice.advance)}</span></div> : null}
            <div className="flex justify-between bg-secondary-50 rounded-xl px-3 py-2"><span className="font-semibold text-secondary-700">Balance Due</span><span className="font-bold text-secondary-700">{formatCurrency(invoice?.balance || 0)}</span></div>
          </div>
        </div>

        <div className="flex justify-end pt-12">
          <div className="text-center"><div className="w-48 border-t border-slate-300 pt-2 text-sm text-slate-500">Authorized Signature</div></div>
        </div>

        <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-50">
          Generated by Electrical Estimate Pro · {profile?.business_name || ''}
        </div>
      </div>
    </div>
  );
}

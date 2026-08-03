import { useEffect, useState, useRef } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Download, Printer, Share2, Mail, Save, Receipt, Zap } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Estimate, EstimateItem, Customer, Profile } from '@/lib/types';
import { formatCurrency, formatDate, generateNumber } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function EstimatePreviewPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showExport, setShowExport] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;
    (async () => {
      const { data: est } = await supabase.from('estimates').select('*, customer:customers(*)').eq('id', id).single();
      if (est) {
        setEstimate(est as Estimate);
        setCustomer(est.customer as Customer);
      }
      const { data: itemData } = await supabase.from('estimate_items').select('*').eq('estimate_id', id).order('created_at', { ascending: true });
      setItems(itemData as EstimateItem[] || []);
      setLoading(false);
    })();
  }, [id]);

  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    if (!customer) return;
    const msg = `Hello ${customer.name}\n\nYour electrical wiring estimate is ready.\nEstimate Number: ${estimate?.estimate_number}\nGrand Total: ${formatCurrency(estimate?.grand_total || 0)}\n\nPlease check the attached estimate.\n\nThank you.`;
    window.open(`https://wa.me/${customer.phone?.replace(/\D/g, '') || ''}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  const handleEmail = () => {
    if (!customer?.email) return;
    const subject = `Estimate ${estimate?.estimate_number} from ${profile?.business_name || profile?.full_name || 'Electrical Estimate Pro'}`;
    const body = `Hello ${customer.name},\n\nYour electrical wiring estimate is ready.\nEstimate Number: ${estimate?.estimate_number}\nGrand Total: ${formatCurrency(estimate?.grand_total || 0)}\n\nPlease check the attached estimate.\n\nThank you.`;
    window.location.href = `mailto:${customer.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleConvertToInvoice = async () => {
    if (!id || !user || !estimate) return;
    const count = await supabase.from('invoices').select('*', { count: 'exact', head: true }).eq('user_id', user.id);
    const invoiceNumber = generateNumber('INV', count.count || 0);
    const { data, error } = await supabase.from('invoices').insert({
      user_id: user.id,
      estimate_id: id,
      customer_id: estimate.customer_id,
      invoice_number: invoiceNumber,
      invoice_date: new Date().toISOString().split('T')[0],
      status: 'unpaid',
      subtotal: estimate.subtotal, discount: estimate.discount, gst: estimate.gst,
      labour: estimate.labour, transport: estimate.transport, grand_total: estimate.grand_total,
      advance: estimate.advance, balance: estimate.balance, notes: estimate.notes, terms: estimate.terms,
    }).select().single();
    if (data) navigate(`/app/invoices/${data.id}/preview`);
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header - no print */}
      <div className="flex items-center justify-between flex-wrap gap-3 no-print">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(`/app/estimates/${id}/build`)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Estimate Preview</h1>
            <p className="text-xs text-slate-500">{estimate?.estimate_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={handleConvertToInvoice}><Receipt size={16} /> Convert to Invoice</Button>
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}><Share2 size={16} /> Export</Button>
          <Button size="sm" onClick={handlePrint}><Printer size={16} /> Print</Button>
        </div>
      </div>

      {/* Export dropdown */}
      {showExport && (
        <div className="fixed inset-0 z-50 no-print" onClick={() => setShowExport(false)}>
          <div className="absolute inset-0 bg-slate-900/20" />
          <div className="absolute top-20 right-8 w-56 bg-white rounded-2xl card-shadow-lg border border-slate-100 animate-scale-in py-1">
            <button onClick={() => { setShowExport(false); handleDownloadPDF(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Download size={16} /> Download PDF</button>
            <button onClick={() => { setShowExport(false); handlePrint(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Printer size={16} /> Print</button>
            <button onClick={() => { setShowExport(false); handleWhatsApp(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Share2 size={16} /> Share on WhatsApp</button>
            <button onClick={() => { setShowExport(false); handleEmail(); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Mail size={16} /> Send Email</button>
            <button onClick={() => { setShowExport(false); navigate('/app/estimates'); }} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50"><Save size={16} /> Save Draft</button>
          </div>
        </div>
      )}

      {/* Preview Document */}
      <div className="print-area bg-white rounded-2xl card-shadow border border-slate-100 p-6 lg:p-10 max-w-4xl mx-auto" ref={printRef}>
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4 pb-6 border-b-2 border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-600 flex items-center justify-center">
              <Zap size={24} className="text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-slate-900">{profile?.business_name || profile?.full_name || 'Electrical Estimate Pro'}</div>
              {profile?.address && <div className="text-xs text-slate-500 max-w-xs">{profile.address}</div>}
              {profile?.phone && <div className="text-xs text-slate-500">{profile.phone}</div>}
            </div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-slate-900">ESTIMATE</div>
            <div className="text-sm text-slate-500 mt-1">{estimate?.estimate_number}</div>
            <div className="text-xs text-slate-400">{formatDate(estimate?.estimate_date || '')}</div>
          </div>
        </div>

        {/* Customer & Business info */}
        <div className="grid sm:grid-cols-2 gap-6 py-6">
          <div>
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Estimate To</div>
            <div className="text-base font-bold text-slate-900">{customer?.name}</div>
            {customer?.address && <div className="text-sm text-slate-500">{customer.address}</div>}
            {customer?.phone && <div className="text-sm text-slate-500">{customer.phone}</div>}
            {customer?.email && <div className="text-sm text-slate-500">{customer.email}</div>}
          </div>
          <div className="sm:text-right">
            <div className="text-xs font-semibold text-slate-400 uppercase mb-2">Project Details</div>
            <div className="text-sm text-slate-700">{customer?.project_name || '—'}</div>
            <div className="text-sm text-slate-500">{customer?.project_type || '—'}</div>
            {customer?.site_address && <div className="text-sm text-slate-500 mt-1">{customer.site_address}</div>}
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-6">
          <thead>
            <tr className="bg-slate-50 rounded-xl">
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 rounded-l-xl">#</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3">Item Name</th>
              <th className="text-center text-xs font-semibold text-slate-500 uppercase px-4 py-3">Qty</th>
              <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-3 hidden sm:table-cell">Unit</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3">Rate</th>
              <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-3 rounded-r-xl">Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} className="border-b border-slate-50">
                <td className="px-4 py-3 text-sm text-slate-400">{idx + 1}</td>
                <td className="px-4 py-3 text-sm font-medium text-slate-900">{item.name}<div className="text-xs text-slate-400 sm:hidden">{item.category}</div></td>
                <td className="px-4 py-3 text-sm text-slate-600 text-center">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-slate-500 hidden sm:table-cell">{item.unit}</td>
                <td className="px-4 py-3 text-sm text-slate-600 text-right">{formatCurrency(item.rate)}</td>
                <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">{formatCurrency(item.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end mb-6">
          <div className="w-full sm:w-72 space-y-2">
            <div className="flex justify-between text-sm"><span className="text-slate-500">Subtotal</span><span className="font-medium text-slate-900">{formatCurrency(estimate?.subtotal || 0)}</span></div>
            {estimate?.discount ? <div className="flex justify-between text-sm"><span className="text-slate-500">Discount</span><span className="font-medium text-slate-900">{formatCurrency(estimate.discount)}</span></div> : null}
            {estimate?.gst ? <div className="flex justify-between text-sm"><span className="text-slate-500">GST ({estimate.gst}%)</span><span className="font-medium text-slate-900">{formatCurrency((estimate.subtotal - estimate.discount) * estimate.gst / 100)}</span></div> : null}
            {estimate?.labour ? <div className="flex justify-between text-sm"><span className="text-slate-500">Labour</span><span className="font-medium text-slate-900">{formatCurrency(estimate.labour)}</span></div> : null}
            {estimate?.transport ? <div className="flex justify-between text-sm"><span className="text-slate-500">Transport</span><span className="font-medium text-slate-900">{formatCurrency(estimate.transport)}</span></div> : null}
            <div className="flex justify-between border-t border-slate-200 pt-2"><span className="font-bold text-slate-900">Grand Total</span><span className="text-lg font-bold text-primary-600">{formatCurrency(estimate?.grand_total || 0)}</span></div>
            {estimate?.advance ? <div className="flex justify-between text-sm"><span className="text-slate-500">Advance Received</span><span className="font-medium text-slate-900">{formatCurrency(estimate.advance)}</span></div> : null}
            <div className="flex justify-between bg-secondary-50 rounded-xl px-3 py-2"><span className="font-semibold text-secondary-700">Balance</span><span className="font-bold text-secondary-700">{formatCurrency(estimate?.balance || 0)}</span></div>
          </div>
        </div>

        {/* Notes & Terms */}
        {(estimate?.notes || estimate?.terms) && (
          <div className="border-t border-slate-100 pt-6 grid sm:grid-cols-2 gap-6">
            {estimate?.notes && <div><div className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Notes</div><div className="text-sm text-slate-600 whitespace-pre-line">{estimate.notes}</div></div>}
            {estimate?.terms && <div><div className="text-xs font-semibold text-slate-400 uppercase mb-1.5">Terms & Conditions</div><div className="text-sm text-slate-600 whitespace-pre-line">{estimate.terms}</div></div>}
          </div>
        )}

        {/* Signature */}
        <div className="flex justify-end pt-12">
          <div className="text-center">
            <div className="w-48 border-t border-slate-300 pt-2 text-sm text-slate-500">Authorized Signature</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-slate-400 mt-8 pt-4 border-t border-slate-50">
          This estimate was generated by Electrical Estimate Pro · {profile?.business_name || ''}
        </div>
      </div>
    </div>
  );
}

import { Zap, Phone, Mail, MessageCircle, BookOpen, ChevronRight } from 'lucide-react';

export function HelpPage() {
  const faqs = [
    { q: 'How do I create my first estimate?', a: 'Go to Customers, add a customer, then click Create Estimate. Use the Add Item button to browse the product catalog and add items to your estimate.' },
    { q: 'Can I add custom items not in the catalog?', a: 'Yes! In the item drawer, click "Other (Custom Item)" to add any item with your own name, unit, quantity, and rate. You can also save it to your product catalog for future use.' },
    { q: 'How do I share an estimate with my customer?', a: 'Open the estimate preview and click Export. You can download a PDF, print it, share via WhatsApp, or send by email.' },
    { q: 'How do I convert an estimate to an invoice?', a: 'Open the estimate preview and click "Convert to Invoice". An invoice will be automatically generated with a new invoice number.' },
    { q: 'Can I track payments?', a: 'Yes, go to the Payments page to record payments received, track pending amounts, and see your total revenue.' },
    { q: 'Is my data secure?', a: 'Your data is stored securely and only accessible by you. We use industry-standard encryption and security practices.' },
  ];

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Help & Support</h1>
        <p className="text-sm text-slate-500 mt-0.5">Get answers to common questions</p>
      </div>

      {/* Contact Cards */}
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          { icon: Phone, label: 'Call Us', value: '+91 98765 43210', color: 'bg-primary-50 text-primary-600' },
          { icon: Mail, label: 'Email Us', value: 'support@estimpro.in', color: 'bg-secondary-50 text-secondary-600' },
          { icon: MessageCircle, label: 'WhatsApp', value: 'Chat with us', color: 'bg-emerald-50 text-emerald-600' },
        ].map((c) => (
          <div key={c.label} className="bg-white rounded-2xl card-shadow border border-slate-100 p-5 hover:border-primary-200 transition-all cursor-pointer">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${c.color}`}><c.icon size={20} /></div>
            <div className="text-sm font-semibold text-slate-900">{c.label}</div>
            <div className="text-xs text-slate-500 mt-0.5">{c.value}</div>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
          <BookOpen size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-slate-900">Frequently Asked Questions</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {faqs.map((faq, i) => (
            <details key={i} className="group">
              <summary className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-slate-50/50 list-none">
                <span className="text-sm font-medium text-slate-900">{faq.q}</span>
                <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform" />
              </summary>
              <div className="px-5 pb-4 text-sm text-slate-600">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* About */}
      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center"><Zap size={16} /></div>
          <span className="text-base font-bold">Electrical Estimate Pro</span>
        </div>
        <p className="text-sm text-primary-100 mb-3">The modern estimation platform for Indian electricians. Go paperless, get professional, get paid faster.</p>
        <div className="text-xs text-primary-200">Version 1.0.0 · Made in India</div>
      </div>
    </div>
  );
}

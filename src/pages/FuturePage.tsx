import { Sparkles, Mic, ScanText, BarChart3, Users, Package, ShoppingBag, Target, Lock } from 'lucide-react';

export function FuturePage() {
  const features = [
    { icon: Sparkles, title: 'AI Estimate Assistant', desc: 'Get smart suggestions for materials and quantities based on project type and size.', color: 'bg-primary-50 text-primary-600' },
    { icon: Mic, title: 'Voice Estimate', desc: 'Create estimates by speaking naturally. Just describe the project and we build the estimate.', color: 'bg-secondary-50 text-secondary-600' },
    { icon: ScanText, title: 'OCR from Handwritten Notes', desc: 'Scan your paper estimates and convert them into digital estimates automatically.', color: 'bg-emerald-50 text-emerald-600' },
    { icon: BarChart3, title: 'Material Price Comparison', desc: 'Compare prices across suppliers to get the best deals on materials.', color: 'bg-amber-50 text-amber-600' },
    { icon: Users, title: 'Team Members', desc: 'Add team members and collaborate on estimates and projects together.', color: 'bg-purple-50 text-purple-600' },
    { icon: Package, title: 'Inventory Management', desc: 'Track your stock levels and get alerts when materials run low.', color: 'bg-rose-50 text-rose-600' },
    { icon: ShoppingBag, title: 'Marketplace', desc: 'Buy materials directly from suppliers at competitive prices.', color: 'bg-cyan-50 text-cyan-600' },
    { icon: Target, title: 'Lead Management', desc: 'Track potential customers and convert leads into estimates and invoices.', color: 'bg-indigo-50 text-indigo-600' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Coming Soon</h1>
        <p className="text-sm text-slate-500 mt-0.5">Exciting features we're building for the future</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((f) => (
          <div key={f.title} className="relative bg-white rounded-2xl card-shadow border border-slate-100 p-5 overflow-hidden">
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                <Lock size={10} /> Soon
              </span>
            </div>
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-3 ${f.color}`}>
              <f.icon size={22} />
            </div>
            <div className="text-sm font-bold text-slate-900 mb-1">{f.title}</div>
            <div className="text-xs text-slate-500 leading-relaxed">{f.desc}</div>
          </div>
        ))}
      </div>

      <div className="bg-gradient-to-br from-primary-600 to-primary-800 rounded-2xl p-6 text-white text-center">
        <h2 className="text-lg font-bold mb-1">Want early access?</h2>
        <p className="text-sm text-primary-100 mb-4">Upgrade to Pro and be the first to try these features when they launch.</p>
        <button className="bg-white text-primary-700 text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-primary-50 transition-colors">Upgrade to Pro</button>
      </div>
    </div>
  );
}

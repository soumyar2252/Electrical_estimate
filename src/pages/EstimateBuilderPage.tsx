import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2, Pencil, X, Search, Eye, Save, Package } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Customer, Estimate, EstimateItem, Product, CATEGORIES, UNITS, ProductCategory, Unit } from '@/lib/types';
import { DEFAULT_PRODUCTS } from '@/lib/catalog';
import { formatCurrency, classNames } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export function EstimateBuilderPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [estimate, setEstimate] = useState<Estimate | null>(null);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [items, setItems] = useState<EstimateItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState<ProductCategory>('Switches');
  const [productSearch, setProductSearch] = useState('');
  const [showCustom, setShowCustom] = useState(false);
  const [editingItem, setEditingItem] = useState<EstimateItem | null>(null);

  const [summary, setSummary] = useState({
    subtotal: 0, discount: 0, gst: 0, labour: 0, transport: 0, grandTotal: 0, advance: 0, balance: 0,
  });
  const [notes, setNotes] = useState('');
  const [terms, setTerms] = useState('1. Goods once sold will not be taken back.\n2. Payment should be made within 15 days.\n3. Estimate valid for 30 days.');
  const [showSummaryEdit, setShowSummaryEdit] = useState(false);

  const loadEstimate = useCallback(async () => {
    if (!id) return;
    const { data: est } = await supabase.from('estimates').select('*, customer:customers(*)').eq('id', id).single();
    if (!est) return;
    setEstimate(est as Estimate);
    setCustomer(est.customer as Customer);
    setNotes(est.notes || '');
    setTerms(est.terms || '1. Goods once sold will not be taken back.\n2. Payment should be made within 15 days.\n3. Estimate valid for 30 days.');
    setSummary({
      subtotal: Number(est.subtotal) || 0, discount: Number(est.discount) || 0, gst: Number(est.gst) || 0,
      labour: Number(est.labour) || 0, transport: Number(est.transport) || 0, grandTotal: Number(est.grand_total) || 0,
      advance: Number(est.advance) || 0, balance: Number(est.balance) || 0,
    });

    const { data: itemData } = await supabase.from('estimate_items').select('*').eq('estimate_id', id).order('created_at', { ascending: true });
    setItems(itemData as EstimateItem[] || []);

    if (user) {
      const { data: prodData } = await supabase.from('products').select('*').eq('user_id', user.id).order('name');
      setProducts(prodData as Product[] || []);
    }
    setLoading(false);
  }, [id, user]);

  useEffect(() => { loadEstimate(); }, [loadEstimate]);

  // Recalculate totals when items or summary inputs change
  const recalc = useCallback((itemsList: EstimateItem[], s: typeof summary) => {
    const subtotal = itemsList.reduce((sum, i) => sum + Number(i.amount), 0);
    const afterDiscount = subtotal - s.discount;
    const withGst = afterDiscount + (afterDiscount * s.gst / 100);
    const grandTotal = withGst + s.labour + s.transport;
    const balance = grandTotal - s.advance;
    return { ...s, subtotal, grandTotal, balance };
  }, []);

  useEffect(() => {
    setSummary((prev) => recalc(items, prev));
  }, [items, recalc]);

  const handleAddProduct = async (product: { name: string; category: string; unit: string; default_price: number }) => {
    if (!id) return;
    const { data } = await supabase.from('estimate_items').insert({
      estimate_id: id,
      name: product.name,
      category: product.category,
      quantity: 1,
      unit: product.unit,
      rate: product.default_price,
      amount: product.default_price,
    }).select().single();
    if (data) setItems([...items, data as EstimateItem]);
    setDrawerOpen(false);
  };

  const handleAddCustomItem = async (item: { name: string; category: string; unit: string; quantity: number; rate: number; saveToProducts: boolean }) => {
    if (!id || !user) return;
    const { data } = await supabase.from('estimate_items').insert({
      estimate_id: id,
      name: item.name,
      category: item.category,
      quantity: item.quantity,
      unit: item.unit,
      rate: item.rate,
      amount: item.quantity * item.rate,
    }).select().single();
    if (data) setItems([...items, data as EstimateItem]);

    if (item.saveToProducts) {
      const { data: prod } = await supabase.from('products').insert({
        user_id: user.id,
        name: item.name,
        category: item.category,
        unit: item.unit,
        default_price: item.rate,
        is_custom: true,
      }).select().single();
      if (prod) setProducts([...products, prod as Product]);
    }
    setShowCustom(false);
  };

  const handleUpdateItem = async (itemId: string, field: string, value: number | string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;
    const updated = { ...item, [field]: value };
    updated.amount = Number(updated.quantity) * Number(updated.rate);
    setItems(items.map((i) => i.id === itemId ? updated : i));
    await supabase.from('estimate_items').update({ [field]: value, amount: updated.amount }).eq('id', itemId);
  };

  const handleDeleteItem = async (itemId: string) => {
    await supabase.from('estimate_items').delete().eq('id', itemId);
    setItems(items.filter((i) => i.id !== itemId));
  };

  const handleSaveSummary = async () => {
    if (!id) return;
    const updated = recalc(items, summary);
    await supabase.from('estimates').update({
      subtotal: updated.subtotal, discount: updated.discount, gst: updated.gst,
      labour: updated.labour, transport: updated.transport, grand_total: updated.grandTotal,
      advance: updated.advance, balance: updated.balance, notes, terms,
    }).eq('id', id);
    setSummary(updated);
    setShowSummaryEdit(false);
  };

  const handleSaveDraft = async () => {
    await handleSaveSummary();
    navigate('/app/estimates');
  };

  // Get products for active category: user products first, then defaults
  const getCategoryProducts = () => {
    const userProducts = products.filter((p) => p.category === activeCategory);
    const defaults = DEFAULT_PRODUCTS[activeCategory] || [];
    const userNames = new Set(userProducts.map((p) => p.name));
    const mergedDefaults = defaults.filter((d) => !userNames.has(d.name)).map((d) => ({
      name: d.name, category: activeCategory, unit: d.unit, default_price: d.price,
    }));
    const userMapped = userProducts.map((p) => ({
      name: p.name, category: p.category, unit: p.unit, default_price: p.default_price,
    }));
    const all = [...userMapped, ...mergedDefaults];
    if (productSearch) {
      return all.filter((p) => p.name.toLowerCase().includes(productSearch.toLowerCase()));
    }
    return all;
  };

  if (loading) return <div className="flex items-center justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/app/estimates')} className="p-2 rounded-xl hover:bg-slate-100 text-slate-600">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Estimate Builder</h1>
            <p className="text-xs text-slate-500">{estimate?.estimate_number}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/app/estimates/${id}/preview`)}><Eye size={16} /> Preview</Button>
          <Button size="sm" onClick={handleSaveDraft}><Save size={16} /> Save Draft</Button>
        </div>
      </div>

      {/* Customer Info Card */}
      {customer && (
        <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-5">
          <div className="flex items-start justify-between flex-wrap gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-bold">{customer.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="text-base font-semibold text-slate-900">{customer.name}</div>
                <div className="text-sm text-slate-500">{customer.project_name || 'No project'} · {customer.project_type || 'House'}</div>
                {customer.address && <div className="text-xs text-slate-400 mt-0.5">{customer.address}</div>}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-slate-400">Estimate Date</div>
              <div className="text-sm font-medium text-slate-900">{new Date(estimate?.estimate_date || '').toLocaleDateString('en-IN')}</div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Estimate Table */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-semibold text-slate-900">Items ({items.length})</h2>
              <Button size="sm" onClick={() => setDrawerOpen(true)}><Plus size={16} /> Add Item</Button>
            </div>

            {items.length === 0 ? (
              <EmptyState
                icon={<Package size={24} />}
                title="No items added yet"
                description="Click 'Add Item' to browse the product catalog and add items to this estimate."
                action={<Button size="sm" onClick={() => setDrawerOpen(true)}><Plus size={16} /> Add Item</Button>}
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/50">
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2.5">#</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2.5">Item Name</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-4 py-2.5 hidden sm:table-cell">Category</th>
                      <th className="text-center text-xs font-semibold text-slate-500 uppercase px-2 py-2.5">Qty</th>
                      <th className="text-left text-xs font-semibold text-slate-500 uppercase px-2 py-2.5 hidden sm:table-cell">Unit</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase px-2 py-2.5">Rate</th>
                      <th className="text-right text-xs font-semibold text-slate-500 uppercase px-4 py-2.5">Amount</th>
                      <th className="px-2 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50/30">
                        <td className="px-4 py-2.5 text-sm text-slate-400">{idx + 1}</td>
                        <td className="px-4 py-2.5 text-sm font-medium text-slate-900">{item.name}</td>
                        <td className="px-4 py-2.5 text-xs text-slate-500 hidden sm:table-cell">{item.category}</td>
                        <td className="px-2 py-2.5">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, 'quantity', Number(e.target.value))}
                            className="w-14 px-2 py-1 text-sm text-center border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </td>
                        <td className="px-2 py-2.5 text-xs text-slate-500 hidden sm:table-cell">{item.unit}</td>
                        <td className="px-2 py-2.5">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) => handleUpdateItem(item.id, 'rate', Number(e.target.value))}
                            className="w-20 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500"
                          />
                        </td>
                        <td className="px-4 py-2.5 text-sm font-semibold text-slate-900 text-right">{formatCurrency(item.amount)}</td>
                        <td className="px-2 py-2.5">
                          <button onClick={() => handleDeleteItem(item.id)} className="p-1 rounded-lg hover:bg-red-50 text-red-400"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {items.length > 0 && (
              <div className="px-5 py-3 border-t border-slate-100">
                <Button size="sm" variant="outline" onClick={() => setDrawerOpen(true)}><Plus size={16} /> Add Item</Button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-5 space-y-4">
            <Textarea label="Additional Notes" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} placeholder="Any additional notes for the customer..." />
            <Textarea label="Terms & Conditions" value={terms} onChange={(e) => setTerms(e.target.value)} rows={3} />
          </div>
        </div>

        {/* Summary Card */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-5 sticky top-24">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-slate-900">Summary</h2>
              <button onClick={() => setShowSummaryEdit(!showSummaryEdit)} className="text-xs text-primary-600 font-medium hover:text-primary-700">
                {showSummaryEdit ? 'Done' : 'Edit'}
              </button>
            </div>
            <div className="space-y-2.5">
              <SummaryRow label="Subtotal" value={formatCurrency(summary.subtotal)} />
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Discount</span>
                {showSummaryEdit ? (
                  <input type="number" value={summary.discount} onChange={(e) => setSummary({ ...summary, discount: Number(e.target.value) })} className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                ) : <span className="font-medium text-slate-900">{formatCurrency(summary.discount)}</span>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">GST (%)</span>
                {showSummaryEdit ? (
                  <input type="number" value={summary.gst} onChange={(e) => setSummary({ ...summary, gst: Number(e.target.value) })} className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                ) : <span className="font-medium text-slate-900">{summary.gst}%</span>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Labour Charges</span>
                {showSummaryEdit ? (
                  <input type="number" value={summary.labour} onChange={(e) => setSummary({ ...summary, labour: Number(e.target.value) })} className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                ) : <span className="font-medium text-slate-900">{formatCurrency(summary.labour)}</span>}
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Transportation</span>
                {showSummaryEdit ? (
                  <input type="number" value={summary.transport} onChange={(e) => setSummary({ ...summary, transport: Number(e.target.value) })} className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                ) : <span className="font-medium text-slate-900">{formatCurrency(summary.transport)}</span>}
              </div>
              <div className="border-t border-slate-100 pt-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-slate-900">Grand Total</span>
                  <span className="text-lg font-bold text-primary-600">{formatCurrency(summary.grandTotal)}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Advance Received</span>
                {showSummaryEdit ? (
                  <input type="number" value={summary.advance} onChange={(e) => setSummary({ ...summary, advance: Number(e.target.value) })} className="w-24 px-2 py-1 text-sm text-right border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500/20" />
                ) : <span className="font-medium text-slate-900">{formatCurrency(summary.advance)}</span>}
              </div>
              <div className="flex items-center justify-between bg-secondary-50 rounded-xl px-3 py-2.5">
                <span className="text-sm font-semibold text-secondary-700">Balance Amount</span>
                <span className="text-base font-bold text-secondary-700">{formatCurrency(summary.balance)}</span>
              </div>
            </div>
            {showSummaryEdit && (
              <Button size="sm" className="w-full mt-4" onClick={handleSaveSummary}>Apply Changes</Button>
            )}
          </div>
        </div>
      </div>

      {/* Item Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm animate-fade-in" onClick={() => setDrawerOpen(false)} />
          <div className="relative w-full max-w-2xl bg-white h-full animate-slide-in-right flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 shrink-0">
              <h2 className="text-base font-semibold text-slate-900">Add Items</h2>
              <button onClick={() => setDrawerOpen(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={20} /></button>
            </div>

            {/* Search */}
            <div className="px-5 py-3 border-b border-slate-100">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-slate-100 border border-transparent rounded-xl focus:outline-none focus:bg-white focus:border-slate-200 transition-all"
                />
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
              {/* Categories */}
              <div className="w-32 sm:w-40 border-r border-slate-100 overflow-y-auto bg-slate-50/50 shrink-0">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    className={classNames(
                      'w-full text-left px-3 py-2.5 text-sm font-medium transition-colors',
                      activeCategory === cat ? 'bg-primary-50 text-primary-700 border-r-2 border-primary-600' : 'text-slate-600 hover:bg-slate-100',
                    )}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Products */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {getCategoryProducts().map((prod, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{prod.name}</div>
                      <div className="text-xs text-slate-500">{formatCurrency(prod.default_price)} · {prod.unit}</div>
                    </div>
                    <Button size="sm" variant="outline" onClick={() => handleAddProduct(prod)} className="shrink-0">Add</Button>
                  </div>
                ))}
                {activeCategory !== 'Other' && (
                  <button onClick={() => { setShowCustom(true); }} className="w-full flex items-center gap-2 p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary-300 hover:bg-primary-50/30 text-sm font-medium text-slate-600 transition-all">
                    <Plus size={16} /> Other (Custom Item)
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Custom Item Modal */}
      <CustomItemModal open={showCustom} onClose={() => setShowCustom(false)} onAdd={handleAddCustomItem} />
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900">{value}</span>
    </div>
  );
}

function CustomItemModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (item: any) => void }) {
  const [item, setItem] = useState({ name: '', category: 'Other', unit: 'Nos', quantity: 1, rate: 0, saveToProducts: false });

  const handleAdd = () => {
    if (!item.name) return;
    onAdd(item);
    setItem({ name: '', category: 'Other', unit: 'Nos', quantity: 1, rate: 0, saveToProducts: false });
  };

  return (
    <Modal open={open} onClose={onClose} title="Add Custom Item" size="md">
      <div className="p-6 space-y-4">
        <Input label="Item Name *" value={item.name} onChange={(e) => setItem({ ...item, name: e.target.value })} placeholder="Custom item name" />
        <div className="grid grid-cols-2 gap-4">
          <Select label="Category" value={item.category} onChange={(e) => setItem({ ...item, category: e.target.value })}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </Select>
          <Select label="Unit" value={item.unit} onChange={(e) => setItem({ ...item, unit: e.target.value as Unit })}>
            {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
          </Select>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Input label="Quantity" type="number" value={item.quantity} onChange={(e) => setItem({ ...item, quantity: Number(e.target.value) })} />
          <Input label="Rate (₹)" type="number" value={item.rate} onChange={(e) => setItem({ ...item, rate: Number(e.target.value) })} />
        </div>
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input type="checkbox" checked={item.saveToProducts} onChange={(e) => setItem({ ...item, saveToProducts: e.target.checked })} className="rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
          <span className="text-sm text-slate-700">Save this item to My Products for future use</span>
        </label>
        <div className="text-sm text-slate-600 bg-slate-50 rounded-xl px-3 py-2">
          Amount: <span className="font-semibold">{formatCurrency(item.quantity * item.rate)}</span>
        </div>
        <div className="flex gap-3 pt-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" onClick={handleAdd} disabled={!item.name}>Add Item</Button>
        </div>
      </div>
    </Modal>
  );
}

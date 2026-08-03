import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Users, Search, Eye, Pencil, Trash2, FileText, Phone, Mail, MapPin } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Customer, PROJECT_TYPES } from '@/lib/types';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Badge, statusBadgeVariant } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { EmptyState } from '@/components/ui/EmptyState';

export function CustomersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Customer | null>(null);
  const [viewing, setViewing] = useState<Customer | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);

  const [form, setForm] = useState({
    name: '', phone: '', email: '', address: '', project_name: '', project_type: 'House', site_address: '', notes: '',
  });

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setShowForm(true);
      setEditing(null);
      searchParams.delete('new');
      setSearchParams(searchParams, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data } = await supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setCustomers(data as Customer[] || []);
      setLoading(false);
    })();
  }, [user]);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', phone: '', email: '', address: '', project_name: '', project_type: 'House', site_address: '', notes: '' });
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setEditing(c);
    setForm({
      name: c.name, phone: c.phone || '', email: c.email || '', address: c.address || '',
      project_name: c.project_name || '', project_type: c.project_type || 'House', site_address: c.site_address || '', notes: c.notes || '',
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!user || !form.name) return;
    if (editing) {
      await supabase.from('customers').update(form).eq('id', editing.id);
    } else {
      await supabase.from('customers').insert({ ...form, user_id: user.id });
    }
    setShowForm(false);
    const { data } = await supabase.from('customers').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
    setCustomers(data as Customer[] || []);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await supabase.from('customers').delete().eq('id', deleteTarget.id);
    setDeleteTarget(null);
    setCustomers(customers.filter((c) => c.id !== deleteTarget.id));
  };

  const filtered = customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.phone?.includes(search) ||
    c.project_name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Customers</h1>
          <p className="text-sm text-slate-500 mt-0.5">{customers.length} total customers</p>
        </div>
        <Button onClick={openNew}><Plus size={18} /> Add Customer</Button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search by name, phone, or project..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-white border border-slate-200 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-all"
        />
      </div>

      {/* Desktop Table */}
      {filtered.length === 0 && !loading ? (
        <div className="bg-white rounded-2xl card-shadow border border-slate-100">
          <EmptyState
            icon={<Users size={24} />}
            title="No customers found"
            description="Add your first customer to start creating estimates."
            action={<Button onClick={openNew}><Plus size={18} /> Add Customer</Button>}
          />
        </div>
      ) : (
        <>
          <div className="hidden lg:block bg-white rounded-2xl card-shadow border border-slate-100 overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Customer Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Phone</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Project</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Address</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase px-5 py-3">Status</th>
                  <th className="text-right text-xs font-semibold text-slate-500 uppercase px-5 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-xs font-bold">{c.name.charAt(0).toUpperCase()}</div>
                        <span className="text-sm font-medium text-slate-900">{c.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{c.phone || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600">{c.project_name || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-slate-600 max-w-[180px] truncate">{c.address || '—'}</td>
                    <td className="px-5 py-3.5"><Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge></td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => setViewing(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="View"><Eye size={16} /></button>
                        <button onClick={() => openEdit(c)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500" title="Edit"><Pencil size={16} /></button>
                        <button onClick={() => navigate(`/app/estimates?customer=${c.id}`)} className="p-1.5 rounded-lg hover:bg-primary-50 text-primary-600" title="Create Estimate"><FileText size={16} /></button>
                        <button onClick={() => setDeleteTarget(c)} className="p-1.5 rounded-lg hover:bg-red-50 text-red-500" title="Delete"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards */}
          <div className="lg:hidden space-y-3">
            {filtered.map((c) => (
              <div key={c.id} className="bg-white rounded-2xl card-shadow border border-slate-100 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-sm font-bold">{c.name.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-900">{c.name}</div>
                      <div className="text-xs text-slate-500">{c.project_name || 'No project'}</div>
                    </div>
                  </div>
                  <Badge variant={statusBadgeVariant(c.status)}>{c.status}</Badge>
                </div>
                {c.phone && <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-1"><Phone size={12} /> {c.phone}</div>}
                {c.address && <div className="text-xs text-slate-500 flex items-center gap-1.5 mb-3"><MapPin size={12} /> {c.address}</div>}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-50">
                  <button onClick={() => setViewing(c)} className="flex-1 text-xs font-medium text-slate-600 py-1.5 rounded-lg hover:bg-slate-50">View</button>
                  <button onClick={() => openEdit(c)} className="flex-1 text-xs font-medium text-slate-600 py-1.5 rounded-lg hover:bg-slate-50">Edit</button>
                  <button onClick={() => navigate(`/app/estimates?customer=${c.id}`)} className="flex-1 text-xs font-medium text-primary-600 py-1.5 rounded-lg hover:bg-primary-50">Estimate</button>
                  <button onClick={() => setDeleteTarget(c)} className="text-red-500 p-1.5 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      <Modal open={showForm} onClose={() => setShowForm(false)} title={editing ? 'Edit Customer' : 'Add New Customer'} size="lg">
        <div className="p-6 space-y-4">
          <Input label="Customer Name *" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Rajesh Kumar" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Mobile Number" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" />
            <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="customer@email.com" />
          </div>
          <Input label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123 Main Street, Mumbai" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Project Name" value={form.project_name} onChange={(e) => setForm({ ...form, project_name: e.target.value })} placeholder="2BHK Wiring" />
            <Select label="Project Type" value={form.project_type} onChange={(e) => setForm({ ...form, project_type: e.target.value })}>
              {PROJECT_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </Select>
          </div>
          <Input label="Site Address" value={form.site_address} onChange={(e) => setForm({ ...form, site_address: e.target.value })} placeholder="Site location address" />
          <Textarea label="Notes" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional notes about this customer..." rows={3} />
          <div className="flex gap-3 pt-2">
            <Button variant="outline" className="flex-1" onClick={() => setShowForm(false)}>Cancel</Button>
            <Button className="flex-1" onClick={handleSave}>{editing ? 'Update' : 'Save'} Customer</Button>
          </div>
        </div>
      </Modal>

      {/* View Modal */}
      <Modal open={!!viewing} onClose={() => setViewing(null)} title="Customer Details" size="md">
        {viewing && (
          <div className="p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
              <div className="w-14 h-14 rounded-2xl bg-primary-100 text-primary-700 flex items-center justify-center text-xl font-bold">{viewing.name.charAt(0).toUpperCase()}</div>
              <div>
                <div className="text-lg font-bold text-slate-900">{viewing.name}</div>
                <Badge variant={statusBadgeVariant(viewing.status)}>{viewing.status}</Badge>
              </div>
            </div>
            <div className="space-y-3">
              {viewing.phone && <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-slate-400" /><span className="text-slate-700">{viewing.phone}</span></div>}
              {viewing.email && <div className="flex items-center gap-3 text-sm"><Mail size={16} className="text-slate-400" /><span className="text-slate-700">{viewing.email}</span></div>}
              {viewing.address && <div className="flex items-center gap-3 text-sm"><MapPin size={16} className="text-slate-400" /><span className="text-slate-700">{viewing.address}</span></div>}
            </div>
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
              <div><div className="text-xs text-slate-400">Project</div><div className="text-sm font-medium text-slate-900">{viewing.project_name || '—'}</div></div>
              <div><div className="text-xs text-slate-400">Type</div><div className="text-sm font-medium text-slate-900">{viewing.project_type || '—'}</div></div>
            </div>
            {viewing.site_address && <div><div className="text-xs text-slate-400 mb-1">Site Address</div><div className="text-sm text-slate-700">{viewing.site_address}</div></div>}
            {viewing.notes && <div><div className="text-xs text-slate-400 mb-1">Notes</div><div className="text-sm text-slate-700">{viewing.notes}</div></div>}
            <div className="text-xs text-slate-400">Added on {formatDate(viewing.created_at)}</div>
            <div className="flex gap-3 pt-2">
              <Button variant="outline" className="flex-1" onClick={() => { setViewing(null); openEdit(viewing); }}>Edit</Button>
              <Button className="flex-1" onClick={() => { setViewing(null); navigate(`/app/estimates?customer=${viewing.id}`); }}><FileText size={16} /> Create Estimate</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteTarget} onClose={() => setDeleteTarget(null)} title="Delete Customer?" size="sm">
        <div className="p-6">
          <p className="text-sm text-slate-600 mb-4">Are you sure you want to delete <span className="font-semibold text-slate-900">{deleteTarget?.name}</span>? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="outline" className="flex-1" onClick={() => setDeleteTarget(null)}>Cancel</Button>
            <Button variant="danger" className="flex-1" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

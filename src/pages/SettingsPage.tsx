import { useState, useEffect } from 'react';
import { Building, Phone, Mail, MapPin, FileText, QrCode, Palette, Globe, Bell, Upload, Save } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Form';

export function SettingsPage() {
  const { user, profile, refreshProfile } = useAuth();
  const [form, setForm] = useState({
    business_name: '', phone: '', email: '', address: '', gst_number: '', upi_id: '', logo_url: '', theme: 'light', language: 'en', notifications: true,
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        business_name: profile.business_name || '', phone: profile.phone || '', email: user?.email || '',
        address: profile.address || '', gst_number: profile.gst_number || '', upi_id: profile.upi_id || '',
        logo_url: profile.logo_url || '', theme: profile.theme || 'light', language: profile.language || 'en',
        notifications: profile.notifications ?? true,
      });
    }
  }, [profile, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await supabase.from('profiles').upsert({
      id: user.id,
      business_name: form.business_name, phone: form.phone, address: form.address,
      gst_number: form.gst_number, upi_id: form.upi_id, theme: form.theme,
      language: form.language, notifications: form.notifications,
    });
    await refreshProfile();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-sm text-slate-500 mt-0.5">Manage your business profile and preferences</p>
      </div>

      {/* Business Profile */}
      <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Building size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-slate-900">Business Profile</h2>
        </div>

        {/* Logo upload */}
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
            {form.logo_url ? <img src={form.logo_url} alt="Logo" className="w-full h-full rounded-2xl object-cover" /> : <Upload size={24} />}
          </div>
          <div>
            <Button variant="outline" size="sm"><Upload size={14} /> Upload Logo</Button>
            <p className="text-xs text-slate-400 mt-1">PNG or JPG, max 2MB</p>
          </div>
        </div>

        <Input label="Business Name" value={form.business_name} onChange={(e) => setForm({ ...form, business_name: e.target.value })} placeholder="Sharma Electricals" icon={<Building size={16} />} />
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="98765 43210" icon={<Phone size={16} />} />
          <Input label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="business@email.com" icon={<Mail size={16} />} />
        </div>
        <Textarea label="Address" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} placeholder="123 Business Street, Mumbai, Maharashtra" />
      </div>

      {/* Tax & Payment */}
      <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <FileText size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-slate-900">Tax & Payment</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="GST Number" value={form.gst_number} onChange={(e) => setForm({ ...form, gst_number: e.target.value })} placeholder="27AAAAA0000A1Z5" />
          <Input label="UPI ID" value={form.upi_id} onChange={(e) => setForm({ ...form, upi_id: e.target.value })} placeholder="business@upi" icon={<QrCode size={16} />} />
        </div>
      </div>

      {/* Preferences */}
      <div className="bg-white rounded-2xl card-shadow border border-slate-100 p-6 space-y-5">
        <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
          <Palette size={18} className="text-primary-600" />
          <h2 className="text-sm font-semibold text-slate-900">Preferences</h2>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Theme" value={form.theme} onChange={(e) => setForm({ ...form, theme: e.target.value })}>
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Select>
          <Select label="Language" value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value })}>
            <option value="en">English</option>
            <option value="hi">Hindi</option>
            <option value="mr">Marathi</option>
            <option value="ta">Tamil</option>
            <option value="te">Telugu</option>
            <option value="kn">Kannada</option>
          </Select>
        </div>
        <label className="flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center"><Bell size={18} /></div>
            <div>
              <div className="text-sm font-medium text-slate-900">Notification Settings</div>
              <div className="text-xs text-slate-500">Receive payment and estimate notifications</div>
            </div>
          </div>
          <input type="checkbox" checked={form.notifications} onChange={(e) => setForm({ ...form, notifications: e.target.checked })} className="w-5 h-5 rounded border-slate-300 text-primary-600 focus:ring-primary-500" />
        </label>
      </div>

      <div className="flex gap-3">
        <Button variant="outline" className="flex-1">Cancel</Button>
        <Button className="flex-1" onClick={handleSave} disabled={saving}>
          {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Changes'}
          {!saving && !saved && <Save size={16} />}
        </Button>
      </div>
    </div>
  );
}

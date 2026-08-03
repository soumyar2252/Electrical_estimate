import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Mail, Lock, User, Phone, MapPin, Building, Zap, ArrowRight, Check } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { Input, Select } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function SignupPage() {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    business_name: '',
    city: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const update = (key: string, value: string) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    const { error } = await signUp(form.email, form.password, {
      full_name: form.full_name,
      phone: form.phone,
      business_name: form.business_name,
      city: form.city,
    });
    setLoading(false);
    if (error) setError(error);
    else navigate('/app/dashboard');
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 20% 30%, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        <div className="relative z-10 flex flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold">Electrical Estimate Pro</span>
          </div>
          <div className="space-y-6">
            <h1 className="text-4xl font-bold leading-tight">Join thousands of<br />electricians going digital.</h1>
            <p className="text-primary-100 text-lg max-w-md">Create professional estimates, track payments, and grow your electrical business — all from your phone.</p>
            <div className="space-y-3 pt-4">
              {['Free to get started', 'No credit card required', 'Works on mobile & desktop'].map((f) => (
                <div key={f} className="flex items-center gap-3 text-primary-100">
                  <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center"><Check size={12} /></div>
                  {f}
                </div>
              ))}
            </div>
          </div>
          <p className="text-primary-200 text-sm">Start your free trial today</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 bg-slate-50 overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <div className="lg:hidden flex items-center gap-2 mb-8 justify-center">
            <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
              <Zap size={22} className="text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900">Electrical Estimate Pro</span>
          </div>

          <div className="bg-white rounded-2xl card-shadow-lg p-8 animate-slide-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-1">Create your account</h2>
            <p className="text-sm text-slate-500 mb-6">Get started with Electrical Estimate Pro</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Input label="Full Name" placeholder="Rajesh Kumar" value={form.full_name} onChange={(e) => update('full_name', e.target.value)} required icon={<User size={16} />} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Mobile Number" placeholder="98765 43210" value={form.phone} onChange={(e) => update('phone', e.target.value)} required icon={<Phone size={16} />} />
                <Input label="City" placeholder="Mumbai" value={form.city} onChange={(e) => update('city', e.target.value)} required icon={<MapPin size={16} />} />
              </div>
              <Input label="Email Address" type="email" placeholder="you@example.com" value={form.email} onChange={(e) => update('email', e.target.value)} required icon={<Mail size={16} />} />
              <Input label="Business Name (Optional)" placeholder="Sharma Electricals" value={form.business_name} onChange={(e) => update('business_name', e.target.value)} icon={<Building size={16} />} />
              <div className="grid grid-cols-2 gap-3">
                <Input label="Password" type="password" placeholder="Min 6 characters" value={form.password} onChange={(e) => update('password', e.target.value)} required icon={<Lock size={16} />} />
                <Input label="Confirm Password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={(e) => update('confirmPassword', e.target.value)} required icon={<Lock size={16} />} />
              </div>

              {error && <div className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</div>}

              <Button type="submit" size="lg" className="w-full" disabled={loading}>
                {loading ? 'Creating account...' : 'Register'}
                {!loading && <ArrowRight size={18} />}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
              <div className="relative flex justify-center"><span className="bg-white px-4 text-xs text-slate-400">or sign up with</span></div>
            </div>

            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-slate-200 rounded-xl text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
              <svg className="w-4 h-4" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
              Continue with Google
            </button>

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account?{' '}
              <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, Zap, ArrowRight, Check } from 'lucide-react';
import { Input } from '@/components/ui/Form';
import { Button } from '@/components/ui/Button';

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-2 mb-8 justify-center">
          <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
            <Zap size={22} className="text-white" />
          </div>
          <span className="text-xl font-bold text-slate-900">Electrical Estimate Pro</span>
        </div>

        <div className="bg-white rounded-2xl card-shadow-lg p-8 animate-slide-up">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-4">
                <Check size={28} className="text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold text-slate-900 mb-2">Check your email</h2>
              <p className="text-sm text-slate-500 mb-6">We've sent a password reset link to <span className="font-medium text-slate-700">{email}</span></p>
              <Link to="/login"><Button variant="outline" className="w-full">Back to Login</Button></Link>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-slate-900 mb-1">Reset password</h2>
              <p className="text-sm text-slate-500 mb-6">Enter your email and we'll send you a reset link</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input label="Email Address" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required icon={<Mail size={16} />} />
                <Button type="submit" size="lg" className="w-full">Send Reset Link <ArrowRight size={18} /></Button>
              </form>
              <p className="text-center text-sm text-slate-500 mt-6">
                <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Back to login</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

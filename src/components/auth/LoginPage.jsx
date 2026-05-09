import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Mail, Lock, Building2, ArrowRight, Sparkles, Eye, EyeOff } from 'lucide-react';

const LoginPage = () => {
  const { login, signup, error: authError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    companyName: ''
  });
  const [loading, setLoading] = useState(false);
  const isSubmitting = useRef(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting.current) return;
    
    isSubmitting.current = true;
    setLoading(true);
    try {
      if (isLogin) {
        await login(formData.email, formData.password);
      } else {
        await signup(formData.email, formData.password, formData.companyName);
      }
    } catch (err) {
      // Error handled by AuthContext
    } finally {
      setLoading(false);
      isSubmitting.current = false;
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#030303] overflow-hidden">
      {/* Visual Identity Section */}
      <div className="hidden lg:flex lg:w-1/2 relative p-20 flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 bg-primary/10 mix-blend-overlay" />
        <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-primary/20 rounded-full blur-[160px] animate-pulse" />
        <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-blue-500/10 rounded-full blur-[160px]" />
        
        <div className="relative z-10 flex items-center gap-4">
          <div className="w-14 h-14 bg-white/5 backdrop-blur-3xl rounded-2xl flex items-center justify-center border border-white/10 shadow-2xl overflow-hidden">
            <img src="/favicon.png" alt="RevAI Logo" className="w-full h-full object-cover" />
          </div>
          <div>
            <h1 className="text-4xl font-black tracking-tighter text-white">RevAI Studio</h1>
            <p className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Intelligence & CRM Hub</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-primary shadow-xl">
            <Sparkles size={12} /> Powered by Advanced Agentic AI
          </div>
          <h2 className="text-6xl font-black tracking-tight text-white leading-none">
            Scale your <span className="text-primary italic">Revenue</span> Operations.
          </h2>
          <p className="text-lg text-white/50 font-medium leading-relaxed">
            The next generation of CRM intelligence. Automated scoring, predictive inventory, and multi-tenant synchronization.
          </p>
        </div>

        <div className="relative z-10 flex gap-12 border-t border-white/5 pt-12">
          <div>
            <div className="text-4xl font-black text-white">99.9%</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 text-primary/60">Uptime Reliability</div>
          </div>
          <div>
            <div className="text-4xl font-black text-white">2.4k</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1 text-primary/60">Active Workspaces</div>
          </div>
        </div>
      </div>

      {/* Auth Form Section */}
      <div className="flex-1 flex items-center justify-center p-8 relative">
        <div className="w-full max-w-md space-y-8 animate-in slide-in-from-bottom-8 duration-700">
          <div className="space-y-2">
            <h3 className="text-3xl font-black tracking-tighter text-white">
              {isLogin ? 'Access Portal' : 'Register Workspace'}
            </h3>
            <p className="text-muted-foreground font-medium">
              {isLogin ? 'Welcome back. Enter your credentials.' : 'Start your professional journey with RevAI.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {!isLogin && (
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                  Company Name
                </label>
                <div className="relative">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                  <Input 
                    placeholder="e.g. Acme Corp" 
                    className="h-14 pl-12 glass-panel border-white/5 bg-white/[0.02] focus:bg-white/[0.05]"
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                    required
                  />
                </div>
              </div>
            )}

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                Corporate Email
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type="email"
                  placeholder="name@company.com" 
                  className="h-14 pl-12 glass-panel border-white/5 bg-white/[0.02] focus:bg-white/[0.05]"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  required
                />
              </div>
            </div>

            <div className="space-y-2 group">
              <label className="text-[10px] font-black uppercase text-muted-foreground tracking-widest ml-1 group-focus-within:text-primary transition-colors">
                Access Password
              </label>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/20 group-focus-within:text-primary transition-colors" />
                <Input 
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••" 
                  className="h-14 pl-12 pr-12 glass-panel border-white/5 bg-white/[0.02] focus:bg-white/[0.05]"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white/20 hover:text-white transition-colors"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {authError && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold animate-in shake duration-500">
                {authError}
              </div>
            )}

            <Button 
                type="submit" 
                className="w-full h-14 rounded-2xl shadow-2xl shadow-primary/30 font-black text-sm uppercase tracking-widest"
                disabled={loading}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>{isLogin ? 'Initialize Session' : 'Create Intelligence Account'} <ArrowRight className="ml-2 h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" /></>
              )}
            </Button>
          </form>

          <p className="text-center text-sm font-medium text-muted-foreground">
            {isLogin ? "Empty hands?" : "A returning pro?"}{" "}
            <button 
                onClick={() => setIsLogin(!isLogin)} 
                className="text-primary font-bold hover:underline underline-offset-4 decoration-primary/30"
            >
              {isLogin ? 'Create Workspace' : 'Sign in to Portal'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

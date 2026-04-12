import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Building2, ArrowRight, UserCircle2, Plus, X, Check } from 'lucide-react';
import { cn } from '../../lib/utils';

const OrganizationSelector = () => {
  const { currentUser, switchOrganization, registerOrganization, logout } = useAuth();
  const [isRegistering, setIsRegistering] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!currentUser) return null;

  const orgs = currentUser.allOrganizations || [];

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!companyName.trim()) return;
    setLoading(true);
    setError('');
    try {
      await registerOrganization(companyName);
      setIsRegistering(false);
      setCompanyName('');
    } catch (err) {
      setError(err.message || "Failed to register organization.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="w-full max-w-xl p-6 space-y-8 animate-in zoom-in-95 duration-500">
        <div className="text-center space-y-2">
          <div className="inline-flex p-4 rounded-3xl bg-primary/10 text-primary mb-4 shadow-2xl shadow-primary/20">
            <Building2 size={40} />
          </div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-white">
            {isRegistering ? 'New Workspace' : 'Select Workspace'}
          </h1>
          <p className="text-muted-foreground font-medium">
            {isRegistering ? 'Initialize a new professional environment.' : 'Choose an organization to continue your session.'}
          </p>
        </div>

        <div className="grid gap-4">
          {!isRegistering ? (
            <>
              {orgs.map((org) => (
                <button
                  key={org.orgId}
                  onClick={() => switchOrganization(org.orgId)}
                  className={cn(
                    "group flex items-center justify-between p-6 rounded-2xl border transition-all duration-300 shadow-lg",
                    currentUser.activeOrgId === org.orgId 
                      ? "bg-primary border-primary shadow-primary/30 text-white" 
                      : "glass-panel border-white/5 bg-white/5 hover:bg-white/10 hover:border-white/20 text-white"
                  )}
                >
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "w-12 h-12 rounded-xl flex items-center justify-center font-black text-xl shadow-inner",
                      currentUser.activeOrgId === org.orgId ? "bg-white/20" : "bg-primary/20 text-primary"
                    )}>
                      {org.orgName[0]}
                    </div>
                    <div className="text-left">
                      <div className="font-bold text-lg leading-tight">{org.orgName}</div>
                      <div className={cn(
                        "text-[10px] font-black uppercase tracking-widest mt-1",
                        currentUser.activeOrgId === org.orgId ? "text-white/70" : "text-muted-foreground"
                      )}>
                        Role: {org.role}
                      </div>
                    </div>
                  </div>
                  <ArrowRight className={cn(
                    "transition-transform group-hover:translate-x-1",
                    currentUser.activeOrgId === org.orgId ? "text-white" : "text-primary"
                  )} />
                </button>
              ))}

              <Button 
                variant="outline" 
                onClick={() => setIsRegistering(true)}
                className="h-20 rounded-2xl border-dashed border-white/10 bg-transparent hover:bg-white/5 text-muted-foreground hover:text-white transition-all group"
              >
                <Plus className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                <span className="font-bold">Register New Organization</span>
              </Button>
            </>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4 animate-in slide-in-from-right-4 duration-300">
               <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase text-white/40 tracking-widest ml-1">Organization Name</label>
                 <Input 
                   value={companyName}
                   onChange={(e) => setCompanyName(e.target.value)}
                   placeholder="e.g. Innovation Labs"
                   className="h-16 text-xl font-bold glass-panel border-white/5 bg-white/5 focus:bg-white/10"
                   autoFocus
                   required
                 />
               </div>
               
               {error && <p className="text-red-400 text-sm font-bold ml-1">{error}</p>}

               <div className="flex gap-4 pt-2">
                 <Button 
                   type="submit" 
                   className="flex-1 h-14 rounded-xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20"
                   disabled={loading}
                 >
                   {loading ? "Initializing..." : "Register Workspace"}
                 </Button>
                 <Button 
                   type="button" 
                   variant="ghost"
                   onClick={() => setIsRegistering(false)}
                   className="h-14 w-14 rounded-xl text-white/40 hover:text-white border border-white/5"
                 >
                   <X size={20} />
                 </Button>
               </div>
            </form>
          )}
        </div>

        <div className="pt-6 border-t border-white/5 flex items-center justify-between px-2">
          <div className="flex items-center gap-3">
            <UserCircle2 className="text-muted-foreground" size={20} />
            <span className="text-sm font-semibold text-white/60">{currentUser.email}</span>
          </div>
          <button 
            onClick={logout}
            className="text-sm font-black uppercase tracking-widest text-red-400 hover:text-red-300 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSelector;

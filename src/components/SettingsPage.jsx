import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/Card';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { 
  User, 
  ShieldCheck, 
  Database, 
  Cloud, 
  Lock, 
  Globe,
  CheckCircle2
} from 'lucide-react';
import { cn } from '../lib/utils';

const SettingsPage = () => {
  const { currentUser, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [isSaving, setIsSaving] = useState(false);

  // Mock status checks
  const connections = [
    { name: 'Salesforce Core', status: 'connected', type: 'CRM' },
    { name: 'MongoDB Atlas', status: 'connected', type: 'Database' },
    { name: 'Gemini AI Engine', status: 'connected', type: 'Intelligence' },
    { name: 'Cloudinary Storage', status: 'not_connected', type: 'Media' }
  ];

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => setIsSaving(false), 1500);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <header className="flex justify-between items-center">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 text-white/60">System Configuration</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Settings</h1>
          <p className="subtitle text-muted-foreground font-medium">Manage your Studio Identity and Global Integrations.</p>
        </div>
        <Button onClick={handleSave} disabled={isSaving} className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs">
          {isSaving ? 'Syncing...' : 'Save Configuration'}
        </Button>
      </header>

      <div className="flex flex-col lg:flex-row gap-10">
        <aside className="lg:w-64 space-y-2">
           {[
             { id: 'profile', label: 'User Profile', icon: User },
             { id: 'security', label: 'Security', icon: ShieldCheck },
             { id: 'connections', label: 'Integrations', icon: Cloud },
             { id: 'preferences', label: 'Preferences', icon: Globe }
           ].map(tab => (
             <button
               key={tab.id}
               onClick={() => setActiveTab(tab.id)}
               className={cn(
                 "w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all",
                 activeTab === tab.id 
                   ? "bg-primary text-white shadow-lg shadow-primary/20" 
                   : "text-muted-foreground hover:bg-white/5 hover:text-white"
               )}
             >
               <tab.icon className="h-5 w-5" />
               {tab.label}
             </button>
           ))}
           <div className="pt-6 border-t border-white/5 mt-6">
              <button 
                onClick={logout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl font-bold text-red-400 hover:bg-red-400/10 transition-all"
              >
                <Lock className="h-5 w-5" /> Terminate Session
              </button>
           </div>
        </aside>

        <main className="flex-1">
           {activeTab === 'profile' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
               <Card className="glass-panel border-none">
                 <CardHeader>
                    <CardTitle className="text-xl font-bold">Identity Profile</CardTitle>
                    <CardDescription>Update your public identity within the StockPilot network.</CardDescription>
                 </CardHeader>
                 <CardContent className="space-y-6">
                    <div className="flex items-center gap-8 pb-8 border-b border-white/5">
                       <div className="w-24 h-24 rounded-3xl bg-primary/20 flex items-center justify-center text-primary text-4xl font-black border border-primary/20 shadow-inner">
                         {currentUser?.email[0].toUpperCase()}
                       </div>
                       <div>
                         <Button variant="outline" className="h-10 text-xs font-bold px-6 border-white/10 hover:bg-white/5">Change Avatar</Button>
                         <p className="text-[10px] text-muted-foreground mt-3 font-bold uppercase tracking-widest">Recommended size: 400x400px</p>
                       </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Display Name</label>
                         <Input className="h-12 glass-panel border-white/5" placeholder="Operational Name" defaultValue="Studio Admin" />
                       </div>
                       <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Email Registry</label>
                         <Input className="h-12 glass-panel border-white/5 opacity-60" disabled value={currentUser?.email} />
                       </div>
                    </div>
                 </CardContent>
               </Card>

               <Card className="glass-panel border-none">
                 <CardHeader>
                    <CardTitle className="text-xl font-bold">Regional Standards</CardTitle>
                    <CardDescription>Localized units and standards for inventory modules.</CardDescription>
                 </CardHeader>
                 <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Primary Currency</label>
                         <select className="w-full h-12 glass-panel border-white/5 bg-transparent px-4 font-bold text-white rounded-xl">
                            <option value="USD">USD - US Dollar ($)</option>
                            <option value="INR">INR - Indian Rupee (₹)</option>
                            <option value="EUR">EUR - Euro (€)</option>
                         </select>
                    </div>
                    <div className="space-y-2">
                         <label className="text-[10px] font-black uppercase text-muted-foreground pl-1">Data Retention</label>
                         <select className="w-full h-12 glass-panel border-white/5 bg-transparent px-4 font-bold text-white rounded-xl">
                            <option value="30">30 Days (Standard)</option>
                            <option value="90">90 Days (Enterprise)</option>
                            <option value="365">Infinite (Master)</option>
                         </select>
                    </div>
                 </CardContent>
               </Card>
             </div>
           )}

           {activeTab === 'connections' && (
             <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
                <Card className="glass-panel border-none">
                  <CardHeader>
                    <CardTitle className="text-xl font-bold">Protocol Monitoring</CardTitle>
                    <CardDescription>Real-time status of your neural and data integrations.</CardDescription>
                  </CardHeader>
                  <CardContent>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {connections.map(conn => (
                          <div key={conn.name} className="p-6 rounded-2xl bg-white/5 border border-white/5 flex items-center justify-between">
                             <div className="flex items-center gap-4">
                                <div className={cn(
                                   "w-12 h-12 rounded-xl flex items-center justify-center border shadow-inner",
                                   conn.status === 'connected' ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : "bg-muted text-muted-foreground border-white/10"
                                )}>
                                   <Database className="h-5 w-5" />
                                </div>
                                <div>
                                   <div className="text-sm font-black text-white">{conn.name}</div>
                                   <div className="text-[10px] font-bold text-muted-foreground uppercase">{conn.type}</div>
                                </div>
                             </div>
                             {conn.status === 'connected' ? (
                               <div className="flex items-center gap-2 text-emerald-500 text-[10px] font-black uppercase tracking-widest">
                                 <CheckCircle2 className="h-4 w-4" /> Live
                               </div>
                             ) : (
                               <Button variant="ghost" size="sm" className="text-primary text-[10px] font-black uppercase tracking-widest hover:bg-primary/10">Authorize →</Button>
                             )}
                          </div>
                        ))}
                     </div>
                  </CardContent>
                </Card>
             </div>
           )}
        </main>
      </div>
    </div>
  );
};

export default SettingsPage;

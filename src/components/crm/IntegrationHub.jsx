import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { useAuth } from '../../contexts/AuthContext';
import { integrationApi } from '../../services/integrationApi';
import { Cable, CheckCircle2, RefreshCw, Settings2, Plus, ArrowRight, Cloud, LayoutGrid, Slack } from 'lucide-react';
import { cn } from '../../lib/utils';
import IntegrationSettingsModal from './IntegrationSettingsModal';
import { toast } from 'sonner';

const IntegrationHub = () => {
  const { currentUser } = useAuth();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncingId, setSyncingId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState(null);

  const fetchIntegrations = async () => {
    try {
      const res = await integrationApi.getIntegrations();
      setIntegrations(res.data);
    } catch (err) {
      console.error("Failed to fetch integrations", err);
      toast.error("Cloud synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIntegrations();
  }, []);

  const handleSync = async (id) => {
    setSyncingId(id);
    const toastId = toast.loading("Syncing CRM nodes...");
    try {
      const res = await integrationApi.syncIntegration(id);
      toast.success(`Success: Synced ${res.data.recordCount} records`, { id: toastId });
      fetchIntegrations();
    } catch (err) {
      console.error("Sync failed", err);
      toast.error("Deep sync failed: Check configuration", { id: toastId });
    } finally {
      setSyncingId(null);
    }
  };

  const handleOpenSettings = (integration) => {
    setSelectedIntegration(integration);
    setIsModalOpen(true);
  };

  const handleSaveSettings = async (id, config) => {
    try {
      await integrationApi.updateIntegration(id, { 
        status: 'connected', 
        config 
      });
      toast.success("Security link established");
      fetchIntegrations();
    } catch (err) {
      toast.error("Authorization failed");
      throw err;
    }
  };

  const handleDisconnect = async (integration) => {
    try {
      await integrationApi.updateIntegration(integration._id, { status: 'not_connected' });
      toast.info("Integration link severed");
      fetchIntegrations();
    } catch (err) {
      toast.error("Deactivation failed");
    }
  };

  const getIcon = (name) => {
    switch (name.toLowerCase()) {
      case 'salesforce': return <Cloud className="h-6 w-6 text-[#00A1E0]" />;
      case 'hubspot': return <LayoutGrid className="h-6 w-6 text-[#FF7A59]" />;
      case 'slack': return <Slack className="h-6 w-6 text-[#4A154B]" />;
      default: return <Cable className="h-6 w-6 text-primary" />;
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">Ecosystem Hub</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Integrations</h1>
          <p className="subtitle text-muted-foreground font-medium max-w-2xl">Connect your revenue operations stack to synchronize lead intelligence and automate cross-platform workflows.</p>
        </div>
        <Button className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs">
          <Plus className="mr-3 h-5 w-5" /> Add Custom API
        </Button>
      </header>

      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={i} className="glass-panel border-none h-64 animate-pulse" />
          ))
        ) : (
          integrations.map((item) => (
            <Card key={item._id} className={cn(
              "glass-panel border-none shadow-2xc transition-all duration-500 hover:-translate-y-2 group overflow-hidden",
              item.status === 'connected' ? "ring-1 ring-primary/20" : "opacity-80"
            )}>
              <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition-opacity">
                 <Cable className="h-24 w-24 -rotate-12" />
              </div>
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center border border-white/5 shadow-inner">
                    {getIcon(item.name)}
                  </div>
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-[0.1em] border",
                    item.status === 'connected' 
                      ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                      : "bg-muted/10 text-muted-foreground border-white/5"
                  )}>
                    {item.status === 'connected' ? "Active Node" : "Deactivated"}
                  </div>
                </div>
                <CardTitle className="text-2xl font-black text-white mt-6">{item.name}</CardTitle>
                <CardDescription className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{item.type} Integration</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6 pt-4">
                <div className="flex items-center justify-between gap-4">
                  {item.status === 'connected' ? (
                    <Button variant="outline" className="flex-1 glass-panel border-primary/20 h-11 text-[10px] font-black uppercase" onClick={() => handleSync(item._id)} disabled={syncingId === item._id}>
                      {syncingId === item._id ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
                      Sync Logic
                    </Button>
                  ) : (
                    <Button className="flex-1 h-11 text-[10px] font-black uppercase shadow-lg shadow-primary/20" onClick={() => handleOpenSettings(item)}>
                      Establish Link
                    </Button>
                  )}
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-11 w-11 glass-panel border-white/5 hover:bg-white/10"
                    onClick={() => item.status === 'connected' ? handleDisconnect(item) : handleOpenSettings(item)}
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
                
                {item.status === 'connected' && (
                  <div className="pt-2 flex items-center gap-2 text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                    Secure Connection Established
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <section className="pt-10">
        <Card className="glass-panel border-none bg-primary/5 p-10 overflow-hidden relative">
           <div className="absolute -right-20 -top-20 opacity-5">
             <Cloud className="h-96 w-96" />
           </div>
           <div className="space-y-6 relative">
             <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-widest">
               <Cable className="h-4 w-4" /> Advanced Webhooks
             </div>
             <h2 className="text-4xl font-black text-white tracking-tighter max-w-xl">Deep Stack Synchronization</h2>
             <p className="text-muted-foreground font-medium max-w-2xl leading-relaxed">
               Sync your CRM data with our AI engine to enable hyper-personalized lead scoring and automated follow-up sequences. 
               Our bi-directional sync ensures your Salesforce or HubSpot instance stays up-to-date with RevAI's predictive insights.
             </p>
             <div className="flex gap-4 pt-4">
               <Button variant="link" className="text-primary font-black uppercase tracking-widest text-[10px] p-0 flex items-center gap-2 group">
                 Review API Docs <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
               </Button>
             </div>
           </div>
        </Card>
      </section>

      {selectedIntegration && (
        <IntegrationSettingsModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          integration={selectedIntegration}
          onSave={handleSaveSettings}
        />
      )}
    </div>
  );
};

export default IntegrationHub;

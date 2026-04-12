import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { X, Shield, Lock, User, Globe } from 'lucide-react';
import { cn } from "../../lib/utils";

const IntegrationSettingsModal = ({ isOpen, onClose, integration, onSave }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    securityToken: '',
    loginUrl: 'https://login.salesforce.com',
    clientId: '',
    clientSecret: '',
    authMethod: 'oauth' // default to oauth for generic request
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (integration) {
      setFormData(prev => ({
        ...prev,
        username: integration.config?.username || '',
        password: integration.config?.password || '',
        securityToken: integration.config?.securityToken || '',
        loginUrl: integration.config?.loginUrl || 'https://login.salesforce.com',
        authMethod: integration.isGenericRequest ? 'oauth' : 'credentials'
      }));
    }
  }, [integration, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSave(integration._id, formData);
      onClose();
    } catch (err) {
      console.error("Failed to save integration settings", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-300">
      <div className="glass-panel w-full max-w-xl border-white/10 shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500" />
        
        <div className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h3 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                {integration.name} Link Initialization
              </h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 px-1">
                {integration.isGenericRequest 
                  ? "Global credentials not found. Choose your connection method."
                  : "Update your secure synchronization parameters."}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full text-muted-foreground hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="flex gap-2 mb-8 bg-white/5 p-1 rounded-xl">
             <button 
                type="button"
                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", formData.authMethod === 'oauth' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
                onClick={() => setFormData({...formData, authMethod: 'oauth'})}
             >
                OAuth 2.0 (Login URL)
             </button>
             <button 
                type="button"
                className={cn("flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all", formData.authMethod === 'credentials' ? "bg-primary text-white shadow-lg" : "text-muted-foreground hover:text-white")}
                onClick={() => setFormData({...formData, authMethod: 'credentials'})}
             >
                Direct Credentials
             </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid gap-6">
              {formData.authMethod === 'oauth' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Lock className="h-3 w-3" /> Consumer Key (Client ID)
                    </label>
                    <Input 
                      value={formData.clientId}
                      onChange={(e) => setFormData({...formData, clientId: e.target.value})}
                      placeholder="Enter Salesforce consumer key"
                      className="bg-white/5 border-white/10 h-12"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Lock className="h-3 w-3" /> Consumer Secret (Client Secret)
                    </label>
                    <Input 
                      type="password"
                      value={formData.clientSecret}
                      onChange={(e) => setFormData({...formData, clientSecret: e.target.value})}
                      placeholder="Enter Salesforce client secret"
                      className="bg-white/5 border-white/10 h-12"
                      required
                    />
                  </div>
                  <p className="text-[9px] text-muted-foreground font-bold italic leading-relaxed">
                    Note: Your organization will be redirected to the Salesforce Login URL with these parameters.
                  </p>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <User className="h-3 w-3" /> Salesforce Username
                    </label>
                    <Input 
                      value={formData.username}
                      onChange={(e) => setFormData({...formData, username: e.target.value})}
                      placeholder="admin@yourorg.com"
                      className="bg-white/5 border-white/10 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Lock className="h-3 w-3" /> API Password
                    </label>
                    <Input 
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="••••••••••••"
                      className="bg-white/5 border-white/10 h-12"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                      <Globe className="h-3 w-3" /> Security Token
                    </label>
                    <Input 
                      value={formData.securityToken}
                      onChange={(e) => setFormData({...formData, securityToken: e.target.value})}
                      placeholder="Optional for whitelisted IPs"
                      className="bg-white/5 border-white/10 h-12"
                    />
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                  <Globe className="h-3 w-3" /> Login Target
                </label>
                <select 
                  value={formData.loginUrl}
                  onChange={(e) => setFormData({...formData, loginUrl: e.target.value})}
                  className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
                >
                  <option value="https://login.salesforce.com" className="bg-black">Production</option>
                  <option value="https://test.salesforce.com" className="bg-black">Sandbox</option>
                </select>
              </div>
            </div>

            <div className="pt-6 flex gap-4">
              <Button type="button" variant="ghost" onClick={onClose} className="flex-1 h-12 font-black uppercase tracking-widest text-[10px]">
                Abort
              </Button>
              <Button type="submit" disabled={loading} className="flex-1 h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20">
                {loading ? "Authorizing..." : (formData.authMethod === 'oauth' ? "Initialize OAuth Redirect" : "Initialize Link")}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IntegrationSettingsModal;

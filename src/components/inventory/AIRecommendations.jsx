import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { inventoryApi } from '../../services/inventoryApi';
import { Sparkles, Lightbulb, Loader2, ListChecks, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Link } from 'react-router-dom';

const AIRecommendations = () => {
  const [itemDescription, setItemDescription] = useState('');
  const [userFeedback, setUserFeedback] = useState('');
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await inventoryApi.getRecommendations({ itemDescription, userFeedback });
      setRecommendations(res.data);
    } catch (err) {
      setError("AI Engine connection failure. Please verify protocol.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-5xl mx-auto">
      <header className="space-y-1">
        <div className="flex items-center gap-2 text-primary font-black uppercase tracking-widest text-xs">
           <Link to="/inventory" className="hover:underline">Inventory Hub</Link>
           <ChevronRight className="h-3 w-3" />
           <span className="text-muted-foreground">AI Pairing Logic</span>
        </div>
        <h1 className="text-5xl font-extrabold tracking-tighter text-white flex items-center gap-4">
          <Sparkles className="text-primary h-10 w-10 animate-pulse" /> Neural Recommendations
        </h1>
        <p className="subtitle text-muted-foreground font-bold uppercase tracking-widest text-xs">AI-Powered Cross-Sell Intelligence & Node Pairing</p>
      </header>

      <div className="grid gap-10 lg:grid-cols-2">
        <Card className="glass-panel border-none shadow-2xl h-fit">
          <CardHeader>
            <CardTitle className="text-xl font-black text-white">Item Definition</CardTitle>
            <CardDescription className="text-[10px] font-bold uppercase tracking-widest">Input parameters for neural processing</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Primary Item Description</label>
                <textarea 
                  className="w-full h-32 bg-white/5 border-none rounded-2xl p-4 text-white font-medium placeholder:text-muted-foreground focus:ring-2 focus:ring-primary/50 outline-none transition-all"
                  placeholder="e.g., Premium Leather Chronograph Watch, Silver plating, sapphire crystal..."
                  value={itemDescription}
                  onChange={(e) => setItemDescription(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Operational Context (Optional)</label>
                <Input 
                  className="h-14 glass-panel border-none font-medium"
                  placeholder="e.g., Focus on luxury accessories and gift sets."
                  value={userFeedback}
                  onChange={(e) => setUserFeedback(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full h-14 text-lg font-black uppercase tracking-tighter shadow-2xl shadow-primary/40" disabled={loading}>
                {loading ? <><Loader2 className="mr-3 h-5 w-5 animate-spin" /> Synthesizing...</> : <><Sparkles className="mr-3 h-5 w-5" /> Execute Analysis</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-8">
          {recommendations ? (
            <Card className="glass-panel border-primary/20 shadow-2xl animate-in zoom-in duration-500 overflow-hidden relative">
              <div className="absolute top-0 right-0 p-4">
                <div className="px-3 py-1 bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest rounded-full border border-primary/20">
                  Confidence: High
                </div>
              </div>
              <CardHeader>
                <CardTitle className="text-2xl font-black text-white flex items-center gap-2">
                  <Lightbulb className="text-primary h-6 w-6" /> Optimized Pairs
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8">
                <div className="grid grid-cols-1 gap-3">
                  {recommendations.recommendedPairs?.map((pair, i) => (
                    <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all group">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center font-black group-hover:scale-110 transition-transform">
                        {i + 1}
                      </div>
                      <span className="font-bold text-lg text-white">{pair}</span>
                    </div>
                  ))}
                </div>
                
                <div className="p-6 rounded-2xl bg-primary/10 border border-primary/20 relative">
                  <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">AI Reasoning Summary</h4>
                  <p className="text-sm font-medium leading-relaxed italic text-white/80">
                    "{recommendations.reasoning}"
                  </p>
                </div>
                
                <Button variant="outline" className="w-full h-12 glass-panel border-primary/30 font-black uppercase tracking-widest text-[10px]" onClick={() => setRecommendations(null)}>
                  Clear Analysis
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="glass-panel border-none shadow-2xl flex flex-col items-center justify-center py-20 text-center opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-700 h-full">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center mb-6 relative">
                 <Sparkles className="text-muted-foreground w-12 h-12" />
                 <div className="absolute inset-0 bg-primary/10 rounded-full animate-ping opacity-20" />
              </div>
              <h3 className="text-xl font-black text-white uppercase tracking-tighter">Awaiting Definition</h3>
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-2 px-10 leading-relaxed">
                Define your primary item node to initiate neural pairing analysis.
              </p>
            </Card>
          )}

          {error && (
            <Card className="bg-destructive/10 border-destructive/20 shadow-2xl p-6 rounded-3xl animate-in shake duration-500">
              <p className="text-destructive font-bold text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-5 w-5" /> {error}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIRecommendations;

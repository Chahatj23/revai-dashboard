import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { useDeals } from '../../contexts/DealContext';
import { Kanban, LayoutDashboard, Target, History, DollarSign, ArrowRight, MoreVertical, Plus, Trophy, Clock } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toast } from 'sonner';

const stages = ['Prospecting', 'Qualification', 'Proposal', 'Negotiation', 'Closed Won'];

const DealManager = () => {
  const { deals, loading, fetchDeals, updateDeal } = useDeals();
  const [draggedDeal, setDraggedDeal] = useState(null);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const onDragStart = (deal) => {
    setDraggedDeal(deal);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = async (stage) => {
    if (!draggedDeal || draggedDeal.stage === stage) return;
    
    // Optimistic UI update
    const originalStage = draggedDeal.stage;
    updateDeal(draggedDeal.id, { stage });
    setDraggedDeal(null);
  };

  const calculateTotalValue = (stage) => {
    return deals
      .filter(d => d.stage === stage)
      .reduce((sum, d) => sum + (Number(d.value) || 0), 0);
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-[1800px] mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">Revenue Logistics</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Deal Matrix</h1>
          <p className="subtitle text-muted-foreground font-medium max-w-2xl">Visualizing active negotiations and weighted revenue pipeline velocity.</p>
        </div>
        <div className="flex gap-4">
            <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center gap-6 shadow-2xl backdrop-blur-xl">
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Pipe Value</p>
                   <p className="text-2xl font-black text-white">${deals.reduce((s,d) => s+(Number(d.value)||0), 0).toLocaleString()}</p>
                </div>
                <div className="w-px h-10 bg-white/10" />
                <div>
                   <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1">Weighted</p>
                   <p className="text-2xl font-black text-primary">${Math.round(deals.reduce((s,d) => {
                       const w = {'Prospecting':0.1, 'Qualification':0.2, 'Proposal':0.5, 'Negotiation':0.8, 'Closed Won':1};
                       return s + (Number(d.value)||0)*(w[d.stage]||0);
                   }, 0)).toLocaleString()}</p>
                </div>
            </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-[700px]">
        {stages.map((stage) => {
          const stageDeals = deals.filter(d => d.stage === stage);
          const isClosedWon = stage === 'Closed Won';
          
          return (
            <div 
              key={stage} 
              className={cn(
                "flex flex-col gap-4 p-4 rounded-3xl bg-black/20 border border-white/5 transition-all duration-500",
                isClosedWon ? "ring-1 ring-emerald-500/20 bg-emerald-500/[0.02]" : "hover:bg-black/30"
              )}
              onDragOver={onDragOver}
              onDrop={() => onDrop(stage)}
            >
              <div className="flex justify-between items-center px-2">
                <div className="flex flex-col">
                  <h3 className="text-[11px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                    <span className={cn("w-2 h-2 rounded-full", isClosedWon ? "bg-emerald-500" : "bg-primary")} />
                    {stage}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground mt-1">${calculateTotalValue(stage).toLocaleString()}</p>
                </div>
                <div className="w-6 h-6 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-muted-foreground">
                  {stageDeals.length}
                </div>
              </div>

              <div className="flex-1 space-y-4">
                {stageDeals.map((deal) => (
                  <div
                    key={deal.id}
                    draggable
                    onDragStart={() => onDragStart(deal)}
                    className="group glass-panel border-white/5 p-5 space-y-4 cursor-grab active:cursor-grabbing transition-all hover:scale-[1.02] hover:shadow-2xl hover:border-primary/20 relative overflow-hidden"
                  >
                    {isClosedWon && <div className="absolute -right-4 -top-4 w-12 h-12 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500 opacity-20"><Trophy className="h-4 w-4" /></div>}
                    
                    <div className="flex justify-between items-start">
                        <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{deal.title}</h4>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-tighter">{deal.company}</p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100"><MoreVertical className="h-3 w-3" /></Button>
                    </div>

                    <div className="flex items-center justify-between pt-2">
                        <div className="px-2 py-0.5 rounded-md bg-white/5 border border-white/5 text-[9px] font-black text-white flex items-center gap-1">
                            <DollarSign className="h-2.5 w-2.5 text-primary" />
                            {Number(deal.value).toLocaleString()}
                        </div>
                        <div className="flex items-center gap-1.5 opacity-40 group-hover:opacity-100 transition-opacity">
                            <Clock className="h-3 w-3 text-muted-foreground" />
                            <span className="text-[9px] font-bold text-muted-foreground uppercase">{deal.source || 'SF'}</span>
                        </div>
                    </div>
                  </div>
                ))}
                
                {stageDeals.length === 0 && (
                   <div className="h-32 border-2 border-dashed border-white/5 rounded-2xl flex items-center justify-center text-[10px] font-bold text-muted-foreground/30 uppercase tracking-widest italic">
                       Drop Node Here
                   </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DealManager;

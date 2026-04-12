import React, { useState } from 'react';
import { useProducts } from '../../contexts/ProductContext';
import { useAuth } from '../../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { 
  RotateCcw, 
  Play, 
  AlertTriangle,
  PackageCheck,
  Zap,
  Boxes
} from 'lucide-react';
import { cn } from '../../lib/utils';

const RestockSimulator = () => {
  const { products, updateProduct } = useProducts();
  const { currentUser } = useAuth();
  const [simulationData, setSimulationData] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastApplied, setLastApplied] = useState(null);

  const handleSimValueChange = (productId, value) => {
    setSimulationData(prev => ({
      ...prev,
      [productId]: parseInt(value) || 0
    }));
  };

  const applySimulation = async () => {
    setIsProcessing(true);
    try {
      for (const [productId, addAmount] of Object.entries(simulationData)) {
        if (addAmount <= 0) continue;
        
        const product = products.find(p => p.id === productId);
        if (product) {
          await updateProduct(productId, {
            ...product,
            stockLevel: product.stockLevel + addAmount,
            userId: currentUser.uid
          });
        }
      }
      setLastApplied(new Date());
      setSimulationData({});
    } catch (err) {
      alert("Simulation commit failed. Registry mismatch.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2 text-white/60">Optimization Suite</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Stock Simulator</h1>
          <p className="subtitle text-muted-foreground font-medium max-w-2xl">Model and authorize batch inventory replenishment in a sandbox environment.</p>
        </div>
        <div className="flex gap-4">
          <Button 
            variant="outline" 
            onClick={() => setSimulationData({})}
            className="h-14 px-6 glass-panel border-white/5 font-black uppercase tracking-widest text-[10px]"
          >
             <RotateCcw className="mr-2 h-4 w-4" /> Reset Sandbox
          </Button>
          <Button 
            onClick={applySimulation}
            disabled={isProcessing || Object.keys(simulationData).length === 0}
            className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs"
          >
            {isProcessing ? <Zap className="mr-3 h-5 w-5 animate-pulse" /> : <Play className="mr-3 h-5 w-5" />}
            Commit Simulation
          </Button>
        </div>
      </header>

      {lastApplied && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-500 text-xs font-bold uppercase tracking-widest">
          <PackageCheck className="h-5 w-5" />
          Batch replenishment successful. Registry updated at {lastApplied.toLocaleTimeString()}
        </div>
      )}

      <div className="grid gap-8">
        <Card className="glass-panel border-none shadow-3xl bg-black/40">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Active Inventory Registry</CardTitle>
            <CardDescription>Adjust the replenishment values for each node in the simulation.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-white/5 h-14 border-b border-white/5">
                   <tr>
                     <th className="pl-8 text-[10px] font-black uppercase tracking-widest text-white/40">Product Node</th>
                     <th className="text-[10px] font-black uppercase tracking-widest text-white/40">Current Units</th>
                     <th className="text-[10px] font-black uppercase tracking-widest text-white/40">Replenishment (+X)</th>
                     <th className="text-[10px] font-black uppercase tracking-widest text-white/40">Projected Total</th>
                     <th className="pr-8 text-right text-[10px] font-black uppercase tracking-widest text-white/40 text-primary">Status</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {products.map((product) => {
                    const addAmount = simulationData[product.id] || 0;
                    const projected = product.stockLevel + addAmount;
                    const isLow = product.stockLevel <= (product.reorderPoint || 10);
                    
                    return (
                       <tr key={product.id} className="h-20 hover:bg-white/[0.02]">
                         <td className="pl-8 font-bold text-white">{product.name}</td>
                         <td className="text-sm font-medium text-white/60">{product.stockLevel} units</td>
                         <td className="px-4">
                           <Input 
                             type="number" 
                             placeholder="0" 
                             className="w-24 h-11 glass-panel bg-white/5 border-white/5"
                             value={simulationData[product.id] || ''}
                             onChange={(e) => handleSimValueChange(product.id, e.target.value)}
                           />
                         </td>
                         <td className={cn("font-black", addAmount > 0 ? "text-primary" : "text-white/40")}>
                           {projected} units
                         </td>
                         <td className="pr-8 text-right">
                            {isLow && addAmount === 0 ? (
                              <div className="inline-flex items-center gap-1 text-amber-500 text-[10px] font-black uppercase tracking-tighter">
                                <AlertTriangle className="h-3 w-3" /> Critical Stock
                              </div>
                            ) : (
                               <div className="inline-flex items-center gap-1 text-emerald-500 text-[10px] font-black uppercase tracking-tighter">
                                <PackageCheck className="h-3 w-3" /> Stable
                              </div>
                            )}
                         </td>
                       </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      <section className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
         <Card className="glass-panel border-none p-8 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
               <Boxes className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-black text-white tracking-tight">Node Integrity</h3>
            <p className="text-xs font-medium text-muted-foreground leading-relaxed">
              Every simulation commit is processed as a bi-directional transaction, ensuring real-time consistency across the global inventory layer.
            </p>
         </Card>
      </section>
    </div>
  );
};

export default RestockSimulator;

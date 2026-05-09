import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { inventoryApi } from '../../services/inventoryApi';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/Card';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { 
  TrendingUp, 
  History, 
  Settings2, 
  QrCode, 
  Activity, 
  AlertTriangle,
  ChevronRight,
  Database,
  XCircle
} from 'lucide-react';
import { cn } from '../../lib/utils';

const ProductDetail = () => {
  const { id } = useParams();
  const { currentUser } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await inventoryApi.getProduct(id, currentUser.uid);
        setProduct(res.data);
      } catch (err) {
        setError("Node identity failed to synchronize.");
      } finally {
        setLoading(false);
      }
    };
    if (currentUser?.uid && id) fetchProduct();
  }, [id, currentUser]);

  if (loading) return (
    <div className="p-10 space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto">
      <Skeleton className="h-10 w-48 bg-white/5 rounded-xl" />
      <Skeleton className="h-64 w-full bg-white/5 rounded-3xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <Skeleton className="h-40 bg-white/5 rounded-3xl" />
        <Skeleton className="h-40 bg-white/5 rounded-3xl" />
        <Skeleton className="h-40 bg-white/5 rounded-3xl" />
      </div>
    </div>
  );

  if (error || !product) return (
    <div className="p-20 text-center flex flex-col items-center gap-6">
       <XCircle className="h-20 w-20 text-destructive opacity-40" />
       <h1 className="text-3xl font-black text-white italic">Identity Not Found</h1>
       <p className="text-muted-foreground font-medium">The requested product node does not exist in the current registry.</p>
       <Button variant="outline" asChild className="h-14 px-10 glass-panel border-white/10">
         <Link to="/inventory/manage">Back to Master Catalog</Link>
       </Button>
    </div>
  );

  const isLowStock = product.stockLevel <= (product.reorderPoint || 10);

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 max-w-6xl mx-auto pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary mb-3">
             <Link to="/inventory/manage" className="hover:underline">Catalog</Link>
             <ChevronRight className="h-3 w-3" />
             <span className="text-muted-foreground">Node Identity</span>
          </div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">{product.name}</h1>
          <p className="subtitle text-muted-foreground font-bold uppercase tracking-widest text-xs">Node Serial: {product.id.slice(-8).toUpperCase()}</p>
        </div>
        <div className="flex gap-4">
          <Button variant="outline" className="h-14 px-6 glass-panel border-white/5 font-black uppercase tracking-widest text-[10px]">
             <Settings2 className="mr-2 h-4 w-4" /> Edit Parameters
          </Button>
          <Button className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs">
             <Activity className="mr-3 h-5 w-5" /> Analytics Stream
          </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
           <Card className="glass-panel border-none shadow-3xl bg-black/40 overflow-hidden">
              <div className="h-2 bg-primary/20" />
              <CardHeader className="pb-2">
                 <CardTitle className="text-xl font-bold flex items-center gap-2">
                    <Database className="h-5 w-5 text-primary" /> Core Specifications
                 </CardTitle>
              </CardHeader>
              <CardContent className="space-y-8 p-10">
                 <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    <div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Stock Volume</div>
                       <div className={cn("text-4xl font-black", isLowStock ? "text-destructive" : "text-emerald-500")}>
                         {product.stockLevel}
                       </div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Unit Value</div>
                       <div className="text-4xl font-black text-white">${product.price?.toFixed(2)}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Threshold</div>
                       <div className="text-4xl font-black text-white/40">{product.reorderPoint || 0}</div>
                    </div>
                    <div>
                       <div className="text-[10px] font-bold text-muted-foreground uppercase mb-1">Global Class</div>
                       <div className="text-xl font-black text-primary uppercase tracking-tighter">{product.category}</div>
                    </div>
                 </div>
                 
                 <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40 mb-4">Neural Data Mapping</h4>
                    <p className="text-sm font-medium leading-relaxed text-white/80">
                       {product.description || "No manual identity metadata provided for this node. AI-generated mapping pending."}
                    </p>
                 </div>
              </CardContent>
           </Card>

           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="glass-panel border-none p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Supply Chain History</h3>
                    <History className="h-5 w-5 text-muted-foreground" />
                 </div>
                 <div className="space-y-4">
                    {[1,2,3].map(i => (
                       <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-none">
                          <div className="text-xs font-bold text-white/60">Batch Integration #{i*102}</div>
                          <div className="text-xs font-black text-emerald-500">+20 Units</div>
                       </div>
                    ))}
                 </div>
              </Card>
              <Card className="glass-panel border-none p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <h3 className="text-lg font-black text-white">Predicted Velocity</h3>
                    <TrendingUp className="h-5 w-5 text-primary" />
                 </div>
                 <div className="h-32 flex items-end gap-2 px-2">
                    {[3,5,2,8,6,9,4].map((h, i) => (
                       <div key={i} className="flex-1 bg-primary/20 rounded-t-lg transition-all hover:bg-primary/50" style={{ height: `${h * 10}%` }} />
                    ))}
                 </div>
                 <p className="text-[10px] font-bold text-muted-foreground text-center uppercase tracking-widest">7-Day Sales Node Forecast</p>
              </Card>
           </div>
        </div>

        <aside className="space-y-10">
           <Card className="glass-panel border-none bg-primary/5 p-10 text-center space-y-6">
              <div className="w-48 h-48 bg-white rounded-3xl mx-auto p-4 shadow-2xl flex items-center justify-center">
                 <QrCode className="w-full h-full text-black" />
              </div>
              <div>
                 <h4 className="text-xl font-black text-white uppercase tracking-tighter">Node Token</h4>
                 <p className="text-[10px] font-bold text-primary active-pulse uppercase tracking-[0.3em] mt-1">Authorized Entry</p>
              </div>
              <Button variant="outline" className="w-full h-12 border-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">Generate Print Label</Button>
           </Card>

           <Card className="glass-panel border-none p-8 space-y-6">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 border border-orange-500/20">
                    <AlertTriangle className="h-5 w-5" />
                 </div>
                 <h3 className="text-md font-black text-white">System Alerts</h3>
              </div>
              <div className="space-y-1">
                 {isLowStock ? (
                   <p className="text-xs font-medium text-destructive leading-relaxed font-bold italic">
                     Critical vulnerability detected: Supply volume is below defined threshold. Trigger replenishment phase.
                   </p>
                 ) : (
                   <p className="text-xs font-medium text-emerald-500 leading-relaxed font-bold italic">
                     Operational status nominal. No replenishment required for this cycle.
                   </p>
                 )}
              </div>
           </Card>
        </aside>
      </div>
    </div>
  );
};

export default ProductDetail;

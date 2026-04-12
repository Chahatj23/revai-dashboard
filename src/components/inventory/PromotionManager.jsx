import React from 'react';
import { usePromotions } from '../../contexts/PromotionContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { Percent, Calendar, Tag, Plus, CheckCircle2, XCircle } from 'lucide-react';
import { cn } from '../../lib/utils';

const PromotionManager = () => {
  const { promotions, loading } = usePromotions();

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 pb-24">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Market Injectors</h1>
          <p className="subtitle text-primary font-bold uppercase tracking-widest text-xs">Campaign Protocols & Price Adjustment Logic</p>
        </div>
        <Button size="lg" className="shadow-2xl shadow-primary/40 h-14 px-8 font-extrabold text-lg bg-orange-500 hover:bg-orange-600 border-none transition-all">
          <Plus className="mr-2 h-6 w-6" /> Deploy Campaign
        </Button>
      </header>

      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card className="glass-panel border-none shadow-2xl bg-gradient-to-br from-orange-500/10 to-transparent">
          <CardHeader>
            <CardTitle className="text-sm font-black uppercase tracking-widest text-orange-400">Yield Optimization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-5xl font-black text-white">{promotions.length}</div>
            <p className="text-[10px] font-bold text-muted-foreground mt-2 uppercase">Active Injection Protocols</p>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-none shadow-2xl overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-white/5 hover:bg-white/5 border-white/10">
              <TableHead className="font-black text-xs uppercase tracking-widest w-[30%]">Campaign Identity</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-center">Intensity</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-center">Operational Timeline</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-center">Status</TableHead>
              <TableHead className="font-black text-xs uppercase tracking-widest text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <TableRow key={i}><TableCell colSpan={5}><div className="h-14 bg-white/5 animate-pulse rounded-xl w-full" /></TableCell></TableRow>
              ))
            ) : promotions.length > 0 ? (
              promotions.map((promo) => (
                <TableRow key={promo.id} className="hover:bg-orange-500/5 border-white/5 transition-all group">
                  <TableCell>
                    <div className="flex items-center gap-4">
                      <div className="p-3 rounded-2xl bg-orange-500/20 text-orange-400 border border-orange-500/20 group-hover:scale-110 transition-transform">
                        <Tag className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="font-bold text-white text-lg">{promo.name}</div>
                        <div className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">{promo.description || "Experimental Protocol"}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-center font-black text-2xl text-orange-400">
                    -{promo.discountPercentage}%
                  </TableCell>
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center gap-1 font-bold text-muted-foreground text-[10px] uppercase tracking-widest">
                      <span>{new Date(promo.startDate).toLocaleDateString()}</span>
                      <div className="w-4 h-0.5 bg-white/10" />
                      <span>{new Date(promo.endDate).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <span className={cn(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest",
                      promo.status === 'active' ? "bg-emerald-500/20 text-emerald-500" : "bg-white/5 text-muted-foreground"
                    )}>
                      {promo.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/20 text-primary font-black uppercase tracking-widest text-[10px]">
                      Modify
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-20">
                  <Percent className="h-20 w-20 text-muted-foreground mx-auto mb-6 opacity-10" />
                  <p className="text-xl font-bold italic text-muted-foreground uppercase tracking-tighter">No market injections scheduled.</p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default PromotionManager;

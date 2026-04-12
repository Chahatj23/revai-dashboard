import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, FunnelChart, Funnel, LabelList
} from 'recharts';
import { LayoutDashboard, TrendingUp, Target, Users, Zap, Calendar, Download, RefreshCw, BarChart3, PieChart as PieIcon, Activity } from 'lucide-react';
import axios from 'axios';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#ef4444'];

const ExecutiveReports = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5000/api/crm/summary', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error("Failed to fetch executive summary", err);
      toast.error("Intelligence synchronization failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  if (loading) {
    return (
      <div className="p-10 flex items-center justify-center min-h-[600px]">
        <div className="flex flex-col items-center gap-4 animate-pulse">
           <div className="w-12 h-12 bg-primary/20 rounded-full" />
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/60">Compiling Business Intelligence...</p>
        </div>
      </div>
    );
  }

  const sourceData = Object.entries(data?.leadStats?.bySource || {}).map(([name, value]) => ({ name, value }));

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">Strategic Intelligence</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Executive Reports</h1>
          <p className="subtitle text-muted-foreground font-medium max-w-2xl">High-fidelity visualization of revenue funnels, pipeline velocity, and source ROI.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="h-14 px-6 glass-panel border-white/5 font-black uppercase tracking-widest text-[10px]" onClick={fetchSummary}>
            <RefreshCw className="mr-2 h-4 w-4" /> Refresh Engine
          </Button>
          <Button className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs">
            <Download className="mr-3 h-5 w-5" /> Export PDF
          </Button>
        </div>
      </header>

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Revenue', value: `$${data?.totalRevenue?.toLocaleString()}`, icon: TrendingUp, color: 'text-emerald-500' },
          { label: 'Pipeline Value', value: `$${data?.dealStats?.totalValue?.toLocaleString()}`, icon: Target, color: 'text-primary' },
          { label: 'Total Customers', value: data?.customersCount, icon: Users, color: 'text-blue-500' },
          { label: 'Conversion Rate', value: `${((data?.customersCount / (data?.leadStats?.total || 1)) * 100).toFixed(1)}%`, icon: Zap, color: 'text-amber-500' }
        ].map((stat, i) => (
          <Card key={i} className="glass-panel border-none bg-white/[0.02] hover:bg-white/[0.04] transition-all">
            <CardContent className="pt-8">
               <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                    <h3 className="text-3xl font-black text-white">{stat.value}</h3>
                  </div>
                  <div className={cn("p-2 rounded-xl bg-white/5 border border-white/5 shadow-inner", stat.color)}>
                     <stat.icon size={20} />
                  </div>
               </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Conversion Funnel */}
        <Card className="glass-panel border-none bg-white/[0.02] flex flex-col min-h-[450px]">
           <CardHeader>
              <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                 <Activity className="h-5 w-5 text-primary" />
                 Revenue Conversion Funnel
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Lifecycle Velocity: Lead ➔ Deal ➔ Customer</CardDescription>
           </CardHeader>
           <CardContent className="flex-1 pb-10">
              <ResponsiveContainer width="100%" height={300}>
                <FunnelChart>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                     itemStyle={{ color: '#6366f1', fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                  <Funnel
                    dataKey="value"
                    data={data?.funnel}
                    isAnimationActive
                  >
                    <LabelList position="right" fill="#888" stroke="none" dataKey="name" style={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                    {data?.funnel.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.8} />
                    ))}
                  </Funnel>
                </FunnelChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>

        {/* Source Distribution */}
        <Card className="glass-panel border-none bg-white/[0.02] flex flex-col min-h-[450px]">
           <CardHeader>
              <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                 <PieIcon className="h-5 w-5 text-purple-500" />
                 Origin ROI (Source Distribution)
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Lead generation performance by channel</CardDescription>
           </CardHeader>
           <CardContent className="flex-1 pb-10">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={sourceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {sourceData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                     contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                     itemStyle={{ fontWeight: 'bold', fontSize: '10px', textTransform: 'uppercase' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex justify-center gap-6 mt-4">
                  {sourceData.map((s, i) => (
                      <div key={i} className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">{s.name} ({s.value})</span>
                      </div>
                  ))}
              </div>
           </CardContent>
        </Card>

        {/* Pipeline Value Chart */}
        <Card className="glass-panel border-none bg-white/[0.02] lg:col-span-2">
           <CardHeader>
              <CardTitle className="text-xl font-black text-white flex items-center gap-3">
                 <BarChart3 className="h-5 w-5 text-emerald-500" />
                 Pipeline Volume per Phase
              </CardTitle>
              <CardDescription className="text-xs font-bold uppercase tracking-widest text-muted-foreground italic">Total Deal value sharded by pipeline stage</CardDescription>
           </CardHeader>
           <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={Object.entries(data?.dealStats?.byStage || {}).map(([name, count]) => ({ name, count }))}>
                  <XAxis dataKey="name" stroke="#555" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <YAxis stroke="#555" fontSize={10} fontWeight="bold" tickLine={false} axisLine={false} />
                  <Tooltip 
                     cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                     contentStyle={{ backgroundColor: '#111', border: '1px solid #333', borderRadius: '12px' }}
                  />
                  <Bar dataKey="count" fill="url(#colorBar)" radius={[10, 10, 0, 0]} />
                  <defs>
                    <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={1}/>
                      <stop offset="100%" stopColor="#a855f7" stopOpacity={0.8}/>
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
           </CardContent>
        </Card>
      </div>

      <Card className="glass-panel border-none bg-primary/[0.03] overflow-hidden relative p-10 mt-10">
         <div className="absolute right-0 top-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
         <div className="relative flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="space-y-4">
               <h2 className="text-3xl font-black text-white tracking-tighter">Strategic Analysis Ready</h2>
               <p className="text-muted-foreground font-medium max-w-xl">
                 Your business pulse is synchronized. Use these insights to rebalance inventory restock levels or allocate growth capital to your highest ROI lead sources.
               </p>
            </div>
            <Button className="h-14 px-10 font-bold uppercase tracking-widest text-xs shadow-2xl shadow-primary/30">
               Optimize Operations
            </Button>
         </div>
      </Card>
    </div>
  );
};

export default ExecutiveReports;

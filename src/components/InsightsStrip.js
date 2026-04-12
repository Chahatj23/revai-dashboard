import React from 'react';
import { Card, CardContent } from './ui/Card';
import { TrendingUp, Zap, Briefcase, AlertCircle, ArrowUpRight } from 'lucide-react';

const InsightsStrip = ({ leads }) => {
  const totalValue = leads.reduce((sum, lead) => sum + (lead.expected_deal_size || 0), 0);
  const avgProbability = leads.length > 0 
    ? Math.round(leads.reduce((sum, lead) => sum + (lead.conversion_probability || 0), 0) / leads.length) 
    : 0;
  const activeDeals = leads.filter(l => l.status !== 'Closed').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="glass-panel border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-xl">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Pipeline Value</p>
              <h4 className="text-2xl font-extrabold">${totalValue.toLocaleString()}</h4>
            </div>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> 12% increase this month
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-accent/10 rounded-xl">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Conversion Rate</p>
              <h4 className="text-2xl font-extrabold">{avgProbability}%</h4>
            </div>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 mt-2 flex items-center gap-1">
            <ArrowUpRight className="h-3 w-3" /> Optimized by AI agent
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-500/10 rounded-xl">
              <Briefcase className="h-6 w-6 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Active Deals</p>
              <h4 className="text-2xl font-extrabold">{activeDeals}</h4>
            </div>
          </div>
          <p className="text-[10px] font-bold text-muted-foreground mt-2">
            3 requires immediate action
          </p>
        </CardContent>
      </Card>

      <Card className="glass-panel border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-500/10 rounded-xl">
              <AlertCircle className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Risk Score</p>
              <h4 className="text-2xl font-extrabold">Low</h4>
            </div>
          </div>
          <p className="text-[10px] font-bold text-emerald-500 mt-2">
            Supply chain stabilized
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default InsightsStrip;

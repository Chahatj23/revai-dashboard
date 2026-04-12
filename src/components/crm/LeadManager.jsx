import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/Table';
import { useLeads } from '../../contexts/LeadContext';
import { useDeals } from '../../contexts/DealContext';
import { Search, Plus, Filter, MoreHorizontal, ArrowUpRight, BadgeCheck, Zap, Globe, ShieldCheck, Mail, Phone, Trash2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import LeadModal from '../LeadModal';
import { toast } from 'sonner';

const LeadManager = () => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const { leads, loading, fetchLeads, updatePriority, deleteLead } = useLeads();
  const { addDeal } = useDeals();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const filteredLeads = leads.filter(lead => 
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleConvertToDeal = async (lead) => {
    try {
      await addDeal({
        title: `${lead.company} - Expansion`,
        value: lead.expected_deal_size || 5000,
        stage: 'Qualification',
        contactName: lead.name,
        contactEmail: lead.email || '',
        contactPhone: lead.phone || '',
        company: lead.company,
        source: lead.source,
        associatedLeadId: lead.id
      });
      toast.success("Lead converted to active Deal pipeline");
    } catch (err) {
      toast.error("Handover failed");
    }
  };

  const getSourceIcon = (source) => {
    switch (source?.toLowerCase()) {
      case 'salesforce': return <Globe className="h-3 w-3 text-blue-400" />;
      case 'csv': return <BadgeCheck className="h-3 w-3 text-emerald-400" />;
      default: return <ShieldCheck className="h-3 w-3 text-purple-400" />;
    }
  };

  return (
    <div className="p-10 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-24 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-1">
          <div className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-2">CRM Intelligence</div>
          <h1 className="text-5xl font-extrabold tracking-tighter text-white">Lead Reservoir</h1>
          <p className="subtitle text-muted-foreground font-medium max-w-2xl">Manage prospective revenue streams fueled by AI-driven predictive scoring.</p>
        </div>
        <div className="flex gap-4">
            <Button variant="outline" className="h-14 px-6 glass-panel border-white/5 font-black uppercase tracking-widest text-[10px]">
                <Filter className="mr-2 h-4 w-4" /> Advanced Filter
            </Button>
            <Button className="h-14 px-8 shadow-2xl shadow-primary/30 font-black uppercase tracking-widest text-xs" onClick={() => { setEditingLead(null); setIsModalOpen(true); }}>
                <Plus className="mr-3 h-5 w-5" /> Seed New Lead
            </Button>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="glass-panel border-none bg-primary/5">
              <CardContent className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">High Velocity</p>
                  <h3 className="text-3xl font-black text-white">{leads.filter(l => l.priority === 'Hot').length}</h3>
              </CardContent>
          </Card>
          <Card className="glass-panel border-none bg-amber-500/5">
              <CardContent className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Engagement</p>
                  <h3 className="text-3xl font-black text-white">{leads.filter(l => l.priority === 'Warm').length}</h3>
              </CardContent>
          </Card>
          <Card className="glass-panel border-none bg-blue-500/5">
              <CardContent className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Cold Storage</p>
                  <h3 className="text-3xl font-black text-white">{leads.filter(l => l.priority === 'Cold').length}</h3>
              </CardContent>
          </Card>
          <Card className="glass-panel border-none bg-purple-500/5">
              <CardContent className="pt-6">
                  <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-1">Conversion Potential</p>
                  <h3 className="text-3xl font-black text-white">
                      {((leads.filter(l => l.score > 80).length / leads.length || 0) * 100).toFixed(0)}%
                  </h3>
              </CardContent>
          </Card>
      </div>

      <div className="space-y-6">
        <div className="flex items-center gap-4 relative max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by lead name or organization..." 
            className="pl-12 h-14 glass-panel border-white/5 bg-white/5 focus:ring-primary shadow-2xl"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="rounded-2xl border border-white/5 bg-black/40 backdrop-blur-xl overflow-hidden shadow-2xl">
          <Table>
            <TableHeader className="bg-white/5">
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Lead / Enterprise</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-center">AI Score</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Engagement Source</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6">Next Pulse</TableHead>
                <TableHead className="text-[10px] font-black uppercase tracking-widest py-6 text-right px-8">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i} className="animate-pulse border-white/5">
                    <TableCell colSpan={5} className="h-16 bg-white/5" />
                  </TableRow>
                ))
              ) : filteredLeads.length === 0 ? (
                 <TableRow>
                   <TableCell colSpan={5} className="h-32 text-center text-muted-foreground font-bold italic">No records synchronized in the current cluster.</TableCell>
                 </TableRow>
              ) : (
                filteredLeads.map((lead) => (
                  <TableRow key={lead.id} className="border-white/5 hover:bg-white/[0.02] transition-colors group cursor-pointer" onClick={() => navigate(`/org/${orgId}/leads/${lead.id}`)}>
                    <TableCell className="py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center font-black text-primary border border-primary/20">
                          {lead.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-white text-sm">{lead.name}</div>
                          <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
                            {lead.company}
                            {lead.score >= 90 && <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className={cn(
                        "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        lead.score > 80 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : 
                        lead.score > 50 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : 
                        "bg-red-500/10 text-red-500 border-red-500/20"
                      )}>
                        {lead.score}% Precision
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest bg-white/5 w-fit px-3 py-1.5 rounded-lg border border-white/5">
                         {getSourceIcon(lead.source)}
                         {lead.source || "Manual"}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-[10px] font-bold text-white uppercase tracking-widest flex items-center gap-2">
                         <span className={cn("w-2 h-2 rounded-full", lead.priority === 'Hot' ? "bg-primary animate-pulse" : "bg-muted-foreground")} />
                         {lead.next_action || "Pending AI Decision"}
                      </div>
                    </TableCell>
                    <TableCell className="text-right px-8">
                       <div className="flex items-center justify-end gap-2">
                          {lead.score >= 90 ? (
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary hover:text-white transition-all shadow-lg shadow-primary/20" onClick={() => handleConvertToDeal(lead)}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg glass-panel border-white/5 hover:bg-white/10" onClick={() => handleConvertToDeal(lead)}>
                              <ArrowUpRight className="h-4 w-4 opacity-40" />
                            </Button>
                          )}
                          <Button size="icon" variant="ghost" className="h-9 w-9 rounded-lg hover:bg-red-500/20 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => deleteLead(lead.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <LeadModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={() => fetchLeads()} 
        existingLead={editingLead} 
      />
    </div>
  );
};

export default LeadManager;

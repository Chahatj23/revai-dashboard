import { useEffect, useState, useCallback, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getLeads, getDeals, seedDemoData, updateLeadPriority } from "../../services/api";
import { toast } from "sonner";
import axios from "axios";
import { API_BASE_URL } from "../../config";
import LeadChart from "../LeadChart";
import InsightsStrip from "../InsightsStrip";
import TodayFocus from "../TodayFocus";
import LeadDetailPanel from "../LeadDetailPanel";
import TodayTasks from "../TodayTasks";
import PipelineKanban from "../PipelineKanban";
import SmartAlerts from "../SmartAlerts";
import LeadModal from "../LeadModal";
import ReactMarkdown from 'react-markdown';
import { Button } from "../ui/Button";
import { cn } from "../../lib/utils";

const CRMDashboard = ({ showPipelineOnly = false }) => {
  const { orgId } = useParams();
  const navigate = useNavigate();
  const [leads, setLeads] = useState([]);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  const isActionPending = useRef(false);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // AI Agent State
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);

  const fetchLeads = useCallback(async () => {
    if (isActionPending.current) return;
    isActionPending.current = true;
    try {
      const [leadsRes, dealsRes] = await Promise.all([
        getLeads(),
        getDeals()
      ]);
      setLeads(leadsRes.data);
      setDeals(dealsRes.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      isActionPending.current = false;
    }
  }, []);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  const handleSeedData = async () => {
    if (isActionPending.current) return;
    isActionPending.current = true;
    try {
      await seedDemoData();
      // Directly call fetch logic without the ref check here to ensure refresh
      const [leadsRes, dealsRes] = await Promise.all([
        getLeads(),
        getDeals()
      ]);
      setLeads(leadsRes.data);
      setDeals(dealsRes.data);
      toast.success("Environment seeded successfully.");
    } catch (e) {
      toast.error("Seeding parity error.");
    } finally {
      isActionPending.current = false;
    }
  };

  const askAgent = async () => {
    if (!query.trim() || agentLoading) return;
    
    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setAgentLoading(true);
    
    try {
      const res = await axios.post(`${API_BASE_URL}/agent/query`, { 
        query: currentQuery,
        history: messages
      });
      setMessages(prev => [...prev, { role: 'agent', text: res.data.answer }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'agent', text: "Error communicating with AI Agent." }]);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleLeadDrop = async (leadId, newPriority) => {
    setLeads(prevLeads => prevLeads.map(l => 
      (l.id === leadId || l.name === leadId) ? { ...l, priority: newPriority } : l
    ));
    
    try {
      await updateLeadPriority(leadId, newPriority);
    } catch (e) {
      console.error("Failed to update priority in backend", e);
    }
  };

  return (
    <div className="crm-dashboard space-y-8 animate-in fade-in duration-500">
      {!showPipelineOnly && (
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold tracking-tight text-white">Revenue Insights</h1>
            <p className="subtitle text-muted-foreground font-medium">Real-time business analytics and AI forecasting</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isActionPending.current}>
              Seed Sample Data
            </Button>
            <Button variant="outline" size="sm">
              Generate Report
            </Button>
            <Button size="sm" onClick={() => { setEditingLead(null); setIsModalOpen(true); }}>
              + New Lead
            </Button>
          </div>
        </header>
      )}
      
      <main className="dashboard-main mt-0">
        {loading ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="animate-pulse flex flex-col items-center gap-4">
                <div className="w-12 h-12 bg-primary/20 rounded-full" />
                <p className="text-muted-foreground font-bold italic">Synchronizing data models...</p>
              </div>
            </div>
        ) : (
          <div className="w-full max-w-[1600px] mx-auto space-y-10">
            {/* Main Stage - Full Width Now */}
            {!showPipelineOnly && <InsightsStrip leads={leads} deals={deals} />}
            <div className="grid gap-8">
              {!showPipelineOnly && <LeadChart leads={leads} />}
              <PipelineKanban leads={leads} onLeadClick={(lead) => navigate(`/org/${orgId}/leads/${lead.id}`)} onLeadDrop={handleLeadDrop} />
            </div>

            {/* Widgets Section - Moved Downwards */}
            {!showPipelineOnly && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
                <TodayFocus leads={leads} onLeadClick={setSelectedLead} />
                <SmartAlerts leads={leads} onLeadClick={setSelectedLead} />
                <TodayTasks />
              </div>
            )}
            
            <section className="ai-agent-container">
                <div className="agent-header mb-8">
                  <h3 className="text-2xl font-extrabold flex items-center gap-2">
                    <span className="text-primary">✨</span> AI Business Analyst
                  </h3>
                  <p className="text-sm text-muted-foreground font-medium">Inquiry system for CRM and inventory datasets</p>
                </div>
                
                <div className="chat-history-area max-h-[500px] overflow-y-auto mb-6 pr-4 space-y-4">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={cn(
                      "chat-bubble p-4 rounded-2xl max-w-[85%] shadow-sm",
                      msg.role === 'user' 
                        ? 'bg-primary text-primary-foreground ml-auto' 
                        : 'bg-card border-border border-2'
                    )}>
                      <ReactMarkdown className="prose prose-sm dark:prose-invert">{msg.text}</ReactMarkdown>
                    </div>
                  ))}
                  {agentLoading && (
                    <div className="chat-bubble bg-muted/30 p-4 rounded-2xl max-w-[80%] border-2 border-dashed border-primary/20">
                      <p className="typing-indicator italic text-primary/60 font-bold">RevAI is processing...</p>
                    </div>
                  )}
                </div>
                
                <div className="agent-input-group flex gap-3">
                  <input
                    className="agent-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask about your leads or current inventory status..."
                    onKeyDown={(e) => e.key === 'Enter' && askAgent()}
                  />
                  <Button className="px-8" onClick={askAgent} disabled={agentLoading}>
                    Send
                  </Button>
                </div>
              </section>
          </div>
        )}
      </main>
      
      <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onEdit={(lead) => { setEditingLead(lead); setIsModalOpen(true); }} onDeleteSuccess={() => { setSelectedLead(null); fetchLeads(); }} />
      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => fetchLeads()} existingLead={editingLead} />
    </div>
  );
};

export default CRMDashboard;

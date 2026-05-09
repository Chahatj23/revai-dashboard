import { useEffect, useState } from "react";
import { getLeads, updateLeadPriority } from "./services/api";
import axios from "axios";
import LeadChart from "./components/LeadChart";
import InsightsStrip from "./components/InsightsStrip";
import TodayFocus from "./components/TodayFocus";
import LeadDetailPanel from "./components/LeadDetailPanel";
import TodayTasks from "./components/TodayTasks";
import PipelineKanban from "./components/PipelineKanban";
import SmartAlerts from "./components/SmartAlerts";
import LeadModal from "./components/LeadModal";
import ReactMarkdown from 'react-markdown';

function App() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState(null);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState(null);

  // AI Agent State
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([]);
  const [agentLoading, setAgentLoading] = useState(false);


  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      const res = await getLeads();
      setLeads(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const filteredLeads = filter === "ALL" ? leads : leads.filter((l) => l.priority === filter);

  const askAgent = async () => {
    if (!query.trim()) return;
    
    const userMessage = { role: 'user', text: query };
    setMessages(prev => [...prev, userMessage]);
    const currentQuery = query;
    setQuery("");
    setAgentLoading(true);
    
    try {
      const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:5000/api";
      const res = await axios.post(`${baseUrl}/agent/query`, { 
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
    // Optimistic Update
    setLeads(prevLeads => prevLeads.map(l => 
      (l.id === leadId || l.name === leadId) ? { ...l, priority: newPriority } : l
    ));
    
    // API Call
    try {
      await updateLeadPriority(leadId, newPriority);
    } catch (e) {
      console.error("Failed to update priority in backend", e);
      // Could revert state here on failure in a real app
    }
  };

  return (
    <div className="dashboard-container">
      
      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1>RevAI CRM Dashboard</h1>
          <p className="subtitle">AI-Powered Revenue Intelligence</p>
        </div>
        <button className="btn-sm btn-outline" onClick={() => { setEditingLead(null); setIsModalOpen(true); }} style={{ padding: '10px 15px', fontWeight: 'bold' }}>
          + New Lead
        </button>
      </header>
      
      <main className="dashboard-main">
        {loading ? (
            <div className="loader">Loading intelligence...</div>
        ) : (
          <div className="pro-layout-grid">
            {/* Left Sidebar */}
            <aside className="pro-sidebar">
              <TodayFocus leads={leads} onLeadClick={setSelectedLead} />
              <SmartAlerts leads={leads} onLeadClick={setSelectedLead} />
              <TodayTasks />
            </aside>
            
            {/* Main Stage */}
            <main className="pro-main-stage">
              <InsightsStrip leads={leads} />
              <LeadChart leads={leads} />
              <PipelineKanban leads={leads} onLeadClick={setSelectedLead} onLeadDrop={handleLeadDrop} />
              
              <div className="ai-agent-container glass-panel mt-20">
                <div className="agent-header">
                  <h3>✨ Ask RevAI Assistant</h3>
                  <p>Chat with your live CRM data</p>
                </div>
                
                <div className="chat-history-area">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`chat-bubble ${msg.role === 'user' ? 'user-bubble' : 'agent-bubble fade-in'}`}>
                      {msg.role === 'user' ? (
                        <p>{msg.text}</p>
                      ) : (
                        <>
                          <div className="response-content">
                            <ReactMarkdown>{msg.text}</ReactMarkdown>
                          </div>
                          {/* Quick Action Buttons */}
                          <div className="chat-actions">
                            <button className="chat-action-btn" onClick={() => { setQuery("Show me all hot leads"); askAgent(); }}>🔥 Hot Leads</button>
                            <button className="chat-action-btn" onClick={() => { setQuery("What deals are at risk?"); askAgent(); }}>⚠️ At Risk</button>
                            <button className="chat-action-btn" onClick={() => { setQuery("Give me a pipeline summary"); askAgent(); }}>📊 Summary</button>
                            <button className="chat-action-btn" onClick={() => { setQuery("Which leads should I follow up today?"); askAgent(); }}>📞 Follow-ups</button>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                  {agentLoading && (
                    <div className="chat-bubble agent-bubble fade-in">
                      <p className="typing-indicator">Gathering intelligence...</p>
                    </div>
                  )}
                  {messages.length === 0 && !agentLoading && (
                    <div style={{ textAlign: 'center', padding: '20px 0' }}>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: '15px' }}>Try asking something:</p>
                      <div className="chat-actions" style={{ justifyContent: 'center' }}>
                        <button className="chat-action-btn" onClick={() => { setQuery("Show me all hot leads"); }}>🔥 Hot Leads</button>
                        <button className="chat-action-btn" onClick={() => { setQuery("Revenue forecast this quarter"); }}>💰 Forecast</button>
                        <button className="chat-action-btn" onClick={() => { setQuery("Which leads should I follow up today?"); }}>📞 Follow-ups</button>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="agent-input-group mt-20">
                  <input
                    className="agent-input"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Ask a follow-up question..."
                    onKeyDown={(e) => e.key === 'Enter' && askAgent()}
                  />
                  <button className="agent-btn" onClick={askAgent} disabled={agentLoading}>
                    Send
                  </button>
                </div>
              </div>
            </main>
          </div>
        )}
      </main>
      
      <LeadDetailPanel lead={selectedLead} onClose={() => setSelectedLead(null)} onEdit={(lead) => { setEditingLead(lead); setIsModalOpen(true); }} onDeleteSuccess={() => { setSelectedLead(null); fetchLeads(); }} />
      <LeadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onSave={() => fetchLeads()} existingLead={editingLead} />
    </div>
  );
}

export default AppWithProviders;

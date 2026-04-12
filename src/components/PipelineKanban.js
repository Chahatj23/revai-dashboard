import React from 'react';
import { cn } from "../lib/utils";

const PipelineKanban = ({ leads, onLeadClick, onLeadDrop }) => {

  const grouped = {
    Hot: leads.filter(l => l.priority === "Hot" || l.score > 80),
    Warm: leads.filter(l => l.priority === "Warm" || (l.score > 50 && l.score <= 80)),
    Cold: leads.filter(l => l.priority === "Cold" || l.score <= 50),
  };

  const handleDragStart = (e, lead) => {
    // We use lead.id if it exists, otherwise lead.name as the unique identifier
    const id = lead.id || lead.name;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Slight delay to allow the ghost image to render before applying styles to the original
    setTimeout(() => {
      e.target.classList.add('is-dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('is-dragging');
  };

  const handleDragOver = (e) => {
    e.preventDefault(); // Necessary to allow dropping
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetPriority) => {
    e.preventDefault();
    const leadId = e.dataTransfer.getData('text/plain');
    if (leadId && onLeadDrop) {
      onLeadDrop(leadId, targetPriority);
    }
  };

  return (
    <div className="kanban-container">
      {Object.entries(grouped).map(([priority, priorityLeads]) => (
        <div 
          key={priority} 
          className={cn(
            "kanban-column group/column transition-colors duration-300",
            priority === 'Hot' ? 'bg-red-500/5 hover:bg-red-500/10' : 
            priority === 'Warm' ? 'bg-amber-500/5 hover:bg-amber-500/10' : 
            'bg-blue-500/5 hover:bg-blue-500/10'
          )}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, priority)}
        >
          <div className="column-header">
            <h4 className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                priority === 'Hot' ? 'bg-red-500' : 
                priority === 'Warm' ? 'bg-amber-500' : 
                'bg-blue-500'
              )}></span>
              {priority} Leads
            </h4>
            <span className="text-[10px] font-bold bg-muted/50 px-2 py-1 rounded-full">{priorityLeads.length}</span>
          </div>
          
          <div className="kanban-cards space-y-4">
            {priorityLeads.map((lead, idx) => (
              <div 
                key={lead.id || `${lead.name}-${idx}`} 
                className="kanban-card group border-2 border-transparent hover:border-primary/30"
                draggable="true"
                onDragStart={(e) => handleDragStart(e, lead)}
                onDragEnd={handleDragEnd}
                onClick={() => onLeadClick(lead)}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="min-w-0">
                    <h5 className="font-bold text-base truncate pr-2 group-hover:text-primary transition-colors">{lead.name}</h5>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest truncate">
                      {lead.company}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className="text-xs font-extrabold text-primary">${(lead.expected_deal_size || 0).toLocaleString()}</span>
                    <span className="text-[9px] font-black bg-primary/10 text-primary px-1.5 py-0.5 rounded leading-none">
                      {lead.score}
                    </span>
                  </div>
                </div>
                
                <div className="smart-badges mb-4">
                  {priority === 'Hot' && <span className="smart-badge badge-fire">🔥 Hot</span>}
                  {lead.conversion_probability >= 70 && <span className="smart-badge badge-intent">⚡ {lead.conversion_probability}%</span>}
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-muted/50">
                  <span className="text-[10px] font-bold text-primary italic uppercase tracking-wider">{lead.next_action || 'Nurture'}</span>
                  {lead.id && lead.id.startsWith('00Q') && (
                    <a 
                      href={`https://swankie-dev-ed.develop.my.salesforce.com/${lead.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="p-1 px-2 rounded bg-[#00A1E0]/10 hover:bg-[#00A1E0]/20 transition-colors"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <span className="text-[9px] font-black text-[#00A1E0]">SF</span>
                    </a>
                  )}
                </div>
              </div>
            ))}
            {priorityLeads.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-muted rounded-xl">
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">No active leads</p>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PipelineKanban;

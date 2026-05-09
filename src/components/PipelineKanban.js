import { useState } from 'react';

const PipelineKanban = ({ leads, onLeadClick, onLeadDrop }) => {
  const [draggedLeadId, setDraggedLeadId] = useState(null);

  const grouped = {
    Hot: leads.filter(l => l.priority === "Hot" || l.score > 80),
    Warm: leads.filter(l => l.priority === "Warm" || (l.score > 50 && l.score <= 80)),
    Cold: leads.filter(l => l.priority === "Cold" || l.score <= 50),
  };

  const handleDragStart = (e, lead) => {
    // We use lead.id if it exists, otherwise lead.name as the unique identifier
    const id = lead.id || lead.name;
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    
    // Slight delay to allow the ghost image to render before applying styles to the original
    setTimeout(() => {
      e.target.classList.add('is-dragging');
    }, 0);
  };

  const handleDragEnd = (e) => {
    e.target.classList.remove('is-dragging');
    setDraggedLeadId(null);
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
    setDraggedLeadId(null);
  };

  return (
    <div className="kanban-container">
      {Object.entries(grouped).map(([priority, priorityLeads]) => (
        <div 
          key={priority} 
          className={`kanban-column column-${priority.toLowerCase()}`}
          onDragOver={handleDragOver}
          onDrop={(e) => handleDrop(e, priority)}
        >
          <div className="column-header">
            <h4>{priority} Leads</h4>
            <span className="lead-count">{priorityLeads.length}</span>
          </div>
          
          <div className="kanban-cards">
            {priorityLeads.map((lead, idx) => (
              <div 
                key={lead.id || `${lead.name}-${idx}`} 
                className="kanban-card"
                draggable="true"
                onDragStart={(e) => handleDragStart(e, lead)}
                onDragEnd={handleDragEnd}
                onClick={() => onLeadClick(lead)}
              >
                <div className="card-top">
                  <div className="lead-identity">
                    <h5 className="lead-name">{lead.name}</h5>
                    <div className="lead-subtitle">
                      {lead.title !== 'No Title' ? `${lead.title} @ ` : ''}{lead.company}
                    </div>
                  </div>
                  <span className="score-number">{lead.score}</span>
                </div>
                
                <div className="smart-badges">
                  {priority === 'Hot' && <span className="smart-badge badge-fire">🔥 Hot</span>}
                  {lead.conversion_probability >= 70 && <span className="smart-badge badge-intent">⚡ {lead.conversion_probability}% Prob</span>}
                  {lead.expected_deal_size > 0 && <span className="smart-badge badge-money">💰 ${lead.expected_deal_size.toLocaleString()}</span>}
                </div>
                
                <div className="card-bottom-row">
                  <span className="card-action">{lead.next_action || 'Nurture'}</span>
                  {lead.id && lead.id.startsWith('00Q') && (
                    <a 
                      href={`https://swankie-dev-ed.develop.my.salesforce.com/${lead.id}`} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="sf-record-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      ☁️ SF
                    </a>
                  )}
                </div>
              </div>
            ))}
            {priorityLeads.length === 0 && <div className="kanban-empty">Drag leads here</div>}
          </div>
        </div>
      ))}
    </div>
  );
};

export default PipelineKanban;

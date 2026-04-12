const TodayFocus = ({ leads, onLeadClick }) => {
  const topLeads = leads
    .filter(l => l.score > 80)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  if (topLeads.length === 0) return (
    <div className="today-focus-container glass-panel">
      <h3 className="section-title focus-title">🔥 Today's Focus</h3>
      <p className="empty-state">No high-priority leads at the moment.</p>
    </div>
  );

  return (
    <div className="today-focus-container glass-panel">
      <div className="focus-header">
        <h3 className="section-title focus-title">🔥 Today's Focus</h3>
        <span className="subtitle-sm">Top Priority Actions</span>
      </div>
      <div className="focus-list">
        {topLeads.map((lead, index) => (
          <div key={index} className="focus-card" onClick={() => onLeadClick(lead)}>
            <div className="focus-card-info">
              <h4>{lead.name}</h4>
              <div className="focus-meta" style={{ flexWrap: 'wrap', gap: '5px' }}>
                <span className="badge badge-hot">Score: {lead.score}</span>
                {lead.conversion_probability && <span className="badge badge-warm">{lead.conversion_probability}% Prob</span>}
                {lead.expected_deal_size > 0 && <span className="badge badge-cold" style={{background: 'rgba(52, 211, 153, 0.15)', color: '#34d399', borderColor: 'rgba(52, 211, 153, 0.3)'}}>${lead.expected_deal_size.toLocaleString()}</span>}
              </div>
            </div>
            <div className="focus-card-action">
              <span className="action-recommendation">→ {lead.next_action}</span>
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
      </div>
    </div>
  );
};

export default TodayFocus;

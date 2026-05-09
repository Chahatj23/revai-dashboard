const LeadTable = ({ leads, onLeadClick }) => {
  const getPriorityBadge = (priority) => {
    switch(priority) {
      case 'Hot': return <span className="badge badge-hot">🔴 Hot</span>;
      case 'Warm': return <span className="badge badge-warm">🟡 Warm</span>;
      case 'Cold': return <span className="badge badge-cold">🔵 Cold</span>;
      default: return <span className="badge">{priority}</span>;
    }
  };

  if (leads.length === 0) {
    return <div className="empty-state">No leads found for this filter.</div>;
  }

  return (
    <div className="table-container">
      <table className="lead-table">
        <thead>
          <tr>
            <th>Lead Name</th>
            <th>AI Score</th>
            <th>Priority</th>
            <th>Next Action</th>
            <th>Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {leads.map((lead, index) => (
            <tr key={index} onClick={() => onLeadClick && onLeadClick(lead)} className="clickable-row">
              <td className="font-medium">{lead.name}</td>
              <td>
                <div className="score-container">
                  <span className="score-number">{lead.score}</span>
                  <div className="score-bar-bg">
                    <div className="score-bar-fill" style={{ width: `${lead.score}%`, background: lead.score > 80 ? 'var(--hot-color)' : lead.score > 50 ? 'var(--warm-color)' : 'var(--cold-color)' }}></div>
                  </div>
                </div>
              </td>
              <td>{getPriorityBadge(lead.priority)}</td>
              <td><span className="action-tag">{lead.next_action}</span></td>
              <td className="reason-text">{lead.reason}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LeadTable;

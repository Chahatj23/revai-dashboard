import { useEffect, useState } from 'react';
import { getAnomalies } from '../services/api';

const SmartAlerts = ({ leads, onLeadClick }) => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const res = await getAnomalies();
      setAlerts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleMerge = () => {
    alert("Merge conflict resolution requires admin approval in this instance. Request sent.");
  };

  if (loading) {
    return (
      <div className="smart-alerts-container glass-panel">
        <h3 className="section-title">🚨 Smart Alerts</h3>
        <p className="typing-indicator" style={{ fontSize: '0.9rem' }}>Scanning pipeline...</p>
      </div>
    );
  }

  if (alerts.length === 0) return null;

  return (
    <div className="smart-alerts-container glass-panel fade-in">
      <div className="alerts-header">
        <h3 className="section-title">🚨 Smart Alerts</h3>
        <span className="badge badge-hot pulse-animation">{alerts.length} Warnings</span>
      </div>
      <div className="alerts-list">
        {alerts.map((alert, idx) => (
          <div key={idx} className={`alert-card severity-${alert.severity || 'medium'}`}>
            <div className="alert-top">
              <strong>{alert.title}</strong>
            </div>
            <p className="alert-message">{alert.message}</p>
            {alert.type === 'duplicate' && (
              <div className="alert-actions" style={{ flexWrap: 'wrap' }}>
                {alert.leadIds && alert.leadIds.map(id => {
                  const lead = leads.find(l => l.id === id);
                  if (!lead) return null;
                  return (
                    <button key={id} className="btn-sm btn-outline" onClick={() => onLeadClick(lead)}>
                      Review {lead.name}
                    </button>
                  );
                })}
                <button className="btn-sm btn-merge" onClick={handleMerge}>Merge</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default SmartAlerts;

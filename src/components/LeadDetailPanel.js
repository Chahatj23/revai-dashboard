import { useState } from 'react';
import axios from 'axios';
import { submitFeedback } from '../services/api';

const LeadDetailPanel = ({ lead, onClose, onEdit, onDeleteSuccess }) => {
  const [activeAction, setActiveAction] = useState(null);
  const [statusMsg, setStatusMsg] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  const [emailTone, setEmailTone] = useState('professional');
  const [emailGenerating, setEmailGenerating] = useState(false);
  const [demoDate, setDemoDate] = useState('');
  const [demoTime, setDemoTime] = useState('10:00');

  if (!lead) return null;

  const leadEmail = lead.email || `${lead.name?.split(' ')[0]?.toLowerCase() || 'contact'}@${lead.company?.toLowerCase().replace(/\s+/g, '') || 'company'}.com`;
  const leadPhone = lead.phone || '+1 (555) 000-0000';
  const sfUrl = lead.id?.startsWith('00Q') ? `https://swankie-dev-ed.develop.my.salesforce.com/${lead.id}` : null;
  const probColor = (lead.conversion_probability || 0) >= 70 ? '#34d399' : (lead.conversion_probability || 0) >= 40 ? '#fcd34d' : '#ef4444';

  const showStatus = (msg) => { setStatusMsg(msg); setTimeout(() => setStatusMsg(''), 4000); };

  // Generate email content using AI
  const generateEmail = async (tone) => {
    setEmailGenerating(true);
    try {
      const res = await axios.post('http://localhost:5000/api/agent/ask', {
        question: `Write a short ${tone} sales follow-up email for a lead named ${lead.name} from ${lead.company}. They are a ${lead.priority} priority lead with a ${lead.conversion_probability || 50}% conversion probability and potential deal size of $${lead.expected_deal_size?.toLocaleString() || '10,000'}. Their recommended action is: ${lead.next_action || 'Nurture'}. Write ONLY the email body, no subject line. Keep it under 100 words. Be direct and professional.`
      });
      const body = res.data?.answer || `Hi ${lead.name?.split(' ')[0]},\n\nI wanted to follow up on our conversation. I believe we can add significant value to ${lead.company}.\n\nWould you have time for a quick call this week?\n\nBest regards`;
      setEmailBody(body);
      setEmailSubject(`Follow-up: ${lead.company} — RevAI Opportunity`);
    } catch (err) {
      setEmailBody(`Hi ${lead.name?.split(' ')[0] || 'there'},\n\nThank you for your interest. I'd love to discuss how we can help ${lead.company} achieve its goals.\n\nWould you have 15 minutes this week?\n\nBest regards`);
      setEmailSubject(`Follow-up: ${lead.company} — RevAI Opportunity`);
    }
    setEmailGenerating(false);
  };

  const openEmail = async () => {
    setActiveAction('email');
    await generateEmail('professional');
  };

  const regenerateEmail = async () => {
    await generateEmail(emailTone);
  };

  const sendEmail = () => {
    window.open(`mailto:${leadEmail}?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`, '_blank');
    showStatus('✅ Email client opened!');
    setActiveAction(null);
  };

  const openDemo = () => {
    setDemoDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
    setActiveAction('demo');
  };

  const scheduleDemo = () => {
    const s = `${demoDate.replace(/-/g, '')}T${demoTime.replace(':', '')}00`;
    const eH = String(parseInt(demoTime.split(':')[0]) + 1).padStart(2, '0');
    const e = `${demoDate.replace(/-/g, '')}T${eH}${demoTime.split(':')[1]}00`;
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(`Demo: ${lead.name} — ${lead.company}`)}&dates=${s}/${e}&details=${encodeURIComponent(`AI Score: ${lead.score} | Deal: $${lead.expected_deal_size?.toLocaleString()}`)}`, '_blank');
    showStatus('📅 Calendar opened!');
    setActiveAction(null);
  };

  const handleFeedback = async (type) => {
    try { await submitFeedback(lead.id || lead.name, type); showStatus(`✅ Feedback: ${type}`); } catch (e) { console.error(e); }
  };

  const handleDelete = async () => {
    if (window.confirm(`Delete ${lead.name}?`)) {
      try { const { deleteLead } = require("../services/api"); await deleteLead(lead.id); onDeleteSuccess(); } catch (e) { console.error(e); }
    }
  };

  return (
    <div className="ldp-fullpage fade-in">
      {/* Top Bar */}
      <div className="ldp-topbar">
        <button className="ldp-back" onClick={onClose}>← Back to Pipeline</button>
        <div className="ldp-topbar-actions">
          {sfUrl && <a href={sfUrl} target="_blank" rel="noopener noreferrer" className="ldp-topbar-btn">☁️ Salesforce</a>}
          <button className="ldp-topbar-btn" onClick={() => onEdit(lead)}>✏️ Edit</button>
          <button className="ldp-topbar-btn ldp-btn-danger" onClick={handleDelete}>🗑️ Delete</button>
        </div>
      </div>

      {statusMsg && <div className="ldp-toast fade-in">{statusMsg}</div>}

      <div className="ldp-content">
        {/* Hero */}
        <div className="ldp-hero">
          <div className="ldp-avatar">{lead.name?.charAt(0) || '?'}</div>
          <div className="ldp-hero-info">
            <h1 className="ldp-name">{lead.name}</h1>
            <p className="ldp-role">{lead.title !== 'No Title' ? `${lead.title} at ` : ''}{lead.company}</p>
            <div className="ldp-badges">
              <span className={`ldp-badge ldp-priority-${(lead.priority || 'cold').toLowerCase()}`}>{lead.priority}</span>
              <span className="ldp-badge ldp-badge-score">Score: {lead.score}</span>
              {lead.conversion_probability && <span className="ldp-badge" style={{ background: `${probColor}15`, borderColor: `${probColor}40`, color: probColor }}>{lead.conversion_probability}%</span>}
              {lead.expected_deal_size > 0 && <span className="ldp-badge ldp-badge-deal">${lead.expected_deal_size.toLocaleString()}</span>}
            </div>
          </div>
        </div>

        {/* Two column: Left info, Right actions */}
        <div className="ldp-two-col">
          
          {/* LEFT COLUMN */}
          <div className="ldp-left">
            {/* Contact Details */}
            <div className="ldp-card">
              <h3 className="ldp-card-title">👤 Contact Details</h3>
              <div className="ldp-contact-grid">
                <div className="ldp-contact-item">
                  <span className="ldp-contact-icon">📧</span>
                  <div>
                    <label>Email</label>
                    <a href={`mailto:${leadEmail}`} className="ldp-contact-value ldp-link">{leadEmail}</a>
                  </div>
                </div>
                <div className="ldp-contact-item">
                  <span className="ldp-contact-icon">📞</span>
                  <div>
                    <label>Phone</label>
                    <a href={`tel:${leadPhone}`} className="ldp-contact-value ldp-link">{leadPhone}</a>
                  </div>
                </div>
                <div className="ldp-contact-item">
                  <span className="ldp-contact-icon">🏢</span>
                  <div>
                    <label>Company</label>
                    <span className="ldp-contact-value">{lead.company}</span>
                  </div>
                </div>
                <div className="ldp-contact-item">
                  <span className="ldp-contact-icon">💼</span>
                  <div>
                    <label>Title</label>
                    <span className="ldp-contact-value">{lead.title || 'N/A'}</span>
                  </div>
                </div>
                <div className="ldp-contact-item">
                  <span className="ldp-contact-icon">🎯</span>
                  <div>
                    <label>Next Action</label>
                    <span className="ldp-contact-value" style={{ color: '#a5b4fc' }}>{lead.next_action || 'Nurture'}</span>
                  </div>
                </div>
                <div className="ldp-contact-item">
                  <span className="ldp-contact-icon">📅</span>
                  <div>
                    <label>Follow-up</label>
                    <span className="ldp-contact-value">{lead.next_follow_up_date || 'Not scheduled'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* AI Insights + Timeline side by side */}
            <div className="ldp-inner-two-col">
              <div className="ldp-card">
                <h3 className="ldp-card-title">🧠 AI Insights</h3>
                <p className="ldp-reasoning">{lead.reason}</p>
                <div className="ldp-metrics-row">
                  <div className="ldp-metric">
                    <span className="ldp-metric-value" style={{ color: probColor }}>{lead.conversion_probability || 0}%</span>
                    <span className="ldp-metric-label">Win Probability</span>
                    <div className="ldp-metric-bar"><div style={{ width: `${lead.conversion_probability || 0}%`, background: probColor }}></div></div>
                  </div>
                  <div className="ldp-metric">
                    <span className="ldp-metric-value" style={{ color: '#a5b4fc' }}>{lead.score}</span>
                    <span className="ldp-metric-label">AI Score</span>
                    <div className="ldp-metric-bar"><div style={{ width: `${lead.score}%`, background: '#6366f1' }}></div></div>
                  </div>
                </div>
                <div className="ldp-feedback">
                  <span>Rate this score:</span>
                  <button className="ldp-fb-btn ldp-fb-yes" onClick={() => handleFeedback('Accurate')}>👍 Yes</button>
                  <button className="ldp-fb-btn ldp-fb-no" onClick={() => handleFeedback('Incorrect')}>👎 No</button>
                </div>
              </div>

              <div className="ldp-card">
                <h3 className="ldp-card-title">📜 Activity</h3>
                <div className="ldp-timeline">
                  {[
                    { color: '#ef4444', title: `AI Scored Lead — ${lead.score} pts`, time: 'Just now' },
                    { color: '#3b82f6', title: `Task: ${lead.next_action || 'Nurture'}`, time: '2 mins ago' },
                    { color: '#a855f7', title: 'Email Sent: Introduction', time: '1 day ago' },
                    { color: '#f59e0b', title: 'Lead Created', time: '3 days ago' },
                  ].map((item, i) => (
                    <div key={i} className="ldp-tl-item">
                      <div className="ldp-tl-dot" style={{ background: item.color }}></div>
                      <div className="ldp-tl-content">
                        <strong>{item.title}</strong>
                        <span>{item.time}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Actions */}
          <div className="ldp-right">
            <div className="ldp-card ldp-actions-card">
              <h3 className="ldp-card-title" style={{ textAlign: 'center' }}>⚡ Quick Actions</h3>

              {!activeAction && (
                <div className="ldp-actions-grid">
                  <button className="ldp-action" onClick={openEmail}>
                    <div className="ldp-action-icon" style={{ background: 'rgba(99,102,241,0.15)' }}>📧</div>
                    <strong>Send Email</strong>
                    <span>AI-generated draft</span>
                  </button>
                  <button className="ldp-action" onClick={() => { window.open(`tel:${leadPhone}`); showStatus('📞 Dialer opened'); }}>
                    <div className="ldp-action-icon" style={{ background: 'rgba(34,197,94,0.15)' }}>📞</div>
                    <strong>Call</strong>
                    <span>{leadPhone}</span>
                  </button>
                  <button className="ldp-action" onClick={openDemo}>
                    <div className="ldp-action-icon" style={{ background: 'rgba(168,85,247,0.15)' }}>📅</div>
                    <strong>Schedule Demo</strong>
                    <span>Google Calendar</span>
                  </button>
                  <a href={`https://wa.me/?text=${encodeURIComponent(`Hi ${lead.name}, following up regarding ${lead.company}...`)}`} target="_blank" rel="noopener noreferrer" className="ldp-action" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <div className="ldp-action-icon" style={{ background: 'rgba(37,211,102,0.15)' }}>💬</div>
                    <strong>WhatsApp</strong>
                    <span>Send message</span>
                  </a>
                </div>
              )}

              {/* EMAIL COMPOSER */}
              {activeAction === 'email' && (
                <div className="ldp-form fade-in">
                  <div className="ldp-form-top">
                    <h4>📧 Compose Email</h4>
                    <button className="ldp-form-back" onClick={() => setActiveAction(null)}>← Back</button>
                  </div>

                  {/* Context bar */}
                  <div className="ldp-email-context">
                    <span>Context: <strong>{lead.priority}</strong> lead • {lead.conversion_probability}% probability • ${lead.expected_deal_size?.toLocaleString() || '0'} deal • Action: {lead.next_action}</span>
                  </div>

                  <label className="ldp-label">TO</label>
                  <input value={leadEmail} readOnly className="ldp-input" style={{ opacity: 0.6 }} />

                  <label className="ldp-label">SUBJECT</label>
                  <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="ldp-input" />

                  {/* Tone selector + Regenerate */}
                  <div className="ldp-tone-row">
                    <label className="ldp-label" style={{ margin: 0 }}>TONE</label>
                    <div className="ldp-tone-pills">
                      {['professional', 'friendly', 'urgent', 'casual'].map(t => (
                        <button key={t} className={`ldp-tone-pill ${emailTone === t ? 'active' : ''}`} onClick={() => setEmailTone(t)}>
                          {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                      ))}
                    </div>
                    <button className="ldp-regen-btn" onClick={regenerateEmail} disabled={emailGenerating}>
                      {emailGenerating ? '⏳ Generating...' : '🔄 Regenerate'}
                    </button>
                  </div>

                  <label className="ldp-label">MESSAGE {emailGenerating && <span style={{ color: '#a5b4fc', fontStyle: 'italic', textTransform: 'none' }}>— AI is writing...</span>}</label>
                  <textarea 
                    value={emailGenerating ? 'Generating AI content...' : emailBody} 
                    onChange={e => setEmailBody(e.target.value)} 
                    rows={6} 
                    className="ldp-input ldp-textarea" 
                    disabled={emailGenerating}
                  />

                  <button className="ldp-send-btn" onClick={sendEmail} disabled={emailGenerating}>
                    📧 Open in Email Client
                  </button>
                </div>
              )}

              {/* DEMO SCHEDULER */}
              {activeAction === 'demo' && (
                <div className="ldp-form fade-in">
                  <div className="ldp-form-top">
                    <h4>📅 Schedule Demo</h4>
                    <button className="ldp-form-back" onClick={() => setActiveAction(null)}>← Back</button>
                  </div>
                  <label className="ldp-label">DATE</label>
                  <input type="date" value={demoDate} onChange={e => setDemoDate(e.target.value)} className="ldp-input" />
                  <label className="ldp-label">TIME</label>
                  <input type="time" value={demoTime} onChange={e => setDemoTime(e.target.value)} className="ldp-input" />
                  <div className="ldp-preview">
                    <strong>Demo: {lead.name} — {lead.company}</strong>
                    <span>Score {lead.score} • ${lead.expected_deal_size?.toLocaleString() || '0'} deal</span>
                  </div>
                  <button className="ldp-send-btn" onClick={scheduleDemo}>📅 Create in Google Calendar</button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default LeadDetailPanel;

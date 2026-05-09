import { useState, useEffect } from "react";
import { createLead, updateLead } from "../services/api";

const LeadModal = ({ isOpen, onClose, onSave, existingLead }) => {
  const [formData, setFormData] = useState({
    name: "", company: "", source: "", interaction: "", budget: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (existingLead) {
      setFormData({
        name: existingLead.name || "",
        company: existingLead.company || "",
        source: existingLead.title || "", // Using title as proxy for simplicity
        interaction: existingLead.reason || "",
        budget: existingLead.budget || ""
      });
    } else {
      setFormData({ name: "", company: "", source: "", interaction: "", budget: "" });
    }
  }, [existingLead, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (existingLead) {
        await updateLead(existingLead.id, formData);
      } else {
        await createLead(formData);
      }
      onSave(); // Trigger refresh
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="modal-content glass-panel fade-in slide-up" style={{ width: '450px', padding: '25px', borderRadius: '12px', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: '15px', right: '15px', background: 'transparent', border: 'none', color: 'white', fontSize: '1.2rem', cursor: 'pointer' }}>&times;</button>
        <h3 style={{ marginTop: 0 }}>{existingLead ? "Edit Lead" : "Create New Lead"}</h3>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Full Name</label>
            <input name="name" value={formData.name} onChange={handleChange} required style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Company</label>
            <input name="company" value={formData.company} onChange={handleChange} required style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white' }} />
          </div>
          {!existingLead && (
            <>
              <div>
                <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Notes (For AI Scoring)</label>
                <textarea name="interaction" value={formData.interaction} onChange={handleChange} placeholder="e.g. Visited pricing page twice..." style={{ width: '100%', padding: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', minHeight: '80px' }} />
              </div>
            </>
          )}
          <button type="submit" disabled={loading} style={{ background: 'linear-gradient(90deg, #6366f1, #a855f7)', color: 'white', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '10px' }}>
            {loading ? "Processing..." : (existingLead ? "Save Changes" : "Score & Create Lead")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default LeadModal;

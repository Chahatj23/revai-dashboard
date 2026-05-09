import { useState, useEffect, useRef } from 'react';

// Animated counter hook
const useCountUp = (target, duration = 1200) => {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target === prevTarget.current) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();

    const tick = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
    prevTarget.current = target;
  }, [target, duration]);

  return count;
};

const InsightsStrip = ({ leads }) => {
  const hot = leads.filter(l => l.priority === "Hot").length;
  const warm = leads.filter(l => l.priority === "Warm").length;
  const cold = leads.filter(l => l.priority === "Cold").length;
  
  const totalPipeline = leads.reduce((sum, l) => sum + (l.expected_deal_size || 0), 0);
  const weightedPipeline = leads.reduce((sum, l) => sum + ((l.expected_deal_size || 0) * (l.conversion_probability || 0) / 100), 0);
  const avgProb = leads.length > 0 ? Math.round(leads.reduce((sum, l) => sum + (l.conversion_probability || 0), 0) / leads.length) : 0;

  // Animated values
  const animPipeline = useCountUp(totalPipeline, 1400);
  const animForecast = useCountUp(Math.round(weightedPipeline), 1600);
  const animHot = useCountUp(hot, 800);
  const animWarm = useCountUp(warm, 900);
  const animCold = useCountUp(cold, 1000);
  const animProb = useCountUp(avgProb, 1200);

  const formatCurrency = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // Win rate color
  const probColor = avgProb >= 60 ? '#34d399' : avgProb >= 40 ? '#fcd34d' : '#ef4444';

  return (
    <div className="insights-strip-enhanced glass-panel">
      <div className="insights-row-big">
        <div className="insight-card insight-card-anim" style={{ '--anim-delay': '0s' }}>
          <span className="insight-card-label">Pipeline Value</span>
          <span className="insight-card-value" style={{ color: '#fcd34d' }}>{formatCurrency(animPipeline)}</span>
          <div className="insight-progress-track">
            <div className="insight-progress-fill" style={{ width: '100%', background: '#fcd34d' }} />
          </div>
        </div>
        <div className="insight-card insight-card-anim" style={{ '--anim-delay': '0.1s', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <span className="insight-card-label">AI Weighted Forecast</span>
          <span className="insight-card-value metric-glow" style={{ color: '#fca5a5' }}>{formatCurrency(animForecast)}</span>
          <div className="insight-progress-track">
            <div className="insight-progress-fill" style={{ width: `${totalPipeline > 0 ? (weightedPipeline / totalPipeline * 100) : 0}%`, background: '#ef4444' }} />
          </div>
        </div>
        <div className="insight-card insight-card-anim" style={{ '--anim-delay': '0.2s' }}>
          <span className="insight-card-label">Avg Win Rate</span>
          <span className="insight-card-value" style={{ color: probColor }}>{animProb}%</span>
          <div className="insight-progress-track">
            <div className="insight-progress-fill" style={{ width: `${avgProb}%`, background: probColor }} />
          </div>
        </div>
      </div>

      <div className="insights-row-counts">
        <div className="count-chip count-chip-anim" style={{ '--anim-delay': '0.3s' }}>
          <span className="count-chip-icon">🔥</span>
          <span className="count-chip-value" style={{ color: '#fca5a5' }}>{animHot}</span>
          <span className="count-chip-label">Hot</span>
        </div>
        <div className="count-chip count-chip-anim" style={{ '--anim-delay': '0.4s' }}>
          <span className="count-chip-icon">🟡</span>
          <span className="count-chip-value" style={{ color: '#fcd34d' }}>{animWarm}</span>
          <span className="count-chip-label">Warm</span>
        </div>
        <div className="count-chip count-chip-anim" style={{ '--anim-delay': '0.5s' }}>
          <span className="count-chip-icon">🔵</span>
          <span className="count-chip-value" style={{ color: '#93c5fd' }}>{animCold}</span>
          <span className="count-chip-label">Cold</span>
        </div>
        <div className="count-chip count-chip-anim" style={{ '--anim-delay': '0.6s' }}>
          <span className="count-chip-icon">📊</span>
          <span className="count-chip-value">{leads.length}</span>
          <span className="count-chip-label">Total</span>
        </div>
      </div>
    </div>
  );
};

export default InsightsStrip;

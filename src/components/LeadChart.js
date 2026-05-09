import { useState, useCallback } from "react";
import { PieChart, Pie, Tooltip, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Sector } from "recharts";

// Custom active shape renderer for donut hover with percentage
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill, payload, percent, value } = props;
  return (
    <g>
      <Sector
        cx={cx} cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        style={{ filter: `drop-shadow(0 0 12px ${fill})`, transition: 'all 0.3s ease' }}
      />
      <Sector
        cx={cx} cy={cy}
        innerRadius={outerRadius + 12}
        outerRadius={outerRadius + 16}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        opacity={0.4}
      />
      <text x={cx} y={cy - 8} textAnchor="middle" fill="#fff" fontSize="1.6rem" fontWeight="700">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
      <text x={cx} y={cy + 14} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="0.65rem" textTransform="uppercase" letterSpacing="1">
        {payload.name} ({value})
      </text>
    </g>
  );
};

// Custom bar tooltip
const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{
      background: 'rgba(15,17,26,0.95)', border: '1px solid rgba(99,102,241,0.3)',
      borderRadius: '10px', padding: '12px 16px', boxShadow: '0 8px 32px rgba(0,0,0,0.5)'
    }}>
      <p style={{ margin: '0 0 8px', fontWeight: 700, color: '#fff', fontSize: '0.9rem' }}>{label} Leads</p>
      {payload.map((entry, i) => (
        <p key={i} style={{ margin: '4px 0', color: entry.color, fontSize: '0.82rem' }}>
          {entry.name}: <strong>${entry.value.toLocaleString()}</strong>
        </p>
      ))}
    </div>
  );
};

const LeadChart = ({ leads }) => {
  const [activeDonutIndex, setActiveDonutIndex] = useState(null);

  // Donut data
  const hot = leads.filter(l => l.priority === "Hot").length;
  const warm = leads.filter(l => l.priority === "Warm").length;
  const cold = leads.filter(l => l.priority === "Cold").length;
  const other = leads.length - hot - warm - cold;

  const donutData = [
    { name: "Hot", value: hot },
    { name: "Warm", value: warm },
    { name: "Cold", value: cold },
    ...(other > 0 ? [{ name: "Other", value: other }] : []),
  ].filter(d => d.value > 0);

  // Revenue by priority
  const revenueData = [
    { name: "Hot", pipeline: leads.filter(l => l.priority === "Hot").reduce((s, l) => s + (l.expected_deal_size || 0), 0), forecast: leads.filter(l => l.priority === "Hot").reduce((s, l) => s + ((l.expected_deal_size || 0) * (l.conversion_probability || 0) / 100), 0) },
    { name: "Warm", pipeline: leads.filter(l => l.priority === "Warm").reduce((s, l) => s + (l.expected_deal_size || 0), 0), forecast: leads.filter(l => l.priority === "Warm").reduce((s, l) => s + ((l.expected_deal_size || 0) * (l.conversion_probability || 0) / 100), 0) },
    { name: "Cold", pipeline: leads.filter(l => l.priority === "Cold").reduce((s, l) => s + (l.expected_deal_size || 0), 0), forecast: leads.filter(l => l.priority === "Cold").reduce((s, l) => s + ((l.expected_deal_size || 0) * (l.conversion_probability || 0) / 100), 0) },
  ];

  // Top 5 leads by deal size
  const topDeals = [...leads].sort((a, b) => (b.expected_deal_size || 0) - (a.expected_deal_size || 0)).slice(0, 5);

  const COLORS = { Hot: '#ef4444', Warm: '#f59e0b', Cold: '#3b82f6', Other: '#6b7280' };
  const formatCurrency = (val) => '$' + (val / 1000).toFixed(0) + 'K';

  const totalLeads = leads.length;
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  const onDonutEnter = useCallback((_, index) => setActiveDonutIndex(index), []);
  const onDonutLeave = useCallback(() => setActiveDonutIndex(null), []);

  return (
    <div className="pipeline-analytics-panel glass-panel">
      <h3 className="section-title" style={{ marginBottom: '20px' }}>📊 Pipeline Analytics</h3>

      <div className="analytics-grid">
        
        {/* Column 1: Donut Chart */}
        <div className="analytics-card analytics-card-hover">
          <h4 className="analytics-card-title">Lead Distribution</h4>
          <div style={{ position: 'relative' }}>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={donutData} 
                  dataKey="value" 
                  nameKey="name" 
                  cx="50%" 
                  cy="50%" 
                  innerRadius={55}
                  outerRadius={80} 
                  paddingAngle={4}
                  strokeWidth={0}
                  activeIndex={activeDonutIndex}
                  activeShape={renderActiveShape}
                  onMouseEnter={onDonutEnter}
                  onMouseLeave={onDonutLeave}
                >
                  {donutData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[entry.name]}
                      style={{ cursor: 'pointer', transition: 'opacity 0.3s ease' }}
                      opacity={activeDonutIndex !== null && activeDonutIndex !== index ? 0.3 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Default center label (hidden when hovering) */}
            {activeDonutIndex === null && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <span style={{ display: 'block', fontSize: '1.8rem', fontWeight: 700, color: '#fff' }}>{totalLeads}</span>
                <span style={{ display: 'block', fontSize: '0.65rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '1px' }}>Leads</span>
              </div>
            )}
          </div>
          {/* Legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '5px' }}>
            {donutData.map((d, i) => (
              <div 
                key={d.name} 
                style={{ display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', opacity: activeDonutIndex !== null && activeDonutIndex !== i ? 0.4 : 1, transition: 'opacity 0.3s' }}
                onMouseEnter={() => setActiveDonutIndex(i)}
                onMouseLeave={() => setActiveDonutIndex(null)}
              >
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: COLORS[d.name], boxShadow: activeDonutIndex === i ? `0 0 8px ${COLORS[d.name]}` : 'none', transition: 'box-shadow 0.3s' }} />
                <span style={{ fontSize: '0.75rem', color: activeDonutIndex === i ? '#fff' : 'var(--text-secondary)', fontWeight: activeDonutIndex === i ? 600 : 400, transition: 'all 0.3s' }}>
                  {d.name} ({d.value}) · {donutTotal > 0 ? Math.round(d.value / donutTotal * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Revenue Bar Chart */}
        <div className="analytics-card analytics-card-hover">
          <h4 className="analytics-card-title">Revenue by Priority</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="name" tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.08)', radius: 4 }} />
              <Bar dataKey="pipeline" name="Pipeline" fill="#6366f1" radius={[6,6,0,0]} animationDuration={800} />
              <Bar dataKey="forecast" name="AI Forecast" fill="#a855f7" radius={[6,6,0,0]} animationDuration={1000} />
            </BarChart>
          </ResponsiveContainer>
          {/* Bar legend */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', marginTop: '4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 6, borderRadius: 3, background: '#6366f1' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>Pipeline</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: 12, height: 6, borderRadius: 3, background: '#a855f7' }} />
              <span style={{ fontSize: '0.7rem', color: 'var(--text-secondary)' }}>AI Forecast</span>
            </div>
          </div>
        </div>

        {/* Column 3: Top Deals Leaderboard */}
        <div className="analytics-card analytics-card-hover">
          <h4 className="analytics-card-title">Top Deals</h4>
          <div className="top-deals-list">
            {topDeals.map((lead, idx) => {
              const prob = lead.conversion_probability || 0;
              const probColor = prob >= 70 ? '#34d399' : prob >= 40 ? '#fcd34d' : '#ef4444';
              return (
                <div key={lead.id || idx} className="top-deal-row">
                  <span className="top-deal-rank" style={{ color: idx === 0 ? '#fcd34d' : idx === 1 ? '#d1d5db' : idx === 2 ? '#f59e0b' : 'var(--text-secondary)' }}>
                    {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`}
                  </span>
                  <div className="top-deal-info">
                    <span className="top-deal-name">{lead.name}</span>
                    <span className="top-deal-company">{lead.company}</span>
                  </div>
                  <div className="top-deal-value">
                    <span style={{ fontWeight: 700, color: '#34d399' }}>${(lead.expected_deal_size || 0).toLocaleString()}</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                      <div style={{ width: '40px', height: '4px', background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden' }}>
                        <div style={{ width: `${prob}%`, height: '100%', background: probColor, borderRadius: '2px', transition: 'width 0.6s ease' }} />
                      </div>
                      <span style={{ fontSize: '0.65rem', color: probColor, fontWeight: 600 }}>{prob}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};

export default LeadChart;

import { useState, useCallback } from "react";
import { cn } from "../lib/utils";
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

  const COLORS = { Hot: '#6366f1', Warm: '#a855f7', Cold: '#3b82f6', Other: '#94a3b8' };
  const formatCurrency = (val) => '$' + (val / 1000).toFixed(0) + 'K';

  const totalLeads = leads.length;
  const donutTotal = donutData.reduce((s, d) => s + d.value, 0);

  const onDonutEnter = useCallback((_, index) => setActiveDonutIndex(index), []);
  const onDonutLeave = useCallback(() => setActiveDonutIndex(null), []);

  return (
    <div className="pipeline-analytics-panel glass-panel border shadow-2xl space-y-8">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-extrabold tracking-tight">Analytics</h3>
        <div className="px-3 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded-full uppercase tracking-widest leading-none">
          Live Intelligence
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Column 1: Donut Chart */}
        <div className="analytics-card bg-muted/20 p-6 rounded-2xl border border-muted/50 transition-all hover:bg-muted/30">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Lead Distribution</h4>
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
                  paddingAngle={6}
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
                      style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                      opacity={activeDonutIndex !== null && activeDonutIndex !== index ? 0.4 : 1}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            {/* Default center label (hidden when hovering) */}
            {activeDonutIndex === null && (
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', pointerEvents: 'none' }}>
                <span className="block text-3xl font-extrabold text-foreground">{totalLeads}</span>
                <span className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Leads</span>
              </div>
            )}
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-4 mt-6">
            {donutData.map((d, i) => (
              <div 
                key={d.name} 
                className={cn(
                  "flex items-center gap-2 transition-all duration-300 pointer-events-none",
                  activeDonutIndex !== null && activeDonutIndex !== i ? "opacity-30 scale-95" : "opacity-100"
                )}
              >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[d.name] }} />
                <span className="text-[10px] font-bold text-muted-foreground">
                  {d.name} {donutTotal > 0 ? Math.round(d.value / donutTotal * 100) : 0}%
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Revenue Bar Chart */}
        <div className="analytics-card bg-muted/20 p-6 rounded-2xl border border-muted/50 transition-all hover:bg-muted/30">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Revenue Mapping</h4>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={revenueData} barGap={6}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsla(var(--border), 0.5)" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 700 }} axisLine={false} tickLine={false} tickFormatter={formatCurrency} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(99,102,241,0.05)', radius: 8 }} />
              <Bar dataKey="pipeline" name="Pipeline" fill="#6366f1" radius={[4,4,4,4]} barSize={24} />
              <Bar dataKey="forecast" name="AI Forecast" fill="#a855f7" radius={[4,4,4,4]} barSize={24} />
            </BarChart>
          </ResponsiveContainer>
          {/* Bar legend */}
          <div className="flex justify-center gap-6 mt-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#6366f1]" />
              <span className="text-[10px] font-bold text-muted-foreground">Pipeline</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-[#a855f7]" />
              <span className="text-[10px] font-bold text-muted-foreground">AI Forecast</span>
            </div>
          </div>
        </div>

        {/* Column 3: Top Deals Leaderboard */}
        <div className="analytics-card bg-muted/20 p-6 rounded-2xl border border-muted/50 transition-all hover:bg-muted/30">
          <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">Elite Deals</h4>
          <div className="space-y-4">
            {topDeals.map((lead, idx) => {
              const prob = lead.conversion_probability || 0;
              const probColor = prob >= 70 ? '#10b981' : prob >= 40 ? '#f59e0b' : '#ef4444';
              return (
                <div key={lead.id || idx} className="flex items-center gap-4 group cursor-default">
                  <span className="text-sm font-extrabold text-muted-foreground/30 group-hover:text-primary transition-colors">
                    {idx === 0 ? '01' : idx === 1 ? '02' : idx === 2 ? '03' : `0${idx + 1}`}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate group-hover:text-foreground transition-colors">{lead.name}</p>
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider truncate">{lead.company}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-extrabold text-emerald-500">${(lead.expected_deal_size || 0).toLocaleString()}</p>
                    <div className="flex items-center justify-end gap-2 mt-1">
                      <div className="w-12 h-1 bg-muted rounded-full overflow-hidden">
                        <div style={{ width: `${prob}%`, backgroundColor: probColor }} className="h-full transition-all duration-1000" />
                      </div>
                      <span className="text-[8px] font-bold" style={{ color: probColor }}>{prob}%</span>
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

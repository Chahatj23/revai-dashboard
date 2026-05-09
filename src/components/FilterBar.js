const FilterBar = ({ filter, setFilter }) => {
  const options = [
    { value: "ALL", label: "All Leads", icon: "📋" },
    { value: "Hot", label: "Hot", icon: "🔥" },
    { value: "Warm", label: "Warm", icon: "🟡" },
    { value: "Cold", label: "Cold", icon: "🔵" },
  ];

  return (
    <div className="filter-bar">
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`filter-btn ${filter === opt.value ? 'active' : ''} ${opt.value.toLowerCase()}-filter`}
          onClick={() => setFilter(opt.value)}
        >
          <span className="icon">{opt.icon}</span>
          {opt.label}
        </button>
      ))}
    </div>
  );
};

export default FilterBar;

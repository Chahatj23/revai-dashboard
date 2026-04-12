import { useEffect, useState, useCallback } from "react";
import { getTasks, createTask, updateTask, deleteTask } from "../services/api";

const TodayTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("Open");
  const [showForm, setShowForm] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [newPriority, setNewPriority] = useState("Normal");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTasks(activeFilter);
      setTasks(res.data);
    } catch (e) {
      console.error("Error fetching tasks:", e);
    } finally {
      setLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      await createTask(newSubject, newPriority);
      setNewSubject("");
      setNewPriority("Normal");
      setShowForm(false);
      setActiveFilter("Open");
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleComplete = async (taskId) => {
    try {
      await updateTask(taskId, { Status: "Completed" });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReopen = async (taskId) => {
    try {
      await updateTask(taskId, { Status: "Open" });
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (taskId) => {
    try {
      await deleteTask(taskId);
      fetchTasks();
    } catch (err) {
      console.error(err);
    }
  };

  const filters = ["Open", "Completed", "All"];

  return (
    <div className="tasks-container glass-panel">
      <div className="tasks-header">
        <h3 className="section-title">📌 Today's Tasks</h3>
        <button
          className="btn-sm btn-outline"
          onClick={() => setShowForm(!showForm)}
          style={{ fontSize: '0.75rem', padding: '4px 10px' }}
        >
          {showForm ? '✕' : '+ New'}
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="task-filter-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
        {filters.map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`task-filter-btn ${activeFilter === f ? 'active' : ''}`}
            style={{
              flex: 1,
              padding: '6px 0',
              fontSize: '0.75rem',
              fontWeight: 600,
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '6px',
              cursor: 'pointer',
              background: activeFilter === f ? 'rgba(99, 102, 241, 0.25)' : 'transparent',
              color: activeFilter === f ? '#a5b4fc' : 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Create Task Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="fade-in" style={{ marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <input
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            placeholder="Task subject..."
            required
            style={{ width: '100%', padding: '8px 10px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.85rem', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <select
              value={newPriority}
              onChange={(e) => setNewPriority(e.target.value)}
              style={{ flex: 1, padding: '6px 8px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border-color)', borderRadius: '6px', color: 'white', fontSize: '0.8rem' }}
            >
              <option value="High">High Priority</option>
              <option value="Normal">Normal Priority</option>
              <option value="Low">Low Priority</option>
            </select>
            <button type="submit" style={{ padding: '6px 14px', background: 'linear-gradient(90deg, #6366f1, #a855f7)', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.8rem' }}>
              Add
            </button>
          </div>
        </form>
      )}

      {/* Task List */}
      <div className="tasks-list">
        {loading ? (
          <div className="empty-state" style={{ fontSize: '0.85rem' }}>Loading...</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state" style={{ fontSize: '0.85rem' }}>
            {activeFilter === 'Open' ? 'All tasks completed! 🎉' : activeFilter === 'Completed' ? 'No completed tasks yet.' : 'No tasks found.'}
          </div>
        ) : (
          tasks.map(task => (
            <div key={task.id} className={`task-item ${task.Status === 'Completed' ? 'task-completed' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
              {/* Checkbox / Toggle */}
              <div
                onClick={() => task.Status === 'Open' ? handleComplete(task.id) : handleReopen(task.id)}
                style={{
                  width: '22px', height: '22px', borderRadius: '50%', cursor: 'pointer', flexShrink: 0,
                  border: task.Status === 'Completed' ? '2px solid #34d399' : '2px solid rgba(255,255,255,0.2)',
                  background: task.Status === 'Completed' ? 'rgba(52, 211, 153, 0.2)' : 'transparent',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                {task.Status === 'Completed' && <span style={{ fontSize: '0.7rem', color: '#34d399' }}>✓</span>}
              </div>

              {/* Task Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <span style={{
                  display: 'block', fontSize: '0.85rem', fontWeight: 500,
                  color: task.Status === 'Completed' ? 'var(--text-secondary)' : 'var(--text-primary)',
                  textDecoration: task.Status === 'Completed' ? 'line-through' : 'none',
                  whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis'
                }}>
                  {task.Subject}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  color: task.Priority === 'High' ? '#ef4444' : 'var(--text-secondary)'
                }}>
                  {task.Priority === 'High' ? '🔴 High' : task.Priority === 'Low' ? '🔵 Low' : '🟡 Normal'}
                </span>
              </div>

              {/* Delete X */}
              <button
                onClick={() => handleDelete(task.id)}
                style={{ background: 'transparent', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '0.9rem', padding: '2px 6px' }}
                title="Delete task"
              >
                ×
              </button>
            </div>
          ))
        )}
      </div>

      {/* Count Footer */}
      <div style={{ marginTop: '10px', fontSize: '0.7rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
        {tasks.length} {activeFilter === 'All' ? 'total' : activeFilter.toLowerCase()} task{tasks.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
};

export default TodayTasks;

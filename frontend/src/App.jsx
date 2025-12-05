import React, { useState, useEffect } from 'react';
import { Plus, Mic, Search, Filter, X, WifiOff } from 'lucide-react';
import Column from './components/TaskBoard/Column';
import TaskModal from './components/Modals/TaskModal';
import VoiceInputModal from './components/Modals/VoiceInputModal';
import { api } from './api/endpoints';

// --- MOCK DATA ---
const MOCK_TASKS = [
  { id: 1, title: 'Design System Update', description: 'Update color palette.', status: 'To Do', priority: 'High', due_date: '25-10-2025', created_at: '24-10-2025 10:30:00', updated_at: '24-10-2025 10:30:00' },
  { id: 2, title: 'Integrate AssemblyAI', description: 'Voice to text.', status: 'In Progress', priority: 'Critical', due_date: '24-10-2025', created_at: '23-10-2025 14:15:00', updated_at: '23-10-2025 16:20:00' },
  { id: 3, title: 'Client Meeting', description: 'Q4 roadmap.', status: 'Done', priority: 'Medium', due_date: '20-10-2025', created_at: '19-10-2025 09:00:00', updated_at: '20-10-2025 11:00:00' },
];

// Helper to generate "DD-MM-YYYY HH:mm:ss" for optimistic updates
const getCurrentTimeDBFormat = () => {
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based
  const year = now.getFullYear();
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');
  return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
};

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(false);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPriority, setFilterPriority] = useState('All');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const fetchTasks = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));

    try {
      const data = await api.fetchTasks();
      if (Array.isArray(data)) {
        setTasks(data);
        setIsDemoMode(false);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.warn("Backend unavailable, switching to Demo Mode.");
      setTasks(MOCK_TASKS);
      setIsDemoMode(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTasks(); }, []);

  // --- Filtering Logic ---
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.description && task.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesPriority = filterPriority === 'All' || task.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  const handleCreateOrUpdate = async (taskData) => {
    const currentTime = getCurrentTimeDBFormat();

    if (isDemoMode) {
      const newTask = {
        ...taskData,
        id: taskData.id || Date.now(),
        updated_at: currentTime,
        // If creating, add created_at
        created_at: taskData.id ? (tasks.find(t => t.id === taskData.id)?.created_at) : currentTime
      };
      setTasks(prev => taskData.id ? prev.map(t => t.id === taskData.id ? newTask : t) : [newTask, ...prev]);
    } else {
      try {
        if (taskData.id) await api.updateTask(taskData.id, taskData);
        else await api.createTask(taskData);
        fetchTasks();
      } catch (err) { console.error(err); }
    }
    setIsTaskModalOpen(false);
    setEditingTask(null);
  };

  const handleDelete = async (id) => {
    if (confirm("Delete this task?")) {
      if (isDemoMode) setTasks(prev => prev.filter(t => t.id !== id));
      else { await api.deleteTask(id); fetchTasks(); }
      setIsTaskModalOpen(false);
    }
  };

  const handleDrop = async (e, newStatus) => {
    const taskId = e.dataTransfer.getData("taskId");
    const task = tasks.find(t => t.id.toString() == taskId);

    if (task && task.status !== newStatus) {
      // FIX: Use the helper to generate the correct date string format
      const updated = {
        ...task,
        status: newStatus,
        updated_at: getCurrentTimeDBFormat()
      };

      // Optimistic update
      setTasks(prev => prev.map(t => t.id === task.id ? updated : t));

      if (!isDemoMode) await api.updateTask(task.id, { status: newStatus });
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 text-slate-900 font-sans overflow-hidden">

      {/* 1. Header (Fixed) */}
      <header className="flex-none bg-white border-b border-slate-200 px-6 py-4 z-20 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-sm">
              <img
                src="/voice.svg"
                alt="Voice Task Tracker Logo"
                className="h-8 w-8"
              />
            </div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">TaskTracker</h1>
            {isDemoMode && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium border border-amber-200">
                <WifiOff size={12} /> Demo Mode
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsVoiceModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium transition-colors">
              <Mic size={18} /> <span className="hidden sm:inline">Voice Create</span>
            </button>
            <button onClick={() => { setEditingTask(null); setIsTaskModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium shadow-sm transition-colors">
              <Plus size={18} /> <span>Create Task</span>
            </button>
          </div>
        </div>

        {/* 2. Global Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search Bar */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-md text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={14} />
              </button>
            )}
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-2">
            <Filter size={18} className="text-slate-400" />
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value)}
              className="bg-slate-100 text-sm font-medium text-slate-600 py-2 px-3 rounded-md outline-none focus:ring-2 focus:ring-blue-500 border-r-[8px] border-r-transparent"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
      </header>

      {/* 3. Main Board Area */}
      <main className="flex-1 overflow-y-auto p-6 scroll-smooth">
        <div className="flex flex-col md:flex-row gap-6 min-h-full">
          {['To Do', 'In Progress', 'Done'].map(status => (
            <Column
              key={status}
              title={status}
              status={status}
              tasks={filteredTasks.filter(t => t.status === status)}
              loading={loading}
              onDrop={handleDrop}
              onEdit={(t) => { setEditingTask(t); setIsTaskModalOpen(true); }}
            />
          ))}
        </div>
      </main>

      {/* Modals */}
      <TaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSubmit={handleCreateOrUpdate}
        onDelete={handleDelete}
        initialData={editingTask}
      />

      <VoiceInputModal
        isOpen={isVoiceModalOpen}
        onClose={() => setIsVoiceModalOpen(false)}
        onTaskReady={(data) => {
          setIsVoiceModalOpen(false);
          setEditingTask(data);
          setIsTaskModalOpen(true);
        }}
      />
    </div>
  );
}
import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, ArrowDownAZ, Calendar, AlertCircle } from 'lucide-react';
import TaskCard from './TaskCard';
import SkeletonCard from './SkeletonCard';

// Helper to parse DB dates for sorting
const parseForSort = (dateStr) => {
  if (!dateStr) return 0;
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('-').map(Number);
  
  if (timePart) {
    const [h, m, s] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, h, m, s).getTime();
  }
  return new Date(year, month - 1, day).getTime();
};

export default function Column({ title, status, tasks = [], loading, onDrop, onEdit }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [sortType, setSortType] = useState({ field: 'date', dir: 'desc' });
  const [showMenu, setShowMenu] = useState(false);
  
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // --- Sorting Logic ---
  const getSortedTasks = () => {
    if (!Array.isArray(tasks)) return [];

    let sorted = [...tasks];
    const { field, dir } = sortType;
    const modifier = dir === 'asc' ? 1 : -1;

    sorted.sort((a, b) => {
      if (field === 'priority') {
        const priorityOrder = { 'Critical': 3, 'High': 2, 'Medium': 1, 'Low': 0 };
        return (priorityOrder[a.priority] - priorityOrder[b.priority]) * modifier;
      }
      if (field === 'date') {
        const dateA = parseForSort(a.due_date || a.created_at);
        const dateB = parseForSort(b.due_date || b.created_at);
        return (dateA - dateB) * modifier;
      }
      if (field === 'name') {
        return a.title.localeCompare(b.title) * modifier;
      }
      return 0;
    });

    return sorted;
  };

  const handleSort = (field, dir) => {
    setSortType({ field, dir });
    setShowMenu(false);
  };

  const getBadgeColor = (count) => {
    if (status === 'To Do') return 'bg-slate-200 text-slate-700';
    if (status === 'In Progress') return 'bg-blue-100 text-blue-700';
    return 'bg-green-100 text-green-700';
  };

  // Safe length check
  const taskCount = Array.isArray(tasks) ? tasks.length : 0;

  return (
    <div 
      className={`
        flex-1 min-w-[300px] flex flex-col rounded-xl border transition-colors duration-200
        ${isDragOver ? 'bg-indigo-50 border-indigo-300 ring-2 ring-indigo-200' : 'bg-slate-100/50 border-slate-200/60'}
      `}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={() => setIsDragOver(false)}
      onDrop={(e) => { setIsDragOver(false); onDrop(e, status); }}
    >
      {/* Column Header */}
      <div className="p-4 flex items-center justify-between sticky top-0 backdrop-blur-sm rounded-t-xl z-10">
        <div className="flex items-center gap-2">
           <h2 className="text-sm font-bold text-slate-600 uppercase tracking-wider">{title}</h2>
           <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getBadgeColor(taskCount)}`}>
             {taskCount}
           </span>
        </div>
        
        {/* Column Menu */}
        <div className="relative" ref={menuRef}>
          <button 
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-slate-200 rounded text-slate-400 transition-colors"
          >
            <MoreHorizontal size={16} />
          </button>
          
          {showMenu && (
            <div className="absolute right-0 top-8 w-48 bg-white rounded-lg shadow-xl border border-slate-100 p-1 z-20 animate-[fadeIn_0.1s]">
              <div className="text-[10px] font-bold text-slate-400 px-3 py-2 uppercase tracking-wide bg-slate-50/50 rounded-t">Sort By</div>
              
              {/* Priority */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><AlertCircle size={10}/> Priority</div>
                <div className="flex gap-1">
                    <button onClick={() => handleSort('priority', 'desc')} className={`flex-1 text-[10px] py-1 rounded border ${sortType.field==='priority'&&sortType.dir==='desc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 hover:bg-slate-50'}`}>High → Low</button>
                    <button onClick={() => handleSort('priority', 'asc')} className={`flex-1 text-[10px] py-1 rounded border ${sortType.field==='priority'&&sortType.dir==='asc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 hover:bg-slate-50'}`}>Low → High</button>
                </div>
              </div>

              {/* Date */}
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><Calendar size={10}/> Date</div>
                <div className="flex gap-1">
                    <button onClick={() => handleSort('date', 'desc')} className={`flex-1 text-[10px] py-1 rounded border ${sortType.field==='date'&&sortType.dir==='desc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 hover:bg-slate-50'}`}>Newest</button>
                    <button onClick={() => handleSort('date', 'asc')} className={`flex-1 text-[10px] py-1 rounded border ${sortType.field==='date'&&sortType.dir==='asc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 hover:bg-slate-50'}`}>Oldest</button>
                </div>
              </div>

              {/* Name */}
              <div className="px-2 py-1 mb-1">
                <div className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1"><ArrowDownAZ size={10}/> Name</div>
                <div className="flex gap-1">
                    <button onClick={() => handleSort('name', 'asc')} className={`flex-1 text-[10px] py-1 rounded border ${sortType.field==='name'&&sortType.dir==='asc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 hover:bg-slate-50'}`}>A-Z</button>
                    <button onClick={() => handleSort('name', 'desc')} className={`flex-1 text-[10px] py-1 rounded border ${sortType.field==='name'&&sortType.dir==='desc' ? 'bg-blue-50 border-blue-200 text-blue-600' : 'border-slate-100 hover:bg-slate-50'}`}>Z-A</button>
                </div>
              </div>

            </div>
          )}
        </div>
      </div>
      
      {/* Content Area */}
      <div className="p-3 pt-0 flex-1 space-y-3 min-h-[100px]">
        {loading ? (
           <>
             <SkeletonCard />
             <SkeletonCard />
           </>
        ) : (
          getSortedTasks().map(task => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} />
          ))
        )}

        {!loading && taskCount === 0 && (
          <div className="h-42 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-xs font-medium">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  );
}
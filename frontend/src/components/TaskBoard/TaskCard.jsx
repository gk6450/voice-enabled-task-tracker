import React from 'react';
import { Calendar, Clock, Edit2 } from 'lucide-react';

const priorityColors = {
  'Low': 'bg-slate-200 text-slate-600',
  'Medium': 'bg-blue-100 text-blue-700',
  'High': 'bg-orange-100 text-orange-700',
  'Critical': 'bg-red-100 text-red-700'
};

// Helper to parse "DD-MM-YYYY" or "DD-MM-YYYY HH:mm:ss"
const parseCustomDate = (dateStr) => {
  if (!dateStr) return null;
  
  // Split date and time
  const [datePart, timePart] = dateStr.split(' ');
  const [day, month, year] = datePart.split('-').map(Number);
  
  // Month is 0-indexed in JS Date (0 = Jan, 11 = Dec)
  if (timePart) {
    const [hours, minutes, seconds] = timePart.split(':').map(Number);
    return new Date(year, month - 1, day, hours, minutes, seconds);
  }
  
  return new Date(year, month - 1, day);
};

const formatDate = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const formatTime = (dateObj) => {
  if (!dateObj || isNaN(dateObj.getTime())) return '';
  return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true });
};

export default function TaskCard({ task, onEdit }) {
  const dueDate = parseCustomDate(task.due_date);
  const createdDate = parseCustomDate(task.created_at);
  const updatedDate = parseCustomDate(task.updated_at);

  return (
    <div 
      draggable 
      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
      onClick={() => onEdit(task)}
      className="bg-white p-4 rounded-lg shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group relative"
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-slate-800 leading-snug group-hover:text-blue-600 transition-colors pr-4">
          {task.title}
        </h3>
      </div>
      
      {/* Priority Badge */}
      <div className="flex items-center gap-2 mb-3">
        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${priorityColors[task.priority] || priorityColors.Medium}`}>
          {task.priority}
        </span>
      </div>

      <div className="space-y-1.5 mt-3 pt-3 border-t border-slate-100">
        
        {/* Due Date */}
        {dueDate && (
          <div className="flex items-center gap-2 text-xs text-slate-600">
             <Calendar size={12} className="text-slate-400" />
             <span className="font-medium text-red-500">Due: {formatDate(dueDate)}</span>
          </div>
        )}

        {/* Created At */}
        <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <Clock size={10} />
            <span>Created: {formatDate(createdDate)} at {formatTime(createdDate)}</span>
        </div>

        {/* Updated At */}
        <div className="flex items-center gap-2 text-[10px] text-slate-500 font-medium">
            <Edit2 size={10} />
            <span>Updated: {formatDate(updatedDate)} at {formatTime(updatedDate)}</span>
        </div>

      </div>
    </div>
  );
}
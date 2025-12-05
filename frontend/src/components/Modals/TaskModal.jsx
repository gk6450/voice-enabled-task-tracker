import React from 'react';
import { X, Save, Trash2 } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, onSubmit, onDelete, initialData }) {
  if (!isOpen) return null;
  const isEdit = !!initialData?.id;

  // Helper: Convert DB "16-12-2025" -> Input "2025-12-16"
  const getInputValue = (dbDate) => {
    if (!dbDate) return '';
    // Check if it's already in YYYY-MM-DD (from voice input before save)
    if (dbDate.match(/^\d{4}-\d{2}-\d{2}$/)) return dbDate;
    
    // Convert DD-MM-YYYY to YYYY-MM-DD
    const parts = dbDate.split('-');
    if (parts.length === 3) {
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return '';
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    if (initialData?.id) data.id = initialData.id;
    onSubmit(data);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden animate-[fadeIn_0.2s_ease-out]">
        <form onSubmit={handleSubmit}>
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h2 className="font-semibold text-slate-800">{isEdit ? 'Edit Task' : 'New Task'}</h2>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Title</label>
              <input name="title" required defaultValue={initialData?.title} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Task title" />
            </div>
            
            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Description</label>
              <textarea name="description" rows="3" defaultValue={initialData?.description} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Details..." />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Status</label>
                <select name="status" defaultValue={initialData?.status || 'To Do'} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                  <option>To Do</option>
                  <option>In Progress</option>
                  <option>Done</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Priority</label>
                <select name="priority" defaultValue={initialData?.priority || 'Medium'} className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white">
                  <option>Low</option>
                  <option>Medium</option>
                  <option>High</option>
                  <option>Critical</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 uppercase mb-1">Due Date</label>
              <input 
                type="date" 
                name="due_date" 
                // Use the helper to ensure the input sees YYYY-MM-DD
                defaultValue={getInputValue(initialData?.due_date)} 
                className="w-full px-3 py-2 border border-slate-300 rounded-md" 
              />
            </div>
          </div>

          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
            {isEdit ? (
                <button type="button" onClick={() => onDelete(initialData.id)} className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1">
                    <Trash2 size={16} /> Delete
                </button>
            ) : <div></div>}
            
            <div className="flex gap-3">
              <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-200 rounded-md">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm flex items-center gap-2">
                <Save size={16} /> Save
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
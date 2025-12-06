const API_BASE = import.meta.env.VITE_BACKEND_URL;

export const api = {
  fetchTasks: async () => {
    const res = await fetch(`${API_BASE}/tasks`);
    if (!res.ok) throw new Error("Failed to fetch");
    return res.json();
  },
  
  createTask: async (data) => {
    const res = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to create");
    return res.json();
  },

  updateTask: async (id, data) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error("Failed to update");
    return res.json();
  },

  deleteTask: async (id) => {
    const res = await fetch(`${API_BASE}/tasks/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error("Failed to delete");
    return res.json();
  },

  processVoice: async (formData) => {
    const res = await fetch(`${API_BASE}/process-voice`, {
      method: 'POST',
      body: formData
    });
    if (!res.ok) throw new Error("Voice processing failed");
    return res.json();
  }
};
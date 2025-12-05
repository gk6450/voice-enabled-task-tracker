import pool from '../config/db.js';

// Helper: Convert "2025-12-16" -> "16-12-2025"
const formatToDBDate = (isoDate) => {
  if (!isoDate) return null;
  const [year, month, day] = isoDate.split('-');
  return `${day}-${month}-${year}`;
};

export const getAllTasks = async (req, res) => {
  try {
    // Sort by ID DESC so newest tasks are top
    const result = await pool.query('SELECT * FROM tasks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Database error' });
  }
};

export const createTask = async (req, res) => {
  const { title, description, status, priority, due_date } = req.body;
  
  // Convert format before saving
  const formattedDueDate = formatToDBDate(due_date);

  try {
    const result = await pool.query(
      'INSERT INTO tasks (title, description, status, priority, due_date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [title, description || '', status || 'To Do', priority || 'Medium', formattedDueDate]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create task' });
  }
};

export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { title, description, status, priority, due_date } = req.body;

  // Convert format before saving (if due_date is provided)
  const formattedDueDate = due_date ? formatToDBDate(due_date) : undefined;

  try {
    // Dynamic update query
    const result = await pool.query(
      `UPDATE tasks 
       SET title = COALESCE($1, title), 
           description = COALESCE($2, description), 
           status = COALESCE($3, status), 
           priority = COALESCE($4, priority), 
           due_date = COALESCE($5, due_date)
       WHERE id = $6 RETURNING *`,
      [title, description, status, priority, formattedDueDate, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Task not found' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update task' });
  }
};

export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM tasks WHERE id = $1', [id]);
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
};
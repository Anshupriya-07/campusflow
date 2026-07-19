import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState('');
  const token = localStorage.getItem('token');

  const fetchTasks = () => {
    fetch('http://localhost:5000/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setTasks);
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const addTask = async (e) => {
  e.preventDefault();
  const token = localStorage.getItem('token');
  const res = await fetch('http://localhost:5000/tasks', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ title, description: '', due_date: dueDate }),
  });

  if (res.status === 401) {
    alert('Session expired, please log in again.');
    localStorage.removeItem('token');
    window.location.href = '/login';
    return;
  }

  if (!res.ok) {
    alert('Failed to add task.');
    return;
  }

  setTitle('');
  setDueDate('');
  fetchTasks();
};

  const deleteTask = async (id) => {
    await fetch(`http://localhost:5000/tasks/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchTasks();
  };

  const toggleStatus = async (task) => {
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    await fetch(`http://localhost:5000/tasks/${task.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ ...task, status: newStatus }),
    });
    fetchTasks();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Tasks</h1>

      <form onSubmit={addTask} className="flex gap-3 mb-8">
        <input
          type="text"
          placeholder="New task..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="flex-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
          required
        />
        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium">
          Add
        </button>
      </form>

      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex justify-between items-center"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={task.status === 'completed'}
                onChange={() => toggleStatus(task)}
                className="w-4 h-4 accent-indigo-600"
              />
              <span className={task.status === 'completed' ? 'line-through text-slate-500' : ''}>
                {task.title}
              </span>
            </div>
            <div className="flex items-center gap-3">
              {task.due_date && (
                <span className="text-xs text-slate-500">
                  {new Date(task.due_date).toLocaleDateString()}
                </span>
              )}
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-400 hover:text-red-300 text-sm"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Tasks;
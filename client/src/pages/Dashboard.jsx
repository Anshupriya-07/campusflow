import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function Dashboard() {
  const [progress, setProgress] = useState(null);
  const [tasks, setTasks] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/progress', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProgress);

    fetch('http://localhost:5000/tasks', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setTasks);
  }, []);

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-1">Good Evening 👋</h1>
      <p className="text-slate-400 mb-8">Here's what's happening today.</p>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm mb-1">DSA Solved</p>
          <p className="text-2xl font-bold">{progress?.dsa_solved ?? '-'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm mb-1">Login Streak</p>
          <p className="text-2xl font-bold">🔥 {progress?.login_streak ?? '-'} days</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm mb-1">Internships Applied</p>
          <p className="text-2xl font-bold">{progress?.internship_applications ?? '-'}</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <p className="text-slate-400 text-sm mb-1">Subjects Done</p>
          <p className="text-2xl font-bold">{progress?.subjects_completed ?? '-'}</p>
        </div>
      </div>

      <h2 className="text-lg font-semibold mb-4">Recent Tasks</h2>
      <div className="space-y-2">
        {tasks.map((task) => (
          <div
            key={task.id}
            className="bg-slate-900 border border-slate-800 rounded-lg px-4 py-3 flex justify-between items-center"
          >
            <span>{task.title}</span>
            <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-300">{task.status}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Dashboard;
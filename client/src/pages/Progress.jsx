import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function ProgressPage() {
  const [progress, setProgress] = useState(null);
  const [form, setForm] = useState({ dsa_solved: 0, subjects_completed: 0, internship_applications: 0});
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/progress', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setProgress(data);
        setForm({
          dsa_solved: data.dsa_solved,
          subjects_completed: data.subjects_completed,
          internship_applications: data.internship_applications,
        });
      });
  }, []);

  const updateProgress = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/progress', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setProgress(data);
  };

  const Bar = ({ label, value, max }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-slate-400">{label}</span>
        <span className="text-slate-300">{value}{max === 100 ? '%' : ''}</span>
      </div>
      <div className="w-full bg-slate-800 rounded-full h-2">
        <div
          className="bg-indigo-500 h-2 rounded-full"
          style={{ width: `${Math.min((value / max) * 100, 100)}%` }}
        />
      </div>
    </div>
  );

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Progress</h1>

      {progress && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 mb-8 max-w-lg">
          <Bar label="DSA Solved" value={progress.dsa_solved} max={200} />
          <Bar label="Subjects Completed" value={progress.subjects_completed} max={8} />
          <Bar label="Internship Applications" value={progress.internship_applications} max={20} />
          <Bar label="Login Streak" value={progress.login_streak} max={30} />
        </div>
      )}

      <h2 className="text-lg font-semibold mb-4">Update Progress</h2>
      <form onSubmit={updateProgress} className="max-w-sm space-y-4">
        {['dsa_solved', 'subjects_completed', 'internship_applications'].map((field) => (
          <div key={field}>
            <label className="text-sm text-slate-400 capitalize">{field.replace(/_/g, ' ')}</label>
            <input
              type="number"
              value={form[field]}
              onChange={(e) => setForm({ ...form, [field]: Number(e.target.value) })}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
            />
          </div>
        ))}
        <button type="submit" className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium">
          Save
        </button>
      </form>
    </Layout>
  );
}

export default ProgressPage;
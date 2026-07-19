import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function Placements() {
  const [internships, setInternships] = useState([]);
  const [company, setCompany] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('applied');
  const token = localStorage.getItem('token');

  const fetchInternships = () => {
    fetch('http://localhost:5000/internships', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setInternships);
  };

  useEffect(() => {
    fetchInternships();
  }, []);

  const addInternship = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/internships', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ company, role, status, applied_date: new Date().toISOString().split('T')[0] }),
    });
    if (res.status === 401) {
      window.location.href = '/login';
      return;
    }
    setCompany('');
    setRole('');
    setStatus('applied');
    fetchInternships();
  };

  const statusColor = {
    applied: 'bg-blue-500/20 text-blue-400',
    'OA scheduled': 'bg-yellow-500/20 text-yellow-400',
    interview: 'bg-purple-500/20 text-purple-400',
    offer: 'bg-green-500/20 text-green-400',
    rejected: 'bg-red-500/20 text-red-400',
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Placement Tracker</h1>

      <form onSubmit={addInternship} className="flex flex-wrap gap-3 mb-8">
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
          required
        />
        <input
          type="text"
          placeholder="Role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
        >
          <option value="applied">Applied</option>
          <option value="OA scheduled">OA Scheduled</option>
          <option value="interview">Interview</option>
          <option value="offer">Offer</option>
          <option value="rejected">Rejected</option>
        </select>
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium">
          Add
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {internships.map((i) => (
          <div key={i.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-lg">{i.company}</h3>
              <span className={`text-xs px-2 py-1 rounded-full ${statusColor[i.status] || 'bg-slate-700 text-slate-300'}`}>
                {i.status}
              </span>
            </div>
            <p className="text-slate-400 text-sm">{i.role}</p>
            <p className="text-slate-500 text-xs mt-2">Applied: {new Date(i.applied_date).toLocaleDateString()}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Placements;
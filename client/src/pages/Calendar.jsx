import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function Calendar() {
  const [tasks, setTasks] = useState([]);
  const [internships, setInternships] = useState([]);
  const [hackathons, setHackathons] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/tasks', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json()).then(setTasks);
    fetch('http://localhost:5000/internships', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json()).then(setInternships);
    fetch('http://localhost:5000/hackathons', { headers: { Authorization: `Bearer ${token}` } })
      .then((res) => res.json()).then(setHackathons);
  }, []);

  const events = [
    ...tasks.filter(t => t.due_date).map(t => ({ title: t.title, date: t.due_date, type: 'Assignment', color: 'bg-orange-500/20 text-orange-400' })),
    ...internships.filter(i => i.applied_date).map(i => ({ title: `${i.company} - ${i.status}`, date: i.applied_date, type: 'Interview', color: 'bg-blue-500/20 text-blue-400' })),
    ...hackathons.filter(h => h.event_date).map(h => ({ title: h.name, date: h.event_date, type: 'Hackathon', color: 'bg-green-500/20 text-green-400' })),
  ].sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Calendar</h1>

      <div className="space-y-3 max-w-2xl">
        {events.length === 0 && <p className="text-slate-500">No upcoming events yet.</p>}
        {events.map((e, idx) => (
          <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex justify-between items-center">
            <div>
              <p className="font-medium">{e.title}</p>
              <p className="text-slate-500 text-sm">{new Date(e.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
            </div>
            <span className={`text-xs px-3 py-1 rounded-full ${e.color}`}>{e.type}</span>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Calendar;
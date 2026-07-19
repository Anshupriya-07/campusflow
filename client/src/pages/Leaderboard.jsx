import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function Leaderboard() {
  const [leaders, setLeaders] = useState([]);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetch('http://localhost:5000/leaderboard', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setLeaders);
  }, []);

  const medal = { 1: '🥇', 2: '🥈', 3: '🥉' };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Leaderboard</h1>

      <div className="space-y-2">
        {leaders.map((user) => (
          <div
            key={user.id}
            className="bg-slate-900 border border-slate-800 rounded-xl px-5 py-4 flex justify-between items-center"
          >
            <div className="flex items-center gap-4">
              <span className="text-lg font-bold w-8 text-center">
                {medal[user.rank] || `#${user.rank}`}
              </span>
              <span className="font-medium">{user.name}</span>
            </div>
            <div className="flex gap-6 text-sm text-slate-400">
              <span>DSA: {user.dsa_solved}</span>
              <span>Hackathons: {user.hackathons_count}</span>
              <span>🔥 Streak: {user.login_streak}</span>
              <span className="text-indigo-400 font-semibold">{user.score} pts</span>
            </div>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Leaderboard;
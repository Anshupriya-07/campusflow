import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';

function Settings() {
  const [profile, setProfile] = useState(null);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:5000/profile', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setProfile);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>

      {profile && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 max-w-md space-y-4">
          <div>
            <p className="text-slate-500 text-sm">Name</p>
            <p className="text-lg">{profile.name}</p>
          </div>
          <div>
            <p className="text-slate-500 text-sm">Email</p>
            <p className="text-lg">{profile.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="mt-4 px-5 py-2 rounded-lg bg-red-600/20 text-red-400 hover:bg-red-600/30 font-medium"
          >
            Log Out
          </button>
        </div>
      )}
    </Layout>
  );
}

export default Settings;
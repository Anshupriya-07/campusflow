import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:5000/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) {
        setError('Invalid email or password');
        return;
      }
      const data = await res.json();
      localStorage.setItem('token', data.token);
      navigate('/dashboard');
    } catch (err) {
      setError('Something went wrong. Try again.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      <div className="hidden md:flex w-1/2 bg-indigo-950/40 items-center justify-center p-12">
        <div className="max-w-sm text-center">
          <h2 className="text-3xl font-bold mb-4">Welcome Back</h2>
          <p className="text-slate-400">Pick up right where you left off, your tasks, progress, and goals are waiting.</p>
        </div>
      </div>

      <div className="w-full md:w-1/2 flex items-center justify-center p-8">
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-5">
          <h1 className="text-2xl font-bold mb-2">Log in to CampusFlow</h1>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <div>
            <label className="text-sm text-slate-400">College Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <div>
            <label className="text-sm text-slate-400">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full mt-1 px-4 py-2 rounded-lg bg-slate-900 border border-slate-700 focus:outline-none focus:border-indigo-500"
              required
            />
          </div>

          <button type="submit" className="w-full py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium">
            Log In
          </button>

          <p className="text-sm text-slate-400 text-center">
            Don't have an account? <Link to="/signup" className="text-indigo-400 hover:underline">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
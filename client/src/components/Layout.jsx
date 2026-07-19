import { Link, useLocation, useNavigate } from 'react-router-dom';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: '🏠' },
  { name: 'Tasks', path: '/tasks', icon: '✅' },
  { name: 'Calendar', path: '/calendar', icon: '📅' },
  { name: 'Notes', path: '/notes', icon: '📚' },
  { name: 'Placements', path: '/placements', icon: '💼' },
  { name: 'Progress', path: '/progress', icon: '📈' },
  { name: 'Leaderboard', path: '/leaderboard', icon: '🏆' },
  { name: 'Settings', path: '/settings', icon: '⚙️' },
];

function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800 flex flex-col p-4">
        <div className="text-xl font-bold px-2 mb-8">CampusFlow</div>

        <nav className="flex-1 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                location.pathname === item.path
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <span>{item.icon}</span>
              {item.name}
            </Link>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          className="px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 rounded-lg text-left"
        >
          🚪 Logout
        </button>
      </aside>

      {/* Main content, scrollable */}
      <main className="flex-1 overflow-y-auto p-8">{children}</main>
    </div>
  );
}

export default Layout;
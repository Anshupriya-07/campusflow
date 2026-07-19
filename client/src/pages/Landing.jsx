import { Link } from 'react-router-dom';

function Landing() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <nav className="flex justify-between items-center px-8 py-5 border-b border-slate-800">
        <span className="text-xl font-bold">CampusFlow</span>
        <div className="flex gap-6 text-sm text-slate-400">
          <a href="#features">Features</a>
          <a href="#testimonials">Testimonials</a>
          <a href="#faq">FAQ</a>
        </div>
        <div className="flex gap-3">
          <Link to="/login" className="px-4 py-2 text-sm rounded-lg border border-slate-700 hover:bg-slate-800">Login</Link>
          <Link to="/signup" className="px-4 py-2 text-sm rounded-lg bg-indigo-600 hover:bg-indigo-500">Sign Up</Link>
        </div>
      </nav>

      <section className="max-w-4xl mx-auto text-center py-32 px-6">
        <h1 className="text-5xl font-bold mb-6 leading-tight">
          One Workspace For Your <span className="text-indigo-400">Entire College Life</span>
        </h1>
        <p className="text-slate-400 text-lg mb-10">
          Manage academics, track placements, join hackathons, organize notes, and study smarter with AI.
        </p>
        <div className="flex justify-center gap-4">
          <Link to="/signup" className="px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium">Get Started</Link>
          <button className="px-6 py-3 rounded-lg border border-slate-700 hover:bg-slate-800 font-medium">Watch Demo</button>
        </div>
        <p className="mt-8 text-sm text-slate-500">★★★★★ Used by 500+ Students</p>
      </section>
    </div>
  );
}

export default Landing;
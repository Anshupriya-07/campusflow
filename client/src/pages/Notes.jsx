import { useEffect, useState } from 'react';
import Layout from '../components/Layout';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [subject, setSubject] = useState('');
  const token = localStorage.getItem('token');

  const fetchNotes = () => {
    fetch('http://localhost:5000/notes', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then(setNotes);
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  const addNote = async (e) => {
    e.preventDefault();
    await fetch('http://localhost:5000/notes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ title, content, subject }),
    });
    setTitle('');
    setContent('');
    setSubject('');
    fetchNotes();
  };

  const deleteNote = async (id) => {
    await fetch(`http://localhost:5000/notes/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchNotes();
  };

  return (
    <Layout>
      <h1 className="text-2xl font-bold mb-6">Notes</h1>

      <form onSubmit={addNote} className="bg-slate-900 border border-slate-800 rounded-xl p-5 mb-8 space-y-3 max-w-lg">
        <input
          type="text"
          placeholder="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-indigo-500"
          required
        />
        <input
          type="text"
          placeholder="Subject (e.g. DBMS, OS)"
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        <textarea
          placeholder="Write your note..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={4}
          className="w-full px-4 py-2 rounded-lg bg-slate-950 border border-slate-700 focus:outline-none focus:border-indigo-500"
        />
        <button type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 font-medium">
          Add Note
        </button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {notes.map((note) => (
          <div key={note.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{note.title}</h3>
              <button onClick={() => deleteNote(note.id)} className="text-red-400 hover:text-red-300 text-xs">
                Delete
              </button>
            </div>
            {note.subject && (
              <span className="text-xs px-2 py-1 rounded-full bg-slate-800 text-slate-400 mb-2 inline-block">
                {note.subject}
              </span>
            )}
            <p className="text-slate-400 text-sm mt-2 line-clamp-3">{note.content}</p>
          </div>
        ))}
      </div>
    </Layout>
  );
}

export default Notes;
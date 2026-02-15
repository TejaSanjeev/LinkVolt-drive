import { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const View = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Security States
  const [isLocked, setIsLocked] = useState(false);
  const [password, setPassword] = useState('');
  
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    fetchContent();
  }, [id]);

  const fetchContent = async (pwd = '') => {
    try {
      const res = await axios.post(`http://localhost:5000/api/${id}/verify`, { password: pwd });
      
      // Success! Show content
      setData(res.data);
      setIsLocked(false);
      setLoading(false);

    } catch (err) {
      if (err.response?.status === 401) {
        setIsLocked(true);
        setLoading(false);
        
        if (pwd) setError('Incorrect Password');
      } else {
        
        setError(err.response?.data?.error || 'Link expired or not found');
        setLoading(false);
      }
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    fetchContent(password);
  };

  
  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
        <div className="relative w-24 h-24">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-blue-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-500 rounded-full animate-spin"></div>
        </div>
    </div>
  );

  
  if (error && !isLocked) return (
    <div className="glass-panel max-w-lg mx-auto p-10 rounded-3xl text-center border border-red-900/50 bg-red-900/10 mt-10 shadow-2xl">
      <div className="text-6xl mb-6">💔</div>
      <h2 className="text-3xl font-bold text-red-400 mb-2">Link Unavailable</h2>
      <p className="text-gray-300 text-lg">{error}</p>
      <Link to="/" className="btn-volt mt-8 inline-block px-8 py-3 rounded-xl text-white font-bold">Go Home</Link>
    </div>
  );

  
  if (isLocked) return (
    <div className="glass-panel max-w-md mx-auto p-10 rounded-3xl text-center border border-yellow-600/30 mt-10 shadow-2xl relative overflow-hidden">
      <div className="text-6xl mb-6">🔒</div>
      <h2 className="text-2xl font-bold text-gray-100 mb-2">Protected Content</h2>
      <p className="text-gray-400 text-sm mb-8">Enter password to unlock this file.</p>
      
      <form onSubmit={handlePasswordSubmit} className="space-y-4">
        <input
          type="password"
          placeholder="Enter Password"
          className="w-full bg-gray-900/60 border border-gray-600 text-white text-center p-4 rounded-xl focus:outline-none focus:border-yellow-500 transition text-lg tracking-widest"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
        />
        <button className="w-full btn-volt py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-yellow-500/20">
          Unlock Access 🔓
        </button>
      </form>
      {error && <div className="mt-4 text-red-400 bg-red-900/20 p-2 rounded border border-red-900/50 text-sm font-semibold">{error}</div>}
    </div>
  );

  
  return (
    <div className="max-w-5xl mx-auto glass-panel rounded-2xl p-8 md:p-12 shadow-2xl border border-gray-700/50 mt-6 relative overflow-hidden animate-fade-in-up">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-gray-700 pb-6 mb-8 gap-4">
        <div>
            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-100 to-gray-400">
            {data.type === 'file' ? 'Ready for Download' : 'Shared Text Snippet'}
            </h2>
            <p className="text-gray-500 text-sm mt-1">Link ID: <span className="font-mono text-blue-400">{id}</span></p>
        </div>
        <span className="bg-green-900/30 text-xs px-4 py-1.5 rounded-full text-green-400 border border-green-500/30 font-bold uppercase tracking-wider shadow-inner">
            ✅ View Recorded
        </span>
      </div>

      {data.type === 'text' ? (
        <div className="relative group">
            <textarea
                readOnly
                className="w-full h-[500px] bg-gray-950 text-emerald-400 font-mono p-6 rounded-xl border border-gray-800 focus:outline-none resize-none text-sm leading-relaxed shadow-inner"
                value={data.content}
            />
            <button 
                onClick={() => {navigator.clipboard.writeText(data.content); alert("Copied!");}}
                className="absolute top-4 right-4 bg-gray-800/80 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-lg text-xs border border-gray-600 opacity-0 group-hover:opacity-100 transition backdrop-blur-sm"
            >
                Copy Content
            </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 bg-gradient-to-b from-gray-900/40 to-gray-900/10 rounded-2xl border-2 border-dashed border-gray-700 hover:border-blue-500/50 transition duration-500">
          <div className="w-24 h-24 bg-blue-900/20 rounded-full flex items-center justify-center mb-6 animate-pulse-slow">
             <div className="text-6xl">📁</div>
          </div>
          
          <h3 className="text-2xl font-bold text-gray-200 mb-2 max-w-2xl text-center break-words px-4">
            {data.originalName}
          </h3>
          <p className="text-gray-500 text-sm mb-8">File is safe and ready to download</p>
          
          <a
            href={`http://localhost:5000/api/file/download/${data.filename}`}
            className="group relative inline-flex items-center gap-3 btn-volt px-10 py-4 rounded-full text-white font-bold text-lg shadow-lg hover:shadow-blue-500/40 transition transform hover:-translate-y-1"
          >
            <span>Download File</span>
            <span className="group-hover:translate-y-1 transition-transform">⬇️</span>
          </a>
        </div>
      )}

      <div className="mt-10 pt-6 border-t border-gray-800 text-center">
        <Link to="/" className="text-blue-400 hover:text-blue-300 hover:underline font-semibold transition">
          Create New Link ⚡
        </Link>
      </div>
    </div>
  );
};

export default View;
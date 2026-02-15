import { useState } from 'react';
import axios from 'axios';

const Upload = ({ token }) => {
  const [activeTab, setActiveTab] = useState('text');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState('');
  const [maxViews, setMaxViews] = useState('');
  const [isOneTime, setIsOneTime] = useState(false);
  const [password, setPassword] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const MAX_FILE_SIZE = 5 * 1024 * 1024;
  const getMinDateTime = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setError('');
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'txt', 'docx', 'zip'];

    if (selectedFile) {
        if (selectedFile.size > MAX_FILE_SIZE) {
            setError('File too large (Max 5MB)');
            setFile(null); e.target.value = null; return;
        }
        const ext = selectedFile.name.split('.').pop().toLowerCase();
        if (!allowedExtensions.includes(ext)) {
            setError(`Invalid type. Allowed: ${allowedExtensions.join(', ')}`);
            setFile(null); e.target.value = null; return;
        }
        setFile(selectedFile);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true); setError(''); setGeneratedLink('');
    const formData = new FormData();
    if (expiry) formData.append('expiry', expiry);
    if (maxViews) formData.append('maxViews', maxViews);
    if (password) formData.append('password', password);

    if (activeTab === 'text') {
      if (!text.trim()) { setError('Enter text first.'); setLoading(false); return; }
      formData.append('text', text);
    } else {
      if (!file) { setError('Select a file first.'); setLoading(false); return; }
      formData.append('file', file);
    }

    try {
      const config = { headers: { 'Content-Type': 'multipart/form-data', ...(token && { Authorization: `Bearer ${token}` }) } };
      const res = await axios.post('http://localhost:5000/api/upload', formData, config);
      if (res.data.success) setGeneratedLink(`${window.location.origin}/${res.data.linkId}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-gray-700/50 max-w-6xl mx-auto">
      <form onSubmit={handleUpload} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Main Input Area */}
        <div className="lg:col-span-2 space-y-4">
           {/* Tabs */}
           <div className="flex bg-gray-900/50 rounded-lg p-1 mb-4">
              <button
                type="button"
                className={`flex-1 py-3 rounded-md font-bold transition ${activeTab === 'text' ? 'bg-gray-700 text-blue-400 shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => { setActiveTab('text'); setGeneratedLink(''); }}
              >
                📝 Text Editor
              </button>
              <button
                type="button"
                className={`flex-1 py-3 rounded-md font-bold transition ${activeTab === 'file' ? 'bg-gray-700 text-purple-400 shadow-lg' : 'text-gray-400 hover:text-gray-200'}`}
                onClick={() => { setActiveTab('file'); setGeneratedLink(''); }}
              >
                📁 File Upload
              </button>
           </div>

           {/* Input Area */}
           <div className="h-96">
              {activeTab === 'text' ? (
                <textarea
                  className="w-full h-full bg-gray-900/50 text-gray-200 p-6 rounded-xl border border-gray-700 focus:outline-none input-glow transition font-mono leading-relaxed resize-none"
                  placeholder="Paste your code, secrets, or notes here..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                />
              ) : (
                <div className="h-full border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center justify-center bg-gray-900/30 hover:border-purple-500 transition relative">
                    <input type="file" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                    <div className="text-6xl mb-4">☁️</div>
                    <p className="text-xl font-bold text-gray-300">Drag & Drop or Click to Upload</p>
                    <p className="text-sm text-gray-500 mt-2">Max 5MB (Images, PDF, TXT, ZIP)</p>
                    {file && <p className="mt-4 text-purple-400 font-bold bg-purple-900/20 px-4 py-2 rounded-lg border border-purple-500/30">Selected: {file.name}</p>}
                </div>
              )}
           </div>
        </div>

        {/* RIGHT COLUMN: Settings Sidebar */}
        <div className="lg:col-span-1 space-y-6 bg-gray-800/30 p-6 rounded-xl border border-gray-700/50 h-fit">
            <h3 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 mb-4 border-b border-gray-700 pb-2">
                ⚙️ Link Settings
            </h3>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Expires At</label>
                
                <input
                    type="datetime-local"
                    min={getMinDateTime()}
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    className="w-full bg-gray-900/80 border border-gray-600 text-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500 [color-scheme:dark]"
                />
                <p className="text-xs text-gray-500 mt-1 text-right">Default: 10 Mins</p>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">
                    Max Views {isOneTime && <span className="text-red-400 ml-1">(Locked)</span>}
                </label>
                <input
                    type="number"
                    min="1"
                    placeholder="Unlimited"
                    value={maxViews}
                    disabled={isOneTime} 
                    onChange={(e) => setMaxViews(e.target.value)}
                    className={`w-full bg-gray-900/80 border border-gray-600 text-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500 ${isOneTime ? 'opacity-50 cursor-not-allowed' : ''}`}
                />
            </div>

            <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-700/50 flex items-center gap-3">
                <input
                    id="oneTime"
                    type="checkbox"
                    checked={isOneTime}
                    onChange={(e) => {setIsOneTime(e.target.checked); if(e.target.checked) setMaxViews('1'); else setMaxViews('');}}
                    className="w-5 h-5 accent-orange-500 cursor-pointer"
                />
                <label htmlFor="oneTime" className="text-sm text-gray-300 cursor-pointer font-medium">
                    🔥 Burn after reading
                </label>
            </div>

            <div>
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 block">Password (Optional)</label>
                
                <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-gray-900/80 border border-gray-600 text-gray-200 p-3 rounded-lg focus:outline-none focus:border-blue-500"
                />
            </div>

            <button disabled={loading} className="w-full btn-volt py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-blue-500/20 transition transform hover:-translate-y-1 mt-4">
              {loading ? '⚡ Energizing...' : 'Generate Secure Link ⚡'}
            </button>

            {error && <div className="p-3 bg-red-900/30 text-red-300 text-sm text-center rounded border border-red-800">{error}</div>}
        </div>
      </form>

      {/* Result Section */}
      {generatedLink && (
        <div className="mt-8 p-6 bg-gradient-to-r from-green-900/40 to-emerald-900/40 rounded-xl border border-green-500/30 flex flex-col md:flex-row items-center gap-4 animate-fade-in-up">
          <div className="flex-1 w-full">
             <p className="text-green-400 text-xs font-bold uppercase tracking-wider mb-1">Link Generated Successfully</p>
             <input readOnly value={generatedLink} className="w-full bg-gray-900 text-emerald-300 p-3 rounded border border-emerald-700/50 font-mono text-sm focus:outline-none"/>
          </div>
          <button
            onClick={() => { navigator.clipboard.writeText(generatedLink); alert("Copied!"); }}
            className="w-full md:w-auto bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-lg font-bold shadow-lg transition"
          >
            Copy Link
          </button>
        </div>
      )}
    </div>
  );
};
export default Upload;
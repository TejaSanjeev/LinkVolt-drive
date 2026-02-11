import { useState } from 'react';
import axios from 'axios';

const Upload = () => {
  const [activeTab, setActiveTab] = useState('text'); // 'text' or 'file'
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const [expiry, setExpiry] = useState(10);
  const [generatedLink, setGeneratedLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setGeneratedLink('');

    const formData = new FormData();
    formData.append('expiry', expiry);

    if (activeTab === 'text') {
      if (!text.trim()) {
        setError('Please enter some text.');
        setLoading(false);
        return;
      }
      formData.append('text', text);
    } else {
      if (!file) {
        setError('Please select a file.');
        setLoading(false);
        return;
      }
      formData.append('file', file);
    }

    try {
      const res = await axios.post('http://localhost:5000/api/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        // Construct the full URL using the current window location
        const link = `${window.location.origin}/${res.data.linkId}`;
        setGeneratedLink(link);
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.error || 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      {/* Tabs */}
      <div className="flex mb-4 border-b">
        <button
          className={`flex-1 py-2 font-semibold ${activeTab === 'text' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => { setActiveTab('text'); setGeneratedLink(''); setError(''); }}
        >
          Text
        </button>
        <button
          className={`flex-1 py-2 font-semibold ${activeTab === 'file' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500'}`}
          onClick={() => { setActiveTab('file'); setGeneratedLink(''); setError(''); }}
        >
          File
        </button>
      </div>

      <form onSubmit={handleUpload}>
        <div className="mb-4">
          {activeTab === 'text' ? (
            <textarea
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              rows="5"
              placeholder="Paste your text here..."
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          ) : (
            <input
              type="file"
              className="w-full p-2 border rounded-lg bg-gray-50"
              onChange={(e) => setFile(e.target.files[0])}
            />
          )}
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-1">Expires in:</label>
          <select
            value={expiry}
            onChange={(e) => setExpiry(e.target.value)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="1">1 Minute</option>
            <option value="10">10 Minutes (Default)</option>
            <option value="60">1 Hour</option>
            <option value="1440">1 Day</option>
          </select>
        </div>

        <button
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-300"
        >
          {loading ? 'Generating Link...' : 'Generate Link'}
        </button>
      </form>

      {error && <p className="mt-4 text-red-500 text-sm text-center">{error}</p>}

      {generatedLink && (
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200 animate-pulse-once">
          <p className="text-sm text-green-800 mb-2 font-semibold">Your Secure Link:</p>
          <div className="flex items-center gap-2">
            <input
              readOnly
              value={generatedLink}
              className="flex-1 p-2 text-sm bg-white border rounded text-gray-600 outline-none"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(generatedLink);
                alert("Copied!");
              }}
              className="bg-green-600 text-white px-3 py-2 rounded hover:bg-green-700 text-sm"
            >
              Copy
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
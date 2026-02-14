import { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const View = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Password States
  const [isProtected, setIsProtected] = useState(false);
  const [inputPassword, setInputPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  
  const hasFetched = useRef(false);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/${id}`);
        
        // Check if server says it's protected
        if (res.data.protected) {
            setIsProtected(true);
            setLoading(false);
        } else {
            setData(res.data);
            setLoading(false);
        }

      } catch (err) {
        handleErrors(err);
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const handlePasswordSubmit = async (e) => {
      e.preventDefault();
      setPasswordError('');
      
      try {
          // Send password to verification endpoint
          const res = await axios.post(`http://localhost:5000/api/${id}/verify`, {
              password: inputPassword
          });
          
          setIsProtected(false); // Unlock
          setData(res.data);     // Show content
      } catch (err) {
          if (err.response && err.response.status === 401) {
              setPasswordError("Incorrect password.");
          } else {
              handleErrors(err);
          }
      }
  };

  const handleErrors = (err) => {
    if (err.response && err.response.status === 410) {
        setError('This link has expired or reached its limit.');
     } else if (err.response && err.response.status === 404) {
        setError('Link not found.');
     } else {
        setError('Error retrieving content.');
     }
  };

  if (loading) return <div className="text-center mt-10">Loading secure content...</div>;

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center mt-10">
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p>{error}</p>
      <a href="/" className="inline-block mt-4 text-blue-600 underline">Go Home</a>
    </div>
  );

  // LOCKED STATE UI
  if (isProtected) {
      return (
        <div className="bg-white shadow-xl rounded-lg p-8 max-w-sm mx-auto text-center">
            <div className="text-4xl mb-4">🔒</div>
            <h2 className="text-xl font-bold mb-4">Password Required</h2>
            <p className="text-gray-600 mb-6 text-sm">This link is protected. Please enter the password to view it.</p>
            
            <form onSubmit={handlePasswordSubmit}>
                <input 
                    type="password" 
                    value={inputPassword}
                    onChange={(e) => setInputPassword(e.target.value)}
                    className="w-full p-2 border rounded mb-4 text-center"
                    placeholder="Enter Password"
                    autoFocus
                />
                <button className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700">
                    Unlock Link
                </button>
            </form>
            {passwordError && <p className="text-red-500 mt-4 text-sm">{passwordError}</p>}
        </div>
      );
  }

  // UNLOCKED STATE UI (Same as before)
  return (
    <div className="bg-white shadow-xl rounded-lg p-6">
      <h2 className="text-xl font-bold mb-4 text-gray-800">
        {data.type === 'text' ? 'Shared Text' : 'Shared File'}
      </h2>

      {data.type === 'text' ? (
        <div className="relative">
          <pre className="bg-gray-50 p-4 rounded border overflow-x-auto text-sm text-gray-700 whitespace-pre-wrap">
            {data.content}
          </pre>
          <button
            onClick={() => {
                navigator.clipboard.writeText(data.content);
                alert("Text copied!");
            }}
            className="mt-4 w-full bg-gray-800 text-white py-2 rounded hover:bg-gray-900 transition"
          >
            Copy Text
          </button>
        </div>
      ) : (
        <div className="text-center py-8">
          <div className="text-6xl mb-4">📄</div>
          <p className="font-semibold text-gray-700 mb-6">{data.originalName}</p>
          <a
            href={`http://localhost:5000/api/file/download/${data.filename}`}
            className="inline-block w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            Download File
          </a>
        </div>
      )}
      
      <div className="mt-6 pt-4 border-t text-center">
         <a href="/" className="text-sm text-gray-400 hover:text-gray-600">Share your own content</a>
      </div>
    </div>
  );
};

export default View;
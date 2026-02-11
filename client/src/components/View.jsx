import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const View = () => {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/${id}`);
        setData(res.data);
      } catch (err) {
        if (err.response && err.response.status === 410) {
           setError('This link has expired.');
        } else if (err.response && err.response.status === 404) {
           setError('Link not found.');
        } else {
           setError('Error retrieving content.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  if (loading) return <div className="text-center mt-10">Loading secure content...</div>;

  if (error) return (
    <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
      <h2 className="text-xl font-bold mb-2">Access Denied</h2>
      <p>{error}</p>
      <a href="/" className="inline-block mt-4 text-blue-600 underline">Go Home</a>
    </div>
  );

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
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Upload from './components/Upload';
import View from './components/View';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <h1 className="text-3xl font-bold text-center text-blue-600 mb-8">LinkVault ⚡</h1>
          <Routes>
            <Route path="/" element={<Upload />} />
            <Route path="/:id" element={<View />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
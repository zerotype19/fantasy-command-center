import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { League } from './pages/League';
import { ResearchPlayers } from './pages/ResearchPlayers';
import { LoadMyTeam } from './pages/LoadMyTeam';
import { Layout } from './components/Layout';

function App() {
  const [activeTab, setActiveTab] = useState('research');

  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Layout activeTab={activeTab} setActiveTab={setActiveTab}>
          <Routes>
            <Route path="/" element={<Navigate to="/research" replace />} />
            <Route path="/research" element={<ResearchPlayers />} />
            <Route path="/team" element={<LoadMyTeam />} />
            <Route path="/settings" element={<League />} />
            <Route path="/home" element={<Home />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import League from './pages/League';
import LoadMyTeam from './pages/LoadMyTeam';
import NFLSchedule from './pages/NFLSchedule';
import ResearchPlayers from './pages/ResearchPlayers';
import PlayerMatchups from './pages/PlayerMatchups';
import FantasyProsAdmin from './pages/FantasyProsAdmin';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/league" element={<League />} />
          <Route path="/load-my-team" element={<LoadMyTeam />} />
          <Route path="/nfl-schedule" element={<NFLSchedule />} />
          <Route path="/research-players" element={<ResearchPlayers />} />
          <Route path="/matchups" element={<PlayerMatchups />} />
          <Route path="/fantasy-pros-admin" element={<FantasyProsAdmin />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;

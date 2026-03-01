import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { GroupPage } from './pages/GroupPage';
import { EdgeDetailPage } from './pages/EdgeDetailPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/:letter" element={<GroupPage />} />
        <Route path="/edges/:slug" element={<EdgeDetailPage />} />
      </Routes>
    </Router>
  );
}

export default App;

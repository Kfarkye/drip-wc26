import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';
import { GroupPage } from './pages/GroupPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/group/d" element={<GroupPage />} />
      </Routes>
    </Router>
  );
}

export default App;

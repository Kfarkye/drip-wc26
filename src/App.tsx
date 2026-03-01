import { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Home } from './pages/Home';

const GroupPage = lazy(() =>
  import('./pages/GroupPage').then((module) => ({ default: module.GroupPage }))
);
const EdgeDetailPage = lazy(() =>
  import('./pages/EdgeDetailPage').then((module) => ({ default: module.EdgeDetailPage }))
);

function RouteFallback() {
  return <div className="px-5 py-10 text-sm text-[var(--gray-500)]">Loading page...</div>;
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/group/:letter"
          element={
            <Suspense fallback={<RouteFallback />}>
              <GroupPage />
            </Suspense>
          }
        />
        <Route
          path="/edges/:slug"
          element={
            <Suspense fallback={<RouteFallback />}>
              <EdgeDetailPage />
            </Suspense>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

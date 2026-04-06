import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';
import SessionRecap from './pages/SessionRecap';
import Plans from './pages/Templates';
import Settings from './pages/Settings';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} />
          <Route path="/recap" element={<SessionRecap />} />
          <Route path="/history" element={<History />} />
          <Route path="/progress" element={<Dashboard />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/import" element={<Import />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

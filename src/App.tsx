import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import SelectWorkout from './pages/SelectWorkout';
import Workout from './pages/Workout';
import History from './pages/History';
import Dashboard from './pages/Dashboard';
import Import from './pages/Import';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<SelectWorkout />} />
          <Route path="/workout/:type" element={<Workout />} />
          <Route path="/history" element={<History />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/import" element={<Import />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

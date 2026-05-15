import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import RefillMaker from './pages/RefillMaker';
import PenSearch from './pages/PenSearch';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/refill-maker" element={<RefillMaker />} />
        <Route path="/pens" element={<PenSearch />} />
      </Routes>
    </BrowserRouter>
  );
}
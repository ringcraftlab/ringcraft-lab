import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import RefillMaker from './pages/RefillMaker';
import PenSearch from './pages/PenSearch';
import Goods from './pages/Goods';

export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/tool" element={<RefillMaker />} />
        <Route path="/refill-maker" element={<RefillMaker />} />
        <Route path="/goods" element={<Goods />} />
        <Route path="/goods/:category" element={<Goods />} />
        <Route path="/goods/:category/:section" element={<Goods />} />
        <Route path="/pen-search" element={<PenSearch />} />
        <Route path="/pens" element={<Navigate to="/pen-search" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
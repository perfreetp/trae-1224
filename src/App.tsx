import { HashRouter, Routes, Route } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import HomePage from '@/pages/HomePage';
import GrowthPage from '@/pages/GrowthPage';
import VaccinePage from '@/pages/VaccinePage';
import MedicinePage from '@/pages/MedicinePage';
import SymptomPage from '@/pages/SymptomPage';
import VisitPage from '@/pages/VisitPage';
import FamilyPage from '@/pages/FamilyPage';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/growth" element={<GrowthPage />} />
          <Route path="/vaccine" element={<VaccinePage />} />
          <Route path="/medicine" element={<MedicinePage />} />
          <Route path="/symptom" element={<SymptomPage />} />
          <Route path="/visit" element={<VisitPage />} />
          <Route path="/family" element={<FamilyPage />} />
        </Route>
      </Routes>
    </HashRouter>
  );
}

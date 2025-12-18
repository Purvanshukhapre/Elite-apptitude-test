import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Welcome from './pages/user/Welcome';
import Registration from './pages/user/Registration';
import AptitudeTest from './pages/user/AptitudeTest';
import Feedback from './pages/user/Feedback';
import AdminLogin from './pages/admin/AdminLogin';
import PremiumDashboard from './pages/admin/PremiumDashboard';
import AdminDashboardUltimateFixed from './pages/AdminDashboardUltimate_fixed';
import AnalyticsDashboard from './pages/admin/AnalyticsDashboard';
import FeedbackDashboard from './pages/admin/FeedbackDashboard';
import ApplicantsPage from './pages/admin/ApplicantsPage';

function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Welcome />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/test" element={<AptitudeTest />} />
          <Route path="/feedback" element={<Feedback />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<PremiumDashboard />} />
          <Route path="/admin/dashboard2" element={<AdminDashboardUltimateFixed />} />
          <Route path="/admin/analytics" element={<AnalyticsDashboard />} />
          <Route path="/admin/feedback" element={<FeedbackDashboard />} />
          <Route path="/admin/applicants" element={<ApplicantsPage />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}

export default App;
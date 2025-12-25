import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Welcome from './pages/user/Welcome';
import Registration from './pages/user/Registration';
import AptitudeTest from './pages/user/AptitudeTest';
import Feedback from './pages/user/Feedback';
import AdminLogin from './pages/admin/AdminLogin';

import ApplicantDetailsPage from './pages/admin/ApplicantDetailsPage';
import ModernDashboard from './pages/admin/ModernDashboard';
import ModernApplicantsPage from './pages/admin/ModernApplicantsPage';
import ModernAnalyticsDashboard from './pages/admin/ModernAnalyticsDashboard';
import ModernFeedbackDashboard from './pages/admin/ModernFeedbackDashboard';
import ViewApplicantsPage from './pages/admin/ViewApplicantsPage';

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/test" element={<AptitudeTest />} />
            <Route path="/feedback" element={<Feedback />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/applicant/:applicantId" element={<ApplicantDetailsPage />} />
            <Route path="/admin/applicants" element={<Navigate to="/admin/modern/applicants" replace />} />
            <Route path="/admin/dashboard" element={<Navigate to="/admin/modern" replace />} />
            <Route path="/admin/modern" element={<ModernDashboard />} />
            <Route path="/admin/modern/applicants" element={<ModernApplicantsPage />} />
            <Route path="/admin/modern/analytics" element={<ModernAnalyticsDashboard />} />
            <Route path="/admin/modern/feedback" element={<ModernFeedbackDashboard />} />
            <Route path="/admin/view-applicants" element={<ViewApplicantsPage />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
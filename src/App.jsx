import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import ErrorBoundary from './components/ErrorBoundary';
import Layout from './components/admin/Layout';
import Welcome from './pages/user/Welcome';
import Registration from './pages/user/Registration';
import AptitudeTest from './pages/user/AptitudeTest';
import UserFeedback from './pages/user/Feedback';
import AdminLogin from './pages/admin/AdminLogin';
import Dashboard from './pages/admin/Dashboard';
import Analytics from './pages/admin/Analytics';
import Applicants from './pages/admin/Applicants';
import FeedbackPage from './pages/admin/Feedback';
import ApplicantDetails from './pages/admin/ApplicantDetails';
import Email from './pages/admin/Email';

function App() {
  return (
    <AppProvider>
      <ErrorBoundary>
        <Router>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/register" element={<Registration />} />
            <Route path="/test" element={<AptitudeTest />} />
            <Route path="/feedback" element={<UserFeedback />} />
            <Route path="/admin" element={<AdminLogin />} />
            <Route path="/admin/modern" element={<Layout><Dashboard /></Layout>} />
            <Route path="/admin/modern/analytics" element={<Layout><Analytics /></Layout>} />
            <Route path="/admin/modern/applicants" element={<Layout><Applicants /></Layout>} />
            <Route path="/admin/modern/feedback" element={<Layout><FeedbackPage /></Layout>} />
            <Route path="/admin/modern/email" element={<Layout><Email /></Layout>} />
            <Route path="/admin/modern/applicants/:id" element={<Layout><ApplicantDetails /></Layout>} />
            <Route path="/admin/*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </Router>
      </ErrorBoundary>
    </AppProvider>
  );
}

export default App;
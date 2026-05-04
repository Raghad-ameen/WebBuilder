import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import Login from './pages/Login.jsx';
import Signup from './pages/Signup.jsx';
import Editor from './pages/Editor.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { Navbar } from './components/Navbar'; 
import { Footer } from './sections/Footer';
import { AboutPage } from './pages/AboutPage';
import { FeaturesPage } from './pages/FeaturesPage';
import { TemplatesPage } from './pages/TemplatesPage';
import AdminDashboard from './pages/AdminDashboard';


const ProtectedAdminRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem('user')); 
  
  if (!user || !user.is_staff) {
    return <Navigate to="/login" replace />; 
  }
  
  return children;
};

function App() {
  return (
    <Router>
      <Navbar /> 
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/templates" element={<TemplatesPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Signup />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/editor/:siteId" element={<Editor />} />
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/admin" element={<ProtectedAdminRoute>
    <AdminDashboard />
  </ProtectedAdminRoute>} />
      </Routes>
      <Footer />
    </Router>
  );
}
export default App;
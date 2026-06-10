import React from 'react';
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
import GuidePage from './pages/GuidePage.jsx';
import LiveWebsiteView from './components/LiveWebsiteView.jsx';

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
      <Routes>
        {/* الصفحات العامة للمنصة (مغلفة بـ React Fragment لحل مشكلة الـ 500) */}
        <Route path="/" element={<><Navbar /><LandingPage /><Footer /></>} />
        <Route path="/about" element={<><Navbar /><AboutPage /><Footer /></>} />
        <Route path="/features" element={<><Navbar /><FeaturesPage /><Footer /></>} />
        <Route path="/templates" element={<><Navbar /><TemplatesPage /><Footer /></>} />
        <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
        <Route path="/register" element={<><Navbar /><Signup /><Footer /></>} />
        <Route path="/dashboard" element={<><Navbar /><Dashboard /><Footer /></>} />
        <Route path="/guide" element={<><Navbar /><GuidePage /><Footer /></>} />
        
        {/* صفحة المحرر (مستقلة وبدون قوائم خارجية) */}
        <Route path="/editor/:siteId" element={<Editor />} />
        
        {/* صفحة المعاينة الحية المستقلة تماماً */}
        <Route path="/preview/:siteId" element={<LiveWebsiteView />} />
        
        {/* لوحة تحكم الإدارة */}
        <Route path="/admin" element={
          <ProtectedAdminRoute>
            <AdminDashboard />
          </ProtectedAdminRoute>
        } />
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
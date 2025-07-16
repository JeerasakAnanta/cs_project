import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components - Public
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Login from './components/Login';
import Pagenotfound from './components/Pagenotfound';

// Components - Protected (ทุกหน้า)
import About from './components/About';
import PdfList from './components/PdfList';
import Services from './components/Services';
import Chatbot from './components/Chatbot';
import Management from './components/Management';
import Pdfcrud from './components/Pdfcrud';
import Uploadpdf from './components/Uploadpdf';

// Admin
import Settings from './components/admin/Settings';
import AdminPanel from './components/admin/AdminPanel';
import ArchivedChats from './components/admin/ArchivedChats';
import Playground from './components/admin/Playground';

// Auth Wrapper
import PrivateRoute from './components/PrivateRoute';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />

      <main className="flex-1 p-4">
        <Routes>
          {/* ✅ Login page - only public route */}
          <Route path="/login" element={<Login />} />

          {/* ✅ Protected routes - ต้อง login ก่อน */}
          <Route
            path="/"
            element={
              <PrivateRoute>
                <Chatbot />
              </PrivateRoute>
            }
          />
          <Route
            path="/pdfList"
            element={
              <PrivateRoute>
                <PdfList />
              </PrivateRoute>
            }
          />
          <Route
            path="/services"
            element={
              <PrivateRoute>
                <Services />
              </PrivateRoute>
            }
          />
          <Route
            path="/about"
            element={
              <PrivateRoute>
                <About />
              </PrivateRoute>
            }
          />
          <Route
            path="/management"
            element={
              <PrivateRoute>
                <Management />
              </PrivateRoute>
            }
          />
          <Route
            path="/pdfcrud"
            element={
              <PrivateRoute>
                <Pdfcrud />
              </PrivateRoute>
            }
          />
          <Route
            path="/uploadpdf"
            element={
              <PrivateRoute>
                <Uploadpdf />
              </PrivateRoute>
            }
          />

          {/* 🔐 Admin only */}
          <Route
            path="/settings"
            element={
              <PrivateRoute role="admin">
                <Settings />
              </PrivateRoute>
            }
          />
          <Route
            path="/adminPanel"
            element={
              <PrivateRoute role="admin">
                <AdminPanel />
              </PrivateRoute>
            }
          />
          <Route
            path="/archivedchats"
            element={
              <PrivateRoute role="admin">
                <ArchivedChats />
              </PrivateRoute>
            }
          />
          <Route
            path="/playground"
            element={
              <PrivateRoute role="admin">
                <Playground />
              </PrivateRoute>
            }
          />

          {/* 404 */}
          <Route path="*" element={<Pagenotfound />} />
        </Routes>
      </main>

      <Footer />
    </Router>
  );
};

export default App;

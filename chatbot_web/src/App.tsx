// src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Components Chatbot
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import About from './components/About';
import PdfList from './components/PdfList';
import Services from './components/Services';
import Chatbot from './components/Chatbot';
import Management from './components/Management';
import Pdfcrud from './components/Pdfcrud';
import Uploadpdf from './components/Uploadpdf';
import Pagenotfound from './components/Pagenotfound';

// Admin
import Settings from './components/admin/Settings';
import AdminPanel from './components/admin/AdminPanel';
import ArchivedChats from './components/admin/ArchivedChats';
import Playground from './components/admin/Playground';

const App: React.FC = () => {
  return (
    <Router>
      <Navbar />

      <main className="flex-1 p-4">
        <Routes>
          {/* Chatbots */}
          <Route path="/" element={<Chatbot />} />
          <Route path="/PdfList" element={<PdfList />} />
          <Route path="/services" element={<Services />} />
          <Route path="/about" element={<About />} />
          <Route path="/management" element={<Management />} />
          <Route path="/pdfcrud" element={<Pdfcrud />} />
          <Route path="/uploadpdf" element={<Uploadpdf />} />

          {/* Admin */}
          <Route path="/settings" element={<Settings />} />
          <Route path="/adminPanel" element={<AdminPanel />} />
          <Route path="/archivedchats" element={<ArchivedChats />} />
          <Route path="/playground" element={<Playground />} />

          {/* 404 not found */}
          <Route path="*" element={<Pagenotfound />} />
        </Routes>
      </main>

      {/* Add the Footer here */}
      <Footer />
    </Router>
  );
};

export default App;

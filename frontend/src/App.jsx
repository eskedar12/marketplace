import React from 'react';
import Navbar from './components/layout/Navbar.jsx';
import Footer from './components/layout/Footer.jsx';
import AppRouter from './routes/AppRouter.jsx';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import AssistantWidget from './components/assistant/AssistantWidget.jsx';

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1">
        <AppRouter />
      </main>
      <Footer />
      <AssistantWidget />
    </div>
  );
}

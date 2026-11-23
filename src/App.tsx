import React, { useEffect } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { LenisProvider } from './context/LenisContext';
import { ArchiveProvider, useArchive } from './context/ArchiveContext';
import { CyberCursor } from './components/CyberCursor';
import { Navbar } from './components/Navbar';
import { GarageDrawer } from './components/GarageDrawer';
import { BagDrawer } from './components/BagDrawer';
import { ProductModal } from './components/ProductModal';
import { ToastStack } from './components/ToastStack';
import { Footer } from './components/Footer';
import { ZeroGPortal } from './components/ZeroGPortal';
import { HomePage } from './pages/HomePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { AdminPage } from './pages/AdminPage';
import { WelcomePage } from './pages/WelcomePage';

const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [pathname]);
  return null;
};

const ArchiveShell: React.FC = () => {
  const location = useLocation();
  const { portalEntered, enterPortal } = useArchive();
  const isWelcomeRoute = location.pathname === '/welcome';
  const showBootPortal = !portalEntered && location.pathname === '/';

  return (
    <>
      <ScrollToTop />
      <CyberCursor />

      <AnimatePresence>
        {showBootPortal && <ZeroGPortal key="boot-portal" onEnter={enterPortal} />}
      </AnimatePresence>

      {!isWelcomeRoute && <Navbar />}

      <main className="min-h-screen">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/welcome" element={<WelcomePage />} />
          <Route path="/collections" element={<CollectionsPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isWelcomeRoute && <Footer />}

      <GarageDrawer />
      <BagDrawer />
      <ProductModal />
      <ToastStack />
    </>
  );
};

export const App: React.FC = () => (
  <BrowserRouter>
    <LenisProvider>
      <ArchiveProvider>
        <ArchiveShell />
      </ArchiveProvider>
    </LenisProvider>
  </BrowserRouter>
);

export default App;

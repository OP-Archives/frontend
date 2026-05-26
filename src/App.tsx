import { MotionConfig } from 'framer-motion';
import { BrowserRouter, Routes, useLocation } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { TenantRouteContext } from './routes/TenantRouteContext';
import { TitleManager } from './routes/TitleManager';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Footer } from '@/components/ui/Footer';
import { Navbar } from '@/navbar/navbar';

function AppLayout() {
  const location = useLocation();
  const isPlayerRoute = /^\/[^/]+\/(vods|cdn|manual|games)\/[^/]+$/.test(location.pathname);

  return (
    <div
      className={`flex w-full flex-col overflow-x-hidden pb-[40px] ${isPlayerRoute ? 'h-[100dvh] overflow-hidden' : 'min-h-screen'}`}
    >
      <Navbar />
      <main
        className={`relative mx-auto flex w-full flex-1 flex-col ${
          isPlayerRoute ? 'min-h-0 overflow-hidden' : 'max-w-7xl px-4'
        }`}
      >
        <TenantRouteContext>
          <TitleManager />
          <Routes>{AppRoutes}</Routes>
        </TenantRouteContext>
      </main>
    </div>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <MotionConfig transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] as const }} reducedMotion="user">
          <AppLayout />
          <Footer className="z-10 shrink-0" />
        </MotionConfig>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

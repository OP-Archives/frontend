import { MotionConfig } from 'framer-motion';
import { useEffect } from 'react';
import { BrowserRouter, Routes, useLocation } from 'react-router-dom';
import { AppRoutes } from './routes/AppRoutes';
import { TenantRouteContext } from './routes/TenantRouteContext';
import { TitleManager } from './routes/TitleManager';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { Footer } from '@/components/ui/Footer';
import { Navbar } from '@/navbar/navbar';

function AppLayout() {
  const location = useLocation();
  const isPlayerRoute = /^\/[^/]+\/(youtube|vods|cdn|manual|games)\/[^/]+$/.test(location.pathname);

  useEffect(() => {
    document.body.classList.toggle('player-route', isPlayerRoute);
  }, [isPlayerRoute]);

  return (
    <>
      <div
        className={`flex w-full flex-col overflow-x-hidden ${isPlayerRoute ? 'player-wrapper h-[100dvh] overflow-hidden pb-[40px]' : 'min-h-screen pb-[40px]'}`}
      >
        <Navbar />
        <main
          className={`relative mx-auto flex min-h-0 w-full flex-1 flex-col ${isPlayerRoute ? 'max-w-full' : 'max-w-[1800px] px-4'}`}
        >
          <TenantRouteContext>
            <TitleManager />
            <Routes>{AppRoutes}</Routes>
          </TenantRouteContext>
        </main>
      </div>
      <Footer className="z-10 shrink-0" />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <MotionConfig transition={{ duration: 0.25, ease: [0.25, 0.4, 0.25, 1] as const }} reducedMotion="user">
          <AppLayout />
        </MotionConfig>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

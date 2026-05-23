import { AnimatePresence, motion } from 'framer-motion';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { BlurredBackground } from '@/components/BlurredBackground';
import { TenantContext } from '@/contexts/TenantContext';
import { Games } from '@/games/Games';
import { Library } from '@/games/Library';
import { Landing } from '@/landing/Landing';
import { Navbar } from '@/navbar/navbar';
import { About } from '@/pages/About';
import { StartArchiving } from '@/pages/StartArchiving';
import { TenantProfile } from '@/tenants/TenantProfile';
import { ErrorBoundary } from '@/utils/ErrorBoundary';
import { Footer } from '@/utils/Footer';
import { NotFound } from '@/utils/NotFound';
import { useTenants } from '@/utils/useTenants';
import { Vod } from '@/vods/Vod';
import { Vods } from '@/vods/Vods';

function AnimatedRoutes() {
  const location = useLocation();
  const isTenantRoute = location.pathname.split('/')[1] !== undefined && location.pathname.split('/')[1] !== '';
  const { data: tenantsData } = useTenants();
  const tenants = tenantsData?.data;
  const currentTenant = isTenantRoute ? location.pathname.split('/')[1] : '';
  const currentTenantData = tenants?.find((t: { id: string }) => t.id === currentTenant);

  const cdnEnabled = currentTenantData?.cdn?.enabled ?? false;
  const cdnBaseUrl = currentTenantData?.cdn?.baseUrl ?? '';

  return (
    <TenantContext.Provider value={{ tenant: currentTenantData ?? null, cdnEnabled, cdnBaseUrl }}>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          className="w-full"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          {isTenantRoute && <BlurredBackground imageUrl={currentTenantData?.background_image_url || null} />}
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="about" element={<About />} />
            <Route path="archive" element={<StartArchiving />} />
            <Route path="start" element={<StartArchiving />} />
            <Route path=":tenant" element={<TenantProfile />}>
              <Route index element={<Vods />} />
              <Route path="games" element={<Games />} />
              <Route path="games/:vodId" element={<Vod />} />
              <Route path="library" element={<Library />} />
              <Route path="vods" element={<Vods />} />
              <Route path="vods/:vodId" element={<Vod />} />
              <Route path="cdn/:vodId" element={<Vod />} />
              <Route path="manual/:vodId" element={<Vod />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </motion.div>
      </AnimatePresence>
    </TenantContext.Provider>
  );
}

export function App() {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <div className="flex min-h-screen w-full flex-col overflow-x-hidden">
          <Navbar />
          <main className="relative mx-auto w-full max-w-7xl flex-1 px-4">
            <AnimatedRoutes />
          </main>
          <Footer className="relative z-10" />
        </div>
      </ErrorBoundary>
    </BrowserRouter>
  );
}

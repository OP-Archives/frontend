import { Route } from 'react-router-dom';
import { NotFound } from '@/components/ui/NotFound';
import { Games } from '@/games/Games';
import { Library } from '@/games/Library';
import { Landing } from '@/landing/Landing';
import { About } from '@/pages/About';
import LeaveSiteConfirmation from '@/pages/LeaveSiteConfirmation';
import { Privacy } from '@/pages/Privacy';
import { StartArchiving } from '@/pages/StartArchiving';
import { TermsOfService } from '@/pages/TermsOfService';
import { TenantIndex } from '@/tenants/TenantIndex';
import { TenantProfile } from '@/tenants/TenantProfile';
import { Vod } from '@/vods/Vod';
import { Vods } from '@/vods/Vods';

export const AppRoutes = (
  <>
    <Route path="/" element={<Landing />} />
    <Route path="about" element={<About />} />
    <Route path="archive" element={<StartArchiving />} />
    <Route path="start" element={<StartArchiving />} />
    <Route path="leave" element={<LeaveSiteConfirmation />} />
    <Route path="privacy" element={<Privacy />} />
    <Route path="tos" element={<TermsOfService />} />
    <Route path=":tenant" element={<TenantProfile />}>
      <Route index element={<TenantIndex />} />
      <Route path="games" element={<Games />} />
      <Route path="games/:vodId" element={<Vod />} />
      <Route path="library" element={<Library />} />
      <Route path="vods" element={<Vods />} />
      <Route path="vods/:vodId" element={<Vod />} />
      <Route path="youtube/:vodId" element={<Vod />} />
      <Route path="cdn/:vodId" element={<Vod />} />
      <Route path="manual/:vodId" element={<Vod />} />
    </Route>
    <Route path="*" element={<NotFound />} />
  </>
);

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import LandingPage from '@/pages/landing-page';
import { SubmitPage } from '@/pages/submit';
import { LoginPage } from '@/pages/login-page';
import { AuthCallbackPage } from '@/pages/auth-callback';
import { NicknameSetupPage } from '@/pages/nickname-setup';
import { AdminPage } from '@/pages/admin-page';
import { Header } from '@/widgets/Header';
import { Error404 } from './Error404';

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <div className="min-h-screen">
        <Header />
        <LandingPage />
      </div>
    ),
  },
  {
    path: '/submit',
    element: (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Header />
        <SubmitPage />
      </div>
    ),
  },
  {
    path: '/login',
    element: (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Header />
        <LoginPage />
      </div>
    ),
  },
  {
    path: '/auth/callback/:provider',
    element: (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Header />
        <AuthCallbackPage />
      </div>
    ),
  },
  {
    path: '/nickname-setup',
    element: (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Header />
        <NicknameSetupPage />
      </div>
    ),
  },
  {
    path: '/admin',
    element: (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Header />
        <AdminPage />
      </div>
    ),
  },
  {
    path: '*',
    element: (
      <div className="min-h-screen bg-[var(--color-surface)]">
        <Header />
        <Error404 />
      </div>
    ),
  },
]);

export const Routes = () => {
  return <RouterProvider router={router} />;
};

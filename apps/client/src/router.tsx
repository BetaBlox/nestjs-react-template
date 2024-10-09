import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import HomePage from '@/features/home/home-page';
import Login from '@/auth/login-page';
import loginAction from '@/auth/login-action';
import loginLoader from '@/auth/login-loader';
import protectedLoader from '@/auth/protected-loader';
import Logout from '@/auth/logout-page';
import {
  FORGOT_PASSWORD,
  HOME,
  LOGIN,
  LOGOUT,
  PASSWORD_RESET,
  PROFILE,
} from '@/common/routes';
import SidebarLayout from '@/layouts/sidebar-layout';
import UserProfilePage from '@/features/user-profile/user-profile-page';
import ForgotPasswordPage from '@/auth/forgot-password-page';
import PasswordResetPage from '@/auth/password-reset-page';
import ErrorPage from '@/error-page';
import ImpersonatePage from './auth/impersonate-page';

const router = createBrowserRouter([
  {
    id: 'root',
    path: HOME,
    errorElement: <ErrorPage />,
    Component: SidebarLayout,
    children: [
      {
        index: true,
        path: HOME,
        loader: protectedLoader,
        element: <HomePage />,
      },
      {
        path: PROFILE,
        loader: protectedLoader,
        element: <UserProfilePage />,
      },
    ],
  },
  {
    path: LOGIN,
    action: loginAction,
    loader: loginLoader,
    element: <Login />,
  },
  {
    path: LOGOUT,
    element: <Logout />,
  },
  {
    path: FORGOT_PASSWORD,
    element: <ForgotPasswordPage />,
  },
  {
    path: PASSWORD_RESET,
    element: <PasswordResetPage />,
  },
  {
    path: '/impersonate',
    element: <ImpersonatePage />,
  },
]);

function Router() {
  return (
    // Only creating router once this component is rendered, otherwise loaders
    // will kick off and start executing, which screws with our authentication
    <RouterProvider router={router} fallbackElement={<p>Initial Load...</p>} />
  );
}

export default Router;

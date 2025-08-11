import React from 'react';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { AnimeProvider } from './context/AnimeContext';
import { AuthProvider } from './hooks/useAuth';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import TrackerPage from './pages/TrackerPage';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <Layout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <TrackerPage />,
      },
      // Future routes like /list or /add can be added here
    ],
  },
]);

const App: React.FC = () => {
  return (
    <AuthProvider>
      <AnimeProvider>
        <RouterProvider router={router} />
      </AnimeProvider>
    </AuthProvider>
  );
};

export default App;

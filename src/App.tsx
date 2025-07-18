import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DynamicPage from './components/DynamicPage';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Sidebar } from './components/Sidebar';
import { ErrorBoundary } from './components/ErrorBoundary';
import { InstallPWAPrompt } from './components/InstallPWAPrompt';
import { JWTPrivateRoute } from './components/JWTPrivateRoute';
import { AdminSetup } from './components/AdminSetup';
import { AdminLogin } from './components/AdminLogin';
import SettingsPage from './pages/admin/SettingsPage';
import PagesPage from './pages/admin/PagesPage';
import PageEditor from './pages/admin/PageEditor';
import AppointmentsPage from './pages/admin/AppointmentsPage';
import AppointmentSettingsPage from './pages/admin/AppointmentSettingsPage';
import HomePage from './pages/HomePage';
import ProjectsPage from './pages/ProjectsPage';
import ProjectDetailsPage from './pages/ProjectDetailsPage';
import AboutUsPage from './pages/AboutUsPage';
import ContactPage from './pages/ContactPage';
import SchedulePage from './pages/SchedulePage';
import ProjectsManagementPage from './pages/admin/ProjectsManagementPage';

// Import Firebase utilities for database/storage only (NO AUTH)
import { db } from './utils/firebase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
      onError: (error) => {
        console.error('Query error:', error);
      }
    },
    mutations: {
      onError: (error) => {
        console.error('Mutation error:', error);
      }
    }
  }
});

console.log('App initializing with screen dimensions:', {
  width: window.innerWidth,
  height: window.innerHeight,
  pixelRatio: window.devicePixelRatio
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <ErrorBoundary>
          <Router>
            <div className="min-h-screen flex flex-col lg:flex-row">
              <Sidebar />
              <main className="flex-1 p-4 lg:p-8 pt-20 lg:pt-8 w-full">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<HomePage />} />
                  <Route path="/projects" element={<ProjectsPage />} />
                  <Route path="/projects/:id" element={<ProjectDetailsPage />} />
                  <Route path="/about" element={<AboutUsPage />} />
                  <Route path="/contact" element={<ContactPage />} />
                  <Route path="/schedule" element={<SchedulePage />} />
                  
                  {/* Admin Auth Routes - These should NOT be protected */}
                  <Route path="/admin-setup" element={<AdminSetup />} />
                  <Route path="/admin-login" element={<AdminLogin />} />
                  
                  {/* Legacy login route redirect */}
                  <Route path="/login" element={<AdminLogin />} />
                  
                  {/* Protected Admin Routes */}
                  <Route
                    path="/admin/settings"
                    element={
                      <JWTPrivateRoute>
                        <SettingsPage />
                      </JWTPrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/pages"
                    element={
                      <JWTPrivateRoute>
                        <PagesPage />
                      </JWTPrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/pages/:id"
                    element={
                      <JWTPrivateRoute>
                        <PageEditor />
                      </JWTPrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/appointments"
                    element={
                      <JWTPrivateRoute>
                        <AppointmentsPage />
                      </JWTPrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/appointment-settings"
                    element={
                      <JWTPrivateRoute>
                        <AppointmentSettingsPage />
                      </JWTPrivateRoute>
                    }
                  />
                  <Route
                    path="/admin/projects"
                    element={
                      <JWTPrivateRoute>
                        <ProjectsManagementPage />
                      </JWTPrivateRoute>
                    }
                  />
                  <Route path="/pages/:slug" element={<DynamicPage />} />

                  {/* 404 Fallback - Optional but recommended */}
                  <Route path="*" element={
                    <div className="text-center py-12">
                      <h1 className="text-4xl font-bold text-gray-800 mb-4">404 - Page Not Found</h1>
                      <p className="text-gray-600 mb-8">The page you're looking for doesn't exist.</p>
                      <a href="/" className="bg-blue-900 text-white px-6 py-3 rounded-lg hover:bg-blue-800 transition-colors">
                        Go Home
                      </a>
                    </div>
                  } />
                </Routes>
              </main>
              <InstallPWAPrompt />
            </div>
          </Router>
        </ErrorBoundary>
      </HelmetProvider>
    </QueryClientProvider>
  );
}

export default App;
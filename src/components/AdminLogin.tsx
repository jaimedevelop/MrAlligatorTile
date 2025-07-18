// src/components/AdminLogin.tsx
import React, { useState } from 'react';
import { Shield, User, Lock, AlertCircle } from 'lucide-react';
import { useJWTAuth } from '../utils/jwtAuth';

interface AdminLoginProps {
  onLoginSuccess?: () => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const { isAuthenticated, login, logout, loading: authLoading } = useJWTAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await login(formData.email, formData.password);
      
      if (success) {
        if (onLoginSuccess) {
          onLoginSuccess();
        } else {
          window.location.href = '/admin/appointments';
        }
      } else {
        setError('Invalid email or password');
      }
    } catch (error) {
      setError('Network error occurred');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // If already logged in, show dashboard
  if (isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <Shield className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Access</h2>
          <p className="text-gray-600 mb-6">You are logged in as an administrator.</p>
          <div className="space-y-3">
            <a 
              href="/admin/appointments" 
              className="block bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
            >
              Go to Admin Dashboard
            </a>
            <button
              onClick={handleLogout}
              className="block w-full bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Login</h2>
          <p className="text-gray-600">Sign in to access the admin panel</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="admin@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>Need to set up admin access?</p>
          <a 
            href="/admin-setup" 
            className="text-amber-600 hover:text-orange-600 font-medium"
          >
            Go to Admin Setup
          </a>
        </div>
      </div>
    </div>
  );
}
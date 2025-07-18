import React, { useState, useEffect } from 'react';
import { Shield, User, Lock, CheckCircle } from 'lucide-react';

export function AdminSetup() {
  const [needsSetup, setNeedsSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    email: 'mralligatorrenovations@gmail.com',
    password: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    checkSetupStatus();
  }, []);

  const checkSetupStatus = async () => {
    try {
      const response = await fetch('/api/admin/setup-status');
      const data = await response.json();
      setNeedsSetup(data.needsSetup);
      setLoading(false);
    } catch (error) {
      console.error('Failed to check setup status:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setMessage('Passwords do not match');
      return;
    }
    
    if (formData.password.length < 8) {
      setMessage('Password must be at least 8 characters');
      return;
    }

    try {
      const response = await fetch('/api/admin/setup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        setSuccess(true);
        setMessage('Admin account created successfully!');
        localStorage.setItem('adminToken', data.token);
        // Redirect to admin panel
        window.location.href = '/admin';
      } else {
        setMessage(data.error || 'Setup failed');
      }
    } catch (error) {
      setMessage('Network error occurred');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500 mx-auto"></div>
          <p className="mt-4">Checking admin status...</p>
        </div>
      </div>
    );
  }

  if (!needsSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Admin Already Configured</h2>
          <p className="text-gray-600 mb-6">Admin account is already set up.</p>
          <a 
            href="/admin" 
            className="bg-amber-500 text-white px-6 py-2 rounded-lg hover:bg-amber-600 transition-colors"
          >
            Go to Admin Login
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-amber-50">
      <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
        <div className="text-center mb-6">
          <Shield className="w-16 h-16 text-amber-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Admin Setup</h2>
          <p className="text-gray-600">Create your admin account (one-time setup)</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Admin Email
            </label>
            <div className="relative">
              <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
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
                placeholder="Minimum 8 characters"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
                required
              />
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg text-sm ${
              success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
            }`}>
              {message}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-amber-500 text-white py-2 px-4 rounded-lg hover:bg-amber-600 transition-colors font-medium"
          >
            Create Admin Account
          </button>
        </form>
      </div>
    </div>
  );
}
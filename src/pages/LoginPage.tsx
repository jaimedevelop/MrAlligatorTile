import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const { login, loginError } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoggingIn(true);
    console.log('[Login] Login form submitted');
    console.log('[Login] Current time:', new Date().toISOString());
    
    const trimmedEmail = email.trim();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      console.log('[Login] Validation failed: Empty email or password');
      setIsLoggingIn(false);
      return;
    }

    try {
      console.log('[Login] Calling login function with email:', trimmedEmail);
      console.log('[Login] Current time before login call:', new Date().toISOString());
      
      const startTime = performance.now();
      
      // Create a promise that will reject after a timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => {
          reject(new Error('Login timed out after 60 seconds'));
        }, 60000); // 60 second timeout - same as original
      });
      
      // Race the login promise against the timeout
      const success = await Promise.race([
        login(trimmedEmail, trimmedPassword),
        timeoutPromise
      ]);
      
      const endTime = performance.now();
      
      console.log(`[Login] Login function took ${endTime - startTime}ms to complete`);
      console.log('[Login] Login function returned:', success);
      
      if (success) {
        console.log('[Login] Login successful, navigating to admin settings');
        navigate('/admin/settings'); // Navigate on success
      } else {
        console.log('[Login] Login failed, error should be displayed by authStore');
      }
    } catch (error) {
      // Handle the error explicitly
      console.error("[Login] Unexpected error during login:", error);
      console.error("[Login] Error details:", {
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : 'No stack trace',
        type: error instanceof Error ? error.constructor.name : typeof error
      });
      
      // Check if it's a timeout error
      if (error instanceof Error && error.message.includes('timed out')) {
        console.error("[Login] Login process timed out");
        alert("Login process timed out. Please try again.");
      }
      // Check for network errors
      else if (error instanceof Error && (
        error.message.includes('network') ||
        error.message.includes('fetch') ||
        error.message.includes('connection')
      )) {
        console.error("[Login] Network error during login");
        alert("Network error during login. Please check your connection and try again.");
      }
      // Generic error handling
      else {
        alert("An error occurred during login. Please try again.");
      }
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-green-50 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-green-600" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Admin Login</h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {loginError && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-5 h-5" />
                <p>{loginError}</p>
              </div>
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                  placeholder="Email address"
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none relative block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-green-500 focus:border-green-500 text-base"
                  placeholder="Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoggingIn}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-base font-medium text-white bg-green-500 hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
          >
            {isLoggingIn ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign in'
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
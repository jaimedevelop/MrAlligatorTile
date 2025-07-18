// src/utils/jwtAuth.ts

console.log('🔐 [DEBUG] Loading jwtAuth module');

export interface AdminUser {
  email: string;
  isAdmin: boolean;
}

export class JWTAuth {
  private static instance: JWTAuth;
  private token: string | null = null;
  private user: AdminUser | null = null;

  constructor() {
    console.log('🔐 [DEBUG] JWTAuth constructor called');
    this.token = localStorage.getItem('adminToken');
    console.log('🔐 [DEBUG] Token from localStorage:', this.token ? 'EXISTS' : 'NULL');
  }

  static getInstance(): JWTAuth {
    if (!JWTAuth.instance) {
      console.log('🔐 [DEBUG] Creating new JWTAuth instance');
      JWTAuth.instance = new JWTAuth();
    }
    return JWTAuth.instance;
  }

  async login(email: string, password: string): Promise<boolean> {
    try {
      console.log('🔐 [DEBUG] Login attempt for email:', email);
      const response = await fetch('/api/admin/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('🔐 [DEBUG] Login response status:', response.status);
      const data = await response.json();
      console.log('🔐 [DEBUG] Login response data:', data);

      if (data.success) {
        this.token = data.token;
        localStorage.setItem('adminToken', data.token);
        console.log('🔐 [DEBUG] Token saved to localStorage');
        await this.verifyToken();
        console.log('🔐 [DEBUG] Login successful');
        return true;
      }
      console.log('🔐 [DEBUG] Login failed:', data.error || 'Unknown error');
      return false;
    } catch (error) {
      console.error('🔐 [DEBUG] Login error:', error);
      return false;
    }
  }

  async verifyToken(): Promise<boolean> {
    console.log('🔐 [DEBUG] Verifying token...');
    
    if (!this.token) {
      console.log('🔐 [DEBUG] No token to verify');
      return false;
    }

    try {
      console.log('🔐 [DEBUG] Making verify request with token');
      const response = await fetch('/api/admin/verify', {
        headers: {
          'Authorization': `Bearer ${this.token}`
        }
      });

      console.log('🔐 [DEBUG] Verify response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔐 [DEBUG] Verify response data:', data);
        this.user = data.admin;
        console.log('🔐 [DEBUG] Token verification successful, user set:', this.user);
        return true;
      } else {
        console.log('🔐 [DEBUG] Token verification failed, logging out');
        this.logout();
        return false;
      }
    } catch (error) {
      console.error('🔐 [DEBUG] Token verification error:', error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    console.log('🔐 [DEBUG] Logging out');
    this.token = null;
    this.user = null;
    localStorage.removeItem('adminToken');
    console.log('🔐 [DEBUG] Logout complete');
  }

  isAuthenticated(): boolean {
    const authenticated = !!this.token && !!this.user;
    console.log('🔐 [DEBUG] isAuthenticated check:', {
      hasToken: !!this.token,
      hasUser: !!this.user,
      result: authenticated
    });
    return authenticated;
  }

  getToken(): string | null {
    console.log('🔐 [DEBUG] getToken called, returning:', this.token ? 'TOKEN_EXISTS' : 'NULL');
    return this.token;
  }

  getUser(): AdminUser | null {
    console.log('🔐 [DEBUG] getUser called, returning:', this.user);
    return this.user;
  }

  // Helper method for making authenticated API calls
  async authenticatedFetch(url: string, options: RequestInit = {}): Promise<Response> {
    console.log('🔐 [DEBUG] Making authenticated fetch to:', url);
    
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
      console.log('🔐 [DEBUG] Added Authorization header');
    } else {
      console.log('🔐 [DEBUG] No token available for authenticated fetch');
    }

    return fetch(url, {
      ...options,
      headers,
    });
  }
}

// Singleton instance
export const jwtAuth = JWTAuth.getInstance();
console.log('🔐 [DEBUG] jwtAuth singleton created:', jwtAuth);

// React hook for using JWT auth
import { useState, useEffect } from 'react';

export function useJWTAuth() {
  console.log('🔐 [DEBUG] useJWTAuth hook called');
  
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔐 [DEBUG] useJWTAuth useEffect triggered');
    checkAuth();
  }, []);

  const checkAuth = async () => {
    console.log('🔐 [DEBUG] checkAuth called');
    setLoading(true);
    
    const isValid = await jwtAuth.verifyToken();
    console.log('🔐 [DEBUG] checkAuth - token valid:', isValid);
    
    setIsAuthenticated(isValid);
    setUser(jwtAuth.getUser());
    setLoading(false);
    
    console.log('🔐 [DEBUG] checkAuth complete - isAuthenticated:', isValid, 'user:', jwtAuth.getUser());
  };

  const login = async (email: string, password: string): Promise<boolean> => {
    console.log('🔐 [DEBUG] useJWTAuth login called');
    const success = await jwtAuth.login(email, password);
    
    if (success) {
      console.log('🔐 [DEBUG] Login successful, updating state');
      setIsAuthenticated(true);
      setUser(jwtAuth.getUser());
    } else {
      console.log('🔐 [DEBUG] Login failed');
    }
    
    return success;
  };

  const logout = () => {
    console.log('🔐 [DEBUG] useJWTAuth logout called');
    jwtAuth.logout();
    setIsAuthenticated(false);
    setUser(null);
  };

  return {
    isAuthenticated,
    user,
    loading,
    login,
    logout,
    checkAuth
  };
}

console.log('✅ [DEBUG] jwtAuth module loaded completely');
import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home, Wrench, Phone, Users, Settings, FileText, LogIn, LogOut, Calendar, Menu, X } from 'lucide-react';
import { useJWTAuth } from '../utils/jwtAuth';

export function Sidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, logout } = useJWTAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  const handleLogout = () => {
    logout();
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 focus:outline-none focus:ring-2 focus:ring-amber-400"
        aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
      >
        {isMobileMenuOpen ? (
          <X className="w-6 h-6" />
        ) : (
          <Menu className="w-6 h-6" />
        )}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={closeMobileMenu}
          aria-hidden="true"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static inset-y-0 left-0 z-40
          w-64 min-h-screen bg-amber-500 text-white
          transform transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0 overflow-y-auto
        `}
      >
        <div className="sticky top-0 p-4">
          <div className="flex items-center gap-2 mb-8">
            <img 
              src="/MrAlligatorLogo1.svg" 
              alt="Mr. Alligator Logo" 
              className="w-24 h-24"
            />
            <h1 className="text-xl font-bold">Mr. Alligator</h1>
          </div>
          
          <nav className="space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <Home className="w-5 h-5" />
              <span>Home</span>
            </NavLink>
            
            <NavLink
              to="/projects"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <Wrench className="w-5 h-5" />
              <span>Projects</span>
            </NavLink>
            
            <NavLink
              to="/about"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <Users className="w-5 h-5" />
              <span>About Us</span>
            </NavLink>
            
            <NavLink
              to="/contact"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <Phone className="w-5 h-5" />
              <span>Contact</span>
            </NavLink>

            <NavLink
              to="/schedule"
              className={({ isActive }) => 
                `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
              }
              onClick={closeMobileMenu}
            >
              <Calendar className="w-5 h-5" />
              <span>Schedule Service</span>
            </NavLink>

            {isAuthenticated ? (
              <>
                <div className="border-t border-amber-600 my-4"></div>
                <NavLink
                  to="/admin/pages"
                  className={({ isActive }) => 
                    `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  <FileText className="w-5 h-5" />
                  <span>Pages</span>
                </NavLink>
                <NavLink
                  to="/admin/projects"
                  className={({ isActive }) => 
                    `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Wrench className="w-5 h-5" />
                  <span>Projects</span>
                </NavLink>
                <NavLink
                  to="/admin/appointments"
                  className={({ isActive }) => 
                    `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Calendar className="w-5 h-5" />
                  <span>Appointments</span>
                </NavLink>
                <NavLink
                  to="/admin/appointment-settings"
                  className={({ isActive }) => 
                    `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Settings className="w-5 h-5" />
                  <span>Scheduling Settings</span>
                </NavLink>
                <NavLink
                  to="/admin/settings"
                  className={({ isActive }) => 
                    `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''}`
                  }
                  onClick={closeMobileMenu}
                >
                  <Settings className="w-5 h-5" />
                  <span>Settings</span>
                </NavLink>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 p-2 rounded hover:bg-amber-600 w-full text-left text-red-300 hover:text-red-200"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <NavLink
                to="/admin-login"
                className={({ isActive }) => 
                  `flex items-center gap-2 p-2 rounded hover:bg-amber-600 ${isActive ? 'bg-orange-600' : ''} mt-4 text-amber-300 hover:text-amber-200`
                }
                onClick={closeMobileMenu}
              >
                <LogIn className="w-5 h-5" />
                <span>Admin Login</span>
              </NavLink>
            )}
          </nav>
        </div>
      </aside>
    </>
  );
}
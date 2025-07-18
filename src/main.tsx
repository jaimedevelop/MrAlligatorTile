// Type definitions for global window augmentation if needed
interface WindowWithGlobals extends Window {
    global: Window;
    process: {
      env: { DEBUG?: string };
    };
  }
  
  // Set up global window properties if needed by any remaining dependencies
  (window as unknown as WindowWithGlobals).global = window;
  (window as unknown as WindowWithGlobals).process = {
    env: { DEBUG: undefined }
  };
  
  import { StrictMode } from 'react';
  import { createRoot } from 'react-dom/client';
  import App from './App.tsx';
  import './index.css';
  
  // Initialize the app
  const initializeApp = async () => {
    try {
      // Any initialization logic can go here
      console.log('App initialization started');
      
      console.info(`Environment: ${import.meta.env.MODE}`);
      
      // Render the app
      const rootElement = document.getElementById('root');
      
      if (!rootElement) {
        throw new Error('Root element not found');
      }
      
      createRoot(rootElement).render(
        <StrictMode>
          <App />
        </StrictMode>
      );
      
      console.log('App rendered successfully');
    } catch (error) {
      console.error('Failed to initialize the app:', error);
    }
  };
  
  // Start the application
  initializeApp();
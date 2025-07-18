import React from 'react';
import { ErrorBoundary as ReactErrorBoundary } from 'react-error-boundary';
import { AlertTriangle } from 'lucide-react';

function logError(error: Error, info: { componentStack: string }) {
  // Log the error
  console.error('Error caught by boundary:', error);
  console.error('Component stack:', info.componentStack);
  
  // Log device information
  console.log('Device Information:', {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    vendor: navigator.vendor,
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio,
  });
}

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center gap-3 text-red-600 mb-4">
          <AlertTriangle className="w-8 h-8" />
          <h2 className="text-xl font-bold">Something went wrong</h2>
        </div>
        
        <div className="mb-6">
          <p className="text-gray-600 mb-2">We're sorry, but something unexpected happened.</p>
          <pre className="text-sm bg-red-50 p-4 rounded overflow-auto max-h-40 whitespace-pre-wrap">
            {error.message}
          </pre>
        </div>

        <div className="flex flex-col gap-2">
          <button
            onClick={resetErrorBoundary}
            className="w-full bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700"
          >
            Try Again
          </button>
          <a
            href="/"
            className="w-full text-center border border-gray-300 px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Return Home
          </a>
        </div>
      </div>
    </div>
  );
}

export function ErrorBoundary({ children }: { children: React.ReactNode }) {
  return (
    <ReactErrorBoundary
      FallbackComponent={ErrorFallback}
      onError={logError}
      onReset={() => {
        // Reset the error boundary state and reload the page
        window.location.reload();
      }}
    >
      {children}
    </ReactErrorBoundary>
  );
}
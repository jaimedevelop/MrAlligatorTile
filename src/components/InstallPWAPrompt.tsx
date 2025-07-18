import React, { useState, useEffect } from 'react';
import { Download, X } from 'lucide-react';

export function InstallPWAPrompt() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handler = (e: any) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show our custom prompt
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    // Show the install prompt
    deferredPrompt.prompt();

    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    // Clear the deferredPrompt variable
    setDeferredPrompt(null);
    // Hide our custom prompt
    setShowPrompt(false);

    // Optionally log the outcome
    console.log(`User response to install prompt: ${outcome}`);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 bg-white rounded-lg shadow-lg p-4 z-50 md:hidden">
      <button
        onClick={() => setShowPrompt(false)}
        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
      >
        <X className="w-5 h-5" />
      </button>
      
      <div className="flex items-center gap-3">
        <Download className="w-8 h-8 text-blue-900" />
        <div className="flex-1">
          <h3 className="font-semibold">Install App</h3>
          <p className="text-sm text-gray-600">
            Add Mr. Alligator to your home screen for quick access
          </p>
        </div>
        <button
          onClick={handleInstall}
          className="bg-blue-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-800"
        >
          Install
        </button>
      </div>
    </div>
  );
}
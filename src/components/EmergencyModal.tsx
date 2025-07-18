import React from 'react';
import { Phone, AlertTriangle, X } from 'lucide-react';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  phoneNumber: string;
}

export function EmergencyModal({ isOpen, onClose, phoneNumber }: EmergencyModalProps) {
  if (!isOpen) return null;

  const formattedPhone = phoneNumber.replace(/[^\d]/g, '');

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full relative overflow-hidden">
        {/* Red header section */}
        <div className="bg-red-600 p-6 text-white">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Emergency Service</h2>
          </div>
          <p className="text-lg">
            Available 24/7 for urgent plumbing issues
          </p>
        </div>

        {/* Content section */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="font-semibold mb-2">When to call emergency service:</h3>
            <ul className="space-y-2 text-gray-700">
              <li>• Burst pipes or major leaks</li>
              <li>• Sewage backup</li>
              <li>• No water supply</li>
              <li>• Gas leak smell</li>
              <li>• Flooding risk</li>
            </ul>
          </div>

          <div className="flex flex-col gap-3">
            <a
              href={`tel:${formattedPhone}`}
              className="flex items-center justify-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
            >
              <Phone className="w-5 h-5" />
              Call Now: {phoneNumber}
            </a>
            <button
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white hover:text-red-100 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
}
import React from 'react';
import { Phone, AlertTriangle } from 'lucide-react';

interface EmergencyContactProps {
  phoneNumber: string;
  className?: string;
}

export function EmergencyContact({ phoneNumber, className = '' }: EmergencyContactProps) {
  const formattedPhone = phoneNumber.replace(/[^\d]/g, '');
  
  return (
    <div className={`bg-red-600 text-white p-4 rounded-lg ${className}`}>
      <div className="flex items-center gap-2 mb-2">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="text-lg font-bold">Emergency Service</h3>
      </div>
      <p className="mb-3">Available 24/7 for urgent plumbing issues</p>
      <a
        href={`tel:${formattedPhone}`}
        className="flex items-center justify-center gap-2 bg-white text-red-600 px-4 py-2 rounded-lg font-semibold hover:bg-red-50 transition-colors"
      >
        <Phone className="w-5 h-5" />
        Call Now: {phoneNumber}
      </a>
    </div>
  );
}
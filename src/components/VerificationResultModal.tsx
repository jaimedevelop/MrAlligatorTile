import { XCircle } from 'lucide-react';

interface VerificationResultModalProps {
  message: string;
  onClose: () => void;
  title?: string; // Optional title
}

export default function VerificationResultModal({ 
  message, 
  onClose, 
  title = "Verification Result" 
}: VerificationResultModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold">{title}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <XCircle className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-grow">
          <pre className="text-sm whitespace-pre-wrap bg-gray-50 p-4 rounded border border-gray-200">
            {message}
          </pre>
        </div>
        <div className="p-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
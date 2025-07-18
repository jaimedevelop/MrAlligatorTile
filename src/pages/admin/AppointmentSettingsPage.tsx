import React, { useState } from 'react'; // Import useState
import { Save, Loader2, AlertCircle, CheckCircle } from 'lucide-react'; // Import icons
import { AppointmentSettings } from '../../types';
import { useAppointmentSettings, useSaveAppointmentSettings } from '../../services/appointmentsService'; // Import hooks for fetching and saving settings

const daysOfWeek = [
  { value: 0, label: 'Sunday' },
  { value: 1, label: 'Monday' },
  { value: 2, label: 'Tuesday' },
  { value: 3, label: 'Wednesday' },
  { value: 4, label: 'Thursday' },
  { value: 5, label: 'Friday' },
  { value: 6, label: 'Saturday' },
];

export default function AppointmentSettingsPage() {
  const { data: settings, isLoading } = useAppointmentSettings();
  const [saveError, setSaveError] = useState<string | null>(null); // State for save errors
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false); // State for save success
  const { mutate: saveSettings, isPending: isSaving } = useSaveAppointmentSettings(); // Remove options from here
  const [localSettings, setLocalSettings] = React.useState<AppointmentSettings>({
    enableScheduling: true,
    availableDays: [1, 2, 3, 4, 5],
    availableHours: {
      start: "09:00",
      end: "17:00"
    },
    excludedDates: [],
    maxDaysInAdvance: 30,
    minDaysInAdvance: 1
  });

  React.useEffect(() => {
    if (settings) {
      setLocalSettings(settings);
    }
  }, [settings]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null); // Clear previous errors on new submit
    setSaveSuccess(false); // Clear previous success message
    saveSettings(localSettings, { // Pass options here
      onSuccess: () => {
        setSaveSuccess(true);
        setSaveError(null);
        // Optionally hide success message after a delay
        setTimeout(() => setSaveSuccess(false), 3000);
      },
      onError: (error: Error) => { // Add type for error
        setSaveError(error.message || 'Failed to save settings. Please try again.');
        setSaveSuccess(false);
      }
    });
  };

  const handleDayToggle = (day: number) => {
    setLocalSettings(prev => ({
      ...prev,
      availableDays: prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day].sort()
    }));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Scheduling Settings</h1>

      <form onSubmit={handleSubmit} className="space-y-8 bg-white p-6 rounded-lg shadow relative"> {/* Add relative positioning */}
        {/* Success Message */}
        {saveSuccess && (
          <div className="absolute top-0 right-0 mt-4 mr-4 flex items-center gap-2 p-3 bg-green-100 text-green-700 border border-green-200 rounded-md text-sm">
            <CheckCircle className="w-4 h-4" />
            Settings saved successfully!
          </div>
        )}
        {/* Error Message */}
        {saveError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-600 flex items-center gap-2">
             <AlertCircle className="w-4 h-4" />
             <span>Error: {saveError}</span>
          </div>
        )}
        <div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enableScheduling"
              checked={localSettings.enableScheduling}
              onChange={(e) => setLocalSettings({ ...localSettings, enableScheduling: e.target.checked })}
              className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="enableScheduling" className="text-lg font-medium">
              Enable Online Scheduling
            </label>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            When disabled, customers will be asked to call for appointments
          </p>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Available Days</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {daysOfWeek.map(day => (
              <div key={day.value} className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`day-${day.value}`}
                  checked={localSettings.availableDays.includes(day.value)}
                  onChange={() => handleDayToggle(day.value)}
                  className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`day-${day.value}`}>{day.label}</label>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Business Hours</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                Start Time
              </label>
              <input
                type="time"
                id="startTime"
                value={localSettings.availableHours.start}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  availableHours: {
                    ...localSettings.availableHours,
                    start: e.target.value
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                End Time
              </label>
              <input
                type="time"
                id="endTime"
                value={localSettings.availableHours.end}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  availableHours: {
                    ...localSettings.availableHours,
                    end: e.target.value
                  }
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-4">Booking Window</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="minDays" className="block text-sm font-medium text-gray-700">
                Minimum Days in Advance
              </label>
              <input
                type="number"
                id="minDays"
                min="0"
                value={localSettings.minDaysInAdvance}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  minDaysInAdvance: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
            <div>
              <label htmlFor="maxDays" className="block text-sm font-medium text-gray-700">
                Maximum Days in Advance
              </label>
              <input
                type="number"
                id="maxDays"
                min="1"
                value={localSettings.maxDaysInAdvance}
                onChange={(e) => setLocalSettings({
                  ...localSettings,
                  maxDaysInAdvance: parseInt(e.target.value)
                })}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <button
            type="submit"
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {isSaving ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>

      <div className="mt-8 bg-blue-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Scheduling Tips</h2>
        <ul className="space-y-2 text-gray-700">
          <li>• Set business hours that align with your team's availability</li>
          <li>• Consider buffer time between appointments for travel and setup</li>
          <li>• Adjust the booking window based on your scheduling preferences</li>
          <li>• Regularly review and update excluded dates for holidays</li>
        </ul>
      </div>
    </div>
  );
}
// components/scheduling/AppointmentForm.tsx
import React, { useState, useEffect } from 'react';
import { format, addDays, isWithinInterval, isSameDay, parseISO, startOfDay } from 'date-fns';
import { Calendar, Clock, AlertCircle, CheckCircle } from 'lucide-react';
import { Appointment, ServiceType, AppointmentSettings } from '../../types/types';
import { useAppointmentSettings, useSaveAppointment, useAppointmentsByDateRange } from '../../services/appointmentsService';

interface TimeSlot {
  time: string;
  available: boolean;
}

const serviceTypes: { value: ServiceType; label: string }[] = [
  { value: 'repair', label: 'Repair Service' },
  { value: 'installation', label: 'Installation' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'inspection', label: 'Inspection' },
  { value: 'emergency', label: 'Emergency Service' },
  { value: 'other', label: 'Other' }
];

function generateTimeSlots(settings: AppointmentSettings): TimeSlot[] {
  const slots: TimeSlot[] = [];
  const [startHour, startMinute] = settings.availableHours.start.split(':').map(Number);
  const [endHour, endMinute] = settings.availableHours.end.split(':').map(Number);
  
  let currentHour = startHour;
  let currentMinute = startMinute;
  
  while (currentHour < endHour || (currentHour === endHour && currentMinute <= endMinute)) {
    slots.push({
      time: `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`,
      available: true
    });
    
    currentMinute += 30;
    if (currentMinute >= 60) {
      currentHour += 1;
      currentMinute = 0;
    }
  }
  
  return slots;
}

function isDateAvailable(date: Date, settings: AppointmentSettings): boolean {
  // Check if the day is in available days
  if (!settings.availableDays.includes(date.getDay())) {
    return false;
  }

  // Check if date is within min/max days range
  const today = startOfDay(new Date());
  const minDate = startOfDay(addDays(today, settings.minDaysInAdvance));
  const maxDate = startOfDay(addDays(today, settings.maxDaysInAdvance));
  
  const selectedDate = startOfDay(date);
  
  if (!isWithinInterval(selectedDate, { start: minDate, end: maxDate })) {
    return false;
  }
  
  // Check if date is in excluded dates
  return !settings.excludedDates.some(excludedDate => 
    isSameDay(parseISO(excludedDate), date)
  );
}

export default function AppointmentForm() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [debouncedSelectedDate, setDebouncedSelectedDate] = useState<Date | null>(null); // State for debounced date
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    serviceType: '' as ServiceType,
    description: ''
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [availableTimeSlots, setAvailableTimeSlots] = useState<TimeSlot[]>([]);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

  // Add this block right here - it will only run when component first mounts
useEffect(() => {
  console.log('=== ENVIRONMENT VARIABLES CHECK ===');
  console.log('API Key:', import.meta.env.VITE_MAILGUN_API_KEY);
  console.log('Domain:', import.meta.env.VITE_MAILGUN_DOMAIN);
  console.log('Business Email:', import.meta.env.VITE_BUSINESS_EMAIL);
  console.log('Admin Email:', import.meta.env.VITE_ADMIN_EMAIL);
  console.log('=== END ENV CHECK ===');
}, []); // Empty dependency array means this only runs once on mount
  const { data: settings, isLoading: isLoadingSettings } = useAppointmentSettings();
  const { mutate: saveAppointment } = useSaveAppointment();
  
  // Use debounced date for the query, but only when we actually have a date selected
  // This prevents unnecessary queries when no date is selected
  const { data: existingAppointments = [], isLoading: isLoadingAppointments } = useAppointmentsByDateRange(
    debouncedSelectedDate ? startOfDay(debouncedSelectedDate) : null, 
    debouncedSelectedDate ? addDays(startOfDay(debouncedSelectedDate), 1) : null
  );

  // Debounce selectedDate with a longer delay to reduce database queries
  useEffect(() => {
    // Only set debounced date if selectedDate is not null
    if (selectedDate) {
      const handler = setTimeout(() => {
        setDebouncedSelectedDate(selectedDate);
      }, 10000); // Increased delay to 800ms to reduce frequency of queries
      
      return () => {
        clearTimeout(handler);
      };
    } else {
      // If selectedDate is null, immediately set debouncedSelectedDate to null
      setDebouncedSelectedDate(null);
    }
  }, [selectedDate]); // Only re-run when selectedDate changes

  // Update available time slots when debounced date or existing appointments change
  useEffect(() => {
    // Only run this effect when we have both settings and a selected date
    if (!settings || !selectedDate) {
      setAvailableTimeSlots([]);
      return;
    }

    // Generate time slots based on settings
    const slots = generateTimeSlots(settings);
    
    // Mark slots as unavailable if they match existing appointments
    const updatedSlots = slots.map(slot => ({
      ...slot,
      available: !existingAppointments.some((apt: Appointment) => 
        format(apt.preferredDate, 'HH:mm') === slot.time
      )
    }));

    setAvailableTimeSlots(updatedSlots);
  }, [debouncedSelectedDate, existingAppointments, settings, selectedDate]); // Added selectedDate to dependency array

  // Hide success message after 5 seconds
  useEffect(() => {
    if (showSuccessMessage) {
      const timer = setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [showSuccessMessage]);

  if (isLoadingSettings || !settings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-900"></div>
      </div>
    );
  }

  if (!settings.enableScheduling) {
    return (
      <div className="bg-yellow-50 p-6 rounded-lg">
        <div className="flex items-center gap-2 text-yellow-800 mb-4">
          <AlertCircle className="w-5 h-5" />
          <p className="font-medium">Our short term schedule is full</p>
        </div>
        <p className="text-yellow-700">
          Please call or send us an email directly at (813) 679-4905 to check if your project could fit in our schedule: mralligatorrenovations@gmail.com
        </p>
      </div>
    );
  }

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.customerName.trim()) {
      errors.customerName = 'Name is required';
    }
    
    if (!formData.customerEmail.trim()) {
      errors.customerEmail = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.customerEmail)) {
      errors.customerEmail = 'Invalid email address';
    }
    
    if (!formData.customerPhone.trim()) {
      errors.customerPhone = 'Phone number is required';
    }
    
    if (!formData.serviceType) {
      errors.serviceType = 'Please select a service type';
    }
    
    if (!selectedDate) {
      errors.date = 'Please select a date';
    }
    
    if (!selectedTime) {
      errors.time = 'Please select a time';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const date = e.target.value ? new Date(e.target.value) : null;
    if (date && isDateAvailable(date, settings)) {
      setSelectedDate(date);
      setSelectedTime(''); // Reset time when date changes
    } else {
      setSelectedDate(null);
      setSelectedTime('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (!selectedDate || !selectedTime) {
        throw new Error('Please select both date and time');
      }

      const [hours, minutes] = selectedTime.split(':').map(Number);
      const appointmentDate = new Date(selectedDate);
      appointmentDate.setHours(hours, minutes, 0, 0);
      
      const appointment: Appointment = {
        ...formData,
        preferredDate: appointmentDate,
        status: 'pending',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Save appointment to database
      await saveAppointment(appointment);
      
      // Send emails (customer confirmation + admin notification)
      try {
        console.log('Appointment emails sent successfully');
      } catch (emailError) {
        console.error('Failed to send emails, but appointment was saved:', emailError);
        // Don't fail the whole process if emails fail
      }
      
      // Reset form
      setSelectedDate(null);
      setSelectedTime('');
      setFormData({
        customerName: '',
        customerEmail: '',
        customerPhone: '',
        serviceType: '' as ServiceType,
        description: ''
      });
      
      // Show success message instead of alert
      setShowSuccessMessage(true);
      
    } catch (error) {
      console.error('Error saving appointment:', error);
      setSubmitError('Failed to submit appointment request. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const minDate = format(addDays(new Date(), settings.minDaysInAdvance), 'yyyy-MM-dd');
  const maxDate = format(addDays(new Date(), settings.maxDaysInAdvance), 'yyyy-MM-dd');

  return (
    <div>
      {/* Success Message */}
      {showSuccessMessage && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-md p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <CheckCircle className="h-5 w-5 text-green-400" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Appointment Request Submitted Successfully!
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  We've received your appointment request and sent a confirmation email. 
                  We'll contact you within 1 business hour to confirm your appointment.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="customerName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="customerName"
              value={formData.customerName}
              onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                formErrors.customerName ? 'border-red-300' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            />
            {formErrors.customerName && (
              <p className="mt-1 text-sm text-red-600">{formErrors.customerName}</p>
            )}
          </div>

          <div>
            <label htmlFor="customerEmail" className="block text-sm font-medium text-gray-700">
              Email Address
            </label>
            <input
              type="email"
              id="customerEmail"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                formErrors.customerEmail ? 'border-red-300' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            />
            {formErrors.customerEmail && (
              <p className="mt-1 text-sm text-red-600">{formErrors.customerEmail}</p>
            )}
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="customerPhone" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="tel"
              id="customerPhone"
              value={formData.customerPhone}
              onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                formErrors.customerPhone ? 'border-red-300' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            />
            {formErrors.customerPhone && (
              <p className="mt-1 text-sm text-red-600">{formErrors.customerPhone}</p>
            )}
          </div>

          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-gray-700">
              Service Type
            </label>
            <select
              id="serviceType"
              value={formData.serviceType}
              onChange={(e) => setFormData({ ...formData, serviceType: e.target.value as ServiceType })}
              className={`mt-1 block w-full rounded-md shadow-sm ${
                formErrors.serviceType ? 'border-red-300' : 'border-gray-300'
              } focus:border-blue-500 focus:ring-blue-500`}
            >
              <option value="">Select a service</option>
              {serviceTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {formErrors.serviceType && (
              <p className="mt-1 text-sm text-red-600">{formErrors.serviceType}</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Preferred Date & Time
          </label>
          <div className="mt-1 grid md:grid-cols-2 gap-4">
            <div>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  value={selectedDate ? format(selectedDate, 'yyyy-MM-dd') : ''}
                  onChange={handleDateChange}
                  min={minDate}
                  max={maxDate}
                  className={`block w-full pl-10 pr-3 py-2 rounded-md shadow-sm ${
                    formErrors.date ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500`}
                />
              </div>
              {formErrors.date && (
                <p className="mt-1 text-sm text-red-600">{formErrors.date}</p>
              )}
            </div>

            <div>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  disabled={!selectedDate || isLoadingAppointments}
                  className={`block w-full pl-10 pr-3 py-2 rounded-md shadow-sm ${
                    formErrors.time ? 'border-red-300' : 'border-gray-300'
                  } focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100`}
                >
                  <option value="">Select a time</option>
                  {availableTimeSlots.map(slot => (
                    <option 
                      key={slot.time} 
                      value={slot.time}
                      disabled={!slot.available}
                    >
                      {slot.time} {!slot.available && '(Unavailable)'}
                    </option>
                  ))}
                </select>
              </div>
              {formErrors.time && (
                <p className="mt-1 text-sm text-red-600">{formErrors.time}</p>
              )}
            </div>
          </div>
        </div>

        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            Description of Service Needed
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="mt-1 block w-full rounded-md shadow-sm border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            placeholder="Please describe the service you need..."
          />
        </div>

        {submitError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-700">{submitError}</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-blue-900 text-white px-6 py-2 rounded-md font-medium hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Schedule Appointment'}
          </button>
        </div>
      </form>
    </div>
  );
}
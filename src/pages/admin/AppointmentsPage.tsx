// pages/admin/AppointmentsPage.tsx
import React, { useState } from 'react';
import { format } from 'date-fns';
import {
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getFilteredRowModel,
  getSortedRowModel,
  SortingState,
} from '@tanstack/react-table';
import { 
  Calendar, 
  Search, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronUp,
  ChevronDown,
  Eye,
  Trash2,
  Phone,
  Mail
} from 'lucide-react';
import { Appointment } from '../../types';
import { useAppointments, useSaveAppointment, useDeleteAppointment } from '../../services/appointmentsService';

const columnHelper = createColumnHelper<Appointment>();

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-green-100 text-green-800',
  rejected: 'bg-red-100 text-red-800',
  completed: 'bg-blue-100 text-blue-800',
  cancelled: 'bg-gray-100 text-gray-800',
};

const statusIcons = {
  pending: Clock,
  confirmed: CheckCircle,
  rejected: XCircle,
  completed: CheckCircle,
  cancelled: AlertTriangle,
};

interface AppointmentDetailsModalProps {
  appointment: Appointment;
  onClose: () => void;
  onStatusChange: (status: Appointment['status']) => void;
  onDelete: () => void;
}

function AppointmentDetailsModal({ 
  appointment, 
  onClose, 
  onStatusChange,
  onDelete
}: AppointmentDetailsModalProps) {
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const handleStatusChange = async (newStatus: Appointment['status']) => {
    if (newStatus === appointment.status) return;
    
    // Check if we're changing FROM confirmed or rejected status
    const isChangingFromFinalStatus = appointment.status === 'confirmed' || appointment.status === 'rejected';
    
    if (isChangingFromFinalStatus) {
      const currentStatusText = appointment.status === 'confirmed' ? 'confirmed' : 'rejected';
      const newStatusText = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
      
      const confirmMessage = `This appointment was already ${currentStatusText}. Are you sure you want to change it to "${newStatusText}"?\n\nThe customer will receive a new email notification.`;
      
      if (!window.confirm(confirmMessage)) {
        return; // User cancelled the change
      }
    }
    
    setIsUpdatingStatus(true);
    try {
      // The appointmentsService already handles email sending automatically
      await onStatusChange(newStatus);
      
      // Show appropriate success message based on status
      if (newStatus === 'confirmed') {
        alert('Appointment confirmed and confirmation email sent to customer.');
      } else if (newStatus === 'rejected') {
        alert('Appointment rejected and notification email sent to customer.');
      }
      // No message for completed/cancelled as requested
      
      onClose();
    } catch (error) {
      console.error('Failed to update appointment status:', error);
      
      // Check if it's an email error vs status update error
      if (error instanceof Error && error.message.includes('email')) {
        if (newStatus === 'confirmed') {
          alert('Appointment status updated to confirmed, but failed to send confirmation email to customer.');
        } else if (newStatus === 'rejected') {
          alert('Appointment status updated to rejected, but failed to send notification email to customer.');
        }
      } else {
        alert('Failed to update appointment status. Please try again.');
      }
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-6">
            <h2 className="text-2xl font-bold">Appointment Details</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <XCircle className="w-6 h-6" />
            </button>
          </div>

          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Customer Information</h3>
                <div className="mt-2 space-y-2">
                  <p className="text-lg font-medium">{appointment.customerName}</p>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="w-4 h-4" />
                    <a href={`mailto:${appointment.customerEmail}`} className="hover:text-blue-600">
                      {appointment.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="w-4 h-4" />
                    <a href={`tel:${appointment.customerPhone}`} className="hover:text-blue-600">
                      {appointment.customerPhone}
                    </a>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">Appointment Details</h3>
                <div className="mt-2 space-y-2">
                  <p>
                    <span className="font-medium">Service Type:</span>{' '}
                    {appointment.serviceType.charAt(0).toUpperCase() + appointment.serviceType.slice(1)}
                  </p>
                  <p>
                    <span className="font-medium">Date:</span>{' '}
                    {format(appointment.preferredDate, 'MMMM d, yyyy')}
                  </p>
                  <p>
                    <span className="font-medium">Time:</span>{' '}
                    {format(appointment.preferredDate, 'h:mm a')}
                  </p>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Description</h3>
              <p className="mt-2 text-gray-700 whitespace-pre-wrap">
                {appointment.description || 'No description provided'}
              </p>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-2">Status</h3>
              <div className="space-y-2">
                <p className="text-sm text-gray-600 mb-3">
                  Current status: <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${statusColors[appointment.status]}`}>
                    {React.createElement(statusIcons[appointment.status], { className: "w-4 h-4" })}
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </p>
                
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleStatusChange('pending')}
                    disabled={isUpdatingStatus || appointment.status === 'pending'}
                    className={`px-4 py-2 rounded-md ${
                      appointment.status === 'pending' 
                        ? 'bg-yellow-100 text-yellow-800 cursor-not-allowed' 
                        : 'bg-gray-100 hover:bg-yellow-50 disabled:opacity-50'
                    }`}
                  >
                    <Clock className="w-4 h-4 inline mr-1" />
                    Pending
                  </button>
                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    disabled={isUpdatingStatus || appointment.status === 'confirmed'}
                    className={`px-4 py-2 rounded-md ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800 cursor-not-allowed' 
                        : (appointment.status === 'rejected') 
                          ? 'bg-gray-100 hover:bg-green-50 disabled:opacity-50 border-2 border-amber-300' 
                          : 'bg-gray-100 hover:bg-green-50 disabled:opacity-50'
                    }`}
                    title={appointment.status === 'rejected' ? 'This will override the rejected status and send a new email' : undefined}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Confirm & Email Customer
                  </button>
                  <button
                    onClick={() => handleStatusChange('completed')}
                    disabled={isUpdatingStatus || appointment.status === 'completed'}
                    className={`px-4 py-2 rounded-md ${
                      appointment.status === 'completed' 
                        ? 'bg-blue-100 text-blue-800 cursor-not-allowed' 
                        : (appointment.status === 'confirmed' || appointment.status === 'rejected')
                          ? 'bg-gray-100 hover:bg-blue-50 disabled:opacity-50 border-2 border-amber-300'
                          : 'bg-gray-100 hover:bg-blue-50 disabled:opacity-50'
                    }`}
                    title={(appointment.status === 'confirmed' || appointment.status === 'rejected') ? 'This will change the appointment status that was already communicated to the customer' : undefined}
                  >
                    <CheckCircle className="w-4 h-4 inline mr-1" />
                    Completed
                  </button>
                  <button
                    onClick={() => handleStatusChange('rejected')}
                    disabled={isUpdatingStatus || appointment.status === 'rejected'}
                    className={`px-4 py-2 rounded-md ${
                      appointment.status === 'rejected' 
                        ? 'bg-red-100 text-red-800 cursor-not-allowed' 
                        : (appointment.status === 'confirmed')
                          ? 'bg-gray-100 hover:bg-red-50 disabled:opacity-50 border-2 border-amber-300'
                          : 'bg-gray-100 hover:bg-red-50 disabled:opacity-50'
                    }`}
                    title={appointment.status === 'confirmed' ? 'This will override the confirmed status and send a new email' : undefined}
                  >
                    <XCircle className="w-4 h-4 inline mr-1" />
                    Reject & Email Customer
                  </button>
                  <button
                    onClick={() => handleStatusChange('cancelled')}
                    disabled={isUpdatingStatus || appointment.status === 'cancelled'}
                    className={`px-4 py-2 rounded-md ${
                      appointment.status === 'cancelled' 
                        ? 'bg-gray-200 text-gray-800 cursor-not-allowed' 
                        : (appointment.status === 'confirmed' || appointment.status === 'rejected')
                          ? 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50 border-2 border-amber-300'
                          : 'bg-gray-100 hover:bg-gray-200 disabled:opacity-50'
                    }`}
                    title={(appointment.status === 'confirmed' || appointment.status === 'rejected') ? 'This will change the appointment status that was already communicated to the customer' : undefined}
                  >
                    <AlertTriangle className="w-4 h-4 inline mr-1" />
                    Cancelled
                  </button>
                </div>
                
                {isUpdatingStatus && (
                  <div className="flex items-center gap-2 text-blue-600 mt-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span className="text-sm">Updating status...</span>
                  </div>
                )}
                
                <p className="text-xs text-gray-500 mt-2">
                  Note: Confirming or rejecting will automatically send an email notification to the customer.
                </p>
              </div>
            </div>

            <div className="border-t pt-4 flex justify-between items-center">
              <button
                onClick={onDelete}
                disabled={isUpdatingStatus}
                className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-800 rounded-md hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Delete Appointment
              </button>
              <button
                onClick={onClose}
                disabled={isUpdatingStatus}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 disabled:opacity-50"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppointmentsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [sorting, setSorting] = useState<SortingState>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  
  const { data: appointments = [], isLoading } = useAppointments();
  const { mutate: saveAppointment } = useSaveAppointment();
  const { mutate: deleteAppointment } = useDeleteAppointment();

  const columns = [
    columnHelper.accessor('customerName', {
      header: 'Customer Name',
      cell: info => info.getValue(),
    }),
    columnHelper.accessor('serviceType', {
      header: 'Service Type',
      cell: info => info.getValue().charAt(0).toUpperCase() + info.getValue().slice(1),
    }),
    columnHelper.accessor('preferredDate', {
      header: 'Appointment Date',
      cell: info => format(info.getValue(), 'MMM dd, yyyy HH:mm'),
    }),
    columnHelper.accessor('status', {
      header: 'Status',
      cell: info => {
        const status = info.getValue();
        const StatusIcon = statusIcons[status];
        return (
          <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-sm ${statusColors[status]}`}>
            <StatusIcon className="w-4 h-4" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        );
      },
    }),
    columnHelper.display({
      id: 'actions',
      cell: ({ row }) => {
        const appointment = row.original;
        return (
          <div className="flex gap-2">
            <button
              onClick={() => setSelectedAppointment(appointment)}
              className="p-1 text-blue-600 hover:text-blue-800"
              title="View Details"
            >
              <Eye className="w-5 h-5" />
            </button>
          </div>
        );
      },
    }),
  ];

  const handleStatusChange = async (appointment: Appointment, newStatus: Appointment['status']) => {
    return new Promise((resolve, reject) => {
      saveAppointment({
        ...appointment,
        status: newStatus,
        updatedAt: new Date(),
      }, {
        onSuccess: () => resolve(undefined),
        onError: (error) => reject(error)
      });
    });
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    if (window.confirm('Are you sure you want to delete this appointment?')) {
      deleteAppointment(appointment.id!);
      setSelectedAppointment(null);
    }
  };

  const table = useReactTable({
    data: appointments,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    state: {
      globalFilter: searchTerm,
      sorting,
    },
    onSortingChange: setSorting,
    onGlobalFilterChange: setSearchTerm,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Appointments Management</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="bg-gray-50">
                  {headerGroup.headers.map(header => (
                    <th
                      key={header.id}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer select-none"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      <div className="flex items-center gap-2">
                        {flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                        {header.column.getIsSorted() && (
                          header.column.getIsSorted() === 'asc' 
                            ? <ChevronUp className="w-4 h-4" />
                            : <ChevronDown className="w-4 h-4" />
                        )}
                      </div>
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr
                  key={row.id}
                  className="border-t border-gray-200 hover:bg-gray-50"
                >
                  {row.getVisibleCells().map(cell => (
                    <td
                      key={cell.id}
                      className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedAppointment && (
        <AppointmentDetailsModal
          appointment={selectedAppointment}
          onClose={() => setSelectedAppointment(null)}
          onStatusChange={(newStatus) => handleStatusChange(selectedAppointment, newStatus)}
          onDelete={() => handleDeleteAppointment(selectedAppointment)}
        />
      )}
    </div>
  );
}
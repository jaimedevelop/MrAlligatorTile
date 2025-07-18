import { SEOHead } from '../components/SEOHead';
import AppointmentForm from '../components/scheduling/AppointmentForm';
import { Clock, Calendar, CheckCircle, AlertTriangle, Phone, Loader2 } from 'lucide-react';
import { useAppointmentSettings } from "../services/appointmentsService";
const seo = {
  title: "Schedule a Plumbing Service - Mr. Alligator Plumbing",
  description: "Book your plumbing service appointment online. Available for emergency repairs, maintenance, and installations. Fast and easy scheduling.",
  keywords: ["schedule plumber", "book plumbing service", "plumbing appointment", "emergency plumber booking"]
};

const features = [
  {
    icon: Clock,
    title: "24/7 Emergency Service",
    description: "Available around the clock for urgent plumbing needs"
  },
  {
    icon: Calendar,
    title: "Flexible Scheduling",
    description: "Choose a time that works best for you"
  },
  {
    icon: CheckCircle,
    title: "Licensed Professionals",
    description: "Expert plumbers for any job, big or small"
  },
  {
    icon: AlertTriangle,
    title: "Quick Response",
    description: "Fast confirmation of your appointment"
  }
];

export default function SchedulePage() {
  const { data: settings, isLoading } = useAppointmentSettings();
  return (
    <>
      <SEOHead seo={seo} />

      {/* Hero Section */}
      <section className="bg-amber-500 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-4xl font-bold mb-4">
              Schedule Your Plumbing Service
            </h1>
            <p className="text-xl opacity-90">
              Book an appointment with our expert plumbers. We'll confirm your
              scheduling request within 1 business hour.
            </p>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-12 bg-amber-50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-amber-600" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scheduling Form Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Book Your Appointment</h2>
              {isLoading ? (
                <div className="flex justify-center items-center h-40">
                  <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
                </div>
              ) : settings?.enableScheduling ? (
                <AppointmentForm />
              ) : (
                <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
                  <h3 className="text-xl font-semibold mb-2">Online Scheduling Currently Unavailable</h3>
                  <p className="text-gray-700">
                    We are currently experiencing high demand. Please call us directly to book your appointment.
                  </p>
                  <a
                    href="tel:+1-555-PLUMBER" // Replace with actual phone number
                    className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600"
                  >
                    <Phone className="w-4 h-4" />
                    Call Us Now
                  </a>
                </div>
              )}
            </div>

            <div className="mt-8 bg-amber-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Important Information</h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  Emergency services are available 24/7
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  Standard service hours are Monday to Friday, 8 AM to 6 PM
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  We'll confirm your appointment via email and phone
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-600">•</span>
                  Please provide accurate contact information for confirmation
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
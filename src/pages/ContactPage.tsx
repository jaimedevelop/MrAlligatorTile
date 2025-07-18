import React, { useState } from 'react';
import { SEOHead } from '../components/SEOHead';
import { EmergencyContact } from '../components/EmergencyContact';
import { Phone, Mail, MapPin, Clock, MessageSquare, Send, CheckCircle } from 'lucide-react';

const seo = {
  title: "Contact Mr. Alligator Plumbing - 24/7 Emergency Service Available",
  description: "Need a plumber? Contact Mr. Alligator Plumbing for immediate assistance. Available 24/7 for emergencies. Get a free quote for your plumbing needs today.",
  keywords: ["plumber contact", "emergency plumbing", "plumbing quote", "24/7 plumber", "local plumber contact", "plumbing services"]
};

const EMERGENCY_NUMBER = "(813) 679-4905";
const OFFICE_NUMBER = "(813) 679-4905";

const contactInfo = [
  {
    icon: Phone,
    title: "Phone",
    primary: OFFICE_NUMBER,
    secondary: `24/7 Emergency: ${EMERGENCY_NUMBER}`
  },
  {
    icon: Mail,
    title: "Email",
    primary: "mralligatorrenovations@gmail.com",
    secondary: "mralligatorplumbing@gmail.com"
  },
  {
    icon: MapPin,
    title: "Location",
    primary: "14907 Coldwater LN",
    secondary: "Tampa, FL 33624"
  },
  {
    icon: Clock,
    title: "Hours",
    primary: "Mon-Sat: 7am-6pm",
    secondary: "Emergency: 24/7"
  }
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  service: string;
  message: string;
  isEmergency: boolean;
}

const initialFormData: FormData = {
  name: '',
  email: '',
  phone: '',
  service: '',
  message: '',
  isEmergency: false
};

export default function ContactPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // If it's an emergency, redirect to phone call
    if (formData.isEmergency) {
      window.location.href = `tel:${EMERGENCY_NUMBER.replace(/[^\d]/g, '')}`;
      return;
    }
    
    // Simulate API call for non-emergency submissions
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    setFormData(initialFormData);
  };

  return (
    <>
      <SEOHead seo={seo} />

      {/* Hero Section */}
      <section className="relative h-[300px] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          <div className="absolute inset-0 bg-amber-600/80" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl max-w-2xl">
            Available 24/7 for emergency plumbing services. Get in touch for a free quote
            or schedule a service appointment.
          </p>
        </div>
      </section>

      {/* Emergency Contact Banner */}
      <div className="container mx-auto px-4 -mt-8 relative z-10">
        <EmergencyContact phoneNumber={EMERGENCY_NUMBER} />
      </div>

      {/* Contact Info Cards */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {contactInfo.map((info, index) => (
              <div key={index} className="bg-amber-50 rounded-lg p-6 text-center">
                <info.icon className="w-10 h-10 mx-auto mb-4 text-amber-600" />
                <h3 className="text-lg font-semibold mb-2">{info.title}</h3>
                {info.title === "Phone" ? (
                  <>
                    <a href={`tel:${info.primary.replace(/[^\d]/g, '')}`} className="block text-gray-900 mb-1 hover:text-amber-600">
                      {info.primary}
                    </a>
                    <a href={`tel:${EMERGENCY_NUMBER.replace(/[^\d]/g, '')}`} className="block text-red-600 hover:text-red-700">
                      {info.secondary}
                    </a>
                  </>
                ) : info.title === "Email" ? (
                  <>
                    <a href={`mailto:${info.primary}`} className="block text-gray-900 mb-1 hover:text-amber-600">
                      {info.primary}
                    </a>
                    <a href={`mailto:${info.secondary}`} className="block text-gray-600 hover:text-amber-600">
                      {info.secondary}
                    </a>
                  </>
                ) : (
                  <>
                    <p className="text-gray-900 mb-1">{info.primary}</p>
                    <p className="text-gray-600">{info.secondary}</p>
                  </>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex items-center gap-3 mb-8">
                <MessageSquare className="w-8 h-8 text-amber-600" />
                <h2 className="text-2xl font-bold">Send Us a Message</h2>
              </div>

              {isSubmitted ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold mb-2">Thank You!</h3>
                  <p className="text-gray-600">
                    We've received your message and will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setIsSubmitted(false)}
                    className="mt-6 text-amber-600 font-semibold hover:text-orange-600"
                  >
                    Send Another Message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="bg-yellow-50 p-4 rounded-lg mb-6">
                    <label className="flex items-start gap-2">
                      <input
                        type="checkbox"
                        name="isEmergency"
                        checked={formData.isEmergency}
                        onChange={handleChange}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-medium text-yellow-800">This is an emergency</p>
                        <p className="text-sm text-yellow-700">
                          If checked, you'll be redirected to call our emergency line immediately
                        </p>
                      </div>
                    </label>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label htmlFor="service" className="block text-sm font-medium text-gray-700 mb-2">
                        Service Needed
                      </label>
                      <select
                        id="service"
                        name="service"
                        required
                        value={formData.service}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      >
                        <option value="">Select a service</option>
                        <option value="emergency">Emergency Repair</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="installation">Installation</option>
                        <option value="inspection">Inspection</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      required
                      rows={4}
                      value={formData.message}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-amber-500 text-white py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>Processing...</>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Send Message
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="h-[400px] relative">
        <iframe
          src="https://maps.google.com/maps?q=14907%20Coldwater%20LN%2C%20Tampa%2C%20FL%2033624&t=&z=15&ie=UTF8&iwloc=&output=embed"
          className="absolute inset-0 w-full h-full border-0"
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </section>

      {/* Emergency Contact */}
      <section className="py-12 bg-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Emergency? Don't Wait!</h2>
          <p className="text-lg mb-6">
            Our emergency plumbing team is available 24/7 for urgent issues
          </p>
          <a
            href={`tel:${EMERGENCY_NUMBER.replace(/[^\d]/g, '')}`}
            className="inline-flex items-center gap-2 bg-white text-red-600 px-8 py-3 rounded-lg font-semibold hover:bg-red-50 transition-colors"
          >
            <Phone className="w-5 h-5" />
            Call Now: {EMERGENCY_NUMBER}
          </a>
        </div>
      </section>
    </>
  );
}
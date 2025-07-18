import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { SEOHead } from '../components/SEOHead';
import { EmergencyModal } from '../components/EmergencyModal';
import { Phone, Clock, Shield, Award } from 'lucide-react';

const seo = {
  title: "Professional Tiling Services",
  description: "Expert tiling services in your area. Available 24/7 for emergency repairs, installations, and maintenance.",
  keywords: ["tiling services", "emergency tile", "local tiling", "professional tiling", "tile repair"]
};

const EMERGENCY_NUMBER = "(813) 679-4905";

const features = [
  {
    icon: Clock,
    title: "24/7 Emergency Service",
    description: "Available around the clock for urgent plumbing needs"
  },
  {
    icon: Shield,
    title: "Licensed & Insured",
    description: "Fully certified professionals you can trust"
  },
  {
    icon: Award,
    title: "Quality Guaranteed",
    description: "Satisfaction guaranteed on all our services"
  },
  {
    icon: Phone,
    title: "Quick Response",
    description: "Fast response times for all service calls"
  }
];

export default function HomePage() {
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);

  return (
    <>
      <SEOHead seo={seo} />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          <div className="absolute inset-0 bg-green-600/70" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-2xl text-white">
            <h1 className="text-5xl font-bold mb-6">
              Expert Tiling Solutions by Mr. Alligator
            </h1>
            <p className="text-xl mb-8">
              Professional tiling services for your home and business. 
              Available 24/7.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link 
                to="/schedule" 
                className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                Schedule Service
              </Link>
              <button
                onClick={() => setIsEmergencyModalOpen(true)}
                className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                Emergency Service
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Why Choose Mr. Alligator Reno and Plumbing?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-green-50">
                <feature.icon className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-green-500 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a Repair or Plumber Right Now?
          </h2>
          <p className="text-xl mb-8">
            Our Company is ready to help with any repair and plumbing emergency 24/7
          </p>
          <button
            onClick={() => setIsEmergencyModalOpen(true)}
            className="bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors inline-flex items-center gap-2"
          >
            <Phone className="w-5 h-5" />
            Call Now: {EMERGENCY_NUMBER}
          </button>
        </div>
      </section>

      {/* Services Preview */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            Our Services
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Emergency Repairs",
                description: "24/7 emergency plumbing repair services for your home or business",
                image: "/Mr_Alligator_Renovations_Roto_Router.jpg"
              },
              {
                title: "Installation Services",
                description: "Professional installation of fixtures, appliances, and plumbing systems",
                image: "/Mr_Alligator_Renovations_Master_Bathroom.jpeg"
              },
              {
                title: "Maintenance",
                description: "Regular maintenance to prevent costly plumbing issues",
                image: "/Mr_Alligator_Renovations_Plumbing_trench_excavator.jpeg"
              }
            ].map((service, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="relative h-48">
                  <img 
                    src={service.image} 
                    alt={service.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{service.title}</h3>
                  <p className="text-gray-600">{service.description}</p>
                  <Link 
                    to="/schedule" 
                    className="mt-4 text-green-600 font-semibold hover:text-green-600 inline-flex items-center"
                  >
                    Schedule Now →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Emergency Modal */}
      <EmergencyModal
        isOpen={isEmergencyModalOpen}
        onClose={() => setIsEmergencyModalOpen(false)}
        phoneNumber={EMERGENCY_NUMBER}
      />
    </>
  );
}
import React from 'react';
import { SEOHead } from '../components/SEOHead';
import { Award, Clock, Shield, Users, Wrench, ThumbsUp, Phone, MapPin } from 'lucide-react';

const seo = {
  title: "About Mr. Alligator Plumbing - Your Trusted Local Plumbers",
  description: "Learn about Mr. Alligator Plumbing's 20+ years of experience providing expert plumbing services. Meet our licensed team of professional plumbers serving your community.",
  keywords: ["local plumbers", "professional plumbing", "licensed plumbers", "experienced plumbing team", "plumbing company history", "trusted plumbers"]
};

const stats = [
  {
    icon: Clock,
    value: "13+",
    label: "Years Experience"
  },
  {
    icon: Users,
    value: "1500+",
    label: "Happy Customers"
  },
  {
    icon: Wrench,
    value: "24/7",
    label: "Emergency Service"
  },
  {
    icon: ThumbsUp,
    value: "99%",
    label: "Satisfaction Rate"
  }
];

const team = [
  {
    name: "Jaime Guerra",
    role: "Founder & Master Plumber",
    image: "/Mr_Alligator_Renovations_Plumbing_trench_excavator.jpeg",
    description: "13+ years of plumbing expertise, Plumber and Gas Contractor, Certified Medical Gas, and Backflow Preventor."
  }
];

const values = [
  {
    icon: Shield,
    title: "Quality Guaranteed",
    description: "Every job is backed by our satisfaction guarantee. We're not happy until you're happy."
  },
  {
    icon: Clock,
    title: "Always On Time",
    description: "We respect your time and schedule, arriving promptly for every appointment."
  },
  {
    icon: Award,
    title: "Licensed & Insured",
    description: "Fully licensed, bonded, and insured for your complete peace of mind."
  }
];

export default function AboutUsPage() {
  return (
    <>
      <SEOHead seo={seo} />

      {/* Hero Section */}
      <section className="relative h-[400px] flex items-center">
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1581141849291-1125c7b692b5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80')",
            backgroundPosition: "center",
            backgroundSize: "cover"
          }}
        >
          <div className="absolute inset-0 bg-green-600/80" />
        </div>
        <div className="container mx-auto px-4 relative z-10 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-6 max-w-2xl">
            Your Trusted Plumbing Partner Since 2017
          </h1>
          <p className="text-xl max-w-2xl">
            We're more than just plumbers – we're your neighbors, committed to providing
            the highest quality plumbing services to our community.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <stat.icon className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <div className="text-4xl font-bold text-green-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 mb-8">
              Founded in 2017 by Jaime Guerra, our company began with a simple mission:
              to provide honest, reliable plumbing services to our community. Serving both residential and commercial clients across the region.
            </p>
            <p className="text-lg text-gray-600">
              Today, we're proud to be the most trusted name in plumbing, known for our
              expertise, professionalism, and commitment to customer satisfaction. We bring decades of combined experience to every job,
              ensuring that your plumbing needs are met with the highest standards of quality.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Our Values</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {values.map((value, index) => (
              <div key={index} className="text-center p-6 rounded-lg bg-green-50">
                <value.icon className="w-12 h-12 mx-auto mb-4 text-green-600" />
                <h3 className="text-xl font-semibold mb-4">{value.title}</h3>
                <p className="text-gray-600">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="py-16 bg-green-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Meet Our Contractor</h2>
          <div className="max-w-2xl mx-auto">
            {team.map((member, index) => (
              <div key={index} className="bg-white rounded-lg overflow-hidden shadow-lg">
                <div className="aspect-w-16 aspect-h-9 relative">
                  <img 
                    src={member.image} 
                    alt={member.name}
                    className="w-full h-[400px] object-cover"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-semibold mb-2">{member.name}</h3>
                  <p className="text-green-600 text-lg mb-4">{member.role}</p>
                  <p className="text-gray-600 text-lg leading-relaxed">{member.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-green-500 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-8">Ready to Work With Us?</h2>
          <div className="flex flex-wrap justify-center gap-8 max-w-2xl mx-auto">
            <div className="flex items-center gap-2">
              <Phone className="w-6 h-6" />
              <span>(813) 679 49 05</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-6 h-6" />
              <span>14907 Coldwater Ln, Tampa, FL 33624</span>
            </div>
          </div>
          <button className="mt-8 bg-white text-green-600 px-8 py-3 rounded-lg font-semibold hover:bg-green-50 transition-colors">
            Contact Us Today
          </button>
        </div>
      </section>
    </>
  );
}
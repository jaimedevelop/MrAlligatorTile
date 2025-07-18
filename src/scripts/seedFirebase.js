// scripts/seedFirebase.js
// Run this script to populate your Firebase database with initial project data
const { setDocument } = require('../src/utils/firebase/database');

// Sample project data
const projects = [
  {
    id: "commercial-kitchen",
    title: "Commercial Kitchen Renovation",
    category: "Commercial",
    type: "Renovation",
    description: "Complete plumbing system overhaul for a busy restaurant kitchen, including grease trap installation and water filtration systems.",
    details: "Full replacement of outdated plumbing infrastructure with modern, code-compliant systems.",
    image: "/images/projects/commercial-kitchen.jpg",
    imageUrl: "https://images.unsplash.com/photo-1590502593389-3949e183d279?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    completionDate: "January 2025",
    tableOnly: false,
    highlights: [
      "24-hour completion",
      "Minimal business disruption",
      "Health code compliant"
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1590502593389-3949e183d279?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Main kitchen area after renovation"
      },
      {
        url: "https://images.unsplash.com/photo-1583608205776-bfd35f0d9f83?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "New industrial sink installation"
      },
      {
        url: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Updated plumbing system"
      },
      {
        url: "https://images.unsplash.com/photo-1631679706909-1844bbd07221?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Grease trap installation"
      },
      {
        url: "https://images.unsplash.com/photo-1585351923007-bf6a01cb19de?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Water filtration system"
      }
    ],
    projectDetails: {
      challenge: "The restaurant needed a complete plumbing overhaul while minimizing downtime. The existing system was outdated and not meeting health code requirements.",
      solution: "We implemented a phased renovation approach, working during off-hours. New grease traps, water filtration systems, and commercial-grade fixtures were installed.",
      outcome: "The restaurant now has a fully compliant, efficient plumbing system. Water usage reduced by 30%, and maintenance costs decreased significantly."
    },
    specifications: {
      duration: "24 hours",
      location: "Downtown Restaurant District",
      services: [
        "Grease trap installation",
        "Water filtration system",
        "Pipe replacement",
        "Fixture upgrades"
      ],
      materials: [
        "Commercial-grade stainless steel fixtures",
        "PEX piping",
        "Industrial grease trap",
        "Multi-stage water filtration system"
      ]
    }
  },
  {
    id: "residential-bathroom",
    title: "Luxury Bathroom Remodel",
    category: "Residential",
    type: "Remodel",
    description: "Complete bathroom renovation with high-end fixtures, rainfall shower, and heated flooring.",
    details: "Transformed outdated bathroom into a modern spa-like retreat with energy-efficient plumbing.",
    image: "/images/projects/bathroom-remodel.jpg",
    imageUrl: "https://images.unsplash.com/photo-1584622781867-1239d536acb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    completionDate: "March 2025",
    tableOnly: false,
    highlights: [
      "Completed in 7 days",
      "Water-saving fixtures",
      "Heated floor installation"
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1584622781867-1239d536acb9?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Completed bathroom with custom shower"
      },
      {
        url: "https://images.unsplash.com/photo-1586798271654-0471ea22eb1a?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Custom vanity installation"
      },
      {
        url: "https://images.unsplash.com/photo-1630394800085-7bfe533e6974?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Heated flooring system"
      }
    ],
    projectDetails: {
      challenge: "The homeowners wanted a luxurious bathroom upgrade within a tight timeline and with minimal disruption to their daily lives.",
      solution: "We pre-ordered all materials and created a detailed project plan. Our team worked efficiently to complete demolition, plumbing, and installation in phases.",
      outcome: "The bathroom was transformed into a spa-like retreat with modern fixtures and energy-efficient systems, completed on time and within budget."
    },
    specifications: {
      duration: "7 days",
      location: "Suburban Residential Area",
      services: [
        "Fixture installation",
        "Shower renovation",
        "Heated floor installation",
        "Plumbing reconfiguration"
      ],
      materials: [
        "Low-flow toilet and faucets",
        "Rainfall showerhead",
        "PEX tubing",
        "Electric radiant floor heating"
      ]
    }
  },
  {
    id: "emergency-leak",
    title: "Emergency Water Main Repair",
    category: "Emergency",
    type: "Repair",
    description: "Rapid response to a ruptured water main in a commercial office building, preventing extensive water damage.",
    details: "Located and repaired burst pipe within 2 hours of initial call, minimizing business disruption.",
    image: "/images/projects/emergency-repair.jpg",
    imageUrl: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
    completionDate: "February 2025",
    tableOnly: false,
    highlights: [
      "30-minute response time",
      "2-hour completion",
      "Minimal water damage"
    ],
    gallery: [
      {
        url: "https://images.unsplash.com/photo-1545259741-2ea3ebf61fa3?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Water main damage assessment"
      },
      {
        url: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Emergency repair in progress"
      },
      {
        url: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80",
        caption: "Completed repair with new piping"
      }
    ],
    projectDetails: {
      challenge: "A ruptured water main was causing significant flooding in a busy office building during work hours, threatening expensive equipment and business operations.",
      solution: "Our emergency team arrived within 30 minutes, quickly located the burst pipe, shut off the water supply, and implemented immediate repairs with minimal disruption.",
      outcome: "Water damage was limited to a small area, and the building was able to resume normal operations by the next business day, saving thousands in potential damages."
    },
    specifications: {
      duration: "2 hours",
      location: "Downtown Office Building",
      services: [
        "Emergency response",
        "Water main repair",
        "Water extraction",
        "Pressure testing"
      ],
      materials: [
        "Schedule 40 PVC pipe",
        "Copper fittings",
        "CPVC couplings",
        "Commercial-grade sealant"
      ]
    }
  }
];

// Seed function
async function seedProjects() {
  try {
    console.log('Starting projects database seeding...');
    
    for (const project of projects) {
      const { id, ...projectData } = project;
      const result = await setDocument('projects', id, projectData);
      
      if (result.success) {
        console.log(`Added project: ${project.title}`);
      } else {
        console.error(`Error adding project ${project.title}:`, result.error);
      }
    }
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

// Run the seed function
seedProjects();
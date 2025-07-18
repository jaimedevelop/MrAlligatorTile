// scripts/populateProjects.ts
import { setDocument } from '../src/utils/firebase/database'; // Adjust path if database file has .js extension
import { Project, GalleryPhoto, ProjectDetails, ProjectSpecifications } from '../src/types/types';
import { v4 as uuidv4 } from 'uuid';

const placeholderImageUrl = (width = 300, height = 200) => `https://via.placeholder.com/${width}x${height}.png?text=Sample+Image`;

const createSampleProject = (category: 'Commercial' | 'Residential' | 'Emergency', titleSuffix: string): Project => {
  const id = uuidv4();
  const baseTitle = `${category} Project ${titleSuffix}`;

  const specifications: ProjectSpecifications = {
    duration: `${Math.floor(Math.random() * 4) + 1} Weeks`,
    location: `Sample Location, ${category} Area`,
    services: ['Service A', 'Service B', 'Service C'].slice(0, Math.floor(Math.random() * 3) + 1),
    materials: ['Material X', 'Material Y', 'Material Z'].slice(0, Math.floor(Math.random() * 3) + 1),
  };

  const projectDetails: ProjectDetails = {
    challenge: `The main challenge for the ${baseTitle} was integrating modern features while preserving the original character.`,
    solution: `Our team implemented a phased approach, starting with structural reinforcements followed by careful installation of new systems for the ${baseTitle}.`,
    outcome: `The ${baseTitle} resulted in a fully functional and aesthetically pleasing space, exceeding client expectations.`,
  };

  const gallery: GalleryPhoto[] = [
    { url: placeholderImageUrl(800, 600), caption: `${baseTitle} - View 1` },
    { url: placeholderImageUrl(800, 600), caption: `${baseTitle} - Detail A` },
    { url: placeholderImageUrl(800, 600), caption: `${baseTitle} - Detail B` },
  ];

  return {
    id,
    title: baseTitle,
    description: `This is a sample description for the ${baseTitle}. It involved extensive work and coordination.`,
    category,
    image: placeholderImageUrl(400, 300),
    imageUrl: placeholderImageUrl(400, 300),
    completionDate: `${['January', 'February', 'March', 'April', 'May', 'June'][Math.floor(Math.random() * 6)]} 202${Math.floor(Math.random() * 3) + 2}`, // e.g., March 2024
    highlights: [
      `Highlight 1 for ${baseTitle}`,
      `Highlight 2 for ${baseTitle}`,
      `Highlight 3 for ${baseTitle}`,
    ],
    type: `${category} Renovation`, // Example type
    details: `More detailed information about the ${baseTitle}. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.`,
    tableOnly: false,
    specifications,
    projectDetails,
    gallery,
  };
};

const sampleProjects: Project[] = [
  createSampleProject('Commercial', 'Alpha'),
  createSampleProject('Residential', 'Beta'),
  createSampleProject('Emergency', 'Gamma'), // Using 'Emergency' as per type definition
];

async function populateFirestore() {
  console.log('Starting Firestore population...');
  try {
    for (const project of sampleProjects) {
      console.log(`Adding project: ${project.title} (ID: ${project.id})`);
      // Assuming setDocument is exported from the correct path and handles Firestore initialization
      // Add type assertion for the result from the JS module, using unknown instead of any
      const result = await setDocument('projects', project.id, project) as { success: boolean; error?: unknown };
      if (!result.success) {
        console.error(`Failed to add project ${project.id}:`, result.error);
      } else {
        console.log(`Successfully added project ${project.id}`);
      }
    }
    console.log('Firestore population completed.');
  } catch (error) {
    console.error('Error populating Firestore:', error);
    process.exit(1); // Exit with error code
  }
}

// Execute the function
populateFirestore();
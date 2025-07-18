import React, { useState } from 'react';
import { format } from 'date-fns';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Search, 
  Loader2, 
  X,
  Save,
  Image as ImageIcon,
  Plus as PlusIcon
} from 'lucide-react';
import { Project, ProjectFormData, GalleryFormItem } from '../../types/types';
import { useProjects } from '../../hooks/useProjects';
// @ts-expect-error - Suppress missing declaration file error (ideally add .d.ts or convert)
import { setDocument, deleteDocument } from '../../utils/firebase/database';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../utils/firebase/storage';
import { v4 as uuidv4 } from 'uuid';

const defaultProject: ProjectFormData = {
  title: '',
  category: 'Commercial',
  description: '',
  image: '',
  imageUrl: '',
  completionDate: '', 
  highlights: [],
  type: '',
  details: '',
  tableOnly: false,
  specifications: {
    duration: '',
    location: '',
    services: [],
    materials: []
  },
  projectDetails: {
    challenge: '',
    solution: '',
    outcome: ''
  },
  gallery: []
};

// Helper to safely convert Firestore Timestamps or strings/numbers to Date
const safeToDate = (value: unknown): Date | undefined => {
  if (!value) return undefined;
  if (typeof value === 'object' && value !== null && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
      return (value as { toDate: () => Date }).toDate();
  }
  try {
    if (typeof value !== 'object') {
        const date = new Date(value as string | number);
        if (!isNaN(date.getTime())) return date; 
    }
  } catch { /* ignore */ }
  return undefined; 
};

export default function ProjectsManagementPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentProject, setCurrentProject] = useState<ProjectFormData>(defaultProject);
  const [imagePreview, setImagePreview] = useState<string>('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'basic' | 'details' | 'gallery'>('basic');
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: projects = [], isLoading } = useProjects();

  const filteredProjects = projects.filter(project =>
    (project?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
    (project?.category?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false)
  );

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCurrentProject((prev: ProjectFormData) => ({ ...prev, newImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!currentProject.title) errors.title = 'Title is required';
    if (!currentProject.category) errors.category = 'Category is required';
    if (!currentProject.completionDate) errors.completionDate = 'Completion date is required';
    if (!currentProject.specifications.duration) errors.duration = 'Duration is required';
    if (!currentProject.specifications.location) errors.location = 'Location is required';
    if (!currentProject.projectDetails.challenge) errors.challenge = 'Challenge is required';
    if (!currentProject.projectDetails.solution) errors.solution = 'Solution is required';
    if (!currentProject.projectDetails.outcome) errors.outcome = 'Outcome is required';

    if (!currentProject.tableOnly) {
      if (!currentProject.description) errors.description = 'Description is required';
      if (!currentProject.type) errors.type = 'Type is required';
      if (!currentProject.image && !currentProject.newImage) errors.image = 'Image is required';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Upload a single image to Firebase Storage
  const uploadImage = async (file: File, path: string): Promise<string> => {
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    return getDownloadURL(storageRef);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      setIsProcessing(true);
      
      const projectData = { ...currentProject };
      const projectId = currentProject.id || uuidv4();
      
      if (projectData.newImage) {
        const mainImagePath = `projects/${projectId}/main-image`;
        const imageUrl = await uploadImage(projectData.newImage, mainImagePath);
        projectData.image = imageUrl;
        projectData.imageUrl = imageUrl;
        delete projectData.newImage;
      }
      
      // Process gallery images
      if (projectData.gallery && projectData.gallery.length > 0) {
        const updatedGallery = await Promise.all(
          projectData.gallery.map(async (item: GalleryFormItem, index: number) => {
            if (item.file) {
              const galleryImagePath = `projects/${projectId}/gallery-${index}`;
              const url = await uploadImage(item.file, galleryImagePath);
              return { url, caption: item.caption }; 
            }
            return { url: item.url || '', caption: item.caption || '' }; 
          })
        );
        projectData.gallery = updatedGallery.filter(item => item.url) as { url: string; caption: string; }[]; 
      }
      
      delete projectData.newImage;
      projectData.gallery = projectData.gallery?.map((item: { url?: string; caption: string; }) => ({ 
        url: item.url || '',
        caption: item.caption || ''
      }));
      
      const dataToSave = {
          ...projectData,
          id: projectId,
          completionDate: projectData.completionDate 
      };

      await setDocument('projects', projectId, dataToSave);
      
      setIsModalOpen(false);
      setCurrentProject(defaultProject);
      setImagePreview('');
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (project: Project) => {
    // Handle both string dates and Firestore Timestamp objects
    let completionDateString = '';
    
    if (typeof project.completionDate === 'string') {
      // If it's already a string, use it as-is
      completionDateString = project.completionDate;
    } else if (project.completionDate && typeof project.completionDate === 'object') {
      // If it's a Firestore Timestamp, convert it but keep the original format
      const date = safeToDate(project.completionDate);
      if (date) {
        // Use en-US format to get MM/DD/YYYY
        completionDateString = date.toLocaleDateString('en-US');
      }
    }

    setCurrentProject({
      ...project,
      completionDate: completionDateString,
      specifications: {
        ...project.specifications,
        services: project.specifications?.services || [],
        materials: project.specifications?.materials || [],
      },
      projectDetails: project.projectDetails || {
        challenge: '',
        solution: '',
        outcome: ''
      },
      gallery: project.gallery?.map(photo => ({ ...photo })) || [] 
    });
    setImagePreview(project.image);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        setIsProcessing(true);
        await deleteDocument('projects', id);
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      } finally {
        setIsProcessing(false);
      }
    }
  };

  const addListItem = (field: 'highlights' | 'services' | 'materials' | 'gallery') => {
    setCurrentProject((prev: ProjectFormData) => {
      if (field === 'highlights') {
        return { ...prev, highlights: [...prev.highlights, ''] };
      } else if (field === 'gallery') {
        return { ...prev, gallery: [...(prev.gallery ?? []), { url: '', caption: '' }] };
      } else {
        const currentSpecs = prev.specifications || { duration: '', location: '', services: [], materials: [] };
        return {
          ...prev,
          specifications: {
            ...currentSpecs,
            [field]: [...currentSpecs[field], '']
          }
        };
      }
    });
  };

  const removeListItem = (field: 'highlights' | 'services' | 'materials' | 'gallery', index: number) => {
    setCurrentProject((prev: ProjectFormData) => {
      if (field === 'highlights') {
        const newHighlights = [...prev.highlights];
        newHighlights.splice(index, 1);
        return { ...prev, highlights: newHighlights };
      } else if (field === 'gallery') {
        const newGallery = [...(prev.gallery ?? [])];
        newGallery.splice(index, 1);
        return { ...prev, gallery: newGallery };
      } else {
        const currentSpecs = prev.specifications || { duration: '', location: '', services: [], materials: [] };
        const newItems = [...currentSpecs[field]];
        newItems.splice(index, 1);
        return {
          ...prev,
          specifications: {
            ...currentSpecs,
            [field]: newItems
          }
        };
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects Management</h1>
        <button
          onClick={() => {
            setCurrentProject(defaultProject);
            setImagePreview('');
            setIsModalOpen(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800"
        >
          <Plus className="w-4 h-4" />
          Add New Project
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Image</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Display</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProjects.map((project: Project) => ( 
                <tr key={project.id} className="border-t border-gray-200 hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <img
                      src={project.image}
                      alt={project.title}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </td>
                  <td className="px-6 py-4">{project.title}</td>
                  <td className="px-6 py-4">{project.category}</td>
                  <td className="px-6 py-4">{project.type}</td>
                  <td className="px-6 py-4">
                    {typeof project.completionDate === 'string' 
                      ? project.completionDate 
                      : (safeToDate(project.completionDate) 
                          ? format(safeToDate(project.completionDate) as Date, 'PP') 
                          : 'Invalid Date')}
                  </td>
                  <td className="px-6 py-4">
                    {project.tableOnly ? 'Table Only' : 'Cards & Table'}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(project)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(project.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredProjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                    No projects found. Create a new project to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Project Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold">
                  {currentProject.id ? 'Edit Project' : 'Add New Project'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="mb-6">
                <div className="flex space-x-4">
                  <button
                    onClick={() => setActiveTab('basic')}
                    className={`px-4 py-2 rounded-t-lg ${
                      activeTab === 'basic' ? 'bg-blue-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Basic Info
                  </button>
                  <button
                    onClick={() => setActiveTab('details')}
                    className={`px-4 py-2 rounded-t-lg ${
                      activeTab === 'details' ? 'bg-blue-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Project Details
                  </button>
                  <button
                    onClick={() => setActiveTab('gallery')}
                    className={`px-4 py-2 rounded-t-lg ${
                      activeTab === 'gallery' ? 'bg-blue-900 text-white' : 'bg-gray-100'
                    }`}
                  >
                    Gallery
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    <div>
                      <label htmlFor="tableOnly" className="flex items-center gap-2 mb-6">
                        <input
                          id="tableOnly"
                          name="tableOnly"
                          type="checkbox"
                          checked={currentProject.tableOnly}
                          onChange={(e) => setCurrentProject({
                            ...currentProject,
                            tableOnly: e.target.checked
                          })}
                          className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-sm font-medium text-gray-700">
                          Table only (hide from cards view)
                        </span>
                      </label>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                          Title *
                        </label>
                        <input
                          id="title"
                          name="title"
                          type="text"
                          value={currentProject.title}
                          onChange={(e) => setCurrentProject({ ...currentProject, title: e.target.value })}
                          className={`w-full p-2 border rounded ${
                            formErrors.title ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.title && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.title}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-2">
                          Category *
                        </label>
                        <select
                          id="category"
                          name="category"
                          value={currentProject.category}
                          onChange={(e) => setCurrentProject({
                            ...currentProject,
                            category: e.target.value as Project['category']
                          })}
                          className="w-full p-2 border border-gray-300 rounded"
                        >
                          <option value="Commercial">Commercial</option>
                          <option value="Residential">Residential</option>
                          <option value="Emergency">Emergency</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                      </label>
                      <textarea
                        id="description"
                        name="description"
                        value={currentProject.description}
                        onChange={(e) => setCurrentProject({ ...currentProject, description: e.target.value })}
                        rows={3}
                        className={`w-full p-2 border rounded ${
                          formErrors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                      />
                      {formErrors.description && (
                        <p className="mt-1 text-sm text-red-500">{formErrors.description}</p>
                      )}
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-2">
                          Type *
                        </label>
                        <input
                          id="type"
                          name="type"
                          type="text"
                          value={currentProject.type}
                          onChange={(e) => setCurrentProject({ ...currentProject, type: e.target.value })}
                          className={`w-full p-2 border rounded ${
                            formErrors.type ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {formErrors.type && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.type}</p>
                        )}
                      </div>

                      <div>
                        <label htmlFor="completionDate" className="block text-sm font-medium text-gray-700 mb-2">
                          Completion Date *
                        </label>
                        <input
                          id="completionDate"
                          name="completionDate"
                          type="text"
                          value={currentProject.completionDate}
                          onChange={(e) => setCurrentProject({ ...currentProject, completionDate: e.target.value })}
                          className={`w-full p-2 border rounded ${
                            formErrors.completionDate ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="e.g., 06/22/2025"
                        />
                        {formErrors.completionDate && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.completionDate}</p>
                        )}
                      </div>
                    </div>

                    <div>
                      <label htmlFor="projectImage" className="block text-sm font-medium text-gray-700 mb-2">
                        Project Image *
                      </label>
                      <div className="mt-2 flex items-center gap-4">
                        {imagePreview ? (
                          <div className="relative">
                            <img
                              src={imagePreview}
                              alt="Preview"
                              className="w-32 h-32 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setImagePreview('');
                                setCurrentProject({ ...currentProject, image: '', newImage: undefined });
                              }}
                              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="relative">
                            <input
                              id="projectImage"
                              name="projectImage"
                              type="file"
                              accept="image/*"
                              onChange={handleImageChange}
                              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500">
                              <ImageIcon className="w-8 h-8 mb-2" />
                              <span className="text-sm">Upload Image</span>
                            </div>
                          </div>
                        )}
                        {formErrors.image && (
                          <p className="mt-1 text-sm text-red-500">{formErrors.image}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'details' && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-4">Project Details</h3>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="duration" className="block text-sm font-medium text-gray-700 mb-2">
                            Duration *
                          </label>
                          <input
                            id="duration"
                            name="duration"
                            type="text"
                            value={currentProject.specifications.duration}
                            onChange={(e) => setCurrentProject({
                              ...currentProject,
                              specifications: {
                                ...currentProject.specifications,
                                duration: e.target.value
                              }
                            })}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="e.g., 24 hours"
                          />
                        </div>
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                            Location *
                          </label>
                          <input
                            id="location"
                            name="location"
                            type="text"
                            value={currentProject.specifications.location}
                            onChange={(e) => setCurrentProject({
                              ...currentProject,
                              specifications: {
                                ...currentProject.specifications,
                                location: e.target.value
                              }
                            })}
                            className="w-full p-2 border border-gray-300 rounded"
                            placeholder="e.g., Downtown Restaurant District"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label htmlFor="challenge" className="block text-sm font-medium text-gray-700 mb-2">
                          Challenge *
                        </label>
                        <textarea
                          id="challenge"
                          name="challenge"
                          value={currentProject.projectDetails.challenge}
                          onChange={(e) => setCurrentProject({
                            ...currentProject,
                            projectDetails: {
                              ...currentProject.projectDetails,
                              challenge: e.target.value
                            }
                          })}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="solution" className="block text-sm font-medium text-gray-700 mb-2">
                          Solution *
                        </label>
                        <textarea
                          id="solution"
                          name="solution"
                          value={currentProject.projectDetails.solution}
                          onChange={(e) => setCurrentProject({
                            ...currentProject,
                            projectDetails: {
                              ...currentProject.projectDetails,
                              solution: e.target.value
                            }
                          })}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                      <div>
                        <label htmlFor="outcome" className="block text-sm font-medium text-gray-700 mb-2">
                          Outcome *
                        </label>
                        <textarea
                          id="outcome"
                          name="outcome"
                          value={currentProject.projectDetails.outcome}
                          onChange={(e) => setCurrentProject({
                            ...currentProject,
                            projectDetails: {
                              ...currentProject.projectDetails,
                              outcome: e.target.value
                            }
                          })}
                          rows={3}
                          className="w-full p-2 border border-gray-300 rounded"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Services Provided
                      </label>
                      <div className="space-y-2">
                        {currentProject.specifications.services.map((service: string, index: number) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              id={`service-${index}`}
                              name={`service-${index}`}
                              type="text"
                              value={service}
                              onChange={(e) => {
                                const newServices = [...currentProject.specifications.services];
                                newServices[index] = e.target.value;
                                setCurrentProject({
                                  ...currentProject,
                                  specifications: {
                                    ...currentProject.specifications,
                                    services: newServices
                                  }
                                });
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeListItem('services', index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addListItem('services')}
                          className="text-blue-900 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Add Service
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Materials Used
                      </label>
                      <div className="space-y-2">
                        {currentProject.specifications.materials.map((material: string, index: number) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              id={`material-${index}`}
                              name={`material-${index}`}
                              type="text"
                              value={material}
                              onChange={(e) => {
                                const newMaterials = [...currentProject.specifications.materials];
                                newMaterials[index] = e.target.value;
                                setCurrentProject({
                                  ...currentProject,
                                  specifications: {
                                    ...currentProject.specifications,
                                    materials: newMaterials
                                  }
                                });
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeListItem('materials', index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addListItem('materials')}
                          className="text-blue-900 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Add Material
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Project Highlights
                      </label>
                      <div className="space-y-2">
                        {currentProject.highlights.map((highlight: string, index: number) => (
                          <div key={index} className="flex gap-2 items-center">
                            <input
                              id={`highlight-${index}`}
                              name={`highlight-${index}`}
                              type="text"
                              value={highlight}
                              onChange={(e) => {
                                const newHighlights = [...currentProject.highlights];
                                newHighlights[index] = e.target.value;
                                setCurrentProject({
                                  ...currentProject,
                                  highlights: newHighlights
                                });
                              }}
                              className="flex-1 p-2 border border-gray-300 rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeListItem('highlights', index)}
                              className="p-2 text-red-600 hover:text-red-800"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => addListItem('highlights')}
                          className="text-blue-900 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <PlusIcon className="w-4 h-4" />
                          Add Highlight
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'gallery' && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium mb-4">Project Gallery</h3>
                    <div className="space-y-4">
                      {(currentProject.gallery ?? []).map((item: GalleryFormItem, index: number) => (
                        <div key={index} className="grid grid-cols-2 gap-4 border p-4 rounded-lg">
                          <div>
                            <label htmlFor={`galleryImage-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                              Image
                            </label>
                            <div className="flex items-center gap-4">
                              {item.url || item.previewUrl ? (
                                <div className="relative">
                                  <img 
                                    src={item.previewUrl || item.url} 
                                    alt={item.caption}
                                    className="w-24 h-24 object-cover rounded"
                                  />
                                  <button
                                    type="button"
                                    onClick={() => {
                                      const newGallery = [...(currentProject.gallery ?? [])];
                                      newGallery[index] = { ...item, url: '', file: undefined, previewUrl: undefined };
                                      setCurrentProject({
                                        ...currentProject,
                                        gallery: newGallery
                                      });
                                    }}
                                    className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                              ) : (
                                <div className="relative">
                                  <input
                                    id={`galleryImage-${index}`}
                                    name={`galleryImage-${index}`}
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) {
                                        const reader = new FileReader();
                                        reader.onloadend = () => {
                                          const newGallery = [...(currentProject.gallery ?? [])];
                                          newGallery[index] = {
                                            ...item,
                                            url: '',
                                            file,
                                            previewUrl: reader.result as string
                                          };
                                          setCurrentProject({
                                            ...currentProject,
                                            gallery: newGallery
                                          });
                                        };
                                        reader.readAsDataURL(file);
                                      }
                                    }}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                  />
                                  <div className="w-24 h-24 border-2 border-dashed border-gray-300 rounded flex flex-col items-center justify-center text-gray-400 hover:border-blue-500 hover:text-blue-500">
                                    <ImageIcon className="w-6 h-6 mb-1" />
                                    <span className="text-xs">Upload</span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <label htmlFor={`galleryCaption-${index}`} className="block text-sm font-medium text-gray-700 mb-2">
                              Caption
                            </label>
                            <div className="flex gap-2">
                              <input
                                id={`galleryCaption-${index}`}
                                name={`galleryCaption-${index}`}
                                type="text"
                                value={item.caption || ''}
                                onChange={(e) => {
                                  const newGallery = [...(currentProject.gallery ?? [])];
                                  newGallery[index] = { ...item, caption: e.target.value };
                                  setCurrentProject({
                                    ...currentProject,
                                    gallery: newGallery
                                  });
                                }}
                                className="flex-1 p-2 border border-gray-300 rounded"
                                placeholder="Enter image caption"
                              />
                              <button
                                type="button"
                                onClick={() => removeListItem('gallery', index)}
                                className="p-2 text-red-600 hover:text-red-800"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addListItem('gallery')}
                        className="text-blue-900 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                      >
                        <PlusIcon className="w-4 h-4" />
                        Add Gallery Image
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-4 pt-4 border-t">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {isProcessing ? 'Saving...' : 'Save Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
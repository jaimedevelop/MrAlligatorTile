import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, Globe, Settings, Loader2, Link, ArrowRight, Notebook as Robot, Code, Share2, AlertTriangle } from 'lucide-react';
import { PageContent, RobotsMeta } from '../../types/types';
import { usePage, useSavePage } from '../../services/pagesService';
import { ErrorBoundary } from 'react-error-boundary';

type Tab = 'content' | 'seo' | 'social' | 'advanced';

const defaultRobots: RobotsMeta = {
  noindex: false,
  nofollow: false,
  noarchive: false,
  nosnippet: false,
  noimageindex: false,
  notranslate: false,
};

const defaultSeo = {
  title: '',
  description: '',
  keywords: [],
  canonicalUrl: '',
  redirectUrl: '',
  robots: defaultRobots,
  schema: '',
  social: {
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary' as const,
    twitterTitle: '',
    twitterDescription: '',
    twitterImage: '',
  },
};

const emptyPage: PageContent = {
  id: '',
  title: '',
  content: '',
  slug: '',
  seo: defaultSeo,
};

// Helper function to generate URL-friendly slugs
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

function ErrorFallback({ error, resetErrorBoundary }: { error: Error; resetErrorBoundary: () => void }) {
  return (
    <div className="p-6 bg-red-50 rounded-lg">
      <div className="flex items-center gap-2 text-red-600 mb-4">
        <AlertTriangle className="w-6 h-6" />
        <h3 className="text-lg font-semibold">Something went wrong</h3>
      </div>
      <pre className="text-sm bg-white p-4 rounded border border-red-200 mb-4">
        {error.message}
      </pre>
      <button
        onClick={resetErrorBoundary}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Try again
      </button>
    </div>
  );
}

function PageEditorContent() {
  const { id = 'new' } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('content');
  const [page, setPage] = useState<PageContent>(emptyPage);
  const [slug, setSlug] = useState('');
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);
  const [schemaError, setSchemaError] = useState<string>('');
  const [saveError, setSaveError] = useState<string>('');
  
  const { data: pageData, isLoading: isLoadingPage, error: pageError } = usePage(id !== 'new' ? id : '');
  const { mutate: savePage, isPending: isSaving } = useSavePage();

  useEffect(() => {
    if (id === 'new') {
      console.log('Creating new page with empty template');
      const newPage = {
        ...emptyPage,
        id: crypto.randomUUID(),
        seo: { ...defaultSeo }
      };
      console.log('New page template:', newPage);
      setPage(newPage);
      setSlug('');
      setSlugManuallyEdited(false);
    } else if (pageData) {
      console.log('Loading existing page:', pageData);
      // Ensure all SEO fields exist with defaults
      const loadedPage = {
        ...pageData,
        seo: {
          ...defaultSeo,
          ...pageData.seo,
          robots: {
            ...defaultRobots,
            ...pageData.seo.robots
          },
          social: {
            ...defaultSeo.social,
            ...pageData.seo.social
          }
        }
      };
      console.log('Processed page data:', loadedPage);
      setPage(loadedPage);
      setSlug(loadedPage.slug || '');
      setSlugManuallyEdited(true); // Don't auto-update slug for existing pages
    }
  }, [id, pageData]);

  const handleTitleChange = (e) => {
    const newTitle = e.target.value;
    setPage({ ...page, title: newTitle });
    
    // Auto-generate slug from title only if it hasn't been manually edited
    if (!slugManuallyEdited || slug === generateSlug(page.title)) {
      const newSlug = generateSlug(newTitle);
      setSlug(newSlug);
    }
  };

  const handleSlugChange = (e) => {
    const newSlug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(newSlug);
    setSlugManuallyEdited(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError('');
    
    // Validate required fields
    if (!page.title.trim()) {
      setSaveError('Page title is required');
      return;
    }

    if (!slug.trim()) {
      setSaveError('Page URL slug is required');
      return;
    }
    
    try {
      // Ensure all required fields are present
      const pageToSave = {
        ...page,
        slug: slug.trim(),
        seo: {
          ...defaultSeo,
          ...page.seo,
          robots: {
            ...defaultRobots,
            ...page.seo.robots
          },
          social: {
            ...defaultSeo.social,
            ...page.seo.social
          }
        }
      };

      // Validate schema JSON if present
      if (pageToSave.seo.schema) {
        try {
          JSON.parse(pageToSave.seo.schema);
          setSchemaError('');
        } catch (error) {
          setSchemaError('Invalid JSON schema format');
          return;
        }
      }

      console.log('Saving page:', pageToSave);
      
      savePage(pageToSave, {
        onSuccess: (savedId) => {
          console.log('Page saved successfully:', savedId);
          navigate('/admin/pages');
        },
        onError: (error) => {
          console.error('Failed to save page:', error);
          setSaveError('Failed to save page. Please try again.');
        },
      });
    } catch (error) {
      console.error('Error during save:', error);
      setSaveError('An unexpected error occurred. Please try again.');
    }
  };

  const handleRobotsChange = (key: keyof RobotsMeta) => {
    setPage({
      ...page,
      seo: {
        ...page.seo,
        robots: {
          ...page.seo.robots,
          [key]: !page.seo.robots[key],
        },
      },
    });
  };

  if (pageError) {
    throw pageError;
  }

  if (isLoadingPage && id !== 'new') {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-900" />
      </div>
    );
  }

  const tabs = [
    { id: 'content' as Tab, label: 'Content', icon: Globe },
    { id: 'seo' as Tab, label: 'SEO', icon: Link },
    { id: 'social' as Tab, label: 'Social', icon: Share2 },
    { id: 'advanced' as Tab, label: 'Advanced', icon: Settings },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          {id === 'new' ? 'Create New Page' : 'Edit Page'}
        </h1>
        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="flex items-center gap-2 px-4 py-2 bg-blue-900 text-white rounded hover:bg-blue-800 disabled:opacity-50"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Saving...' : 'Save Page'}
        </button>
      </div>

      {saveError && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600">
          {saveError}
        </div>
      )}

      <div className="bg-white rounded-lg shadow">
        <div className="border-b">
          <nav className="flex">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3 text-sm font-medium border-b-2 ${
                  activeTab === tab.id
                    ? 'border-blue-900 text-blue-900'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {activeTab === 'content' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  Page Title
                </label>
                <input
                  type="text"
                  id="title"
                  value={page.title}
                  onChange={handleTitleChange}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter page title..."
                />
              </div>

              <div>
                <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-2">
                  Page URL Slug
                </label>
                <div className="flex items-center">
                  <span className="text-gray-500 text-sm mr-2 whitespace-nowrap">
                    https://mralligatorrenovations.com/pages/
                  </span>
                  <input
                    type="text"
                    id="slug"
                    value={slug}
                    onChange={handleSlugChange}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="page-url-slug"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  This will be the URL where your page is accessible. Only lowercase letters, numbers, and hyphens allowed.
                </p>
                {slug && (
                  <p className="mt-1 text-sm text-blue-600">
                    Preview: <span className="font-medium">https://mralligatorrenovations.com/pages/{slug}</span>
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                  Content (HTML)
                </label>
                <textarea
                  id="content"
                  rows={12}
                  value={page.content}
                  onChange={(e) => setPage({ ...page, content: e.target.value })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  placeholder="Enter your HTML content here..."
                />
                <p className="mt-1 text-sm text-gray-500">
                  You can write HTML here. It will be rendered exactly as you type it on the live page.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'seo' && (
            <div className="space-y-6">
              <div>
                <label htmlFor="seoTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  SEO Title
                </label>
                <input
                  type="text"
                  id="seoTitle"
                  value={page.seo.title}
                  onChange={(e) => setPage({
                    ...page,
                    seo: { ...page.seo, title: e.target.value },
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 50-60 characters. Current: {page.seo.title.length}
                </p>
              </div>

              <div>
                <label htmlFor="seoDescription" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Description
                </label>
                <textarea
                  id="seoDescription"
                  rows={3}
                  value={page.seo.description}
                  onChange={(e) => setPage({
                    ...page,
                    seo: { ...page.seo, description: e.target.value },
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Recommended length: 150-160 characters. Current: {page.seo.description.length}
                </p>
              </div>

              <div>
                <label htmlFor="seoKeywords" className="block text-sm font-medium text-gray-700 mb-2">
                  Meta Keywords
                </label>
                <input
                  type="text"
                  id="seoKeywords"
                  value={page.seo.keywords.join(', ')}
                  onChange={(e) => setPage({
                    ...page,
                    seo: {
                      ...page.seo,
                      keywords: e.target.value.split(',').map((k) => k.trim()).filter(k => k),
                    },
                  })}
                  className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="mt-1 text-sm text-gray-500">
                  Separate keywords with commas
                </p>
              </div>

              <div>
                <label htmlFor="canonicalUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  Canonical URL
                </label>
                <div className="flex items-center gap-2">
                  <Link className="w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    id="canonicalUrl"
                    value={page.seo.canonicalUrl}
                    onChange={(e) => setPage({
                      ...page,
                      seo: { ...page.seo, canonicalUrl: e.target.value },
                    })}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/page"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Set this if this page is a duplicate of another page
                </p>
              </div>

              <div>
                <label htmlFor="redirectUrl" className="block text-sm font-medium text-gray-700 mb-2">
                  301 Redirect URL
                </label>
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-5 h-5 text-gray-400" />
                  <input
                    type="url"
                    id="redirectUrl"
                    value={page.seo.redirectUrl}
                    onChange={(e) => setPage({
                      ...page,
                      seo: { ...page.seo, redirectUrl: e.target.value },
                    })}
                    className="flex-1 p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/new-page"
                  />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  Redirect this page to another URL
                </p>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Share2 className="w-5 h-5" />
                  Open Graph (Facebook, LinkedIn)
                </h3>
                
                <div>
                  <label htmlFor="ogTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    OG Title
                  </label>
                  <input
                    type="text"
                    id="ogTitle"
                    value={page.seo.social.ogTitle}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: { ...page.seo.social, ogTitle: e.target.value },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="ogDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    OG Description
                  </label>
                  <textarea
                    id="ogDescription"
                    rows={3}
                    value={page.seo.social.ogDescription}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: { ...page.seo.social, ogDescription: e.target.value },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="ogImage" className="block text-sm font-medium text-gray-700 mb-2">
                    OG Image URL
                  </label>
                  <input
                    type="url"
                    id="ogImage"
                    value={page.seo.social.ogImage}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: { ...page.seo.social, ogImage: e.target.value },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  Twitter Card
                </h3>

                <div>
                  <label htmlFor="twitterCard" className="block text-sm font-medium text-gray-700 mb-2">
                    Card Type
                  </label>
                  <select
                    id="twitterCard"
                    value={page.seo.social.twitterCard}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: {
                          ...page.seo.social,
                          twitterCard: e.target.value as typeof page.seo.social.twitterCard,
                        },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="summary">Summary</option>
                    <option value="summary_large_image">Summary with Large Image</option>
                    <option value="app">App</option>
                    <option value="player">Player</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="twitterTitle" className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Title
                  </label>
                  <input
                    type="text"
                    id="twitterTitle"
                    value={page.seo.social.twitterTitle}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: { ...page.seo.social, twitterTitle: e.target.value },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="twitterDescription" className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Description
                  </label>
                  <textarea
                    id="twitterDescription"
                    rows={3}
                    value={page.seo.social.twitterDescription}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: { ...page.seo.social, twitterDescription: e.target.value },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label htmlFor="twitterImage" className="block text-sm font-medium text-gray-700 mb-2">
                    Twitter Image URL
                  </label>
                  <input
                    type="url"
                    id="twitterImage"
                    value={page.seo.social.twitterImage}
                    onChange={(e) => setPage({
                      ...page,
                      seo: {
                        ...page.seo,
                        social: { ...page.seo.social, twitterImage: e.target.value },
                      },
                    })}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'advanced' && (
            <div className="space-y-8">
              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Robot className="w-5 h-5" />
                  Robots Meta Tags
                </h3>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {Object.entries(page.seo.robots).map(([key, value]) => (
                    <div key={key} className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        id={key}
                        checked={value}
                        onChange={() => handleRobotsChange(key as keyof RobotsMeta)}
                        className="h-4 w-4 text-blue-900 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor={key} className="text-sm text-gray-700">
                        {key}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <h3 className="text-lg font-medium flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Schema Markup (JSON-LD)
                </h3>
                
                <div>
                  <textarea
                    value={page.seo.schema}
                    onChange={(e) => {
                      setPage({
                        ...page,
                        seo: { ...page.seo, schema: e.target.value },
                      });
                      setSchemaError('');
                    }}
                    rows={10}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                    placeholder={`{
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "name": "Mr. Alligator Renovations",
  "description": "Professional renovation services"
}`}
                  />
                  {schemaError && (
                    <p className="mt-2 text-sm text-red-600">{schemaError}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">SEO Tips</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start gap-2">
                    <span className="text-blue-900">•</span>
                    Use schema markup to help search engines understand your content
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-900">•</span>
                    Set canonical URLs to prevent duplicate content issues
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-900">•</span>
                    Use robots meta tags carefully to control search engine behavior
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-blue-900">•</span>
                    Optimize social media previews for better engagement
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function PageEditor() {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        // Reset the error boundary state
        window.location.reload();
      }}
    >
      <PageEditorContent />
    </ErrorBoundary>
  );
}
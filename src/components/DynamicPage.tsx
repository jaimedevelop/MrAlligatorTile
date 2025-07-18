// src/components/DynamicPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { doc, getDoc } from 'firebase/firestore';
import { usePageBySlug } from '../services/pagesService';

export default function DynamicPage() {
  const { slug } = useParams();
  const { data: page, isLoading: loading, error } = usePageBySlug(slug);

  console.log('DynamicPage Debug:', { slug, page, loading, error });

  // Handle redirects
  useEffect(() => {
    if (page?.seo?.redirectUrl) {
      window.location.href = page.seo.redirectUrl;
    }
  }, [page]);

  if (loading) {
    console.log('DynamicPage: Showing loading state');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    console.log('DynamicPage: Showing error state');
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-8">Page not found</p>
          <a 
            href="/" 
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go Home
          </a>
        </div>
      </div>
    );
  }

  if (!page){
    console.log('DynamicPage: No page found, returning null');
    return null;
  }

  console.log('DynamicPage: Rendering page successfully', page);
  return (
    <>
      {/* SEO Head Tags */}
      <Helmet>
        {/* Basic SEO */}
        <title>{page.seo?.title || page.title}</title>
        <meta name="description" content={page.seo?.description || ''} />
        {page.seo?.keywords?.length > 0 && (
          <meta name="keywords" content={page.seo.keywords.join(', ')} />
        )}
        
        {/* Canonical URL */}
        {page.seo?.canonicalUrl && (
          <link rel="canonical" href={page.seo.canonicalUrl} />
        )}
        
        {/* Robots Meta */}
        {page.seo?.robots && (
          <meta 
            name="robots" 
            content={Object.entries(page.seo.robots)
              .filter(([_, value]) => value)
              .map(([key]) => key)
              .join(', ') || 'index, follow'} 
          />
        )}
        
        {/* Open Graph */}
        {page.seo?.social?.ogTitle && (
          <meta property="og:title" content={page.seo.social.ogTitle} />
        )}
        {page.seo?.social?.ogDescription && (
          <meta property="og:description" content={page.seo.social.ogDescription} />
        )}
        {page.seo?.social?.ogImage && (
          <meta property="og:image" content={page.seo.social.ogImage} />
        )}
        <meta property="og:type" content="website" />
        
        {/* Twitter Cards */}
        {page.seo?.social?.twitterCard && (
          <meta name="twitter:card" content={page.seo.social.twitterCard} />
        )}
        {page.seo?.social?.twitterTitle && (
          <meta name="twitter:title" content={page.seo.social.twitterTitle} />
        )}
        {page.seo?.social?.twitterDescription && (
          <meta name="twitter:description" content={page.seo.social.twitterDescription} />
        )}
        {page.seo?.social?.twitterImage && (
          <meta name="twitter:image" content={page.seo.social.twitterImage} />
        )}
        
        {/* Schema Markup */}
        {page.seo?.schema && (
          <script type="application/ld+json">
            {page.seo.schema}
          </script>
        )}
      </Helmet>

      {/* Page Content */}
      <div className="min-h-screen">
        {/* Page Header */}
        <header className="bg-gray-50 py-12">
          <div className="max-w-4xl mx-auto px-4">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {page.title}
            </h1>
          </div>
        </header>

        {/* Page Content */}
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: page.content }}
          />
        </main>
      </div>
    </>
  );
}
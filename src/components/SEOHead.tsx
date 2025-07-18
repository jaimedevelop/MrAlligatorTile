import React from 'react';
import { Helmet } from 'react-helmet-async';
import { SeoSettings } from '../types';

interface SEOHeadProps {
  seo: SeoSettings;
}

export function SEOHead({ seo }: SEOHeadProps) {
  return (
    <Helmet>
      <title>{seo.title} | Mr. Alligator Plumbing</title>
      <meta name="description" content={seo.description} />
      <meta name="keywords" content={seo.keywords.join(', ')} />
      <meta property="og:title" content={seo.title} />
      <meta property="og:description" content={seo.description} />
      <meta name="twitter:title" content={seo.title} />
      <meta name="twitter:description" content={seo.description} />
    </Helmet>
  );
}
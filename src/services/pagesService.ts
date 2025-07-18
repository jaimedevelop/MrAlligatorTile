// src/firebase/services/pagesService.js
import { query, where, getDocs, collection, doc, setDoc } from 'firebase/firestore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  setDocument, 
  getDocument, 
  getAllDocuments, 
  updateDocument, 
  deleteDocument,
  queryDocuments
} from '../utils/firebase/database';
import { db } from '../utils/firebase/database'; // Make sure this import path is correct
import { jwtAuth } from '../utils/jwtAuth';

// Collection name constant
const COLLECTION_NAME = 'pages';

// Logging utility
const logOperation = (operation, details) => {
  console.log(`[Pages Service ${operation}]`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

// Helper function to check JWT admin privileges before Firebase operations
const checkJWTAdminPrivileges = async () => {
  if (!jwtAuth.isAuthenticated()) {
    throw new Error('User is not authenticated');
  }
  
  // Verify the JWT token is still valid
  const isValid = await jwtAuth.verifyToken();
  if (!isValid) {
    throw new Error('User does not have admin privileges to modify pages');
  }
  
  return true;
};

/**
 * Get all pages from the database
 * @returns {Promise<PageContent[]>} Array of page content objects
 */
export async function getAllPages() {
  try {
    logOperation('getAllPages', { starting: true });
    
    const result = await getAllDocuments(COLLECTION_NAME);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch pages');
    }
    
    // Ensure all pages have the required fields with defaults
    const pages = result.data.map(doc => {
      const defaultSeo = {
        title: '', 
        description: '', 
        keywords: [], 
        canonicalUrl: '', 
        redirectUrl: '',
        robots: { 
          noindex: false, 
          nofollow: false, 
          noarchive: false, 
          nosnippet: false, 
          noimageindex: false, 
          notranslate: false 
        },
        schema: '', 
        social: { 
          ogTitle: '', 
          ogDescription: '', 
          ogImage: '', 
          twitterCard: 'summary', 
          twitterTitle: '', 
          twitterDescription: '', 
          twitterImage: '' 
        }
      };
      
      // Ensure the page has all required fields
      return {
        id: doc.id,
        title: doc.title || 'Untitled Page',
        content: doc.content || '',
        type: doc.type || 'page',
        slug: doc.slug || '',
        seo: {
          ...defaultSeo,
          ...(doc.seo || {}),
          title: doc.seo?.title || '',
          robots: {
            ...defaultSeo.robots,
            ...(doc.seo?.robots || {})
          },
          social: {
            ...defaultSeo.social,
            ...(doc.seo?.social || {})
          }
        }
      };
    });
    
    logOperation('getAllPages', { success: true, count: pages.length });
    return pages;
  } catch (error) {
    console.error(`[Pages Service Error] getAllPages:`, error);
    throw error;
  }
}

/**
 * Get a page by its ID
 * @param {string} id - The page ID
 * @returns {Promise<PageContent|null>} The page content or null if not found
 */
export async function getPageById(id) {
  try {
    logOperation('getPageById', { id });
    
    const result = await getDocument(COLLECTION_NAME, id);
    
    if (!result.success) {
      if (result.error === 'Document not found') {
        logOperation('getPageById', { notFound: true, id });
        return null;
      }
      throw new Error(result.error || `Failed to fetch page with ID: ${id}`);
    }
    
    const doc = result.data;
    
    // Define default SEO object
    const defaultSeo = {
      title: '', 
      description: '', 
      keywords: [], 
      canonicalUrl: '', 
      redirectUrl: '',
      robots: { 
        noindex: false, 
        nofollow: false, 
        noarchive: false, 
        nosnippet: false, 
        noimageindex: false, 
        notranslate: false 
      },
      schema: '', 
      social: { 
        ogTitle: '', 
        ogDescription: '', 
        ogImage: '', 
        twitterCard: 'summary', 
        twitterTitle: '', 
        twitterDescription: '', 
        twitterImage: '' 
      }
    };
    
    // Format and return the page with all required fields
    const page = {
      id: doc.id,
      title: doc.title || 'Untitled Page',
      content: doc.content || '',
      type: doc.type || 'page',
      slug: doc.slug || '',
      seo: {
        ...defaultSeo,
        ...(doc.seo || {}),
        title: doc.seo?.title || '',
        robots: {
          ...defaultSeo.robots,
          ...(doc.seo?.robots || {})
        },
        social: {
          ...defaultSeo.social,
          ...(doc.seo?.social || {})
        }
      }
    };
    
    logOperation('getPageById', { success: true, id });
    return page;
  } catch (error) {
    console.error(`[Pages Service Error] getPageById:`, error);
    throw error;
  }
}

/**
 * Save a new page or update an existing one
 * @param {PageContent} page - The page content to save
 * @returns {Promise<string>} The page ID
 */
export async function savePage(pageData) {
  try {
    await checkJWTAdminPrivileges();
    
    logOperation('savePage', { starting: true, id: pageData.id, slug: pageData.slug });
    
    // Use slug as document ID for clean URLs, fallback to existing ID or generate new one
    const docId = pageData.slug || pageData.id || crypto.randomUUID();
    
    const dataToSave = {
      ...pageData,
      id: docId,
      updatedAt: new Date().toISOString(),
      createdAt: pageData.createdAt || new Date().toISOString(),
    };
    
    const result = await setDocument(COLLECTION_NAME, docId, dataToSave);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save page');
    }
    
    logOperation('savePage', { success: true, id: docId });
    return docId;
  } catch (error) {
    console.error(`[Pages Service Error] savePage:`, error);
    throw error;
  }
}

/**
 * Delete a page by its ID
 * @param {string} id - The page ID
 * @returns {Promise<void>}
 */
export async function deletePage(id) {
  try {
    await checkJWTAdminPrivileges();
    
    logOperation('deletePage', { starting: true, id });
    
    const result = await deleteDocument(COLLECTION_NAME, id);
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to delete page');
    }
    
    logOperation('deletePage', { success: true, id });
  } catch (error) {
    console.error(`[Pages Service Error] deletePage:`, error);
    throw error;
  }
}

/**
 * Get a page by its slug using Firebase query
 * @param {string} slug - The page slug
 * @returns {Promise<PageContent|null>} The page content or null if not found
 */
export async function getPageBySlug(slug) {
  try {
    logOperation('getPageBySlug', { slug });
    
    if (!slug) return null;
    
    const pagesRef = collection(db, COLLECTION_NAME);
    const q = query(pagesRef, where('slug', '==', slug));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      logOperation('getPageBySlug', { notFound: true, slug });
      return null;
    }
    
    const doc = querySnapshot.docs[0];
    const page = {
      id: doc.id,
      ...doc.data()
    };
    
    logOperation('getPageBySlug', { success: true, slug });
    return page;
  } catch (error) {
    console.error(`[Pages Service Error] getPageBySlug:`, error);
    throw error;
  }
}

// React Query Hooks

/**
 * Hook to fetch all pages
 */
export function usePages() {
  return useQuery({
    queryKey: ['pages'],
    queryFn: getAllPages,
    retry: 2,
  });
}

/**
 * Hook to fetch a single page by ID
 * @param {string} id - The page ID
 */
export function usePage(id) {
  return useQuery({
    queryKey: ['page', id],
    queryFn: () => getPageById(id),
    enabled: !!id && id !== 'new',
    retry: 2,
    staleTime: 30000,
  });
}

/**
 * Hook to fetch a page by slug
 * @param {string} slug - The page slug
 */
export function usePageBySlug(slug) {
  return useQuery({
    queryKey: ['page', 'slug', slug],
    queryFn: () => getPageBySlug(slug),
    enabled: !!slug,
    retry: 2,
  });
}

/**
 * Hook to save a page
 */
export function useSavePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (page) => {
      logOperation('useSavePage', { starting: true, id: page.id });
      const savedId = await savePage(page);
      logOperation('useSavePage', { success: true, id: savedId });
      return savedId;
    },
    onSuccess: (savedId) => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
      queryClient.invalidateQueries({ queryKey: ['page', savedId] });
    },
    onError: (error) => {
      console.error('Error in useSavePage:', error);
    },
  });
}

/**
 * Hook to delete a page
 */
export function useDeletePage() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deletePage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pages'] });
    },
    onError: (error) => {
      console.error('Error in useDeletePage:', error);
    },
  });
}
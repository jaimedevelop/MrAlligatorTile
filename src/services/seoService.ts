// src/firebase/services/seoService.js
// At the top of seoService.js
/** @typedef {import('../../types/types').SeoSettings} SeoSettings */
/**
 * @typedef {Object} SeoSettings
 * @property {string} title - The page title
 * @property {string} description - Meta description
 * @property {string[]} keywords - Array of keywords
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  setDocument, 
  getDocument 
} from '../utils/firebase/database';
import { jwtAuth } from '../utils/jwtAuth';
import { SeoSettings } from '../types/types';

// Collection and document constants
const SETTINGS_COLLECTION = 'settings';
const SEO_SETTINGS_DOC_ID = 'global_seo_settings';

// Default SEO settings
const defaultSeoSettings = {
  title: "Mr. Alligator Plumbing - Professional Plumbing Services",
  description: "Expert plumbing services available 24/7. Licensed and insured plumbers.",
  keywords: ["plumbing", "services", "emergency plumber"]
};

// Logging utility
const logOperation = (operation, details) => {
  console.log(`[SEO Service ${operation}]`, {
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
    throw new Error('User does not have admin privileges to modify SEO settings');
  }
  
  return true;
};

/**
 * Get global SEO settings
 * @returns {Promise<SeoSettings>} SEO settings
 */
export async function getSeoSettings() {
  try {
    logOperation('getSeoSettings', { starting: true });
    
    const result = await getDocument(SETTINGS_COLLECTION, SEO_SETTINGS_DOC_ID);
    
    if (!result.success) {
      if (result.error === 'Document not found') {
        logOperation('getSeoSettings', { notFound: true, usingDefault: true });
        return defaultSeoSettings;
      }
      throw new Error(result.error || 'Failed to fetch SEO settings');
    }
    
    const doc = result.data;
    
    // Ensure required fields with proper validation
    const settings = {
      title: doc.title || defaultSeoSettings.title,
      description: doc.description || defaultSeoSettings.description,
      keywords: Array.isArray(doc.keywords) ? doc.keywords : defaultSeoSettings.keywords
    };
    
    logOperation('getSeoSettings', { success: true });
    return settings;
  } catch (error) {
    console.error(`[SEO Service Error] getSeoSettings:`, error);
    // Return defaults on error to prevent UI breaking
    logOperation('getSeoSettings', { error: true, usingDefault: true });
    return defaultSeoSettings;
  }
}

/**
 * Save SEO settings
 * @param {SeoSettings} settings - SEO settings to save
 * @returns {Promise<void>}
 */
export async function saveSeoSettings(settings) {
  try {
    logOperation('saveSeoSettings', { starting: true });
    
    // Check JWT admin privileges BEFORE making Firebase call
    await checkJWTAdminPrivileges();
    
    // Validate keywords is an array
    const validatedSettings = {
      ...settings,
      keywords: Array.isArray(settings.keywords) 
        ? settings.keywords 
        : defaultSeoSettings.keywords
    };
    
    const result = await setDocument(
      SETTINGS_COLLECTION, 
      SEO_SETTINGS_DOC_ID, 
      validatedSettings
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save SEO settings');
    }
    
    logOperation('saveSeoSettings', { success: true });
  } catch (error) {
    console.error(`[SEO Service Error] saveSeoSettings:`, error);
    throw error;
  }
}

// React Query Hooks

/**
 * Hook to fetch SEO settings
 */
export function useSeoSettings() {
  return useQuery({
    queryKey: ['seoSettings'],
    queryFn: getSeoSettings
  });
}

/**
 * Hook to save SEO settings
 */
export function useSaveSeoSettings() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saveSeoSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['seoSettings'] });
    }
  });
}//.
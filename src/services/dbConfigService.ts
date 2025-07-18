// src/firebase/services/dbConfigService.js

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// @ts-expect-error - Suppress missing declaration file error (ideally add .d.ts or convert)
import { 
  setDocument, 
  getDocument
// @ts-expect-error - Suppress missing declaration file error (ideally add .d.ts or convert)
} from '../utils/firebase/database';

// Collection and document constants
const SETTINGS_COLLECTION = 'settings';
const DB_CONFIG_DOC_ID = 'database_configuration';

// Define the type for the database configuration
interface DatabaseConfig {
  enabled: boolean;
  host: string;
  port: number;
  database: string;
  username: string;
  password?: string; // Make password optional if it might not always be present
  ssl: boolean;
}

// Default database configuration using the defined type
const defaultDbConfig: DatabaseConfig = {
  enabled: false,
  host: '',
  port: 5984,
  database: '',
  username: '',
  password: '',
  ssl: true
};

// Logging utility - Added types
const logOperation = (operation: string, details: Record<string, unknown>) => {
  console.log(`[DB Config Service ${operation}]`, {
    timestamp: new Date().toISOString(),
    ...details
  });
};

/**
 * Get database configuration
 * @returns {Promise<DatabaseConfig>} Database configuration
 */
export async function getDbConfig(): Promise<DatabaseConfig> {
  try {
    logOperation('getDbConfig', { starting: true });
    
    const result: { success: boolean, data?: unknown, error?: string } = await getDocument(SETTINGS_COLLECTION, DB_CONFIG_DOC_ID);
    
    if (!result.success) {
      if (result.error === 'Document not found') {
        logOperation('getDbConfig', { notFound: true, usingDefault: true });
        return defaultDbConfig;
      }
      throw new Error(result.error || 'Failed to fetch database configuration');
    }
    
    const doc = result.data as Record<string, unknown> | null; // Type assertion for doc data
    if (!doc) {
        logOperation('getDbConfig', { dataMissing: true, usingDefault: true });
        return defaultDbConfig; // Return default if doc data is null/undefined
    }
    
    // Construct configuration safely, initializing with the correct type
    const fetchedConfig: Partial<DatabaseConfig> = {}; // Use Partial to allow building the object
    
    Object.keys(defaultDbConfig).forEach(key => {
      const configKey = key as keyof DatabaseConfig; // Type assertion for key
      const value = doc[configKey];
      
      if (value !== undefined) {
        // Type-check values based on expected types
        const defaultValue = defaultDbConfig[configKey];
        if (typeof value === typeof defaultValue) {
             fetchedConfig[configKey] = value as any; // Assign validated value (use 'as any' carefully if types are complex)
        } else {
            logOperation('getDbConfig', { typeMismatch: true, key: configKey, expected: typeof defaultValue, got: typeof value });
        }
      }
    });
    
    // Combine defaults with fetched configuration
    const config: DatabaseConfig = {
      ...defaultDbConfig,
      ...fetchedConfig
    };
    
    logOperation('getDbConfig', { success: true });
    return config;
  } catch (error) {
    console.error(`[DB Config Service Error] getDbConfig:`, error);
    // Return defaults on error to prevent UI breaking
    logOperation('getDbConfig', { error: true, usingDefault: true });
    return defaultDbConfig;
  }
}

/**
 * Save database configuration
 * @param {Partial<DatabaseConfig>} config - Database configuration (allow partial updates)
 * @returns {Promise<void>}
 */
export async function saveDbConfig(config: Partial<DatabaseConfig>): Promise<void> {
  try {
    logOperation('saveDbConfig', { starting: true });
    
    // Fetch existing config to merge with partial updates if necessary
    // Or simply overwrite with the provided partial config + defaults for missing fields
    // For simplicity, we'll merge with defaults here. A fetch-then-merge might be safer.
    const configToSave: DatabaseConfig = {
      ...defaultDbConfig, // Start with defaults
      ...config          // Overlay provided changes
    };
    
    // Optional: Add validation logic here if needed before saving

    const result: { success: boolean, error?: string } = await setDocument(
      SETTINGS_COLLECTION, 
      DB_CONFIG_DOC_ID, 
      configToSave // Save the merged config
    );
    
    if (!result.success) {
      throw new Error(result.error || 'Failed to save database configuration');
    }
    
    logOperation('saveDbConfig', { success: true });
  } catch (error) {
    console.error(`[DB Config Service Error] saveDbConfig:`, error);
    throw error;
  }
}

// React Query Hooks

/**
 * Hook to fetch database configuration
 */
export function useDbConfig() {
  return useQuery<DatabaseConfig, Error>({ // Add types for hook
    queryKey: ['dbConfig'],
    queryFn: getDbConfig,
    staleTime: Infinity // Configuration doesn't change often
  });
}

/**
 * Hook to save database configuration
 */
export function useSaveDbConfig() {
  const queryClient = useQueryClient();
  
  return useMutation<void, Error, Partial<DatabaseConfig>>({ // Add types for hook
    mutationFn: saveDbConfig,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dbConfig'] });
    },
    onError: (error) => {
      console.error('Error saving DB config:', error);
      // You can add toast notifications or other user feedback here
    }
  });
}
/*database.js*/

console.log('🔥 [DEBUG] Loading Firebase database module');

import { 
    getFirestore, 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    addDoc
  } from 'firebase/firestore';
  import app from './config';
  import { jwtAuth } from '../jwtAuth';
  
  console.log('🔐 [DEBUG] jwtAuth imported:', typeof jwtAuth);
  
  // Initialize Firestore
  const db = getFirestore(app);
  console.log('🔥 [DEBUG] Firestore initialized');
  
  /**
   * Helper function to check JWT admin privileges for write operations
   * Uses collection-based auth rules to allow customer appointments while protecting admin data
   */
  const checkJWTAdminPrivilegesForWrites = async (operation, collectionName) => {
    console.log(`🔐 [DEBUG] checkJWTAdminPrivilegesForWrites called for operation: ${operation} on collection: ${collectionName}`);
    
    // Only check admin privileges for write operations
    if (['setDocument', 'addDocument', 'updateDocument', 'deleteDocument'].includes(operation)) {
      console.log('🔐 [DEBUG] This is a write operation, checking collection rules...');
      
      // COLLECTION-BASED AUTH RULES
      // Allow public writes to appointments collection (customer submissions)
      if (collectionName === 'appointments') {
        console.log('📝 [DEBUG] Allowing public write to appointments collection for customer submissions');
        return true;
      }
      
      // Require admin auth for all other collections (settings, projects, pages, etc.)
      console.log('🔐 [DEBUG] Admin-only collection, checking JWT authentication...');
      
      if (!jwtAuth) {
        console.error('❌ [DEBUG] jwtAuth not available!');
        throw new Error('Authentication system not available');
      }
      
      console.log('🔐 [DEBUG] jwtAuth available, checking authentication...');
      
      if (!jwtAuth.isAuthenticated()) {
        console.log('❌ [DEBUG] User is not authenticated');
        throw new Error('User is not authenticated');
      }
      
      console.log('🔐 [DEBUG] User is authenticated, verifying token...');
      const isValid = await jwtAuth.verifyToken();
      console.log('🔐 [DEBUG] Token verification result:', isValid);
      
      if (!isValid) {
        console.log('❌ [DEBUG] Token verification failed');
        throw new Error('User does not have admin privileges to modify data');
      }
      
      console.log('✅ [DEBUG] JWT admin privileges confirmed for write operation');
    } else {
      console.log('📖 [DEBUG] This is a read operation, no auth check needed');
    }
    return true;
  };
  
  /**
   * Dispatch custom events for different operations
   * @param {string} operation - The operation type (created, updated, deleted)
   * @param {string} collection - The collection name
   * @param {string} docId - The document ID (optional)
   */
  const dispatchDatabaseEvent = (operation, collection, docId = null) => {
    // Dispatch specific collection events
    const collectionEvent = `${collection}${operation.charAt(0).toUpperCase() + operation.slice(1)}`;
    window.dispatchEvent(new CustomEvent(collectionEvent, { 
      detail: { collection, operation, docId } 
    }));
    
    // Dispatch generic database event
    window.dispatchEvent(new CustomEvent('databaseUpdated', { 
      detail: { collection, operation, docId } 
    }));
  };
  
  /**
   * Create or update a document in a collection
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Success status
   */
  export const setDocument = async (collectionName, docId, data) => {
    try {
      console.log(`💾 [DEBUG] setDocument called: ${collectionName}/${docId}`);
      
      // Check JWT admin privileges for write operations (now with collection awareness)
      await checkJWTAdminPrivilegesForWrites('setDocument', collectionName);
      
      console.log('💾 [DEBUG] Auth check passed, proceeding with setDocument');
      
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        updatedAt: new Date()
      }, { merge: true });
      
      console.log('✅ [DEBUG] setDocument successful');
      
      // Dispatch update event
      dispatchDatabaseEvent('updated', collectionName, docId);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ [DEBUG] setDocument error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Add a new document to a collection
   * @param {string} collectionName - Collection name
   * @param {Object} data - Document data
   * @returns {Promise<Object>} Success status with document ID
   */
  export const addDocument = async (collectionName, data) => {
    try {
      console.log(`➕ [DEBUG] addDocument called: ${collectionName}`);
      
      // Check JWT admin privileges for write operations (now with collection awareness)
      await checkJWTAdminPrivilegesForWrites('addDocument', collectionName);
      
      const docRef = await addDoc(collection(db, collectionName), {
        ...data,
        createdAt: new Date(),
        updatedAt: new Date()
      });
      
      console.log('✅ [DEBUG] addDocument successful, ID:', docRef.id);
      
      // Dispatch create event
      dispatchDatabaseEvent('created', collectionName, docRef.id);
      
      return { 
        success: true, 
        id: docRef.id 
      };
    } catch (error) {
      console.error(`❌ [DEBUG] addDocument error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Get a document from a collection
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<Object>} Document data or null
   */
  export const getDocument = async (collectionName, docId) => {
    try {
      console.log(`📖 [DEBUG] getDocument called: ${collectionName}/${docId}`);
      
      // No auth check for read operations - they're public
      const docRef = doc(db, collectionName, docId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        console.log('✅ [DEBUG] getDocument successful - document found');
        return {
          success: true,
          data: { id: docSnap.id, ...docSnap.data() }
        };
      } else {
        console.log('📭 [DEBUG] getDocument - document not found');
        return {
          success: false,
          error: 'Document not found'
        };
      }
    } catch (error) {
      console.error(`❌ [DEBUG] getDocument error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Get all documents from a collection
   * @param {string} collectionName - Collection name
   * @returns {Promise<Array>} Array of documents
   */
  export const getAllDocuments = async (collectionName) => {
    try {
      console.log(`📚 [DEBUG] getAllDocuments called: ${collectionName}`);
      
      // No auth check for read operations - they're public
      const querySnapshot = await getDocs(collection(db, collectionName));
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ [DEBUG] getAllDocuments successful - found ${documents.length} documents`);
      
      return {
        success: true,
        data: documents
      };
    } catch (error) {
      console.error(`❌ [DEBUG] getAllDocuments error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Update a document in a collection
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @param {Object} data - Document data to update
   * @returns {Promise<Object>} Success status
   */
  export const updateDocument = async (collectionName, docId, data) => {
    try {
      console.log(`🔄 [DEBUG] updateDocument called: ${collectionName}/${docId}`);
      
      // Check JWT admin privileges for write operations (now with collection awareness)
      await checkJWTAdminPrivilegesForWrites('updateDocument', collectionName);
      
      const docRef = doc(db, collectionName, docId);
      await updateDoc(docRef, {
        ...data,
        updatedAt: new Date()
      });
      
      console.log('✅ [DEBUG] updateDocument successful');
      
      // Dispatch update event
      dispatchDatabaseEvent('updated', collectionName, docId);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ [DEBUG] updateDocument error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Delete a document from a collection
   * @param {string} collectionName - Collection name
   * @param {string} docId - Document ID
   * @returns {Promise<Object>} Success status
   */
  export const deleteDocument = async (collectionName, docId) => {
    try {
      console.log(`🗑️ [DEBUG] deleteDocument called: ${collectionName}/${docId}`);
      
      // Check JWT admin privileges for write operations (now with collection awareness)
      await checkJWTAdminPrivilegesForWrites('deleteDocument', collectionName);
      
      const docRef = doc(db, collectionName, docId);
      await deleteDoc(docRef);
      
      console.log('✅ [DEBUG] deleteDocument successful');
      
      // Dispatch delete event
      dispatchDatabaseEvent('deleted', collectionName, docId);
      
      return { success: true };
    } catch (error) {
      console.error(`❌ [DEBUG] deleteDocument error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  /**
   * Query documents from a collection
   * @param {string} collectionName - Collection name
   * @param {Array} conditions - Array of where conditions [field, operator, value]
   * @param {string} orderByField - Field to order by
   * @param {string} orderDirection - Order direction ('asc' or 'desc')
   * @param {number} limitCount - Limit number of results
   * @returns {Promise<Array>} Array of documents
   */
  export const queryDocuments = async (
    collectionName, 
    conditions = [], 
    orderByField = null, 
    orderDirection = 'asc', 
    limitCount = null
  ) => {
    try {
      console.log(`🔍 [DEBUG] queryDocuments called: ${collectionName}`);
      
      // No auth check for read operations - they're public
      let q = collection(db, collectionName);
      
      // Add where conditions
      if (conditions && conditions.length > 0) {
        conditions.forEach(condition => {
          q = query(q, where(condition[0], condition[1], condition[2]));
        });
      }
      
      // Add orderBy
      if (orderByField) {
        q = query(q, orderBy(orderByField, orderDirection));
      }
      
      // Add limit
      if (limitCount) {
        q = query(q, limit(limitCount));
      }
      
      const querySnapshot = await getDocs(q);
      const documents = [];
      
      querySnapshot.forEach((doc) => {
        documents.push({ id: doc.id, ...doc.data() });
      });
      
      console.log(`✅ [DEBUG] queryDocuments successful - found ${documents.length} documents`);
      
      return {
        success: true,
        data: documents
      };
    } catch (error) {
      console.error(`❌ [DEBUG] queryDocuments error in ${collectionName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  };
  
  // Export the db instance if needed
  export { db };
  
  console.log('✅ [DEBUG] Firebase database module loaded with JWT auth support and collection-based permissions');
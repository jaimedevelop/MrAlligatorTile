# Product Requirements Document

## 1. Screen Flows

### 1.1 Public Pages Flow

#### Home Page
- **Entry Point**: `/`
- **Data Requirements**: 
  - Featured projects (limited to 3)
  - Emergency contact information
  - Service categories
- **Database Interactions**:
  ```typescript
  // Fetch featured projects (using Firebase Firestore)
  // Requires a composite index on ('featured' == true, orderBy someField) if sorting
  import { collection, query, where, limit, getDocs } from 'firebase/firestore';
  import { db } from './path/to/firebase/config'; // Adjust path

  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, where('featured', '==', true), limit(3));
  const querySnapshot = await getDocs(q);
  const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  ```

#### Projects Page
- **Entry Point**: `/projects`
- **Data Flow**:
  1. Load all projects on initial render
  2. Filter projects by category (client-side)
  3. Sort projects by completion date
- **Database Interactions**:
  ```typescript
  // Fetch all projects, sorted by completion date (using Firebase Firestore)
  // Requires a composite index on ('completionDate' DESC)
  import { collection, query, orderBy, getDocs } from 'firebase/firestore';
  import { db } from './path/to/firebase/config'; // Adjust path

  const projectsRef = collection(db, 'projects');
  const q = query(projectsRef, orderBy('completionDate', 'desc'));
  const querySnapshot = await getDocs(q);
  const projects = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  ```

#### Schedule Page
- **Entry Point**: `/schedule`
- **Data Requirements**:
  - Available time slots
  - Appointment settings
  - Existing appointments
- **Database Interactions**:
  ```typescript
  // Fetch appointment settings (using fixed ID 'appointmentSettings')
  import { doc, getDoc, collection, query, where, Timestamp, getDocs } from 'firebase/firestore';
  import { db } from './path/to/firebase/config'; // Adjust path

  const settingsRef = doc(db, 'settings', 'appointmentSettings');
  const settingsSnap = await getDoc(settingsRef);
  const settings = settingsSnap.exists() ? settingsSnap.data() : null;

  // Check existing appointments for a specific day
  // Requires a composite index on ('preferredDate' range, 'status' !=) if combining filters efficiently
  const appointmentsRef = collection(db, 'appointments');
  const startOfDayTimestamp = Timestamp.fromDate(startOfDay);
  const endOfDayTimestamp = Timestamp.fromDate(endOfDay);

  const q = query(
    appointmentsRef,
    where('preferredDate', '>=', startOfDayTimestamp),
    where('preferredDate', '<=', endOfDayTimestamp),
    where('status', 'not-in', ['cancelled', 'rejected']) // Use 'not-in'
  );
  const querySnapshot = await getDocs(q);
  const existingAppointments = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  ```

### 1.2 Admin Pages Flow

#### Login Flow
1. User enters credentials
2. System authenticates using Firebase Authentication (e.g., `signInWithEmailAndPassword`).
3. Firebase SDK manages the user session/token automatically. Redirect to admin dashboard on success.
4. On failure, displays error message

#### Admin Dashboard
- **Entry Points**: 
  - `/admin/pages`
  - `/admin/projects`
  - `/admin/appointments`
  - `/admin/settings`
- **Protected Routes**: All admin routes require authentication

#### Project Management
- **CRUD Operations**: (Handled by `projectsService.ts` using Firebase SDK)
  ```typescript
  // Create project (Firebase Firestore)
  import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
  import { db } from './path/to/firebase/config'; // Adjust path
  const projectsRef = collection(db, 'projects');
  await addDoc(projectsRef, {
    ...projectData,
    createdAt: serverTimestamp(), // Use server timestamp
    updatedAt: serverTimestamp()
  });

  // Update project (Firebase Firestore)
  import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
  const projectRef = doc(db, 'projects', projectId);
  await updateDoc(projectRef, {
    ...updates,
    updatedAt: serverTimestamp()
  });

  // Delete project (Firebase Firestore)
  import { doc, deleteDoc } from 'firebase/firestore';
  const projectRef = doc(db, 'projects', projectId);
  await deleteDoc(projectRef);
  ```

## 2. Error Handling

### 2.1 Database Errors
- Connection failures: Firebase SDK handles temporary offline scenarios if persistence is enabled. UI should indicate offline status or loading states.
- Write conflicts: Firestore uses optimistic concurrency control. Last write wins by default. Handle potential errors during writes (e.g., document deleted concurrently).
- Validation errors: Display user-friendly messages from client-side validation. Firestore Security Rules provide server-side validation before writes occur.

### 2.2 Form Validation
- Client-side validation before submission
- Server-side validation via Firestore Security Rules (`request.resource.data`) for data integrity and schema enforcement.
- Custom error messages for each field.

## 3. Performance Requirements

### 3.1 Loading Times
- Initial page load: < 2 seconds
- Database queries: < 500ms
- Image loading: Progressive with placeholders

### 3.2 Offline Capability
- Optional offline support via Firebase Firestore Persistence (enabled during initialization).
- Caches data locally and syncs changes automatically when online.
- Handles basic network interruptions gracefully.

## 4. Security Considerations

### 4.1 Authentication
- Managed by Firebase Authentication (Email/Password, potentially others).
- Admin-only access typically enforced via custom claims set on the user's Firebase Auth token (e.g., `admin: true`) and checked in Firestore Security Rules.
- Firebase SDK handles session management securely.

### 4.2 Data Access
- Public/private data separation and role-based access control managed via Firestore Security Rules, evaluating `request.auth` (user's authentication state and claims).
- Input sanitization before saving to DB (client-side). Security rules provide server-side validation of data structure and content.
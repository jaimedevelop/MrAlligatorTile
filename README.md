# For Joaquin Future Cases|

On the droplet, remember the memory capacity issue for commands
There is the test-server.js file, which is to be used for testing (duh)
Always test on localhost:3000 before sending up to production 
(Remember that day where you deleted everything)

to start test server
NODE_OPTIONS="--max-old-space-size=2048" node test-server.js
Then to access, use droplet IP and :3000
NODE_OPTIONS="--max-old-space-size=2048" npm run build

# Mr. Alligator Plumbing Website

A professional plumbing services website built with React, TypeScript, and Tailwind CSS.

## Features

### Public Pages

#### 🏠 Home Page
- Hero section with emergency service and scheduling CTAs
- Featured services overview
- Company highlights and benefits
- Emergency service modal with 24/7 contact information

#### 📞 Contact Page
- Contact information cards
- Interactive contact form
- Emergency contact banner
- Google Maps integration
- Emergency service section

#### 🛠️ Projects Section
- Project portfolio grid
- Category filtering (Commercial, Residential, Emergency)
- Detailed project pages with:
  - Photo galleries
  - Project specifications
  - Challenge/Solution/Outcome descriptions
  - Materials and services used
  - Related project suggestions

#### 📅 Scheduling System
- Online appointment booking
- Service type selection
- Date and time picker
- Emergency service option
- Automatic email notifications
- Availability checking

#### ℹ️ About Us Page
- Company history
- Team member profiles
- Service area information
- Certifications and credentials
- Customer testimonials

### Admin Dashboard

#### 🔐 Authentication
- Secure admin login
- Protected routes
- Session management

#### 📝 Content Management
- Page editor with:
  - Rich text editing
  - SEO settings
  - Meta tag management
  - Social media preview configuration

#### 📊 Appointment Management
- Appointment list view
- Status updates
- Customer information
- Service details
- Email notifications

#### ⚙️ Settings Management
- Global SEO settings
- Scheduling settings:
  - Available days/hours
  - Booking window
  - Service types
  - Excluded dates

## Technical Features

### 💻 Frontend
- React 18 with TypeScript
- Tailwind CSS for styling
- React Router for navigation
- React Query for data fetching
- Zustand for state management
- React Error Boundary for error handling

### 🗄️ Data Management
- **Database:** Firebase Firestore for data storage.
- **Authentication:** Firebase Authentication for user management.
- Structured data models defined in `src/types/`.
- Database interactions are handled through dedicated service files (`src/services/*`) which utilize the Firebase SDK configured in `src/utils/firebase/`.

### 🎨 UI/UX
- Responsive design
- Mobile-first approach
- Interactive components
- Loading states
- Error handling
- Form validation
- Modal dialogs
- Photo galleries

### 🔒 Security
- **Authentication:** Handled via Firebase Authentication (email/password, potentially others).
- **Authorization:** Access control managed through Firebase Security Rules and client-side route guards.
- Protected admin routes (client-side routing guards).
- Client-side form validation and input sanitization.

### 📧 Notifications
- Email notifications for:
  - New appointments
  - Status updates
  - Emergency contacts
  - Admin alerts

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```

## Development

### Available Scripts
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Project Structure
```
src/
├── components/     # Reusable UI components
├── pages/         # Page components (Home, Contact, Projects, Schedule, About, Admin Login, etc.)
├── hooks/         # Custom React hooks (e.g., useAuth, useFormValidation)
├── services/      # Business logic interacting with Firebase
│   ├── projectsService.ts
│   ├── pagesService.ts
│   ├── seoService.ts
│   ├── appointmentsService.ts
│   └── dbConfigService.ts # Potentially for settings or shared DB logic
├── store/         # State management (e.g., Zustand stores)
├── types/         # TypeScript type definitions (Project, Appointment, PageContent, etc.)
└── utils/         # Utility functions
    └── firebase/  # Firebase SDK configuration and initialization
        ├── config.js
        ├── index.js
        ├── database.js
        └── auth.js
```

## Admin Access
Default admin credentials when initial project set:
- Username: admin
- Password: admin
- Admin access is managed via Firebase Authentication. Refer to the Firebase console for user management.

## License
MIT License - See LICENSE file for details
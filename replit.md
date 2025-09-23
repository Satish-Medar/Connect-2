# CivicConnect - Smart Civic Issue Reporting Platform

## Overview

CivicConnect is a Progressive Web Application (PWA) designed for crowdsourced civic issue reporting and resolution. The platform enables citizens to report municipal issues (potholes, lighting, garbage, etc.) through a mobile-first interface with AI-powered analysis, while providing municipal staff with a comprehensive dashboard for issue management and analytics.

The application features real-time issue tracking, AI-powered image classification, gamification elements, and smart routing capabilities to streamline the civic reporting process and improve municipal response times.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Components**: Shadcn/ui component library built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **PWA Features**: Service worker implementation for offline support, caching, and push notifications

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Authentication**: Passport.js with local strategy and session-based authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **File Handling**: Multer for image uploads with Sharp for image processing
- **Real-time Communication**: WebSocket server for live updates

### Database Design
- **Primary Database**: PostgreSQL with Drizzle ORM
- **Connection**: Neon serverless PostgreSQL through connection pooling
- **Schema Design**: 
  - Users table with role-based access (citizen, staff, admin)
  - Issues table with geolocation, AI analysis, and status tracking
  - Validations table for community verification
  - Comments, achievements, and notifications tables for engagement

### AI Integration
- **Image Analysis**: Google Gemini 2.5 Pro for automatic issue classification
- **Capabilities**: Category detection, priority assessment, severity scoring, and department routing
- **Processing**: Base64 image encoding with structured JSON responses for consistent analysis

### Geolocation Services
- **Maps**: Leaflet integration with OpenStreetMap tiles
- **Location Services**: Browser Geolocation API for automatic position tracking
- **Spatial Queries**: PostgreSQL spatial capabilities for proximity-based issue discovery

### Authentication & Authorization
- **Strategy**: Session-based authentication with secure password hashing using scrypt
- **Role Management**: Three-tier system (citizen, staff, admin) with route protection
- **Security**: CSRF protection, secure cookies, and input validation with Zod schemas

### File Storage & Media
- **Image Processing**: Sharp for optimization and resizing
- **Upload Handling**: Multer with memory storage and file type validation
- **Size Limits**: 10MB maximum file size with image format restrictions

### Real-time Features
- **WebSocket Implementation**: Native WebSocket server for live issue updates
- **Broadcast System**: Real-time notifications for status changes and new reports
- **Connection Management**: Client reconnection handling and connection state tracking

### Progressive Web App Features
- **Offline Support**: Service worker with caching strategies for static and dynamic content
- **Installation**: Browser install prompts with custom installation UI
- **Push Notifications**: Service worker-based notification system
- **Responsive Design**: Mobile-first approach with bottom navigation for mobile devices

### Performance Optimizations
- **Code Splitting**: Vite-based bundling with dynamic imports
- **Image Optimization**: Sharp processing for optimal file sizes
- **Caching Strategy**: Multi-tier caching with static and dynamic cache management
- **Query Optimization**: TanStack Query for efficient data fetching and caching

## External Dependencies

### AI Services
- **Google Generative AI**: Gemini 2.5 Pro API for image analysis and issue classification
- **Processing**: Automatic category detection, priority assessment, and department routing

### Database Services
- **Neon Database**: Serverless PostgreSQL hosting with connection pooling
- **Session Storage**: PostgreSQL-based session persistence

### Map Services
- **OpenStreetMap**: Tile server for map rendering
- **Leaflet**: JavaScript mapping library for interactive map features

### Development Tools
- **Replit Integration**: Development environment plugins for cartographer and dev banner
- **TypeScript**: Full type safety across frontend, backend, and shared schemas

### UI Component Libraries
- **Radix UI**: Headless component primitives for accessibility
- **Shadcn/ui**: Pre-built component system with consistent styling
- **Lucide React**: Icon library for consistent iconography

### Build & Development
- **Vite**: Fast build tool with HMR and optimized production builds
- **ESBuild**: Server-side bundling for production deployment
- **PostCSS**: CSS processing with Tailwind CSS compilation

### Authentication & Security
- **Passport.js**: Authentication middleware with local strategy
- **Express Session**: Session management with PostgreSQL store
- **Crypto**: Node.js crypto module for secure password hashing
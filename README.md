# Nipon Payroll Pro

[![License](https://img.shields.io/badge/license-Commercial-blue.svg)](LICENSE)
[![Vue](https://img.shields.io/badge/Vue-3.4+-green.svg)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.2+-blue.svg)](https://www.typescriptlang.org/)
[![Firebase](https://img.shields.io/badge/Firebase-10.5+-orange.svg)](https://firebase.google.com/)

## Overview

Nipon Payroll Pro is a premium, desktop-optimized web application designed specifically for manpower supply companies in Qatar. It serves as a centralized platform for managing employee payroll, customer relationships, financial accounts, and compliance-related notifications.

### Key Features

- **Employee Management**: Comprehensive employee profiles with Qatar-specific compliance data
- **Payroll Processing**: Advanced salary management with Qatar labor law compliance
- **Compliance Tracking**: Automated alerts for Qatar ID, passport, and visa expiries
- **Financial Management**: Excel-like interface for accounts and cash flow management
- **Customer Relations**: Complete CRM for client companies and contracts
- **Document Management**: Secure file uploads with encryption and access controls
- **Receipt & Invoicing**: Professional receipt generation with Qatar VAT compliance
- **Real-time Notifications**: Firebase-powered alerts and updates
- **Analytics & Reports**: Comprehensive business intelligence dashboard
- **Progressive Web App**: Offline capabilities with desktop-first design

## Tech Stack

- **Frontend**: Vue 3 + TypeScript + Vite
- **UI Framework**: Vuetify 3 (Material Design)
- **State Management**: Pinia
- **Backend**: Firebase (Firestore, Auth, Storage, Functions, FCM)
- **Charts**: Chart.js + Vue-Chart.js
- **Spreadsheet**: Handsontable
- **PWA**: Vite PWA Plugin with Workbox
- **Development**: ESLint + Prettier + TypeScript

## Prerequisites

- Node.js 18+ and npm/yarn
- Modern desktop browser (Chrome, Edge, Firefox, Safari)
- Screen resolution: minimum 1024px width
- Firebase project with enabled services

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nipon-payroll-pro
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Configuration**
   - Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
   - Enable Authentication, Firestore, Storage, and Cloud Messaging
   - Copy your Firebase config and update `src/firebase/config.ts`
   - Set up Firebase Security Rules (see `firebase/` directory)

4. **Environment Variables**
   Create a `.env.local` file:
   ```env
   VITE_FIREBASE_API_KEY=your-api-key
   VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
   VITE_FIREBASE_PROJECT_ID=your-project-id
   VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
   VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
   VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
   VITE_USE_FIREBASE_EMULATORS=false
   ```

5. **Development Server**
   ```bash
   npm run dev
   ```

6. **Build for Production**
   ```bash
   npm run build
   ```

## Project Structure

```
src/
├── components/          # Reusable Vue components
│   ├── common/         # Common UI components
│   └── layout/         # Layout components (navigation, headers)
├── views/              # Page components
│   ├── auth/           # Authentication pages
│   ├── employees/      # Employee management
│   ├── payroll/        # Payroll and salary management
│   ├── compliance/     # Compliance and alerts
│   ├── accounts/       # Financial management
│   ├── customers/      # Customer relationship management
│   ├── receipts/       # Invoicing and receipts
│   ├── analytics/      # Reports and analytics
│   ├── settings/       # System settings
│   └── employee-portal/ # Employee self-service
├── stores/             # Pinia state management
├── router/             # Vue Router configuration
├── firebase/           # Firebase configuration and utilities
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── assets/             # Static assets
```

## Key Features Implementation

### Desktop-Only Access
- Automatic mobile device detection and redirect
- Minimum screen width enforcement (1024px)
- Responsive design optimized for desktop workflows

### Qatar Compliance
- Qatar ID tracking with expiry alerts
- Passport and visa management
- Work permit monitoring
- Ministry compliance reporting

### Premium Subscription Model
- Role-based access control
- Feature gating based on subscription tier
- Trial period management
- Subscription upgrade flows

### Security Features
- Firebase Authentication with role-based access
- Document encryption for sensitive files
- Audit trails for all operations
- GDPR and Qatar data protection compliance

## Development Guidelines

### Code Style
- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- Vue 3 Composition API preferred
- Vuetify components for consistent UI

### State Management
- Pinia stores for global state
- Composables for reusable logic
- Firebase real-time subscriptions

### Testing Strategy
- Unit tests for business logic
- Component testing with Vue Test Utils
- E2E testing for critical workflows
- Firebase emulator for development testing

## Deployment

### Prerequisites
- Firebase CLI installed and authenticated
- Production environment variables configured

### Steps
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Firebase Hosting**
   ```bash
   firebase deploy
   ```

3. **Set up custom domain** (optional)
   - Configure DNS settings
   - Enable SSL certificate

## Environment-Specific Configuration

### Development
- Firebase emulators for local development
- Hot module replacement enabled
- Debug logging active

### Production
- Optimized bundle with code splitting
- Service worker for offline functionality
- Firebase production services
- Error tracking and analytics

## Performance Optimization

- **Code Splitting**: Route-based lazy loading
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Service worker with cache strategies
- **Image Optimization**: WebP format with fallbacks
- **CDN**: Firebase hosting with global CDN

## Browser Support

| Browser | Version |
|---------|---------|
| Chrome  | 90+     |
| Edge    | 90+     |
| Firefox | 88+     |
| Safari  | 14+     |

## License

This software is proprietary and licensed for commercial use only. See [LICENSE](LICENSE) for details.

## Support

For technical support and feature requests:
- Email: support@niponpayrollpro.com
- Documentation: [docs.niponpayrollpro.com](https://docs.niponpayrollpro.com)
- Issues: Create an issue in this repository

## Contributing

This is a commercial project. External contributions are not accepted at this time.

---

© 2025 Nipon Payroll Pro. All rights reserved.
# 🚀 Development Access Guide - Nipon Payroll Pro

## Quick Access Without Firebase Setup

Your application is now configured for **development mode** which bypasses Firebase authentication completely!

### 🌐 Access URLs
- **Local:** http://localhost:3001/
- **Network:** http://192.168.1.111:3001/

### 🔑 Development Authentication
No login required! The app automatically logs you in as:
- **Email:** admin@niponpayroll.com
- **Name:** Development Admin
- **Role:** System Administrator (Full Access)
- **Permissions:** All modules and features unlocked

### 📋 Available Features (All Accessible)

#### 🏠 Dashboard
- Overview of system metrics
- Quick action buttons
- Recent activity feed

#### 👥 Employee Management
- Employee list and details
- Add/Edit employee information
- Document management
- Qatar ID and passport tracking

#### 💰 Payroll Processing
- Salary management
- Advance loans tracking
- Payslip generation
- Transaction history

#### ⚖️ Compliance Monitoring
- Document expiry alerts
- Labor law compliance tracking
- Notification center

#### 📊 Financial Management
- Accounts dashboard
- Cash flow management
- Expense tracking
- Financial reports
- Bank reconciliation

#### 🏢 Customer Management
- Client list and details
- Contract management
- Customer portal access

#### 🧾 Receipt Management
- Invoice generation
- Payment tracking
- Receipt templates

#### 📈 Analytics & Reports
- HR analytics
- Financial analytics
- Compliance reports

#### ⚙️ Settings & Administration
- User management
- Company profile
- Subscription management
- System logs
- Backup & restore

### 🔧 Development Features Enabled
- ✅ All routes accessible without authentication
- ✅ Full admin privileges
- ✅ All premium features unlocked
- ✅ Mock data support
- ✅ Debug logging enabled

### 🎯 Getting Started
1. Open your browser
2. Navigate to: http://localhost:3001/
3. You'll be automatically logged in
4. Explore all the features and modules
5. Start developing your specific business logic

### 🔄 Switching to Production
When ready to use Firebase:
1. Set `VITE_USE_DEV_AUTH=false` in `.env.local`
2. Add your real Firebase configuration
3. Restart the development server

### 🛠️ Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Run type checking
npm run type-check

# Preview production build
npm run preview
```

---
**Note:** This development mode is only active when `VITE_USE_DEV_AUTH=true` in your environment variables. Perfect for testing and developing features without Firebase setup!
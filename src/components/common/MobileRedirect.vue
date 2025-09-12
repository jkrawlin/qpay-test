<template>
  <div class="mobile-redirect-overlay">
    <div class="mobile-redirect-content">
      <v-icon size="80" color="primary" class="mb-4">
        mdi-desktop-classic
      </v-icon>
      
      <h1 class="text-h4 font-weight-bold mb-4 text-primary">
        Desktop Access Required
      </h1>
      
      <p class="text-body-1 mb-4 text-center">
        Nipon Payroll Pro is designed exclusively for desktop computers 
        to provide you with the best experience for managing payroll and 
        manpower operations in Qatar.
      </p>
      
      <div class="requirements-card">
        <h3 class="text-h6 mb-3">System Requirements:</h3>
        <ul class="requirements-list">
          <li>Desktop or laptop computer</li>
          <li>Screen width: minimum 1024px</li>
          <li>Modern browser (Chrome, Edge, Firefox, Safari)</li>
          <li>Stable internet connection</li>
        </ul>
      </div>
      
      <div class="features-preview mt-6">
        <h3 class="text-h6 mb-3">Premium Features Include:</h3>
        <v-row>
          <v-col cols="6">
            <v-icon color="success" class="mr-2">mdi-check</v-icon>
            Employee Management
          </v-col>
          <v-col cols="6">
            <v-icon color="success" class="mr-2">mdi-check</v-icon>
            Payroll Processing
          </v-col>
          <v-col cols="6">
            <v-icon color="success" class="mr-2">mdi-check</v-icon>
            Qatar Compliance
          </v-col>
          <v-col cols="6">
            <v-icon color="success" class="mr-2">mdi-check</v-icon>
            Financial Reports
          </v-col>
          <v-col cols="6">
            <v-icon color="success" class="mr-2">mdi-check</v-icon>
            Document Management
          </v-col>
          <v-col cols="6">
            <v-icon color="success" class="mr-2">mdi-check</v-icon>
            Real-time Notifications
          </v-col>
        </v-row>
      </div>
      
      <v-btn
        color="primary"
        size="large"
        class="mt-6"
        @click="redirectToDesktop"
      >
        <v-icon left>mdi-open-in-new</v-icon>
        Access from Desktop
      </v-btn>
      
      <div class="contact-info mt-4">
        <p class="text-caption text-grey-darken-1">
          Need help? Contact our support team for assistance.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const redirectToDesktop = () => {
  // Could implement QR code generation or email link functionality
  alert('Please access this application from a desktop computer with a screen width of at least 1024px.')
}
</script>

<style scoped>
.mobile-redirect-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.mobile-redirect-content {
  background: white;
  border-radius: 16px;
  padding: 40px 30px;
  text-align: center;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(50px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.requirements-card {
  background: #f5f5f5;
  border-radius: 8px;
  padding: 20px;
  text-align: left;
  margin: 20px 0;
}

.requirements-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.requirements-list li {
  padding: 4px 0;
  position: relative;
  padding-left: 20px;
}

.requirements-list li::before {
  content: '•';
  color: #1976d2;
  font-weight: bold;
  position: absolute;
  left: 0;
}

.features-preview {
  text-align: left;
}

.contact-info {
  border-top: 1px solid #e0e0e0;
  padding-top: 16px;
}

/* Ensure this component is visible on mobile */
@media (max-width: 1023px) {
  .mobile-redirect-overlay {
    display: flex !important;
  }
}
</style>
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Custom color palette for Qatar theme
const qatarTheme = {
  dark: false,
  colors: {
    // Primary colors (Qatar maroon inspired)
    primary: '#8B1538',
    'primary-darken-1': '#6B0F2A',
    'primary-lighten-1': '#A61E4D',
    
    // Secondary colors (Professional blue)
    secondary: '#1E3A5F',
    'secondary-darken-1': '#152943',
    'secondary-lighten-1': '#2B4C7E',
    
    // Accent colors
    accent: '#FFB800',
    'accent-darken-1': '#E5A200',
    'accent-lighten-1': '#FFC933',
    
    // Status colors
    success: '#2E7D32',
    info: '#0288D1',
    warning: '#F57C00',
    error: '#C62828',
    
    // Background colors
    background: '#F5F5F5',
    surface: '#FFFFFF',
    'surface-variant': '#FAFAFA',
    
    // Text colors
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#000000',
    'on-surface': '#212121',
    'on-background': '#212121',
    
    // Additional colors
    'grey-lighten-5': '#FAFAFA',
    'grey-lighten-4': '#F5F5F5',
    'grey-lighten-3': '#EEEEEE',
    'grey-lighten-2': '#E0E0E0',
    'grey-lighten-1': '#BDBDBD',
    'grey': '#9E9E9E',
    'grey-darken-1': '#757575',
    'grey-darken-2': '#616161',
    'grey-darken-3': '#424242',
    'grey-darken-4': '#212121'
  }
}

// Dark theme for night mode
const darkTheme = {
  dark: true,
  colors: {
    primary: '#A61E4D',
    'primary-darken-1': '#8B1538',
    'primary-lighten-1': '#C7356B',
    
    secondary: '#2B4C7E',
    'secondary-darken-1': '#1E3A5F',
    'secondary-lighten-1': '#3D5E99',
    
    accent: '#FFC933',
    'accent-darken-1': '#FFB800',
    'accent-lighten-1': '#FFD966',
    
    success: '#4CAF50',
    info: '#03A9F4',
    warning: '#FF9800',
    error: '#F44336',
    
    background: '#121212',
    surface: '#1E1E1E',
    'surface-variant': '#2A2A2A',
    
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#000000',
    'on-surface': '#FFFFFF',
    'on-background': '#FFFFFF'
  }
}

export default createVuetify({
  components,
  directives,
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi
    }
  },
  theme: {
    defaultTheme: 'qatarLight',
    themes: {
      qatarLight: qatarTheme,
      qatarDark: darkTheme
    },
    variations: {
      colors: ['primary', 'secondary', 'accent'],
      lighten: 5,
      darken: 4
    }
  },
  defaults: {
    global: {
      ripple: true
    },
    VCard: {
      elevation: 2,
      rounded: 'lg'
    },
    VBtn: {
      elevation: 2,
      rounded: 'lg',
      class: 'text-none font-weight-medium'
    },
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VAutocomplete: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VTextarea: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary'
    },
    VDataTable: {
      class: 'elevation-2'
    },
    VChip: {
      rounded: 'pill'
    },
    VAlert: {
      rounded: 'lg',
      elevation: 2
    }
  }
})
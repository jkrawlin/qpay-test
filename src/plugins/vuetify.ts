import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import { aliases, mdi } from 'vuetify/iconsets/mdi'
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Light theme
const qatarTheme = {
  dark: false,
  colors: {
    primary: '#8B1538',
    'primary-darken-1': '#6B0F2A',
    'primary-darken-2': '#5A0C23',
    'primary-lighten-1': '#A61E4D',
    'primary-lighten-2': '#C7356B',
    secondary: '#6B0F2A',
    'secondary-darken-1': '#5A0C23',
    'secondary-lighten-1': '#8B1538',
    accent: '#FFB800',
    'accent-darken-1': '#E5A200',
    'accent-lighten-1': '#FFC933',
    success: '#2E7D32',
    info: '#8B1538',
    warning: '#F57C00',
    error: '#C62828',
    background: '#FAFAFA',
    surface: '#FFFFFF',
    'surface-variant': '#FFF5F5',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#000000',
    'on-surface': '#424242',
    'on-background': '#424242'
  }
}

// Dark theme variant
const qatarDarkTheme = {
  dark: true,
  colors: {
    primary: '#8B1538',
    'primary-darken-1': '#6B0F2A',
    secondary: '#A61E4D',
    accent: '#FFB800',
    success: '#4CAF50',
    info: '#C7356B',
    warning: '#FFA726',
    error: '#EF5350',
    background: '#121212',
    surface: '#1E1E1E',
    'surface-variant': '#2A1A22',
    'on-primary': '#FFFFFF',
    'on-secondary': '#FFFFFF',
    'on-accent': '#000000',
    'on-surface': '#E0E0E0',
    'on-background': '#E0E0E0'
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
    defaultTheme: 'qatar',
    themes: {
      qatar: qatarTheme,
      qatarDark: qatarDarkTheme
    }
  },
  defaults: {
    global: {
      ripple: true
    },
    // Ensure all components use primary color
    VDialog: {
      color: 'surface'
    },
    VCard: {
      elevation: 2,
      rounded: 'lg',
      color: 'surface'
    },
    VBtn: {
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
    },
    VMenu: {
      rounded: 'lg'
    },
    VList: {
      rounded: 'lg'
    }
  }
})
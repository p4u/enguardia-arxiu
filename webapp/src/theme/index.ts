import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: true,
}

const colors = {
  primary: {
    50: '#ffebee',
    100: '#ffcdd2',
    200: '#ef9a9a',
    300: '#e57373',
    400: '#ef5350',
    500: '#d32f2f',
    600: '#c62828',
    700: '#b71c1c',
    800: '#8d1e1e',
    900: '#5d1313',
  },
  secondary: {
    50: '#e3f2fd',
    100: '#bbdefb',
    200: '#90caf9',
    300: '#64b5f6',
    400: '#42a5f5',
    500: '#1976d2',
    600: '#1565c0',
    700: '#0d47a1',
    800: '#0a3d91',
    900: '#062e6f',
  },
  accent: {
    50: '#fff3e0',
    100: '#ffe0b2',
    200: '#ffcc80',
    300: '#ffb74d',
    400: '#ffa726',
    500: '#ff9800',
    600: '#fb8c00',
    700: '#f57c00',
    800: '#ef6c00',
    900: '#e65100',
  },
}

const fonts = {
  heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
  body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol"`,
}

const components = {
  Button: {
    defaultProps: {
      colorScheme: 'primary',
    },
    variants: {
      solid: {
        bg: 'primary.500',
        color: 'white',
        _hover: {
          bg: 'primary.600',
        },
        _active: {
          bg: 'primary.700',
        },
      },
      outline: {
        borderColor: 'primary.500',
        color: 'primary.500',
        _hover: {
          bg: 'primary.50',
        },
      },
    },
  },
  Card: {
    baseStyle: {
      container: {
        borderRadius: 'xl',
        boxShadow: 'lg',
        overflow: 'hidden',
      },
    },
  },
  Input: {
    defaultProps: {
      focusBorderColor: 'primary.500',
    },
  },
  Textarea: {
    defaultProps: {
      focusBorderColor: 'primary.500',
    },
  },
}

const styles = {
  global: {
    body: {
      bg: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      color: 'gray.800',
      minHeight: '100vh',
    },
    '*::placeholder': {
      color: 'gray.400',
    },
    '*, *::before, &::after': {
      borderColor: 'gray.200',
    },
    // Add smooth scrolling
    html: {
      scrollBehavior: 'smooth',
    },
    // Custom scrollbar
    '::-webkit-scrollbar': {
      width: '8px',
    },
    '::-webkit-scrollbar-track': {
      bg: 'gray.100',
    },
    '::-webkit-scrollbar-thumb': {
      bg: 'primary.300',
      borderRadius: '4px',
    },
    '::-webkit-scrollbar-thumb:hover': {
      bg: 'primary.400',
    },
  },
}

export const theme = extendTheme({
  config,
  colors,
  fonts,
  components,
  styles,
  space: {
    '4.5': '1.125rem',
    '5.5': '1.375rem',
  },
  sizes: {
    '4.5': '1.125rem',
    '5.5': '1.375rem',
  },
})

export type Theme = typeof theme

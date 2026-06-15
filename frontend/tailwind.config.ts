import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './lib/**/*.{js,ts,jsx,tsx}',
    './hooks/**/*.{js,ts,jsx,tsx}'
  ],
  theme: {
    extend: {
      colors: {
        primary: '#000000',
        secondary: '#0058be',
        tertiary: '#000000',
        background: '#f8f9ff',
        'bg-surface': '#FFFFFF',
        'bg-main': '#F8FAFC',
        'on-surface': '#0b1c30',
        'on-surface-variant': '#45464d',
        'on-primary': '#ffffff',
        'on-secondary': '#ffffff',
        'border-subtle': '#E2E8F0',
        'surface-container': '#e5eeff',
        'surface-container-low': '#eff4ff',
        'surface-container-high': '#dce9ff',
        'surface-container-highest': '#d3e4fe',
        'surface-container-lowest': '#ffffff',
        'surface-dim': '#cbdbf5',
        'surface-bright': '#f8f9ff',
        'surface-variant': '#d3e4fe',
        'surface-tint': '#565e74',
        'primary-container': '#131b2e',
        'secondary-container': '#2170e4',
        'on-primary-container': '#7c839b',
        'on-secondary-container': '#fefcff',
        'primary-fixed': '#dae2fd',
        'primary-fixed-dim': '#bec6e0',
        'secondary-fixed': '#d8e2ff',
        'secondary-fixed-dim': '#adc6ff',
        'tertiary-fixed': '#e1e0ff',
        'tertiary-fixed-dim': '#c0c1ff',
        'tertiary-container': '#07006c',
        'on-tertiary': '#ffffff',
        'on-tertiary-container': '#7073ff',
        'on-tertiary-fixed': '#07006c',
        'on-tertiary-fixed-variant': '#2f2ebe',
        'inverse-primary': '#bec6e0',
        'inverse-surface': '#213145',
        'inverse-on-surface': '#eaf1ff',
        outline: '#76777d',
        'outline-variant': '#c6c6cd',
        'text-heading': 'var(--color-text-heading)',
        'text-body': 'var(--color-text-body)',
        'on-primary-fixed': '#131b2e',
        'on-primary-fixed-variant': '#3f465c',
        'on-secondary-fixed': '#001a42',
        'on-secondary-fixed-variant': '#004395',
        surface: '#f8f9ff',
        error: '#ba1a1a',
        'on-error': '#ffffff',
        'error-container': '#ffdad6',
        'on-error-container': '#93000a',
        'status-todo': '#64748B',
        'status-in-progress': '#2563EB',
        'status-done': '#10B981'
      },
      fontSize: {
        'label-sm': ['12px', { lineHeight: '16px', fontWeight: '600' }],
        'headline-xl': ['36px', { lineHeight: '44px', letterSpacing: '-0.02em', fontWeight: '700' }],
        'headline-lg': ['24px', { lineHeight: '32px', letterSpacing: '-0.01em', fontWeight: '600' }],
        'headline-md': ['20px', { lineHeight: '28px', fontWeight: '600' }],
        'body-lg': ['18px', { lineHeight: '28px', fontWeight: '400' }],
        'body-md': ['16px', { lineHeight: '24px', fontWeight: '400' }],
        'body-sm': ['14px', { lineHeight: '20px', fontWeight: '400' }],
        'label-md': ['14px', { lineHeight: '20px', letterSpacing: '0.05em', fontWeight: '500' }]
      },
      borderRadius: {
        DEFAULT: '0.25rem',
        lg: '0.5rem',
        xl: '0.75rem',
        full: '9999px'
      },
      spacing: {
        'container-max': '1440px',
        'margin-desktop': '32px',
        'margin-mobile': '16px',
        gutter: '24px',
        base: '4px',
        'stack-sm': '8px',
        'stack-md': '16px',
        'stack-lg': '32px'
      },
      boxShadow: {
        soft: '0 15px 45px rgba(15, 23, 42, 0.08)',
        card: '0 8px 24px rgba(15, 23, 42, 0.08)'
      }
    }
  },
  plugins: []
};

export default config;

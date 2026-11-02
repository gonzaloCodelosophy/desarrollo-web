import { definePreset } from '@primeuix/themes';
import Aura from '@primeuix/themes/aura';

// importante aclarar que se heredan todos los estilos de AURA (viene por defecto en primeNG) y se personalizan los que se necesitan con definepreset, revisar doc PrimeNG

export const ClinicaTheme = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fff5f7',
      100: '#fee1e6',
      200: '#f7c9d4',
      300: '#f0adb9',
      400: '#eb8c9b',
      500: '#db6b7c',
      600: '#c54f60',
      700: '#a33948',
      800: '#832e3b',
      900: '#692530',
      950: '#3e1119',
    },
    colorScheme: {
      light: {
        primary: {
          color: '{primary.400}',
          contrastColor: '#ffffff',
          hoverColor: '{primary.500}',
          activeColor: '{primary.600}',
        },
        surface: {
          0: '#ffffff',
          50: '#fbfaf8',
          100: '#f5efeb',
          200: '#e8e2dd',
          300: '#d6d9dd',
          400: '#a8b4c0',
          500: '#75889c',
          600: '#54687d',
          700: '#394d61',
          800: '#26384a',
          900: '#162534',
          950: '#0b1623',
        },
      },
      dark: {
        primary: {
          color: '{primary.200}',
          contrastColor: '#0b1623',
          hoverColor: '{primary.100}',
          activeColor: '{primary.50}',
        },
        surface: {
          0: '#ffffff',
          50: '#f5f8fa',
          100: '#e2ebf2',
          200: '#c8d9e6',
          300: '#a8b8c8',
          400: '#c8d9e6',
          500: '#617a93',
          600: '#344b61',
          700: '#344b61',
          800: '#20374d',
          900: '#162b40',
          950: '#0b1623',
        },
      },
    },
  },
});

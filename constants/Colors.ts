/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * Paleta de cores inspirada no design do Partner Pace Run
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

// Cores principais inspiradas no site partner-pace-run.lovable.app
const primaryOrange = '#F26522';
const primaryOrangeLight = '#FF7A3A';
const primaryOrangeDark = '#D55A1A';

const tintColorLight = primaryOrange;
const tintColorDark = primaryOrangeLight;

export const Colors = {
  light: {
    text: '#2C3E50', // Cinza escuro para melhor legibilidade
    background: '#FFFFFF',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
    // Novas cores da paleta
    primary: primaryOrange,
    primaryLight: primaryOrangeLight,
    primaryDark: primaryOrangeDark,
    secondary: '#34495E',
    accent: '#E67E22',
    success: '#27AE60',
    warning: '#F39C12',
    error: '#E74C3C',
    textLight: '#7F8C8D',
    backgroundLight: '#F8F9FA',
    border: '#E9ECEF',
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
    // Versões escuras das cores
    primary: primaryOrangeLight,
    primaryLight: '#FF8A4A',
    primaryDark: primaryOrange,
    secondary: '#95A5A6',
    accent: '#F39C12',
    success: '#2ECC71',
    warning: '#F1C40F',
    error: '#E74C3C',
    textLight: '#BDC3C7',
    backgroundLight: '#2C3E50',
    border: '#34495E',
  },
};

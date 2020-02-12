import DarkBlueTheme from './DarkBlueTheme';
import DarkTheme from './DarkTheme';
import LightTheme from './LightTheme';

export enum ThemeKeys {
  darkBlue = 'darkBlue',
  light = 'light',
  dark = 'dark'
}

export const Themes = {
  [ThemeKeys.light]: LightTheme,
  [ThemeKeys.dark]: DarkTheme,
  [ThemeKeys.darkBlue]: DarkBlueTheme
};

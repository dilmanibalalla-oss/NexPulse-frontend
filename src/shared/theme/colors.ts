export const palette = {
  navy950: '#070B16',
  navy900: '#101828',
  navy800: '#172033',
  navy700: '#2A3850',

  blue400: '#8EABFF',
  blue500: '#6E8CFF',
  blue600: '#5672E6',
  blueWash: '#18243F',

  purple400: '#B3A6FF',
  purple500: '#9B8CFF',
  purpleWash: '#221E3C',

  green400: '#3DDC97',
  greenWash: '#102E26',

  red400: '#FF5C5C',
  redWash: '#3A1A22',

  grey300: '#C5CDD8',
  grey400: '#9AA3B2',
  grey500: '#6D7C93',
  greyWash: '#1C2431',

  white: '#F4F7FB',
} as const;

export const colors = {
  background: palette.navy950,
  surface: palette.navy900,
  surfaceRaised: palette.navy800,
  border: palette.navy700,
  overlay: 'rgba(7, 11, 22, 0.72)',
  transparent: 'transparent',

  text: palette.white,
  textMuted: palette.grey400,
  textSubtle: palette.grey500,
  textInverse: palette.navy950,

  accent: palette.blue500,
  accentPressed: palette.blue600,
  accentMuted: palette.blueWash,
  purple: palette.purple500,
  purpleMuted: palette.purpleWash,

  up: palette.green400,
  upMuted: palette.greenWash,
  down: palette.red400,
  downMuted: palette.redWash,
  unknown: palette.grey400,
  unknownMuted: palette.greyWash,

  danger: palette.red400,
  dangerMuted: palette.redWash,
  focus: palette.blue400,
} as const;

export type AppColor = keyof typeof colors;
export type PaletteColor = keyof typeof palette;

export const colors = {
  background: '#0B0F14',
  surface: '#141B24',
  surfaceRaised: '#1C2633',
  border: '#2C3A4A',
  text: '#E8EEF5',
  textMuted: '#93A0B0',
  accent: '#3DDC97',
  up: '#3DDC97',
  down: '#FF5C7A',
  unknown: '#E6B45A',
} as const;

export type AppColor = keyof typeof colors;

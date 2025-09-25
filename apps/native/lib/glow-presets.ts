import { type PresetConfig } from 'react-native-animated-glow';

export const confirmationGreen: PresetConfig = {
  cornerRadius: 20,
  outlineWidth: 2,
  borderColor: ['rgba(30, 255, 0, 1)', 'rgba(186, 255, 0, 1)', 'rgba(39, 255, 0, 1)'],
  backgroundColor: '#222',
  animationSpeed: 2,
  randomness: 0.01,
  borderSpeedMultiplier: 1,
  glowLayers: [
    {
      glowPlacement: 'behind',
      colors: ['#0fff47', 'rgba(255, 241, 0, 1)', '#00d646'],
      glowSize: 10,
      opacity: 0.05,
      speedMultiplier: 1,
      coverage: 1,
      relativeOffset: 0
    },
    {
      glowPlacement: 'behind',
      colors: ['#0fff47', 'rgba(255, 241, 0, 1)', '#00d646'],
      glowSize: 4,
      opacity: 0.1,
      speedMultiplier: 1,
      coverage: 1,
      relativeOffset: 0
    },
    {
      glowPlacement: 'inside',
      colors: ['rgba(99, 255, 0, 1)', 'rgba(180, 255, 65, 1)'],
      glowSize: [0, 20],
      opacity: 0.02,
      speedMultiplier: 1,
      coverage: 0.3,
      relativeOffset: 0
    },
    {
      glowPlacement: 'over',
      colors: ['rgba(135, 255, 0, 1)', 'rgba(255, 248, 196, 1)'],
      glowSize: [0, 1],
      opacity: 0.5,
      speedMultiplier: 1,
      coverage: 0.4,
      relativeOffset: 0
    }
  ]
};

export const cosmicNebula: PresetConfig = {
  cornerRadius: 10,
  outlineWidth: 3,
  borderColor: ['rgba(255, 171, 203, 1)', 'rgba(112, 49, 164, 1)', 'rgba(35, 21, 50, 1)'],
  backgroundColor: '#222',
  animationSpeed: 2,
  randomness: 0.01,
  borderSpeedMultiplier: 1,
  glowLayers: [
    {
      glowPlacement: 'behind',
      colors: ['#483D8B', '#8A2BE2', '#9370DB'],
      glowSize: 20,
      opacity: 0.1,
      speedMultiplier: 1,
      coverage: 1,
      relativeOffset: 0
    },
    {
      glowPlacement: 'behind',
      colors: ['rgba(185, 185, 250, 1)', 'rgba(199, 129, 199, 1)', 'rgba(77, 61, 175, 1)'],
      glowSize: [2, 6],
      opacity: 0.6,
      speedMultiplier: 1,
      coverage: 1,
      relativeOffset: 0
    },
    {
      glowPlacement: 'over',
      colors: ['rgba(185, 185, 250, 1)', 'rgba(225, 133, 242, 1)'],
      glowSize: [0, 12],
      opacity: 0.05,
      speedMultiplier: 1.2,
      coverage: 0.5,
      relativeOffset: 0
    },
    {
      glowPlacement: 'over',
      colors: ['rgba(185, 185, 250, 1)', 'rgba(255, 140, 255, 1)'],
      glowSize: [0, 1],
      opacity: 1,
      speedMultiplier: 1.2,
      coverage: 0.3,
      relativeOffset: 0.9
    }
  ]
};

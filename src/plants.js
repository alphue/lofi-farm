export const SPECIES = {
  wheat:      { id: 'wheat',      name: 'Buğday',           role: 'chords',  growMin: 20, startUnlocked: true,  color: '#c9a86a' },
  pumpkin:    { id: 'pumpkin',    name: 'Balkabağı',        role: 'bass',    growMin: 45, startUnlocked: true,  color: '#c97a4a' },
  sunflower:  { id: 'sunflower',  name: 'Ay çiçeği',        role: 'bell',    growMin: 30, startUnlocked: true,  color: '#d9b84e' },
  lavender:   { id: 'lavender',   name: 'Lavanta',          role: 'texture', growMin: 15, startUnlocked: true,  color: '#8f7fb8' },
  corn:       { id: 'corn',       name: 'Mısır',            role: 'hats',    growMin: 25, startUnlocked: false, color: '#d8c46e' },
  carrot:     { id: 'carrot',     name: 'Havuç',            role: 'pluck',   growMin: 35, startUnlocked: false, color: '#d98a5a' },
  blueberry:  { id: 'blueberry',  name: 'Yaban mersini',    role: 'keys',    growMin: 60, startUnlocked: false, color: '#4f6a94' },
  moonflower: { id: 'moonflower', name: 'Ay çiçeği gecesi', role: 'pad',     growMin: 90, startUnlocked: false, color: '#c4d2f0' },
};

export const START_SPECIES = Object.values(SPECIES)
  .filter(s => s.startUnlocked)
  .map(s => s.id);

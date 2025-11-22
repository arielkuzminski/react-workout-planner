import { WorkoutPlan } from '../types';

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'A',
    name: 'Trening A - Siła + Klatka/Plecy',
    exercises: [
      {
        id: 'A1',
        name: 'Hantle skos + (główne)',
        sets: 4,
        repRange: { min: 6, max: 10 },
        startWeight: 30,
        type: 'weight'
      },
      {
        id: 'A2',
        name: 'Wiosłowanie hantlem/bramą',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 45,
        type: 'weight'
      },
      {
        id: 'A3',
        name: 'Przysiad goblet',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 26,
        type: 'weight'
      },
      {
        id: 'A4',
        name: 'OHP hantlami',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 24,
        type: 'weight'
      },
      {
        id: 'A5',
        name: 'Ściąganie drążka/brama na plecy',
        sets: 3,
        repRange: { min: 10, max: 12 },
        startWeight: 55,
        type: 'weight'
      },
      {
        id: 'A6',
        name: 'Triceps brama',
        sets: 3,
        repRange: { min: 12, max: 15 },
        startWeight: 25,
        type: 'weight'
      },
      {
        id: 'A7',
        name: 'Biceps linka',
        sets: 3,
        repRange: { min: 10, max: 15 },
        startWeight: 22,
        type: 'weight'
      }
    ]
  },
  {
    id: 'B',
    name: 'Trening B - Nogi + Plecy + Ramiona',
    exercises: [
      {
        id: 'B1',
        name: 'Rumuński martwy na hantlach',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 50,
        type: 'weight'
      },
      {
        id: 'B2',
        name: 'Ściąganie drążka szeroko',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 60,
        type: 'weight'
      },
      {
        id: 'B3',
        name: 'Wykroki chodzone',
        sets: 3,
        repRange: { min: 10, max: 10 },
        startWeight: 18,
        type: 'weight'
      },
      {
        id: 'B4',
        name: 'Ławka płaska hantel',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 34,
        type: 'weight'
      },
      {
        id: 'B5',
        name: 'Face pull',
        sets: 3,
        repRange: { min: 15, max: 20 },
        startWeight: 18,
        type: 'weight'
      },
      {
        id: 'B6',
        name: 'Triceps maszyna',
        sets: 3,
        repRange: { min: 10, max: 12 },
        startWeight: 32,
        type: 'weight'
      },
      {
        id: 'B7',
        name: 'Biceps stojąc',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 24,
        type: 'weight'
      }
    ]
  },
  {
    id: 'C',
    name: 'Trening C - Klatka + Siła Całościowa',
    exercises: [
      {
        id: 'C1',
        name: 'Hantle skos ciężej niż w A',
        sets: 4,
        repRange: { min: 6, max: 8 },
        startWeight: 34,
        type: 'weight'
      },
      {
        id: 'C2',
        name: 'Wiosło brama ciężej',
        sets: 4,
        repRange: { min: 6, max: 8 },
        startWeight: 52,
        type: 'weight'
      },
      {
        id: 'C3',
        name: 'Hip thrust / glute bridge',
        sets: 4,
        repRange: { min: 10, max: 12 },
        startWeight: 80,
        type: 'weight'
      },
      {
        id: 'C4',
        name: 'Maszyna na barki / Arnold press',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 26,
        type: 'weight'
      },
      {
        id: 'C5',
        name: 'Unoszenie bokiem',
        sets: 3,
        repRange: { min: 12, max: 15 },
        startWeight: 10,
        type: 'weight'
      },
      {
        id: 'C6',
        name: 'Core: plank',
        sets: 3,
        repRange: { min: 45, max: 60 },
        startWeight: 0,
        type: 'time'
      }
    ]
  }
];

// Funkcja pomocnicza do pobrania planu treningowego
export const getWorkoutPlan = (id: 'A' | 'B' | 'C') => {
  return workoutPlans.find(plan => plan.id === id);
};

import { WorkoutPlan } from '../types';

export const workoutPlans: WorkoutPlan[] = [
  {
    id: 'A',
    name: 'Trening A - Siła + Klatka/Plecy',
    exercises: [
      {
        id: 'A1',
        name: 'Decline Chest Press Machine (Matrix)',
        sets: 4,
        repRange: { min: 6, max: 10 },
        startWeight: 30,
        type: 'weight'
      },
      {
        id: 'A2',
        name: 'Seated Cable Row (Neutral Grip)',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 55,
        type: 'weight'
      },
      {
        id: 'A3',
        name: 'Leg Press',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 100,
        type: 'weight'
      },
      {
        id: 'A4',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 15,
        type: 'weight'
      },
      {
        id: 'A5',
        name: 'Lat Pulldown (Medium Grip)',
        sets: 3,
        repRange: { min: 10, max: 12 },
        startWeight: 55,
        type: 'weight'
      },
      {
        id: 'A6',
        name: 'Cable Triceps Extension (Overhead)',
        sets: 3,
        repRange: { min: 12, max: 15 },
        startWeight: 29.3,
        type: 'weight'
      },
      {
        id: 'A7',
        name: 'Cable Biceps Curl (Facing Away, Low Pulley)',
        sets: 3,
        repRange: { min: 10, max: 15 },
        startWeight: 47.3,
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
        name: 'Dumbbell Romanian Deadlift',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 50,
        type: 'weight'
      },
      {
        id: 'B2',
        name: 'Lat Pulldown (Wide Grip)',
        sets: 4,
        repRange: { min: 8, max: 12 },
        startWeight: 60,
        type: 'weight'
      },
      {
        id: 'B3',
        name: 'Walking Lunges',
        sets: 3,
        repRange: { min: 10, max: 10 },
        startWeight: 14,
        type: 'weight'
      },
      {
        id: 'B4',
        name: 'Flat Dumbbell Bench Press',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 22.5,
        type: 'weight'
      },
      {
        id: 'B5',
        name: 'Face Pull (Cable)',
        sets: 3,
        repRange: { min: 15, max: 20 },
        startWeight: 17.5,
        type: 'weight'
      },
      {
        id: 'B6',
        name: 'Triceps Press Machine (Matrix)',
        sets: 3,
        repRange: { min: 10, max: 12 },
        startWeight: 84,
        type: 'weight'
      },
      {
        id: 'B7',
        name: 'EZ-Bar Biceps Curl',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 30,
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
        name: 'Decline Chest Press Machine (Matrix)',
        sets: 4,
        repRange: { min: 6, max: 8 },
        startWeight: 32.5,
        type: 'weight'
      },
      {
        id: 'C2',
        name: 'Seated Cable Row (Neutral Grip)',
        sets: 4,
        repRange: { min: 6, max: 8 },
        startWeight: 64,
        type: 'weight'
      },
      {
        id: 'C3',
        name: 'Hip Thrust (Barbell or Smith Machine)',
        sets: 4,
        repRange: { min: 10, max: 12 },
        startWeight: 80,
        type: 'weight'
      },
      {
        id: 'C4',
        name: 'Dumbbell Shoulder Press',
        sets: 3,
        repRange: { min: 8, max: 12 },
        startWeight: 15,
        type: 'weight'
      },
      {
        id: 'C5',
        name: 'Dumbbell Lateral Raise',
        sets: 3,
        repRange: { min: 12, max: 15 },
        startWeight: 10,
        type: 'weight'
      },
      {
        id: 'C6',
        name: 'Plank',
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

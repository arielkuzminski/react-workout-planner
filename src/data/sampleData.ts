import { WorkoutSession } from '../types';

/**
 * Generuje przykładowe dane z ostatnich 6 tygodni
 * 3 treningi tygodniowo (A→B→C)
 */
export const generateSampleData = (): WorkoutSession[] => {
  const sessions: WorkoutSession[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 42); // 6 tygodni wstecz

  const workoutOrder: ('A' | 'B' | 'C')[] = ['A', 'B', 'C'];
  let workoutIndex = 0;

  // Symulacja treningu co 2 dni
  for (let i = 0; i < 18; i++) {
    const sessionDate = new Date(startDate);
    sessionDate.setDate(sessionDate.getDate() + i * 2.5);

    const workoutType = workoutOrder[workoutIndex % 3];
    workoutIndex++;

    // Generowanie realistycznych danych - progresywny wzrost
    const baseMultiplier = 1 + (i * 0.02); // Stopniowy wzrost wydajności

    const session = generateSessionByType(workoutType, sessionDate, baseMultiplier);
    sessions.push(session);
  }

  return sessions;
};

function generateSessionByType(
  type: 'A' | 'B' | 'C',
  date: Date,
  baseMultiplier: number
): WorkoutSession {
  const id = `sample_${Date.now()}_${Math.random()}`;

  if (type === 'A') {
    return {
      id,
      date,
      workoutType: 'A',
      exercises: [
        {
          exerciseId: 'A1',
          weight: Math.round(30 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 7 + Math.random() * 3 },
            { setNumber: 2, reps: 7 + Math.random() * 3 },
            { setNumber: 3, reps: 6 + Math.random() * 3 },
            { setNumber: 4, reps: 6 + Math.random() * 3 }
          ]
        },
        {
          exerciseId: 'A2',
          weight: Math.round(45 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 9 + Math.random() * 3 },
            { setNumber: 2, reps: 9 + Math.random() * 3 },
            { setNumber: 3, reps: 8 + Math.random() * 3 },
            { setNumber: 4, reps: 8 + Math.random() * 3 }
          ]
        },
        {
          exerciseId: 'A3',
          weight: Math.round(26 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 10 + Math.random() * 2 },
            { setNumber: 3, reps: 9 + Math.random() * 2 },
            { setNumber: 4, reps: 9 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'A4',
          weight: Math.round(24 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 9 + Math.random() * 2 },
            { setNumber: 3, reps: 8 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'A5',
          weight: Math.round(55 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 11 + Math.random() * 1 },
            { setNumber: 2, reps: 11 + Math.random() * 1 },
            { setNumber: 3, reps: 10 + Math.random() * 1 }
          ]
        },
        {
          exerciseId: 'A6',
          weight: Math.round(25 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 13 + Math.random() * 2 },
            { setNumber: 2, reps: 13 + Math.random() * 2 },
            { setNumber: 3, reps: 12 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'A7',
          weight: Math.round(22 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 12 + Math.random() * 3 },
            { setNumber: 2, reps: 12 + Math.random() * 3 },
            { setNumber: 3, reps: 11 + Math.random() * 3 }
          ]
        }
      ]
    };
  } else if (type === 'B') {
    return {
      id,
      date,
      workoutType: 'B',
      exercises: [
        {
          exerciseId: 'B1',
          weight: Math.round(50 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 10 + Math.random() * 2 },
            { setNumber: 3, reps: 9 + Math.random() * 2 },
            { setNumber: 4, reps: 8 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'B2',
          weight: Math.round(60 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 10 + Math.random() * 2 },
            { setNumber: 3, reps: 9 + Math.random() * 2 },
            { setNumber: 4, reps: 9 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'B3',
          weight: Math.round(18 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 10 + Math.random() * 2 },
            { setNumber: 3, reps: 9 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'B4',
          weight: Math.round(34 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 9 + Math.random() * 2 },
            { setNumber: 3, reps: 8 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'B5',
          weight: Math.round(18 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 17 + Math.random() * 3 },
            { setNumber: 2, reps: 16 + Math.random() * 3 },
            { setNumber: 3, reps: 15 + Math.random() * 3 }
          ]
        },
        {
          exerciseId: 'B6',
          weight: Math.round(32 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 11 + Math.random() * 1 },
            { setNumber: 2, reps: 10 + Math.random() * 1 },
            { setNumber: 3, reps: 10 + Math.random() * 1 }
          ]
        },
        {
          exerciseId: 'B7',
          weight: Math.round(24 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 9 + Math.random() * 2 },
            { setNumber: 3, reps: 8 + Math.random() * 2 }
          ]
        }
      ]
    };
  } else {
    // Type C
    return {
      id,
      date,
      workoutType: 'C',
      exercises: [
        {
          exerciseId: 'C1',
          weight: Math.round(34 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 7 + Math.random() * 1 },
            { setNumber: 2, reps: 7 + Math.random() * 1 },
            { setNumber: 3, reps: 6 + Math.random() * 1 },
            { setNumber: 4, reps: 6 + Math.random() * 1 }
          ]
        },
        {
          exerciseId: 'C2',
          weight: Math.round(52 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 7 + Math.random() * 1 },
            { setNumber: 2, reps: 7 + Math.random() * 1 },
            { setNumber: 3, reps: 6 + Math.random() * 1 },
            { setNumber: 4, reps: 6 + Math.random() * 1 }
          ]
        },
        {
          exerciseId: 'C3',
          weight: Math.round(80 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 11 + Math.random() * 1 },
            { setNumber: 2, reps: 11 + Math.random() * 1 },
            { setNumber: 3, reps: 10 + Math.random() * 1 },
            { setNumber: 4, reps: 10 + Math.random() * 1 }
          ]
        },
        {
          exerciseId: 'C4',
          weight: Math.round(26 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 10 + Math.random() * 2 },
            { setNumber: 2, reps: 9 + Math.random() * 2 },
            { setNumber: 3, reps: 8 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'C5',
          weight: Math.round(10 * baseMultiplier * 2) / 2,
          sets: [
            { setNumber: 1, reps: 13 + Math.random() * 2 },
            { setNumber: 2, reps: 13 + Math.random() * 2 },
            { setNumber: 3, reps: 12 + Math.random() * 2 }
          ]
        },
        {
          exerciseId: 'C6',
          weight: 0, // Plank nie ma wagi, wartość to czas
          sets: [
            { setNumber: 1, reps: 47 + Math.random() * 5 },
            { setNumber: 2, reps: 45 + Math.random() * 5 },
            { setNumber: 3, reps: 43 + Math.random() * 5 }
          ]
        }
      ]
    };
  }
}

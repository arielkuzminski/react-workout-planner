import { SessionEntry, SessionSet, WorkoutSession } from '../types';
import { SessionStats } from './analyticsUtils';

const pluralPl = (count: number, forms: [string, string, string]): string => {
  const abs = Math.abs(count);
  const mod10 = abs % 10;
  const mod100 = abs % 100;
  if (abs === 1) return forms[0];
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return forms[1];
  return forms[2];
};

const formatMinutes = (count: number): string =>
  `${count} ${pluralPl(count, ['minuta', 'minuty', 'minut'])}`;

const formatSets = (count: number): string =>
  `${count} ${pluralPl(count, ['seria', 'serie', 'serii'])}`;

const formatExercises = (count: number): string =>
  `${count} ${pluralPl(count, ['ćwiczenie', 'ćwiczenia', 'ćwiczeń'])}`;

const formatVolume = (volume: number): string =>
  `${volume.toLocaleString('pl-PL')} kg wolumenu`;

const formatDuration = (sec: number): string => {
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m}:${String(s).padStart(2, '0')} min`;
};

const formatSet = (set: SessionSet, type: SessionEntry['exerciseType']): string | null => {
  if (type === 'weight') {
    const weight = set.weight ?? 0;
    const reps = set.reps ?? 0;
    if (!set.completed && weight === 0 && reps === 0) return null;
    return `${weight} kg × ${reps}`;
  }
  const duration = set.durationSec ?? 0;
  if (!set.completed && duration === 0) return null;
  return formatDuration(duration);
};

const formatEntry = (entry: SessionEntry): string | null => {
  const lines: string[] = [];
  let setNumber = 0;
  for (const set of entry.sets) {
    const formatted = formatSet(set, entry.exerciseType);
    if (formatted === null) continue;
    setNumber += 1;
    lines.push(`   ${setNumber}) ${formatted}`);
  }
  if (lines.length === 0) return null;
  return [`💪 ${entry.exerciseName}`, ...lines].join('\n');
};

export const buildSessionShareText = (
  session: WorkoutSession,
  stats: SessionStats,
  planLabel: string,
): string => {
  const dateSource = session.completedAt ?? session.endedAt ?? session.startedAt;
  const dateStr = new Date(dateSource).toLocaleDateString('pl-PL');

  const header = `🏆 ${planLabel} — ${dateStr}`;

  const statsLine = [
    `⏱ ${formatMinutes(stats.durationMinutes)}`,
    `💪 ${formatVolume(stats.totalVolume)}`,
    `📊 ${formatSets(stats.totalSets)}`,
    `🔁 ${formatExercises(stats.totalExercises)}`,
  ].join('  •  ');

  const entryBlocks = session.entries
    .map(formatEntry)
    .filter((block): block is string => block !== null);

  const sections: string[] = [`${header}\n${statsLine}`];

  if (entryBlocks.length > 0) {
    sections.push(entryBlocks.join('\n\n'));
  }

  if (stats.prs.length > 0) {
    const prLines = stats.prs.map((pr) => {
      const suffix =
        pr.type === 'weight'
          ? `${pr.previousBest} kg → ${pr.value} kg`
          : `${pr.previousBest} kg vol → ${pr.value} kg vol`;
      return `   • ${pr.exerciseName}: ${suffix}`;
    });
    sections.push(['🥇 Rekordy:', ...prLines].join('\n'));
  }

  sections.push('— Wysłane z Siłki');

  return sections.join('\n\n');
};

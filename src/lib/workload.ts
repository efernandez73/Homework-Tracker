import { toDateKey } from '@/lib/date';
import type { Assignment } from '@/types/assignment';

// Rough relative effort per assignment type, used to weigh workload rather
// than just counting how many things are due on a given day.
export const EFFORT_WEIGHTS: Record<Assignment['type'], number> = {
  Quiz: 1,
  Assignment: 2,
  Project: 4,
};

export type WorkloadLevel = 'Light' | 'Moderate' | 'Heavy';

export function getWorkloadLevel(score: number): WorkloadLevel {
  if (score >= 5) return 'Heavy';
  if (score >= 3) return 'Moderate';
  return 'Light';
}

export function getWorkloadByDate(assignments: Assignment[]) {
  const workload = new Map<string, number>();

  assignments.forEach((assignment) => {
    if (assignment.completed) {
      return;
    }

    const key = toDateKey(new Date(assignment.dueDate));
    const weight = EFFORT_WEIGHTS[assignment.type] ?? EFFORT_WEIGHTS.Assignment;

    workload.set(key, (workload.get(key) ?? 0) + weight);
  });

  return workload;
}

export function getUpcomingHeavyDays(assignments: Assignment[], daysAhead = 7) {
  const workload = getWorkloadByDate(assignments);
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const heavyDays: { date: Date; score: number }[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const date = new Date(today);
    date.setDate(date.getDate() + i);
    const score = workload.get(toDateKey(date)) ?? 0;

    if (getWorkloadLevel(score) === 'Heavy') {
      heavyDays.push({ date, score });
    }
  }

  return heavyDays;
}

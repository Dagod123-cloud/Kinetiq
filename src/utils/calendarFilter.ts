import { SchoolEvent, SchedulingConflict } from '../types/index.ts';

/**
 * Determines if a given school event should appear on a student's personalized calendar.
 * Rules:
 * 1. Cancelled events may still be shown with a cancelled badge or hidden according to preference, but active/rescheduled ones show.
 * 2. School-wide events ('ALL_SCHOOL') appear on EVERY student's calendar automatically.
 * 3. Events compulsory for specific year groups appear if the student belongs to that year group.
 * 4. Events that require registration ONLY appear if the student is registered.
 */
export function isEventOnStudentCalendar(
  event: SchoolEvent,
  studentYearGroup: number,
  registeredEventIds: string[]
): boolean {
  // Personal events created by the student or user always show on their personal calendar
  if (event.isPersonal) {
    return true;
  }

  // If registration is required, student MUST be registered to see it on their personal calendar
  if (event.requiresRegistration) {
    return registeredEventIds.includes(event.id);
  }

  // School-wide compulsory / celebration events
  if (event.audience === 'ALL_SCHOOL') {
    return true;
  }

  // Targeted year group events (e.g. Year 10 Careers Workshop, Year 12 UCAS Prep)
  if (event.audience === 'YEAR_GROUP' && event.targetYearGroups && event.targetYearGroups.length > 0) {
    return event.targetYearGroups.includes(studentYearGroup);
  }

  // Fallback if requiresRegistration is false and audience is REGISTERED_ONLY, check registration
  return registeredEventIds.includes(event.id);
}

/**
 * Converts "HH:MM" string into minutes from midnight for easy range comparison.
 */
export function timeToMinutes(timeStr: string): number {
  if (!timeStr) return 0;
  const [hours, minutes] = timeStr.split(':').map(Number);
  return (isNaN(hours) ? 0 : hours) * 60 + (isNaN(minutes) ? 0 : minutes);
}

/**
 * Detects scheduling conflicts where two active events share the same date and location,
 * and their time windows overlap.
 */
export function detectSchedulingConflicts(events: SchoolEvent[]): SchedulingConflict[] {
  const conflicts: SchedulingConflict[] = [];
  const activeEvents = events.filter(e => e.status !== 'CANCELLED');

  for (let i = 0; i < activeEvents.length; i++) {
    for (let j = i + 1; j < activeEvents.length; j++) {
      const e1 = activeEvents[i];
      const e2 = activeEvents[j];

      // Must be on the exact same date
      if (e1.date !== e2.date) continue;

      // Must share the exact location (case insensitive comparison)
      if (e1.location.trim().toLowerCase() !== e2.location.trim().toLowerCase()) continue;

      // Check time overlap: (StartA < EndB) and (EndA > StartB)
      const e1Start = timeToMinutes(e1.startTime);
      const e1End = timeToMinutes(e1.endTime);
      const e2Start = timeToMinutes(e2.startTime);
      const e2End = timeToMinutes(e2.endTime);

      if (e1Start < e2End && e1End > e2Start) {
        conflicts.push({
          eventId1: e1.id,
          eventId2: e2.id,
          event1Title: e1.title,
          event2Title: e2.title,
          date: e1.date,
          location: e1.location,
          overlapPeriod: `${Math.max(e1Start, e2Start) === e1Start ? e1.startTime : e2.startTime} - ${Math.min(e1End, e2End) === e1End ? e1.endTime : e2.endTime}`
        });
      }
    }
  }

  return conflicts;
}

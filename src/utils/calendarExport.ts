// Utility to export school events into standard RFC 5545 iCalendar (.ics) files
// Supports direct import into Apple Calendar, Google Calendar, Outlook, and mobile calendar apps

import { SchoolEvent } from '../types/index.ts';

function formatIcsDateTime(dateStr: string, timeStr: string): string {
  // dateStr is 'YYYY-MM-DD', timeStr is 'HH:MM'
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = timeStr.replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

export function generateIcsContent(events: SchoolEvent[], calendarName: string = 'KinetiQ School Events'): string {
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//SMR TechNova//KinetiQ Planner//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    `X-WR-CALNAME:${calendarName}`,
    'X-WR-TIMEZONE:UTC',
    'X-WR-CALDESC:Events scheduled via KinetiQ Planner (Powered by SMR TechNova)'
  ];

  events.forEach((event) => {
    const startIso = formatIcsDateTime(event.date, event.startTime || '09:00');
    const endIso = formatIcsDateTime(event.date, event.endTime || '10:00');
    const uid = `${event.id}@kinetiq.smrtechnova.edu`;
    const summary = event.compulsory ? `[COMPULSORY] ${event.title}` : event.title;
    const description = [
      event.description,
      `Category: ${event.category}`,
      event.compulsory ? 'Status: Mandatory School Activity' : '',
      event.houseAffiliation && event.houseAffiliation !== 'ALL_HOUSES' ? `House Affiliation: ${event.houseAffiliation}` : '',
      `Organiser: ${event.organizerName}`,
      'Managed by KinetiQ Planner • SMR TechNova'
    ].filter(Boolean).join('\\n');

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${uid}`);
    lines.push(`DTSTAMP:${dtStamp}`);
    lines.push(`DTSTART:${startIso}`);
    lines.push(`DTEND:${endIso}`);
    lines.push(`SUMMARY:${summary.replace(/,/g, '\\,')}`);
    lines.push(`DESCRIPTION:${description.replace(/,/g, '\\,')}`);
    lines.push(`LOCATION:${(event.location || 'School Campus').replace(/,/g, '\\,')}`);
    lines.push(`CATEGORIES:${event.category}`);
    lines.push('STATUS:CONFIRMED');

    // Add a reminder 30 minutes before
    lines.push('BEGIN:VALARM');
    lines.push('TRIGGER:-PT30M');
    lines.push('ACTION:DISPLAY');
    lines.push(`DESCRIPTION:Reminder: ${event.title}`);
    lines.push('END:VALARM');

    lines.push('END:VEVENT');
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

export function downloadIcsFile(events: SchoolEvent[], filename: string = 'KinetiQ_School_Schedule.ics'): void {
  if (!events || events.length === 0) return;
  const icsData = generateIcsContent(events);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// Generate Google Calendar one-click direct URL for single event
export function getGoogleCalendarUrl(event: SchoolEvent): string {
  const startIso = formatIcsDateTime(event.date, event.startTime || '09:00');
  const endIso = formatIcsDateTime(event.date, event.endTime || '10:00');
  const text = encodeURIComponent(event.compulsory ? `[COMPULSORY] ${event.title}` : event.title);
  const details = encodeURIComponent(`${event.description}\n\nCategory: ${event.category}\nVenue: ${event.location}\nPowered by KinetiQ Planner`);
  const location = encodeURIComponent(event.location || 'School Campus');
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${startIso}/${endIso}&details=${details}&location=${location}`;
}

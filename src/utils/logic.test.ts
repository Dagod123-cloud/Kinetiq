import test from 'node:test';
import assert from 'node:assert/strict';
import { isEventOnStudentCalendar, detectSchedulingConflicts, timeToMinutes } from './calendarFilter.ts';
import { scanTextForModeration } from './moderation.ts';
import { computeFeedbackStats } from './feedbackStats.ts';
import { SchoolEvent, Feedback } from '../types/index.ts';

const mockEventSchoolWide: SchoolEvent = {
  id: 'evt-1',
  title: 'Annual Sports Day & Funfair',
  description: 'Full school athletic competitions, food trucks, and house tournaments.',
  category: 'Sports',
  date: '2026-11-20',
  startTime: '09:00',
  endTime: '15:00',
  location: 'School Main Field & Track',
  audience: 'ALL_SCHOOL',
  requiresRegistration: false,
  capacity: 800,
  registeredStudentIds: [],
  registrationDeadline: '2026-11-19 23:59',
  status: 'UPCOMING',
  organizerName: 'PE & Sports Department'
};

const mockEventYear10Compulsory: SchoolEvent = {
  id: 'evt-2',
  title: 'Year 10 Careers & Apprenticeship Fair',
  description: 'Mandatory workshop exploring GCSE pathways, college options, and industry talks.',
  category: 'Academic & Careers',
  date: '2026-11-25',
  startTime: '10:00',
  endTime: '12:30',
  location: 'Senior Hall',
  audience: 'YEAR_GROUP',
  targetYearGroups: [10],
  requiresRegistration: false,
  capacity: 180,
  registeredStudentIds: [],
  registrationDeadline: '2026-11-24 17:00',
  status: 'UPCOMING',
  organizerName: 'Careers Guidance Office'
};

const mockEventRegistrationRequired: SchoolEvent = {
  id: 'evt-3',
  title: 'Robotics Coding Hackathon',
  description: 'Build an autonomous maze-solver rover in teams.',
  category: 'STEM & Robotics',
  date: '2026-11-28',
  startTime: '13:00',
  endTime: '16:30',
  location: 'Tech Lab 2',
  audience: 'REGISTERED_ONLY',
  requiresRegistration: true,
  capacity: 30,
  registeredStudentIds: ['stu-maya-10'],
  registrationDeadline: '2026-11-27 18:00',
  status: 'UPCOMING',
  organizerName: 'STEM Club'
};

test('isEventOnStudentCalendar: school-wide events appear on any student calendar', () => {
  const appearsForYear8 = isEventOnStudentCalendar(mockEventSchoolWide, 8, []);
  const appearsForYear10 = isEventOnStudentCalendar(mockEventSchoolWide, 10, []);
  assert.equal(appearsForYear8, true);
  assert.equal(appearsForYear10, true);
});

test('isEventOnStudentCalendar: compulsory year-group events only appear for matching year group', () => {
  const appearsForYear10 = isEventOnStudentCalendar(mockEventYear10Compulsory, 10, []);
  const appearsForYear8 = isEventOnStudentCalendar(mockEventYear10Compulsory, 8, []);
  const appearsForYear12 = isEventOnStudentCalendar(mockEventYear10Compulsory, 12, []);

  assert.equal(appearsForYear10, true);
  assert.equal(appearsForYear8, false);
  assert.equal(appearsForYear12, false);
});

test('isEventOnStudentCalendar: registration-required events only appear when registered', () => {
  const notRegistered = isEventOnStudentCalendar(mockEventRegistrationRequired, 10, []);
  const registered = isEventOnStudentCalendar(mockEventRegistrationRequired, 10, ['evt-3']);

  assert.equal(notRegistered, false);
  assert.equal(registered, true);
});

test('timeToMinutes converts HH:MM properly', () => {
  assert.equal(timeToMinutes('09:30'), 570);
  assert.equal(timeToMinutes('00:00'), 0);
  assert.equal(timeToMinutes('14:15'), 855);
});

test('detectSchedulingConflicts flags overlapping events at the same venue', () => {
  const eventA: SchoolEvent = {
    ...mockEventSchoolWide,
    id: 'a',
    date: '2026-11-15',
    location: 'Main Gym',
    startTime: '10:00',
    endTime: '12:00'
  };

  const eventB: SchoolEvent = {
    ...mockEventSchoolWide,
    id: 'b',
    date: '2026-11-15',
    location: 'Main Gym',
    startTime: '11:30', // overlaps with A!
    endTime: '13:00'
  };

  const conflicts = detectSchedulingConflicts([eventA, eventB]);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].location, 'Main Gym');
});

test('detectSchedulingConflicts ignores non-overlapping events', () => {
  const eventA: SchoolEvent = {
    ...mockEventSchoolWide,
    id: 'a',
    date: '2026-11-15',
    location: 'Main Gym',
    startTime: '10:00',
    endTime: '11:00'
  };

  const eventB: SchoolEvent = {
    ...mockEventSchoolWide,
    id: 'b',
    date: '2026-11-15',
    location: 'Main Gym',
    startTime: '11:30', // gap of 30 mins, no overlap
    endTime: '13:00'
  };

  const conflicts = detectSchedulingConflicts([eventA, eventB]);
  assert.equal(conflicts.length, 0);
});

test('scanTextForModeration: approves constructive feedback', () => {
  const res = scanTextForModeration('The science experiments were super fun, but the room was quite cold.');
  assert.equal(res.approved, true);
  assert.equal(res.flaggedTerms.length, 0);
});

test('scanTextForModeration: catches offensive language and provides friendly reason', () => {
  const res = scanTextForModeration('This event was stupid and the organizer is an idiot.');
  assert.equal(res.approved, false);
  assert.ok(res.flaggedTerms.includes('stupid'));
  assert.ok(res.flaggedTerms.includes('idiot'));
  assert.ok(res.reason.includes('respectful'));
});

test('computeFeedbackStats: aggregates recommendation counts and percentages', () => {
  const reviews: Feedback[] = [
    {
      id: 'f1',
      eventId: 'evt-1',
      eventTitle: 'Sports Day',
      liked: 'Great music and games',
      disliked: 'Long queue for food',
      recommend: true,
      rating: 5,
      timestamp: '2026-11-01',
      isAnonymous: true
    },
    {
      id: 'f2',
      eventId: 'evt-1',
      eventTitle: 'Sports Day',
      liked: 'Tug of war',
      disliked: 'Hot weather, need more shade',
      recommend: true,
      rating: 4,
      timestamp: '2026-11-01',
      isAnonymous: true
    },
    {
      id: 'f3',
      eventId: 'evt-1',
      eventTitle: 'Sports Day',
      liked: 'Meeting friends',
      disliked: 'Too loud near the speaker',
      recommend: false,
      rating: 2,
      timestamp: '2026-11-01',
      isAnonymous: true
    },
    {
      id: 'f4',
      eventId: 'evt-1',
      eventTitle: 'Sports Day',
      liked: 'Ice cream stand',
      disliked: 'Ran out of water cups',
      recommend: true,
      rating: 5,
      timestamp: '2026-11-01',
      isAnonymous: true
    }
  ];

  const stats = computeFeedbackStats(reviews);
  assert.equal(stats.totalResponses, 4);
  assert.equal(stats.recommendYesCount, 3);
  assert.equal(stats.recommendNoCount, 1);
  assert.equal(stats.percentRecommendYes, 75);
  assert.equal(stats.percentRecommendNo, 25);
  assert.equal(stats.averageRating, 4.0);
});

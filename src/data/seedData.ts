import {
  SchoolEvent,
  Feedback,
  EventSuggestion,
  StudentProfile,
  OrganiserProfile,
  NotificationItem,
  ConsentFormTemplate,
  ConsentSubmission,
  SchoolStructure
} from '../types/index.ts';

export const INITIAL_SCHOOLS: SchoolStructure[] = [
  {
    id: 'school-st-marys',
    name: "St' Mary's Private High School",
    isDefault: true,
    yearGroups: [
      { year: 7, classes: ['7-A', '7-B', '7-C', '7-Alpha'] },
      { year: 8, classes: ['8-A', '8-B', '8-C', '8-Honours'] },
      { year: 9, classes: ['9-A', '9-B', '9-C', '9-STEM', '9-Arts'] },
      { year: 10, classes: ['10-A', '10-B', '10-C', '10-Science', '10-Business'] },
      { year: 11, classes: ['11-A', '11-B', '11-C', '11-Accelerated'] },
      { year: 12, classes: ['12-A', '12-B', '12-STEM', '12-Humanities'] },
      { year: 13, classes: ['13-A', '13-B', '13-Senior'] }
    ],
    sections: ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega']
  },
  {
    id: 'school-technova-intl',
    name: 'TechNova International High',
    isDefault: false,
    yearGroups: [
      { year: 9, classes: ['9-Tech', '9-Cyber', '9-Media'] },
      { year: 10, classes: ['10-AI', '10-Robotics', '10-Design', '10-Foundations'] },
      { year: 11, classes: ['11-PreMed', '11-Engineering', '11-Data', '11-Venture'] },
      { year: 12, classes: ['12-AdvComputing', '12-FinTech', '12-Biotech'] }
    ],
    sections: ['Alpha', 'Beta', 'Gamma']
  },
  {
    id: 'school-oakridge',
    name: 'Oakridge Secondary School',
    isDefault: false,
    yearGroups: [
      { year: 7, classes: ['7-Oak', '7-Pine', '7-Elm'] },
      { year: 8, classes: ['8-Oak', '8-Pine', '8-Elm'] },
      { year: 9, classes: ['9-Oak', '9-Pine', '9-Cedar'] },
      { year: 10, classes: ['10-Oak', '10-Pine', '10-Cedar'] },
      { year: 11, classes: ['11-Oak', '11-Pine'] },
      { year: 12, classes: ['12-Oak', '12-Pine'] },
      { year: 13, classes: ['13-Senior'] }
    ],
    sections: ['Alpha', 'Beta', 'Gamma', 'Delta']
  }
];

export const SCHOOL_YEAR_GROUPS = [7, 8, 9, 10, 11, 12, 13];
export const SCHOOL_CLASSES = ['7-A', '7-B', '8-A', '8-B', '9-A', '9-B', '10-A', '10-B', '10-Science', '11-A', '11-B', '12-A', '12-B', '13-A', '13-B'];
export const SCHOOL_SECTIONS = ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'];

// Exactly one simplified student demo account for quick testing & evaluation
export const INITIAL_STUDENTS: StudentProfile[] = [
  {
    id: 'stu-demo',
    name: 'Alex Morgan',
    email: 'student.demo@stmarys.edu',
    schoolName: "St' Mary's Private High School",
    yearGroup: 10,
    avatarSeed: 'AlexMorgan',
    studentIdNumber: 'SM-2026-1042',
    house: 'Sapphire',
    houseVerified: true,
    className: '10-A',
    sectionName: 'Alpha',
    role: 'STUDENT',
    points: 120
  }
];

export const INITIAL_ORGANISERS: OrganiserProfile[] = [
  {
    id: 'org-sarang',
    name: 'Sarang (Lead Administrator)',
    email: '1300-sarang-smr@smgeducation.org',
    schoolName: "St' Mary's Private High School",
    role: 'ORGANISER',
    title: 'Principal & Lead Administrator',
    department: 'School Leadership & SMR TechNova',
    avatarSeed: 'Sarang'
  }
];

// Official School Events Across Year Groups (Sports Day, Talent Show, Dubai Trip, Awarding Ceremony, etc.)
export const INITIAL_EVENTS: SchoolEvent[] = [
  {
    id: 'evt-sports-day-2026',
    title: 'Annual Inter-House Sports Day & Athletics Championship',
    description: 'The premier whole-school sports festival. Features 100m/200m track sprints, 4x100m relay, long jump, shot put, and the legendary Inter-House tug-of-war across Crimson, Tiger, Amber, Lime, and Sapphire houses.',
    category: 'Sports',
    date: '2026-11-20',
    startTime: '09:00',
    endTime: '15:30',
    location: "St' Mary's Olympic Athletics Stadium & Oval Track",
    audience: 'ALL_SCHOOL',
    targetYearGroups: [7, 8, 9, 10, 11, 12, 13],
    requiresRegistration: false,
    capacity: 1200,
    registeredStudentIds: [],
    registrationDeadline: '2026-11-19 18:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)',
    featured: true,
    houseAffiliation: 'ALL_HOUSES'
  },
  {
    id: 'evt-talent-show-2026',
    title: 'St\' Mary’s Got Talent: Annual Whole-School Showcase',
    description: 'The ultimate stage for our school community! Live student musical performances, vocal solos, classical dance, dramatic monologues, and comedy. Judged by faculty with audience interactive voting.',
    category: 'Arts & Drama',
    date: '2026-11-27',
    startTime: '16:00',
    endTime: '19:30',
    location: 'Main School Performing Arts Auditorium',
    audience: 'ALL_SCHOOL',
    targetYearGroups: [7, 8, 9, 10, 11, 12, 13],
    requiresRegistration: true,
    capacity: 450,
    registeredStudentIds: [],
    registrationDeadline: '2026-11-25 20:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)',
    featured: true
  },
  {
    id: 'evt-dubai-trip-2026',
    title: 'International School Trip to Dubai (Innovation, STEM & Culture)',
    description: 'An unforgettable 5-day educational expedition to Dubai, UAE. Highlights include guided VIP tours of the Museum of the Future, EXPO City sustainability pavilions, desert astronomy camp, and university tech research labs.',
    category: 'Academic & Careers',
    date: '2026-12-05',
    startTime: '07:30',
    endTime: '21:00',
    location: 'Dubai, United Arab Emirates (Departure: Terminal 3)',
    audience: 'YEAR_GROUP',
    targetYearGroups: [10, 11, 12, 13],
    requiresRegistration: true,
    capacity: 60,
    registeredStudentIds: [],
    registrationDeadline: '2026-11-25 17:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)',
    featured: true,
    requiresParentConsent: true,
    consentFormId: 'cf-dubai-trip'
  },
  {
    id: 'evt-awards-ceremony-2026',
    title: 'Annual Academic & Leadership Awarding Ceremony',
    description: 'Celebrating high academic distinction, sports achievements, community service honours, and the prestigious SMR TechNova Innovation Cup. Parents, guardians, and students cordially invited.',
    category: 'Leadership & Council',
    date: '2026-12-18',
    startTime: '17:00',
    endTime: '20:00',
    location: 'Grand Heritage Assembly Hall & Quadrangle',
    audience: 'ALL_SCHOOL',
    targetYearGroups: [7, 8, 9, 10, 11, 12, 13],
    requiresRegistration: false,
    capacity: 800,
    registeredStudentIds: [],
    registrationDeadline: '2026-12-16 12:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)',
    featured: true
  },
  {
    id: 'evt-junior-science-fair',
    title: 'Year 7 & 8 Junior Science Fair & Discovery Expo',
    description: 'Interactive STEM demonstrations, volcano chemical reactions, renewable wind turbine prototypes, and microscopic biological discoveries presented by Year 7 and 8 science cohorts.',
    category: 'STEM & Robotics',
    date: '2026-11-18',
    startTime: '13:00',
    endTime: '15:30',
    location: 'Science Atrium & Laboratory Wing B',
    audience: 'YEAR_GROUP',
    targetYearGroups: [7, 8],
    requiresRegistration: false,
    capacity: 250,
    registeredStudentIds: [],
    registrationDeadline: '2026-11-17 17:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)'
  },
  {
    id: 'evt-middle-sports-cup',
    title: 'Year 9 & 10 Inter-Class Basketball & Volleyball Cup',
    description: 'Fast-paced round-robin tournament between Year 9 and Year 10 class cohorts. Trophies for championship team, fair play award, and top tournament scorer.',
    category: 'Sports',
    date: '2026-11-23',
    startTime: '14:30',
    endTime: '17:00',
    location: 'Indoor Sports Arena & Court 1',
    audience: 'YEAR_GROUP',
    targetYearGroups: [9, 10],
    requiresRegistration: true,
    capacity: 120,
    registeredStudentIds: [],
    registrationDeadline: '2026-11-21 18:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)'
  },
  {
    id: 'evt-senior-careers-symposium',
    title: 'Year 11 & 12 Pre-University & Careers Symposium',
    description: 'Direct panel discussions with university admissions directors, medicine & law professionals, AI tech founders, and apprenticeship advisors. Personal statement breakout workshops included.',
    category: 'Academic & Careers',
    date: '2026-11-30',
    startTime: '10:00',
    endTime: '14:00',
    location: 'Sixth Form Lecture Theatre & Conference Suite',
    audience: 'YEAR_GROUP',
    targetYearGroups: [11, 12, 13],
    requiresRegistration: true,
    capacity: 180,
    registeredStudentIds: [],
    registrationDeadline: '2026-11-28 16:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)'
  },
  {
    id: 'evt-winter-charity-carnival',
    title: 'Winter Charity Carnival & Festival of Lights',
    description: 'Community holiday bazaar featuring hot cocoa stalls, handcrafted goods, charity bake sales, acoustic choir carols, and student council games raising funds for local children’s hospitals.',
    category: 'Community & Charity',
    date: '2026-12-14',
    startTime: '15:30',
    endTime: '19:00',
    location: 'Central School Courtyard & Covered Walkway',
    audience: 'ALL_SCHOOL',
    targetYearGroups: [7, 8, 9, 10, 11, 12, 13],
    requiresRegistration: false,
    capacity: 600,
    registeredStudentIds: [],
    registrationDeadline: '2026-12-13 12:00',
    status: 'UPCOMING',
    organizerName: 'Sarang (Lead Administrator)'
  }
];

export const INITIAL_CONSENT_TEMPLATES: ConsentFormTemplate[] = [
  {
    id: 'cf-trip-1',
    eventId: 'evt-trip-1',
    eventTitle: 'Year 10 Natural History Museum & Geology Field Trip',
    title: 'Official Parental / Guardian Excursion Permission Form',
    activityOverview: 'Students will travel by certified private chartered coach from St\' Mary’s Private High School to the National Museum of Natural History. The excursion includes curator-led gallery tours, handling geological specimens in research labs, and a lunch break in the supervised museum gardens.',
    date: '2026-12-04',
    location: 'National Museum of Natural History (Charter Coach Departure)',
    departureTime: '08:30 (Sharp from School Bus Bay)',
    returnTime: '17:00 (Return to School Main Gates)',
    supervisingStaff: 'Dr. Angela Patel (Lead), Mr. Mark Edwards, Ms. Clara Vance (Ratio 1:12)',
    emergencyProcedures: 'First Aid certified staff and school mobile dispatch unit will accompany all groups. Nearest hospital: City General Emergency Wing.',
    medicalConditionsRequired: true,
    submissionDeadline: '2026-12-01 17:00',
    rulesAndExpectations: [
      'Students must remain in designated study groups and wear high-visibility school lanyards at all times.',
      'Packed lunch required or pre-ordered school bagged lunch.',
      'School code of conduct applies during transit and inside museum premises.'
    ]
  },
  {
    id: 'cf-camp-1',
    eventId: 'evt-camp-1',
    eventTitle: 'Senior Leadership Adventure & Kayaking Camp',
    title: 'Parental Consent & Water Safety Risk Acknowledgment',
    activityOverview: 'Two-day outdoor leadership camp at Lakeside Outdoor Activity Centre. Activities include supervised flatwater kayak touring, team raft building, orienteering, and evening campfires.',
    date: '2026-12-11',
    location: 'Lakeside Outdoor Activity Centre',
    departureTime: '07:30',
    returnTime: '18:00 (Following day)',
    supervisingStaff: 'Mr. David Harrison, Coach Davies, Certified BCU Kayak Instructors',
    emergencyProcedures: 'Licensed lifeguards on water at all times; mandatory buoyancy vests fitted before pontoon entry.',
    medicalConditionsRequired: true,
    submissionDeadline: '2026-12-05 16:00',
    rulesAndExpectations: [
      'All participants must wear approved CE-marked lifejackets during any watercraft sessions.',
      'Strict curfew of 22:00 in dormitory cabins.',
      'Mobile phones deposited in lockbox during team exercises.'
    ]
  }
];

export const INITIAL_CONSENT_SUBMISSIONS: ConsentSubmission[] = [
  {
    id: 'sub-maya-trip-1',
    eventId: 'evt-trip-1',
    studentId: 'stu-maya-10',
    studentName: 'Maya Chen',
    yearGroup: 10,
    className: '10-A',
    sectionName: 'Alpha',
    parentGuardianName: 'Eleanor Chen',
    parentEmail: 'parent.chen@example.com',
    emergencyPhone: '+44 7700 900142',
    medicalNotes: 'Carries mild asthma inhaler in backpack.',
    dietaryRestrictions: 'Vegetarian',
    permissionGranted: true,
    electronicSignature: 'Eleanor Chen (E-Signed)',
    signedAt: '2026-11-04 14:22',
    status: 'APPROVED'
  }
];

export const INITIAL_FEEDBACK: Feedback[] = [
  {
    id: 'fb-1',
    eventId: 'evt-7',
    eventTitle: 'Science Fair & Maker Expo 2026',
    liked: 'The live liquid nitrogen demo and student VR projects were extraordinary! Everyone was so passionate.',
    disliked: 'The central atrium was very packed between 12 and 1 PM; difficult to walk between demo booths.',
    recommend: true,
    rating: 5,
    timestamp: '2026-11-02 16:30',
    isAnonymous: true
  },
  {
    id: 'fb-2',
    eventId: 'evt-7',
    eventTitle: 'Science Fair & Maker Expo 2026',
    liked: 'Hands-on experiments where we could solder LED badges ourselves.',
    disliked: 'Soldering station ran out of circuit kits midway through the afternoon.',
    recommend: true,
    rating: 4,
    timestamp: '2026-11-02 17:05',
    isAnonymous: true
  },
  {
    id: 'fb-3',
    eventId: 'evt-7',
    eventTitle: 'Science Fair & Maker Expo 2026',
    liked: 'High quality student work and engaging judges.',
    disliked: 'Microphone was muffled during the keynote speeches at 11 AM.',
    recommend: true,
    rating: 4,
    timestamp: '2026-11-02 18:12',
    isAnonymous: true
  },
  {
    id: 'fb-4',
    eventId: 'evt-7',
    eventTitle: 'Science Fair & Maker Expo 2026',
    liked: 'Free popcorn and friendly teacher volunteers.',
    disliked: 'Too loud inside the small lab rooms, gave some of us a headache.',
    recommend: false,
    rating: 3,
    timestamp: '2026-11-02 19:40',
    isAnonymous: true
  },
  {
    id: 'fb-5',
    eventId: 'evt-8',
    eventTitle: 'Halloween Charity Costume Night',
    liked: 'The haunted maze trivia and student DJ playlist kept the dancefloor full all evening.',
    disliked: 'Queues for apple bobbing and punch refreshments took almost 25 minutes.',
    recommend: true,
    rating: 5,
    timestamp: '2026-10-31 21:15',
    isAnonymous: true
  },
  {
    id: 'fb-6',
    eventId: 'evt-8',
    eventTitle: 'Halloween Charity Costume Night',
    liked: 'Costume contest categories were creative and fair; loved the house competition spirit.',
    disliked: 'Gymnasium acoustics made it hard to hear the announcer when winners were called.',
    recommend: true,
    rating: 4,
    timestamp: '2026-10-31 22:00',
    isAnonymous: true
  }
];

export const INITIAL_SUGGESTIONS: EventSuggestion[] = [
  {
    id: 'sug-1',
    title: 'Inter-School Esports & Coding Tournament',
    category: 'STEM & Robotics',
    description: 'Host a Saturday LAN event with Super Smash Bros, Rocket League, and a 2-hour speed-coding challenge for junior and senior teams.',
    estimatedScale: 'Large (Whole School)',
    studentYearGroup: 10,
    upvotes: 42,
    upvotedByMe: true,
    status: 'Approved & Scheduled',
    organizerNotes: 'Approved! Scheduled for the spring term in collaboration with Computing faculty and Student Council.',
    createdAt: '2026-10-24'
  },
  {
    id: 'sug-2',
    title: 'Cultural Cuisine & World Heritage Food Fair',
    category: 'Community & Charity',
    description: 'Students and families bring traditional dishes from their cultural backgrounds to share in the school quad, with proceeds donated to UNICEF.',
    estimatedScale: 'Large (Whole School)',
    studentYearGroup: 9,
    upvotes: 38,
    upvotedByMe: false,
    status: 'Under Consideration',
    organizerNotes: 'Hygiene and allergen logistics currently under review by catering staff.',
    createdAt: '2026-10-28'
  },
  {
    id: 'sug-3',
    title: 'Acoustic Open Mic & Poetry Slam in the Library Courtyard',
    category: 'Arts & Drama',
    description: 'Casual lunchtime session with fairy lights, hot cocoa, acoustic guitars, and spoken-word poetry.',
    estimatedScale: 'Medium (Year Group)',
    studentYearGroup: 11,
    upvotes: 29,
    upvotedByMe: false,
    status: 'Feasibility Review',
    organizerNotes: 'Reviewing weather contingency plan and sound levels adjacent to exam halls.',
    createdAt: '2026-11-01'
  }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Consent Form Required: Museum Field Trip',
    message: 'Parental consent form is now open for Year 10 Museum Excursion on Dec 4. Please have your parent/guardian e-sign before Dec 1.',
    type: 'CONSENT_REQUEST',
    eventId: 'evt-trip-1',
    timestamp: '1 hour ago',
    read: false
  },
  {
    id: 'notif-2',
    title: 'Event Rescheduled: Inter-House Debate',
    message: 'The Senior Debate Championship has been postponed to Nov 26th at 15:30 in Lecture Hall B.',
    type: 'EVENT_CHANGE',
    eventId: 'evt-6',
    timestamp: '2 hours ago',
    read: false,
    changeDetails: {
      status: 'POSTPONED',
      reason: 'Guest adjudicator timetable clash. Updated to Nov 26th at 15:30 in Lecture Hall B.',
      newDate: '2026-11-26',
      newTime: '15:30 - 17:30',
      newLocation: 'Lecture Hall B'
    }
  },
  {
    id: 'notif-3',
    title: 'Registration Confirmed: Rover Hackathon',
    message: 'You are confirmed for the Year 10 STEM & Rover Hackathon on Nov 22nd. Added to your calendar!',
    type: 'REGISTRATION_CONFIRMED',
    eventId: 'evt-2',
    timestamp: 'Yesterday',
    read: false
  },
  {
    id: 'notif-4',
    title: 'Feedback Requested: Science Fair 2026',
    message: 'Did you enjoy the Science Fair? Share anonymous feedback to help shape next year’s activities.',
    type: 'FEEDBACK_INVITE',
    eventId: 'evt-7',
    timestamp: '3 days ago',
    read: true
  }
];

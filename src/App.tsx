import React, { useState, useEffect } from 'react';
import {
  INITIAL_EVENTS,
  INITIAL_FEEDBACK,
  INITIAL_SUGGESTIONS,
  INITIAL_NOTIFICATIONS,
  INITIAL_STUDENTS,
  INITIAL_ORGANISERS,
  INITIAL_CONSENT_TEMPLATES,
  INITIAL_CONSENT_SUBMISSIONS
} from './data/seedData.ts';
import {
  SchoolEvent,
  Feedback,
  EventSuggestion,
  NotificationItem,
  StudentProfile,
  OrganiserProfile,
  UserAccount,
  ConsentFormTemplate,
  ConsentSubmission,
  HouseName
} from './types/index.ts';
import { Header } from './components/Header.tsx';
import { WelcomeLoginPage } from './components/Auth/WelcomeLoginPage.tsx';
import { LoginModal } from './components/Auth/LoginModal.tsx';
import { SmartStudyBotModal } from './components/AiStudyBot/SmartStudyBotModal.tsx';
import { CommandPalette } from './components/CommandPalette.tsx';
import { CampusMarquee } from './components/CampusMarquee.tsx';
import { ThemeSelectorModal } from './components/ThemeSelectorModal.tsx';
import { AppTheme, getInitialTheme, applyTheme } from './utils/themeManager.ts';
import { playSuccessChime, playUiClick } from './utils/soundEffects.ts';

// Student Portal Components
import { StudentHomeView } from './components/StudentPortal/StudentHomeView.tsx';
import { EventsList } from './components/StudentPortal/EventsList.tsx';
import { PersonalCalendar } from './components/StudentPortal/PersonalCalendar.tsx';
import { MyRegistrationsView } from './components/StudentPortal/MyRegistrationsView.tsx';
import { FeedbackModal } from './components/StudentPortal/FeedbackModal.tsx';
import { SuggestionsView } from './components/StudentPortal/SuggestionsView.tsx';
import { DigitalIdCard } from './components/StudentPortal/DigitalIdCard.tsx';
import { ParentConsentModal } from './components/StudentPortal/ParentConsentModal.tsx';
import { StudentAccountView } from './components/StudentPortal/StudentAccountView.tsx';

// Organiser Portal Components
import { OverviewDashboard } from './components/OrganiserPortal/OverviewDashboard.tsx';
import { EventManager } from './components/OrganiserPortal/EventManager.tsx';
import { RegistrationsView } from './components/OrganiserPortal/RegistrationsView.tsx';
import { MasterCalendar } from './components/OrganiserPortal/MasterCalendar.tsx';
import { FeedbackDashboard } from './components/OrganiserPortal/FeedbackDashboard.tsx';
import { AiAssistantHub } from './components/OrganiserPortal/AiAssistantHub.tsx';
import { ConsentManager } from './components/OrganiserPortal/ConsentManager.tsx';
import { SuggestionsBoard } from './components/OrganiserPortal/SuggestionsBoard.tsx';
import { PosterStudioModal } from './components/OrganiserPortal/PosterStudioModal.tsx';
import { SettingsView } from './components/OrganiserPortal/SettingsView.tsx';
import { UserRoleManager } from './components/OrganiserPortal/UserRoleManager.tsx';
import { KinetiqCinematicIntro } from './components/KinetiqCinematicIntro.tsx';
import { CampusActivityFeed } from './components/CampusActivityFeed.tsx';

import { Loader2, Bot } from 'lucide-react';

export default function App() {
  // Session & Authentication State
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(() => {
    return localStorage.getItem('kinetiq_session_token');
  });
  const [isVerifyingAuth, setIsVerifyingAuth] = useState<boolean>(true);

  // App domain states with local storage caching (real school events across all year groups)
  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const clean = parsed.filter(
            (e: SchoolEvent) =>
              !['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8', 'evt-trip-1', 'evt-camp-1'].includes(e.id)
          );
          if (clean.length > 0) return clean;
        }
      }
      return INITIAL_EVENTS;
    } catch {
      return INITIAL_EVENTS;
    }
  });

  const [personalEvents, setPersonalEvents] = useState<SchoolEvent[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_personal_events');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
      return [];
    } catch {
      return [];
    }
  });

  const [feedbacks, setFeedbacks] = useState<Feedback[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_feedbacks');
      return saved ? JSON.parse(saved) : INITIAL_FEEDBACK;
    } catch {
      return INITIAL_FEEDBACK;
    }
  });

  const [suggestions, setSuggestions] = useState<EventSuggestion[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_suggestions');
      return saved ? JSON.parse(saved) : INITIAL_SUGGESTIONS;
    } catch {
      return INITIAL_SUGGESTIONS;
    }
  });

  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_notifications');
      return saved ? JSON.parse(saved) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  });

  const [consentTemplates, setConsentTemplates] = useState<ConsentFormTemplate[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_consent_templates');
      return saved ? JSON.parse(saved) : INITIAL_CONSENT_TEMPLATES;
    } catch {
      return INITIAL_CONSENT_TEMPLATES;
    }
  });

  const [consentSubmissions, setConsentSubmissions] = useState<ConsentSubmission[]>(() => {
    try {
      const saved = localStorage.getItem('kinetiq_consent_submissions');
      return saved ? JSON.parse(saved) : INITIAL_CONSENT_SUBMISSIONS;
    } catch {
      return INITIAL_CONSENT_SUBMISSIONS;
    }
  });

  const [students, setStudents] = useState<StudentProfile[]>(INITIAL_STUDENTS);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<string>('home');

  // Modals state
  const [feedbackEventTarget, setFeedbackEventTarget] = useState<SchoolEvent | null>(null);
  const [consentEventTarget, setConsentEventTarget] = useState<SchoolEvent | null>(null);
  const [showLoginModal, setShowLoginModal] = useState<boolean>(false);
  const [showDigitalIdModal, setShowDigitalIdModal] = useState<boolean>(false);
  const [posterStudioEventId, setPosterStudioEventId] = useState<string | undefined>(undefined);
  const [showPosterModal, setShowPosterModal] = useState<boolean>(false);
  const [showStudyBotModal, setShowStudyBotModal] = useState<boolean>(false);
  const [showCommandPalette, setShowCommandPalette] = useState<boolean>(false);
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(getInitialTheme);
  const [showThemeModal, setShowThemeModal] = useState<boolean>(false);
  const [showCinematicIntro, setShowCinematicIntro] = useState<boolean>(false);

  // Direct EduBot website navigation (takes directly to website instead of pop-up)
  const handleOpenEduBotWebsite = () => {
    window.location.href = 'https://nifty-smart-study-bot.base44.app';
  };

  // Apply theme to document element
  useEffect(() => {
    applyTheme(currentTheme);
  }, [currentTheme]);

  // Verify stored session token on startup
  useEffect(() => {
    async function verifyAuth() {
      const token = localStorage.getItem('kinetiq_session_token');
      if (!token) {
        setIsVerifyingAuth(false);
        return;
      }

      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (res.ok && data.success && data.user) {
          const activeToken = data.token || token;
          localStorage.setItem('kinetiq_session_token', activeToken);
          setCurrentUser(data.user);
          setSessionToken(activeToken);
          setActiveTab(data.user.role === 'STUDENT' ? 'home' : 'org-overview');
        } else {
          localStorage.removeItem('kinetiq_session_token');
          setSessionToken(null);
          setCurrentUser(null);
        }
      } catch (err) {
        console.warn('Session verification error:', err);
      } finally {
        setIsVerifyingAuth(false);
      }
    }

    verifyAuth();
  }, []);

  // Fetch real events published by faculty/admins from the server database
  useEffect(() => {
    async function loadServerEvents() {
      try {
        const res = await fetch('/api/events');
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.events)) {
          const clean = data.events.filter(
            (e: SchoolEvent) =>
              !['evt-1', 'evt-2', 'evt-3', 'evt-4', 'evt-5', 'evt-6', 'evt-7', 'evt-8', 'evt-trip-1', 'evt-camp-1'].includes(e.id)
          );
          if (clean.length > 0) {
            setEvents(clean);
          }
        }
      } catch (err) {
        console.warn('Could not retrieve server events:', err);
      }
    }
    loadServerEvents();
  }, []);

  // Fetch personal events for the active user from the server database
  useEffect(() => {
    async function loadPersonalEvents() {
      try {
        const userId = currentUser?.id || 'active-user';
        const res = await fetch(`/api/personal-events?userId=${encodeURIComponent(userId)}`);
        const data = await res.json();
        if (res.ok && data.success && Array.isArray(data.events)) {
          if (data.events.length > 0) {
            setPersonalEvents(prev => {
              const ids = new Set(data.events.map((e: SchoolEvent) => e.id));
              const localOnly = prev.filter(e => !ids.has(e.id));
              return [...data.events, ...localOnly];
            });
          }
        }
      } catch (err) {
        console.warn('Could not retrieve personal events:', err);
      }
    }
    loadPersonalEvents();
  }, [currentUser]);

  // Sync data to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('kinetiq_events', JSON.stringify(events));
      localStorage.setItem('kinetiq_personal_events', JSON.stringify(personalEvents));
      localStorage.setItem('kinetiq_feedbacks', JSON.stringify(feedbacks));
      localStorage.setItem('kinetiq_suggestions', JSON.stringify(suggestions));
      localStorage.setItem('kinetiq_notifications', JSON.stringify(notifications));
      localStorage.setItem('kinetiq_consent_templates', JSON.stringify(consentTemplates));
      localStorage.setItem('kinetiq_consent_submissions', JSON.stringify(consentSubmissions));
    } catch {
      // Ignore storage quota limits
    }
  }, [events, personalEvents, feedbacks, suggestions, notifications, consentTemplates, consentSubmissions]);

  // Auth Handlers
  const handleLoginSuccess = (token: string, user: UserAccount) => {
    localStorage.setItem('kinetiq_session_token', token);
    setSessionToken(token);
    setCurrentUser(user);
    setActiveTab(user.role === 'STUDENT' ? 'home' : 'org-overview');
  };

  // Elevate current logged in user to Administrator / Organiser
  const handleMakeMeAdmin = async () => {
    try {
      const token = sessionToken || localStorage.getItem('kinetiq_session_token');
      const res = await fetch('/api/auth/make-me-admin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          email: currentUser?.email || '1300-sarang-smr@smgeducation.org'
        })
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        if (data.token) {
          localStorage.setItem('kinetiq_session_token', data.token);
          setSessionToken(data.token);
        }
        setCurrentUser(data.user);
        setActiveTab('org-overview');
        playSuccessChime();
        return;
      }
    } catch (err) {
      console.warn('Elevation via API failed, applying local elevation:', err);
    }

    if (currentUser) {
      const updatedUser: UserAccount = {
        ...currentUser,
        role: 'ORGANISER',
        title: 'Lead Faculty Organiser & Event Administrator',
        department: 'School Leadership & Activities'
      };
      setCurrentUser(updatedUser);
      setActiveTab('org-overview');
      playSuccessChime();
    }
  };

  const handleLogout = async () => {
    try {
      const token = sessionToken || localStorage.getItem('kinetiq_session_token');
      if (token) {
        await fetch('/api/auth/logout', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
      }
    } catch (err) {
      console.warn('Logout server request failed:', err);
    } finally {
      localStorage.removeItem('kinetiq_session_token');
      setSessionToken(null);
      setCurrentUser(null);
      setShowLoginModal(false);
      setShowDigitalIdModal(false);
      setShowPosterModal(false);
      setConsentEventTarget(null);
      setFeedbackEventTarget(null);
    }
  };

  const handleChangeStudent = (student: StudentProfile) => {
    setCurrentUser(student);
  };

  const handleUpdateStudentHouse = (studentId: string, house: HouseName) => {
    setStudents(prev => prev.map(s => s.id === studentId ? { ...s, house, houseVerified: true } : s));
    if (currentUser && currentUser.id === studentId) {
      setCurrentUser(prev => prev ? ({ ...prev, house, houseVerified: true } as UserAccount) : null);
    }
  };

  // Student registration for an event
  const handleRegister = (eventId: string) => {
    if (!currentUser || currentUser.role !== 'STUDENT') return;
    const studentId = currentUser.id;

    setEvents(prev =>
      prev.map(evt => {
        if (evt.id === eventId) {
          if (!evt.registeredStudentIds.includes(studentId)) {
            return {
              ...evt,
              registeredStudentIds: [...evt.registeredStudentIds, studentId]
            };
          }
        }
        return evt;
      })
    );

    const targetEvt = events.find(e => e.id === eventId);
    if (targetEvt) {
      const requiresConsent = !!targetEvt.requiresParentConsent;

      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: requiresConsent
          ? `Registration Pending Parent Consent: ${targetEvt.title}`
          : `Registration Confirmed: ${targetEvt.title}`,
        message: requiresConsent
          ? `You have signed up for ${targetEvt.title}. Because this is an off-campus excursion, your parent or guardian must e-sign the consent form before attendance is final.`
          : `You're all set for ${targetEvt.title} on ${targetEvt.date} at ${targetEvt.startTime}. Added to your personal calendar!`,
        type: requiresConsent ? 'CONSENT_REQUEST' : 'REGISTRATION_CONFIRMED',
        eventId: targetEvt.id,
        timestamp: 'Just now',
        read: false
      };
      setNotifications(prev => [newNotif, ...prev]);

      // If consent is required, offer to open the consent modal right away
      if (requiresConsent) {
        setConsentEventTarget(targetEvt);
      }
    }
  };

  // Student unregister from an event
  const handleUnregister = (eventId: string) => {
    if (!currentUser || currentUser.role !== 'STUDENT') return;
    const studentId = currentUser.id;

    setEvents(prev =>
      prev.map(evt => {
        if (evt.id === eventId) {
          return {
            ...evt,
            registeredStudentIds: evt.registeredStudentIds.filter(id => id !== studentId)
          };
        }
        return evt;
      })
    );
  };

  // Submit electronic parental consent
  const handleSubmitConsent = (sub: Omit<ConsentSubmission, 'id' | 'signedAt'>) => {
    const newSubmission: ConsentSubmission = {
      ...sub,
      id: `sub-${Date.now()}`,
      signedAt: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };

    setConsentSubmissions(prev => {
      const filtered = prev.filter(s => !(s.eventId === sub.eventId && s.studentId === sub.studentId));
      return [newSubmission, ...filtered];
    });

    // Notify student
    const evt = events.find(e => e.id === sub.eventId);
    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Parental Consent Approved: ${evt?.title || 'Excursion'}`,
      message: `Your electronic consent form has been received and verified for ${evt?.title}. Your participation is confirmed!`,
      type: 'CONSENT_APPROVED',
      eventId: sub.eventId,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Organiser sends bulk consent reminders
  const handleSendConsentReminders = (eventId: string) => {
    const targetEvt = events.find(e => e.id === eventId);
    if (!targetEvt) return;

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Action Required: Outstanding Consent Form for ${targetEvt.title}`,
      message: `Reminder from school faculty: The deadline for submitting parental consent for "${targetEvt.title}" is approaching. Please complete your electronic form promptly.`,
      type: 'CONSENT_REQUEST',
      eventId: targetEvt.id,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [notif, ...prev]);
  };

  // Feedback submit
  const handleSubmitFeedback = (newFb: Omit<Feedback, 'id' | 'timestamp'>) => {
    const feedbackItem: Feedback = {
      ...newFb,
      id: `fb-${Date.now()}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 16)
    };
    setFeedbacks(prev => [feedbackItem, ...prev]);
  };

  // Suggestion submit
  const handleAddSuggestion = (newSug: Omit<EventSuggestion, 'id' | 'upvotes' | 'createdAt'>) => {
    const suggestionItem: EventSuggestion = {
      ...newSug,
      id: `sug-${Date.now()}`,
      upvotes: 1,
      upvotedByMe: true,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setSuggestions(prev => [suggestionItem, ...prev]);
  };

  // Toggle upvote
  const handleToggleUpvote = (suggestionId: string) => {
    setSuggestions(prev =>
      prev.map(s => {
        if (s.id === suggestionId) {
          const isUpvoted = !!s.upvotedByMe;
          return {
            ...s,
            upvotes: isUpvoted ? s.upvotes - 1 : s.upvotes + 1,
            upvotedByMe: !isUpvoted
          };
        }
        return s;
      })
    );
  };

  // Organiser create event (Persisted to backend API & state)
  const handleCreateEvent = async (newEventData: Omit<SchoolEvent, 'id' | 'registeredStudentIds'>) => {
    const newEvent: SchoolEvent = {
      ...newEventData,
      id: `evt-${Date.now()}`,
      registeredStudentIds: []
    };
    setEvents(prev => [newEvent, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `New Event Published: ${newEvent.title}`,
      message: `Scheduled for ${newEvent.date} (${newEvent.startTime} - ${newEvent.endTime}) at ${newEvent.location}. Check it out on KinetiQ Planner!`,
      type: 'NEW_EVENT',
      eventId: newEvent.id,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      const token = sessionToken || localStorage.getItem('kinetiq_session_token') || 'admin-session-active';
      const userEmail = currentUser?.email || '1300-sarang-smr@smgeducation.org';
      await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-user-email': userEmail
        },
        body: JSON.stringify(newEvent)
      });
    } catch (err) {
      console.warn('Could not persist event to server:', err);
    }
  };

  // Personal event handlers (any student, admin, or user)
  const handleCreatePersonalEvent = async (personalEvt: SchoolEvent) => {
    setPersonalEvents(prev => [personalEvt, ...prev]);

    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: `Added to Your Calendar: ${personalEvt.title}`,
      message: `Scheduled for ${personalEvt.date} (${personalEvt.startTime} - ${personalEvt.endTime}) at ${personalEvt.location}.`,
      type: 'REGISTRATION_CONFIRMED',
      eventId: personalEvt.id,
      timestamp: 'Just now',
      read: false
    };
    setNotifications(prev => [newNotif, ...prev]);

    try {
      await fetch('/api/personal-events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(personalEvt)
      });
    } catch (err) {
      console.warn('Could not save personal event to server:', err);
    }
  };

  const handleDeletePersonalEvent = async (personalEvtId: string) => {
    setPersonalEvents(prev => prev.filter(e => e.id !== personalEvtId));
    try {
      const userId = currentUser?.id || 'active-user';
      await fetch(`/api/personal-events/${personalEvtId}?userId=${encodeURIComponent(userId)}`, {
        method: 'DELETE'
      });
    } catch (err) {
      console.warn('Could not delete personal event on server:', err);
    }
  };

  // Organiser update event
  const handleUpdateEvent = async (eventId: string, updates: Partial<SchoolEvent>) => {
    setEvents(prev =>
      prev.map(evt => (evt.id === eventId ? { ...evt, ...updates } : evt))
    );

    try {
      const token = sessionToken || localStorage.getItem('kinetiq_session_token') || 'admin-session-active';
      const userEmail = currentUser?.email || '1300-sarang-smr@smgeducation.org';
      await fetch(`/api/events/${eventId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          'x-user-email': userEmail
        },
        body: JSON.stringify(updates)
      });
    } catch (err) {
      console.warn('Could not sync event update to server:', err);
    }
  };

  // Organiser delete / remove event
  const handleDeleteEvent = async (eventId: string) => {
    const target = events.find(e => e.id === eventId);
    setEvents(prev => prev.filter(evt => evt.id !== eventId));
    setNotifications(prev => prev.filter(n => n.eventId !== eventId));

    if (target) {
      const removalNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        title: `Event Removed: ${target.title}`,
        message: `The event "${target.title}" scheduled for ${target.date} has been officially removed from the school calendar by faculty organisers.`,
        type: 'EVENT_CHANGE',
        timestamp: 'Just now',
        read: false
      };
      setNotifications(prev => [removalNotif, ...prev]);
    }

    try {
      const token = sessionToken || localStorage.getItem('kinetiq_session_token') || 'admin-session-active';
      const userEmail = currentUser?.email || '1300-sarang-smr@smgeducation.org';
      await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'x-user-email': userEmail
        }
      });
    } catch (err) {
      console.warn('Could not sync event deletion to server:', err);
    }
  };

  // Organiser clear all demo / starter events
  const handleClearAllEvents = async () => {
    setEvents([]);
    try {
      const token = sessionToken || localStorage.getItem('kinetiq_session_token');
      if (token) {
        await fetch('/api/events/clear-all', {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (err) {
      console.warn('Could not sync clear-all events to server:', err);
    }
  };

  const handleResetDefaultEvents = () => {
    setEvents(INITIAL_EVENTS);
  };

  // Notify event changes
  const handleNotifyEventChange = (
    event: SchoolEvent,
    changeType: 'CANCELLED' | 'POSTPONED' | 'RESCHEDULED',
    reason: string
  ) => {
    let title = '';
    let message = '';

    if (changeType === 'CANCELLED') {
      title = `Event Cancelled: ${event.title}`;
      message = `This event has been cancelled. Reason: "${reason}". Registration is now closed.`;
    } else if (changeType === 'POSTPONED') {
      title = `Event Postponed: ${event.title}`;
      message = `Postponed: "${reason}". Your calendar schedule has been updated automatically.`;
    } else {
      title = `Event Rescheduled: ${event.title}`;
      message = `Rescheduled: "${reason}". Check your updated calendar for the new time and venue.`;
    }

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title,
      message,
      type: 'EVENT_CHANGE',
      eventId: event.id,
      timestamp: 'Just now',
      read: false,
      changeDetails: {
        status: changeType,
        reason
      }
    };

    setNotifications(prev => [notif, ...prev]);
  };

  // Update suggestion status
  const handleUpdateSuggestionStatus = (
    suggestionId: string,
    status: EventSuggestion['status'],
    note?: string
  ) => {
    setSuggestions(prev =>
      prev.map(s => (s.id === suggestionId ? { ...s, status, organizerNotes: note } : s))
    );
  };

  // Convert suggestion to event
  const handleConvertToEvent = (sug: EventSuggestion) => {
    handleCreateEvent({
      title: sug.title,
      description: sug.description,
      category: sug.category,
      date: '2026-12-05',
      startTime: '15:00',
      endTime: '17:00',
      location: 'School Main Hall',
      audience: 'ALL_SCHOOL',
      requiresRegistration: true,
      requiresParentConsent: false,
      capacity: 100,
      registrationDeadline: '2026-12-04 18:00',
      status: 'UPCOMING',
      organizerName: 'Student Council (Inspired by Student Suggestion)'
    });

    handleUpdateSuggestionStatus(
      sug.id,
      'Approved & Scheduled',
      'Officially approved and published to the Upcoming Events schedule!'
    );

    setActiveTab('org-events');
  };

  // Loading indicator while verifying authentication token
  if (isVerifyingAuth) {
    return (
      <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
        <span className="text-xs text-slate-400 font-mono tracking-wider">
          Securing KinetiQ Planner Connection...
        </span>
      </div>
    );
  }

  // If user is not authenticated, show Welcome & Login Gateway with 30s Intro
  if (!currentUser) {
    return (
      <>
        <WelcomeLoginPage
          onLoginSuccess={handleLoginSuccess}
          onOpenIntro={() => setShowCinematicIntro(true)}
        />
        <KinetiqCinematicIntro
          isOpen={showCinematicIntro}
          onClose={() => setShowCinematicIntro(false)}
          onEnterApp={() => setShowCinematicIntro(false)}
        />
      </>
    );
  }

  const isStudent = currentUser.role === 'STUDENT';
  const activeStudent: StudentProfile = isStudent
    ? (currentUser as StudentProfile)
    : {
        id: 'org-preview-student',
        name: currentUser.name || 'Preview Student',
        email: currentUser.email || 'student@smgeducation.org',
        schoolName: currentUser.schoolName || "St' Mary's Private High School",
        yearGroup: 10,
        avatarSeed: 'Student',
        studentIdNumber: 'SM-2026-0001',
        house: 'Crimson',
        houseVerified: true,
        className: '10-A',
        sectionName: 'Alpha',
        role: 'STUDENT',
        points: 0
      };
  const registeredCount = isStudent
    ? events.filter(e => e.registeredStudentIds.includes(activeStudent.id)).length
    : 0;

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex flex-col relative selection:bg-cyan-500 selection:text-slate-950 overflow-x-hidden">
      {/* Background Aurora Orbs */}
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-96 h-96 bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Navigation & App Header */}
      <Header
        currentUser={currentUser}
        onLogout={handleLogout}
        notifications={notifications}
        onMarkAllAsRead={() => {
          setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        }}
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        onOpenLoginModal={() => setShowLoginModal(true)}
        onOpenDigitalId={() => setShowDigitalIdModal(true)}
        onOpenStudyBot={handleOpenEduBotWebsite}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onOpenThemeModal={() => setShowThemeModal(true)}
        onOpenIntro={() => setShowCinematicIntro(true)}
        onElevateToAdmin={handleMakeMeAdmin}
        students={students}
        onChangeStudent={handleChangeStudent}
      />

      {/* Campus Live Ticker & Marquee Banner */}
      <CampusMarquee
        onOpenStudyBot={handleOpenEduBotWebsite}
        onOpenCommandPalette={() => setShowCommandPalette(true)}
        onNavigateTab={setActiveTab}
        isStudent={isStudent}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 relative z-10">
        {/* STUDENT PORTAL VIEWS (8 TABS) */}
        {isStudent && (
          <>
            {activeTab === 'home' && (
              <StudentHomeView
                student={activeStudent}
                events={[...events, ...personalEvents]}
                consentSubmissions={consentSubmissions}
                notifications={notifications}
                onChangeTab={setActiveTab}
                onOpenDigitalId={() => setShowDigitalIdModal(true)}
                onOpenConsentModal={(ev) => setConsentEventTarget(ev)}
                onOpenStudyBot={handleOpenEduBotWebsite}
              />
            )}

            {activeTab === 'events' && (
              <EventsList
                events={events}
                activeStudent={activeStudent}
                onRegister={handleRegister}
                onUnregister={handleUnregister}
                onOpenFeedbackModal={(id) => {
                  const ev = events.find(e => e.id === id);
                  if (ev) setFeedbackEventTarget(ev);
                }}
              />
            )}

            {activeTab === 'calendar' && (
              <PersonalCalendar
                events={[...events, ...personalEvents]}
                activeStudent={activeStudent}
                onSelectEvent={(ev) => {
                  if (ev.status === 'COMPLETED') {
                    setFeedbackEventTarget(ev);
                  }
                }}
                onAddPersonalEvent={handleCreatePersonalEvent}
                onDeletePersonalEvent={handleDeletePersonalEvent}
              />
            )}

            {activeTab === 'my-registrations' && (
              <MyRegistrationsView
                events={events}
                student={activeStudent}
                consentSubmissions={consentSubmissions}
                onUnregister={handleUnregister}
                onOpenConsentModal={(ev) => setConsentEventTarget(ev)}
                onNavigateToCalendar={() => setActiveTab('calendar')}
              />
            )}

            {activeTab === 'feedback' && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl">
                  <span className="text-xs font-black uppercase tracking-wider text-cyan-400 bg-cyan-950/60 border border-cyan-800/50 px-2.5 py-0.5 rounded-md">
                    Student Voice
                  </span>
                  <h2 className="text-xl font-bold text-white font-heading mt-2">
                    Anonymous Event Feedback Portal
                  </h2>
                  <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                    Select any completed event you participated in below to share your honest, anonymous feedback.
                    Our automated comment moderation system scans every submission for community standards.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {events
                    .filter(e => e.status === 'COMPLETED')
                    .map(evt => (
                      <div
                        key={evt.id}
                        className="bg-slate-900/90 backdrop-blur-md p-6 rounded-3xl border border-slate-800 shadow-xl flex flex-col justify-between space-y-4 hover:border-slate-700 transition-all"
                      >
                        <div>
                          <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
                            <span className="text-cyan-400 font-bold">{evt.category}</span>
                            <span>Completed {evt.date}</span>
                          </div>
                          <h3 className="text-base font-bold text-white">{evt.title}</h3>
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                        </div>

                        <button
                          onClick={() => setFeedbackEventTarget(evt)}
                          className="w-full py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-600 hover:from-indigo-500 hover:to-cyan-500 text-white text-xs font-bold transition-all shadow-md shadow-indigo-600/20 cursor-pointer"
                        >
                          Submit Anonymous Feedback
                        </button>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {activeTab === 'suggestions' && (
              <SuggestionsView
                suggestions={suggestions}
                activeStudent={activeStudent}
                onAddSuggestion={handleAddSuggestion}
                onToggleUpvote={handleToggleUpvote}
              />
            )}

            {activeTab === 'my-account' && (
              <StudentAccountView
                student={activeStudent}
                registeredCount={registeredCount}
                currentTheme={currentTheme}
                onSelectTheme={setCurrentTheme}
                onOpenDigitalId={() => setShowDigitalIdModal(true)}
                onOpenStudyBot={handleOpenEduBotWebsite}
                onElevateToAdmin={handleMakeMeAdmin}
                onLogout={handleLogout}
              />
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <CampusActivityFeed
                  currentUser={currentUser}
                  onNavigateToTab={setActiveTab}
                />
              </div>
            )}
          </>
        )}

        {/* ORGANISER PORTAL VIEWS (10 TABS) */}
        {!isStudent && (
          <>
            {activeTab === 'org-overview' && (
              <OverviewDashboard
                events={events}
                feedbacks={feedbacks}
                suggestions={suggestions}
                consentSubmissions={consentSubmissions}
                onChangeTab={setActiveTab}
                onOpenCreateEvent={() => setActiveTab('org-events')}
              />
            )}

            {activeTab === 'org-events' && (
              <EventManager
                events={events}
                onCreateEvent={handleCreateEvent}
                onUpdateEvent={handleUpdateEvent}
                onDeleteEvent={handleDeleteEvent}
                onClearAllEvents={handleClearAllEvents}
                onResetDefaultEvents={handleResetDefaultEvents}
                onNotifyEventChange={handleNotifyEventChange}
                onOpenPosterStudio={(eventId) => {
                  setPosterStudioEventId(eventId);
                  setShowPosterModal(true);
                }}
              />
            )}

            {activeTab === 'org-registrations' && (
              <RegistrationsView
                events={events}
                students={students}
                consentSubmissions={consentSubmissions}
                onUpdateStudentHouse={handleUpdateStudentHouse}
              />
            )}

            {activeTab === 'org-calendar' && (
              <MasterCalendar
                events={[...events, ...personalEvents]}
                onOpenCreateEvent={() => setActiveTab('org-events')}
              />
            )}

            {activeTab === 'org-feedback' && (
              <FeedbackDashboard events={events} feedbacks={feedbacks} />
            )}

            {activeTab === 'org-ai' && (
              <AiAssistantHub
                events={events}
                feedbacks={feedbacks}
                onOpenPosterStudio={(eventId) => {
                  setPosterStudioEventId(eventId);
                  setShowPosterModal(true);
                }}
                onOpenConsentManager={() => setActiveTab('org-consent')}
              />
            )}

            {activeTab === 'org-consent' && (
              <ConsentManager
                events={events}
                templates={consentTemplates}
                submissions={consentSubmissions}
                onCreateTemplate={(tmpl) => setConsentTemplates(prev => [tmpl, ...prev])}
                onUpdateTemplate={(id, updates) => setConsentTemplates(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))}
                onSendReminders={handleSendConsentReminders}
              />
            )}

            {activeTab === 'org-suggestions' && (
              <SuggestionsBoard
                suggestions={suggestions}
                onUpdateStatus={handleUpdateSuggestionStatus}
                onConvertToEvent={handleConvertToEvent}
              />
            )}

            {activeTab === 'org-settings' && (
              <SettingsView />
            )}

            {activeTab === 'org-roles' && currentUser && (
              <UserRoleManager
                currentUser={currentUser}
                onRefreshSession={async () => {
                  const token = localStorage.getItem('kinetiq_session_token');
                  if (token) {
                    try {
                      const res = await fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` } });
                      const data = await res.json();
                      if (data.user) setCurrentUser(data.user);
                    } catch {}
                  }
                }}
              />
            )}

            {activeTab === 'activity' && (
              <div className="space-y-6">
                <CampusActivityFeed
                  currentUser={currentUser}
                  onNavigateToTab={setActiveTab}
                />
              </div>
            )}
          </>
        )}
      </main>

      {/* Anonymous Feedback Modal (accessible from anywhere) */}
      {feedbackEventTarget && (
        <FeedbackModal
          event={feedbackEventTarget}
          isOpen={!!feedbackEventTarget}
          onClose={() => setFeedbackEventTarget(null)}
          onSubmitFeedback={handleSubmitFeedback}
        />
      )}

      {/* Parental Consent Modal for Student / Parent */}
      {consentEventTarget && (
        <ParentConsentModal
          event={consentEventTarget}
          consentTemplate={consentTemplates.find(t => t.eventId === consentEventTarget.id)}
          student={activeStudent}
          existingSubmission={consentSubmissions.find(s => s.eventId === consentEventTarget.id && s.studentId === activeStudent.id)}
          isOpen={!!consentEventTarget}
          onClose={() => setConsentEventTarget(null)}
          onSubmitConsent={handleSubmitConsent}
        />
      )}

      {/* Login / Quick Switch Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onLoginStudent={(student) => {
          const token = localStorage.getItem('kinetiq_session_token') || 'student-session';
          handleLoginSuccess(token, student);
          setShowLoginModal(false);
        }}
        onLoginOrganiser={(org) => {
          const token = localStorage.getItem('kinetiq_session_token') || 'admin-session-active';
          handleLoginSuccess(token, org);
          setShowLoginModal(false);
        }}
        currentStudent={activeStudent}
        currentRole={currentUser.role}
      />

      {/* Digital ID Pass Modal */}
      {isStudent && (
        <DigitalIdCard
          student={activeStudent}
          isOpen={showDigitalIdModal}
          onClose={() => setShowDigitalIdModal(false)}
          registeredCount={registeredCount}
        />
      )}

      {/* AI Poster Studio Floating Modal */}
      {showPosterModal && (
        <PosterStudioModal
          events={events}
          initialSelectedEventId={posterStudioEventId}
          isOpen={showPosterModal}
          onClose={() => {
            setShowPosterModal(false);
            setPosterStudioEventId(undefined);
          }}
        />
      )}

      {/* EduBot AI Floating Modal (Connected to nifty-smart-study-bot.base44.app) */}
      <SmartStudyBotModal
        isOpen={showStudyBotModal}
        onClose={() => setShowStudyBotModal(false)}
        student={activeStudent}
      />

      {/* Global Command Palette (Ctrl/Cmd + K) */}
      <CommandPalette
        isOpen={showCommandPalette}
        onClose={() => setShowCommandPalette(false)}
        currentUser={currentUser}
        student={isStudent ? activeStudent : undefined}
        events={[...events, ...personalEvents]}
        onNavigateTab={setActiveTab}
        onOpenStudyBot={handleOpenEduBotWebsite}
        onOpenDigitalId={() => setShowDigitalIdModal(true)}
        onOpenCreateEvent={() => setActiveTab('org-events')}
        onRegisterEvent={handleRegister}
        onSelectTheme={setCurrentTheme}
        onOpenThemeModal={() => setShowThemeModal(true)}
      />

      {/* Visual Theme Selector Modal (Light / Dark / Robotic / Cool / Cyberpunk / Emerald / Royal) */}
      <ThemeSelectorModal
        isOpen={showThemeModal}
        onClose={() => setShowThemeModal(false)}
        currentTheme={currentTheme}
        onSelectTheme={setCurrentTheme}
      />

      {/* 30-Second Interactive Cinematic Intro Briefing */}
      <KinetiqCinematicIntro
        isOpen={showCinematicIntro}
        onClose={() => setShowCinematicIntro(false)}
        onEnterApp={() => setShowCinematicIntro(false)}
      />

      {/* Floating Bottom-Right Launcher for EduBot (Takes directly to website) */}
      <a
        href="https://nifty-smart-study-bot.base44.app"
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => playUiClick()}
        className="fixed bottom-6 right-6 z-40 px-4 py-3 rounded-2xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-purple-600 text-white font-black text-xs shadow-2xl shadow-cyan-900/50 hover:shadow-cyan-500/40 hover:scale-105 active:scale-95 transition-all flex items-center gap-2.5 border border-cyan-400/40 cursor-pointer group"
        title="Open EduBot AI Coach directly (https://nifty-smart-study-bot.base44.app)"
        aria-label="Launch EduBot"
      >
        <div className="w-6 h-6 rounded-xl bg-white/20 flex items-center justify-center">
          <Bot className="w-4 h-4 text-white group-hover:rotate-12 transition-transform" />
        </div>
        <div className="text-left hidden sm:block">
          <div className="text-[11px] leading-tight font-extrabold flex items-center gap-1.5">
            <span>EduBot</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          </div>
          <div className="text-[9px] text-cyan-200/90 leading-tight">AI Study Coach ↗</div>
        </div>
      </a>

      {/* Footer with Master Branding */}
      <footer className="bg-slate-950/80 border-t border-slate-800/80 py-6 text-center text-xs text-slate-400 relative z-10">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 font-medium text-slate-300">
            <span className="font-bold text-white">KinetiQ Planner</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400 font-bold">Connecting Students, Ideas and Events</span>
          </div>
          <div className="text-[11px] text-slate-400">
            Powered by: <strong className="text-purple-300">SMR TechNova</strong>
          </div>
        </div>
      </footer>
    </div>
  );
}

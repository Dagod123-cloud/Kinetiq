import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Lock as LockIcon,
  Mail as MailIcon,
  User as UserIcon,
  ArrowRight as ArrowRightIcon,
  ShieldCheck as ShieldCheckIcon,
  Sparkles as SparklesIcon,
  Zap as ZapIcon,
  GraduationCap as GraduationCapIcon,
  Building as BuildingIcon,
  Eye as EyeIcon,
  EyeOff as EyeOffIcon,
  CheckCircle2 as CheckCircle2Icon,
  AlertCircle as AlertCircleIcon,
  Loader2 as Loader2Icon,
  KeyRound as KeyRoundIcon,
  UserPlus as UserPlusIcon,
  School as SchoolIcon,
  Award,
  CheckCircle2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserAccount, HouseName, SchoolStructure } from '../../types/index.ts';
import { INITIAL_SCHOOLS } from '../../data/seedData.ts';
import { PE_HOUSES, HOUSE_NAMES, getHouseConfig } from '../../utils/houseThemes.ts';

interface WelcomeLoginPageProps {
  onLoginSuccess: (token: string, user: UserAccount) => void;
  onOpenIntro?: () => void;
}

export const WelcomeLoginPage: React.FC<WelcomeLoginPageProps> = ({
  onLoginSuccess,
  onOpenIntro
}) => {
  // Mode: LOGIN or SIGNUP
  const [authMode, setAuthMode] = useState<'LOGIN' | 'SIGNUP'>('LOGIN');

  // Sign In Form States
  const [usernameOrEmail, setUsernameOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Available School Structures
  const [schools, setSchools] = useState<SchoolStructure[]>(INITIAL_SCHOOLS);
  const [selectedSchoolId, setSelectedSchoolId] = useState<string>('school-st-marys');
  const [isCustomSchool, setIsCustomSchool] = useState<boolean>(false);
  const [customSchoolName, setCustomSchoolName] = useState<string>('');

  // Sign Up Form States
  const [signUpName, setSignUpName] = useState('');
  const [signUpEmail, setSignUpEmail] = useState('');
  const [signUpUsername, setSignUpUsername] = useState('');
  const [signUpPassword, setSignUpPassword] = useState('');
  const [signUpConfirmPassword, setSignUpConfirmPassword] = useState('');
  const [signUpYearGroup, setSignUpYearGroup] = useState<number>(10);
  const [signUpClass, setSignUpClass] = useState<string>('10-A');
  const [signUpSection, setSignUpSection] = useState<string>('Alpha');
  const [signUpHouse, setSignUpHouse] = useState<HouseName>('Crimson');
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);

  // Forgot Password modal state
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const [resetError, setResetError] = useState<string | null>(null);
  const [resetLoading, setResetLoading] = useState(false);

  // Fetch updated schools from API
  useEffect(() => {
    async function loadSchools() {
      try {
        const res = await fetch('/api/schools');
        if (res.ok) {
          const data = await res.json();
          if (data.schools && Array.isArray(data.schools) && data.schools.length > 0) {
            setSchools(data.schools);
          }
        }
      } catch (err) {
        console.warn('Could not load remote schools, using initial seed:', err);
      }
    }
    loadSchools();
  }, []);

  // Compute dynamic lists based on selected school and year group
  const activeSchool = schools.find(s => s.id === selectedSchoolId) || schools[0];
  const effectiveSchoolName = isCustomSchool
    ? (customSchoolName.trim() || 'Custom School')
    : activeSchool.name;

  const availableYearGroups = activeSchool.yearGroups.map(yg => yg.year);
  const currentYearConfig = activeSchool.yearGroups.find(yg => yg.year === signUpYearGroup) || activeSchool.yearGroups[0];
  const availableClasses = currentYearConfig ? currentYearConfig.classes : ['A', 'B'];
  const availableSections = activeSchool.sections || ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega'];

  // Handle school switch
  const handleSchoolChange = (schoolId: string) => {
    if (schoolId === 'custom') {
      setIsCustomSchool(true);
      setSelectedSchoolId('custom');
    } else {
      setIsCustomSchool(false);
      setSelectedSchoolId(schoolId);
      const targetSchool = schools.find(s => s.id === schoolId);
      if (targetSchool && targetSchool.yearGroups.length > 0) {
        const firstYg = targetSchool.yearGroups[0];
        setSignUpYearGroup(firstYg.year);
        if (firstYg.classes.length > 0) {
          setSignUpClass(firstYg.classes[0]);
        }
        if (targetSchool.sections.length > 0) {
          setSignUpSection(targetSchool.sections[0]);
        }
      }
    }
  };

  // Handle year group change
  const handleYearGroupChange = (year: number) => {
    setSignUpYearGroup(year);
    const ygConfig = activeSchool.yearGroups.find(yg => yg.year === year);
    if (ygConfig && ygConfig.classes.length > 0) {
      setSignUpClass(ygConfig.classes[0]);
    }
  };

  // Login Handler
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!usernameOrEmail.trim() || !password) return;

    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          usernameOrEmail: usernameOrEmail.trim(),
          password
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Authentication failed. Please verify credentials.');
        setIsLoading(false);
        return;
      }

      // Success
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 }
        });
      } catch {}

      onLoginSuccess(data.token, data.user);
    } catch {
      setErrorMessage('Network or server connection error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Sign Up Handler
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!signUpName.trim() || !signUpEmail.trim() || !signUpPassword) {
      setErrorMessage('Please complete all required fields.');
      return;
    }

    if (isCustomSchool && !customSchoolName.trim()) {
      setErrorMessage('Please enter your School Name.');
      return;
    }

    if (signUpPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (signUpPassword !== signUpConfirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: signUpName.trim(),
          email: signUpEmail.trim().toLowerCase(),
          username: signUpUsername.trim() || signUpEmail.split('@')[0],
          password: signUpPassword,
          role: 'STUDENT',
          schoolName: effectiveSchoolName,
          yearGroup: signUpYearGroup,
          className: signUpClass,
          sectionName: signUpSection,
          house: signUpHouse
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        setErrorMessage(data.error || 'Registration failed. Please check your information.');
        setIsLoading(false);
        return;
      }

      // Success
      try {
        confetti({
          particleCount: 90,
          spread: 100,
          origin: { y: 0.6 }
        });
      } catch {}

      setSuccessMessage('Student account created successfully! Welcome to KinetiQ Planner.');
      setTimeout(() => {
        onLoginSuccess(data.token, data.user);
      }, 600);
    } catch {
      setErrorMessage('Server connection error during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick fill helper for demonstration & instant access
  const handleQuickFill = async (email: string, pass: string, autoLogin: boolean = true) => {
    setAuthMode('LOGIN');
    setUsernameOrEmail(email);
    setPassword(pass);
    setErrorMessage(null);

    if (autoLogin) {
      setIsLoading(true);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            usernameOrEmail: email.trim(),
            password: pass
          })
        });

        const data = await response.json();
        if (response.ok && data.success && data.user) {
          try {
            confetti({
              particleCount: 80,
              spread: 90,
              origin: { y: 0.6 }
            });
          } catch {}
          onLoginSuccess(data.token, data.user);
          return;
        } else {
          setErrorMessage(data.error || 'Authentication error');
        }
      } catch {
        setErrorMessage('Failed to connect to authentication server');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;

    setResetLoading(true);
    setResetError(null);
    setResetMessage(null);

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail })
      });

      const data = await response.json();
      if (!response.ok) {
        setResetError(data.error || 'Failed to request reset code');
        setResetLoading(false);
        return;
      }

      setResetMessage(`Reset verification code generated: ${data.demoCode || 'Sent to email'}`);
      if (data.demoCode) {
        setResetCode(data.demoCode);
      }
      setResetStep('VERIFY');
    } catch {
      setResetError('Server connection error');
    } finally {
      setResetLoading(false);
    }
  };

  const handleConfirmReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail || !resetCode || !newPassword) return;

    setResetLoading(true);
    setResetError(null);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: resetEmail,
          code: resetCode,
          newPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        setResetError(data.error || 'Reset failed');
        setResetLoading(false);
        return;
      }

      // Success
      setPassword(newPassword);
      setUsernameOrEmail(resetEmail);
      setShowForgotPassword(false);
      setResetStep('REQUEST');
      setResetMessage(null);
      setResetError(null);
      setSuccessMessage('Password updated successfully! You can now log in.');
    } catch {
      setResetError('Server error while resetting password');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#070b14] text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-8 relative overflow-hidden selection:bg-cyan-500 selection:text-slate-950">
      {/* Background Ambient Glow Lights */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-indigo-600/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/2 -right-32 w-96 h-96 bg-cyan-500/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-violet-600/15 rounded-full blur-[150px] pointer-events-none" />

      {/* Main Login Card Wrapper */}
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl overflow-hidden relative z-10 backdrop-blur-xl">
        {/* Left Side: Brand Visual & Master Overview (6 cols) */}
        <div className="lg:col-span-6 p-8 sm:p-10 flex flex-col justify-between bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950/80 border-b lg:border-b-0 lg:border-r border-slate-800/90 relative overflow-hidden">
          <div className="relative z-10 space-y-6">
            {/* KinetiQ Planner Logo & School Seal */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-400 via-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-xl shadow-cyan-500/20 ring-1 ring-white/20">
                <ZapIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-heading font-black text-2xl tracking-tight text-white">
                    KinetiQ Planner
                  </span>
                  <span className="text-[10px] font-black tracking-widest uppercase px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                    SMR TechNova
                  </span>
                </div>
                <p className="text-xs text-slate-400">
                  School Events & Engagement • Powered by: SMR TechNova
                </p>
              </div>
            </div>

            {/* Tagline & Master Pitch */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                Connecting Students, Ideas and Events.
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-white font-heading leading-tight tracking-tight">
                The All-In-One School Events & Student Voice Platform.
              </h1>
              <p className="text-xs text-slate-300 leading-relaxed max-w-md">
                Discover upcoming school activities, sync your personalised timetable, submit 100% anonymous moderated reviews, manage parental consent forms, and compete for your PE House team!
              </p>
            </div>

            {/* 5 PE Houses Showcase Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-300">Official School PE House Teams:</span>
                <span className="text-[10px] text-cyan-400 font-mono">5 Distinct Colours</span>
              </div>
              <div className="grid grid-cols-5 gap-1.5">
                {HOUSE_NAMES.map(h => {
                  const cfg = getHouseConfig(h);
                  return (
                    <div
                      key={h}
                      className="p-2 rounded-xl text-center border transition-all"
                      style={{
                        borderColor: `${cfg.hex}60`,
                        background: `${cfg.hex}15`
                      }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full mx-auto mb-1 shadow-xs"
                        style={{ backgroundColor: cfg.hex }}
                      />
                      <span className="text-[10px] font-black block text-white truncate">
                        {cfg.name}
                      </span>
                      <span className="text-[8px] text-slate-400 block truncate leading-none">
                        {cfg.colorName.split(' ')[0]}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 Pillars Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-cyan-400 text-xs font-bold">
                  <CalendarIcon className="w-3.5 h-3.5" />
                  <span>Personalised Calendar</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Curates your timetable based on your school, year group, class, and confirmed event registrations.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold">
                  <ShieldCheckIcon className="w-3.5 h-3.5" />
                  <span>Event Consent System</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Electronic parental permission with digital signatures for excursions and trips.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-amber-400 text-xs font-bold">
                  <SparklesIcon className="w-3.5 h-3.5" />
                  <span>Anonymous Feedback</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  Real-time 6-step language moderation ensures respectful discourse while preserving honest student voice.
                </p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1">
                <div className="flex items-center gap-1.5 text-purple-400 text-xs font-bold">
                  <BuildingIcon className="w-3.5 h-3.5" />
                  <span>AI Organiser Studio</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug">
                  AI review summaries, operational recommendations, consent generator, and promotional posters.
                </p>
              </div>
            </div>
          </div>

          {/* 30-Second KinetiQ Intro & Verified Admin Access Bar */}
          <div className="mt-8 pt-5 border-t border-slate-800/80 space-y-3 relative z-10">
            {onOpenIntro && (
              <button
                type="button"
                onClick={onOpenIntro}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-cyan-500 via-indigo-600 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-black text-xs sm:text-sm transition-all shadow-xl shadow-cyan-900/30 flex items-center justify-center gap-2.5 cursor-pointer border border-cyan-300/30 group"
              >
                <SparklesIcon className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
                <span>🎬 Watch 30-Second KinetiQ Cinematic Intro</span>
                <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full font-bold">Interactive</span>
              </button>
            )}

            <div className="flex flex-col gap-2 pt-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                <ShieldCheckIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>1-Click Verified Demonstration Accounts:</span>
              </span>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('1300-sarang-smr@smgeducation.org', 'OrganiserPass2026!', true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-600 hover:from-amber-500 hover:to-yellow-500 text-slate-950 font-black text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-amber-900/30"
                  title="Log in directly as Principal & Lead Administrator (1300-sarang-smr@smgeducation.org)"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-slate-950" />
                  <span>Admin: Sarang (Principal & TechNova Lead)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('student.demo@stmarys.edu', 'StudentPass2026!', true)}
                  className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-600 hover:to-indigo-600 text-white font-bold text-xs transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-blue-900/30 border border-blue-400/40"
                  title="Log in directly as Alex Morgan (Year 10 • Sapphire House)"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-cyan-300" />
                  <span>Student Demo: Alex Morgan (Yr 10 • Sapphire)</span>
                </button>
              </div>
            </div>

            <div className="text-[10px] text-slate-500 flex items-center justify-between pt-1">
              <span>Powered by: SMR TechNova</span>
              <span>KinetiQ Planner v2.5 • St' Mary's Private High School</span>
            </div>
          </div>
        </div>

        {/* Right Side: Auth Forms: Sign In / Sign Up (6 cols) */}
        <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-center bg-slate-900/95 space-y-4 overflow-y-auto max-h-[90vh]">
          {/* Top Auth Mode Tabs */}
          <div className="flex items-center p-1 bg-slate-950 rounded-2xl border border-slate-800">
            <button
              type="button"
              onClick={() => {
                setAuthMode('LOGIN');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMode === 'LOGIN'
                  ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMode('SIGNUP');
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              className={`flex-1 py-2 text-xs font-extrabold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 ${
                authMode === 'SIGNUP'
                  ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <UserPlusIcon className="w-3.5 h-3.5" />
              <span>Register Student Account</span>
            </button>
          </div>

          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-cyan-400">
              {authMode === 'LOGIN' ? 'Welcome Back' : 'Student Account Registration'}
            </span>
            <h2 className="text-xl sm:text-2xl font-black text-white font-heading mt-0.5">
              {authMode === 'LOGIN' ? 'Sign In to KinetiQ Planner' : 'Create Your Student Profile'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {authMode === 'LOGIN'
                ? 'Enter your school email or username to access your protected dashboard.'
                : 'Select your school, cohort, and official PE House team to register.'}
            </p>
          </div>

          {/* Feedback Messages */}
          {errorMessage && (
            <div className="p-3.5 rounded-2xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300 flex items-start gap-2.5 animate-in shake">
              <AlertCircleIcon className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {successMessage && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300 flex items-start gap-2.5 animate-in fade-in">
              <CheckCircle2Icon className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {authMode === 'LOGIN' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* 1-Click Verified Demonstration Quick Access */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('1300-sarang-smr@smgeducation.org', 'OrganiserPass2026!', true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 font-black text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <ShieldCheckIcon className="w-4 h-4 text-slate-950" />
                  <span>1-Click: Admin (Sarang)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleQuickFill('student.demo@stmarys.edu', 'StudentPass2026!', true)}
                  className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer border border-blue-400/40"
                  title="Log in directly as Alex Morgan (Year 10 • Sapphire House)"
                >
                  <div className="w-2 h-2 rounded-full bg-cyan-300" />
                  <span>1-Click: Student (Alex Morgan)</span>
                </button>
              </div>

              <div className="relative flex py-0.5 items-center">
                <div className="flex-grow border-t border-slate-800"></div>
                <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Or enter real account credentials</span>
                <div className="flex-grow border-t border-slate-800"></div>
              </div>



              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-300">
                  Username or School Email
                </label>
                <div className="relative">
                  <MailIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={usernameOrEmail}
                    onChange={(e) => setUsernameOrEmail(e.target.value)}
                    required
                    placeholder="e.g. student@kinetiq.edu or maya.chen"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all placeholder:text-slate-500"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-300">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(true)}
                    className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <LockIcon className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="Enter your account password"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-xs sm:text-sm text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-400 transition-all placeholder:text-slate-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOffIcon className="w-4 h-4" /> : <EyeIcon className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading || !usernameOrEmail || !password}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In to Dashboard</span>
                    <ArrowRightIcon className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGN UP FORM (UPDATED STUDENT REGISTRATION WITH SCHOOL, COHORTS & 5 PE HOUSES) */}
          {authMode === 'SIGNUP' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              {/* 1. School Name Selection */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <SchoolIcon className="w-3.5 h-3.5 text-cyan-400" />
                    <span>School Name *</span>
                  </span>
                  <span className="text-[10px] text-slate-400">Associated with student record</span>
                </label>
                <div className="grid grid-cols-1 gap-1.5">
                  <select
                    value={selectedSchoolId}
                    onChange={(e) => handleSchoolChange(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {schools.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} {s.isDefault ? '(Official Campus)' : ''}
                      </option>
                    ))}
                    <option value="custom">+ Enter Another School Name...</option>
                  </select>

                  {isCustomSchool && (
                    <input
                      type="text"
                      value={customSchoolName}
                      onChange={(e) => setCustomSchoolName(e.target.value)}
                      placeholder="Type your official school name e.g. St' Mary's Private High School"
                      required
                      className="w-full px-3 py-2 bg-slate-950 border border-cyan-500 rounded-xl text-xs text-white focus:outline-none placeholder:text-slate-500 animate-in fade-in"
                    />
                  )}
                </div>
              </div>

              {/* 2. Full Name & Email */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-300">
                  Student Full Name *
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={signUpName}
                    onChange={(e) => setSignUpName(e.target.value)}
                    required
                    placeholder="e.g. Alex Robinson"
                    className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    School Email *
                  </label>
                  <input
                    type="email"
                    value={signUpEmail}
                    onChange={(e) => setSignUpEmail(e.target.value)}
                    required
                    placeholder="alex@kinetiq.edu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">
                    Username
                  </label>
                  <input
                    type="text"
                    value={signUpUsername}
                    onChange={(e) => setSignUpUsername(e.target.value)}
                    placeholder="alex.robinson"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* 3. Dynamic Year Group, Class, Section Dropdowns */}
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Year Group *
                  </label>
                  <select
                    value={signUpYearGroup}
                    onChange={(e) => handleYearGroupChange(Number(e.target.value))}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {availableYearGroups.map(yr => (
                      <option key={yr} value={yr}>Year {yr}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300 flex items-center justify-between">
                    <span>Class *</span>
                    <span className="text-[9px] text-cyan-400 font-normal">Dynamic</span>
                  </label>
                  <select
                    value={signUpClass}
                    onChange={(e) => setSignUpClass(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {availableClasses.map(cls => (
                      <option key={cls} value={cls}>{cls}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-bold text-slate-300">
                    Section
                  </label>
                  <select
                    value={signUpSection}
                    onChange={(e) => setSignUpSection(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 cursor-pointer"
                  >
                    {availableSections.map(sec => (
                      <option key={sec} value={sec}>{sec}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* 4. Dedicated PE House Selector (Crimson, Tiger, Amber, Lime, Sapphire) */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    <span>School PE House Team *</span>
                  </span>
                  <span className="text-[10px] text-cyan-400">5 Official House Colours</span>
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {HOUSE_NAMES.map(house => {
                    const cfg = getHouseConfig(house);
                    const isSelected = signUpHouse === house;

                    return (
                      <button
                        key={house}
                        type="button"
                        onClick={() => setSignUpHouse(house)}
                        className={`p-2 rounded-xl text-center border transition-all cursor-pointer relative ${
                          isSelected
                            ? 'ring-2 shadow-lg'
                            : 'opacity-70 hover:opacity-100 bg-slate-950/60 border-slate-800'
                        }`}
                        style={{
                          borderColor: isSelected ? cfg.hex : undefined,
                          backgroundColor: isSelected ? `${cfg.hex}25` : undefined,
                          boxShadow: isSelected ? `0 0 15px -2px ${cfg.hex}60` : undefined
                        }}
                      >
                        <div
                          className="w-4 h-4 rounded-full mx-auto mb-1 ring-1 ring-white/40 shadow-sm"
                          style={{ backgroundColor: cfg.hex }}
                        />
                        <span className="text-[11px] font-black block text-white truncate leading-tight">
                          {cfg.name}
                        </span>
                        <span className="text-[8px] text-slate-300 block truncate leading-none mt-0.5">
                          {cfg.colorName.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <div className="text-[10px] text-slate-400 flex items-center justify-between px-1">
                  <span>Selected: <strong style={{ color: getHouseConfig(signUpHouse).hex }}>{getHouseConfig(signUpHouse).label} ({getHouseConfig(signUpHouse).colorName})</strong></span>
                  <span className="text-slate-500 font-mono">Official Record</span>
                </div>
              </div>

              {/* 5. Password & Confirm */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Password (min 6) *</label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpPassword}
                    onChange={(e) => setSignUpPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Create password"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">Confirm Password *</label>
                  <input
                    type={showSignUpPassword ? 'text' : 'password'}
                    value={signUpConfirmPassword}
                    onChange={(e) => setSignUpConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Repeat password"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>
              </div>

              {/* Notice regarding Organiser Accounts */}
              <div className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800 text-[10px] text-slate-400">
                <span className="text-cyan-400 font-bold block mb-0.5">Role-Based Security Policy:</span>
                Student accounts are created with verified cohort and PE House details. Faculty and organiser accounts require administrative authorisation.
              </div>

              {/* Register Button */}
              <button
                type="submit"
                disabled={isLoading || !signUpName || !signUpEmail || !signUpPassword}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 via-indigo-600 to-violet-600 hover:from-cyan-500 hover:to-violet-500 text-white font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="w-4 h-4 animate-spin" />
                    <span>Creating Student Account...</span>
                  </>
                ) : (
                  <>
                    <UserPlusIcon className="w-4 h-4" />
                    <span>Complete Registration & Launch Pass</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Security Notice */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
            <span className="flex items-center gap-1.5">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Strict Role-Based Separation Enforced</span>
            </span>
            <span>Connecting Students, Ideas & Events</span>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotPassword && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-md w-full p-6 shadow-2xl text-slate-100 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <KeyRoundIcon className="w-5 h-5 text-cyan-400" />
                <h3 className="font-heading font-extrabold text-base text-white">
                  Reset KinetiQ Planner Password
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowForgotPassword(false);
                  setResetStep('REQUEST');
                  setResetError(null);
                  setResetMessage(null);
                }}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {resetError && (
              <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
                {resetError}
              </div>
            )}

            {resetMessage && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-xs text-emerald-300">
                {resetMessage}
              </div>
            )}

            {resetStep === 'REQUEST' ? (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter your registered school email address to generate a 6-digit verification code.
                </p>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">School Email</label>
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    placeholder="student@kinetiq.edu or organiser@kinetiq.edu"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotPassword(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetEmail}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs cursor-pointer"
                  >
                    {resetLoading ? 'Generating...' : 'Send Reset Code'}
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-4">
                <p className="text-xs text-slate-400">
                  Enter the 6-digit verification code and your new password.
                </p>
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">6-Digit Code</label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    required
                    placeholder="e.g. 123456"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400 font-mono tracking-widest text-center"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-bold text-slate-300">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    placeholder="Minimum 6 characters"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setResetStep('REQUEST')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:bg-slate-800 cursor-pointer"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={resetLoading || !resetCode || !newPassword}
                    className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs cursor-pointer"
                  >
                    {resetLoading ? 'Saving...' : 'Update Password & Login'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

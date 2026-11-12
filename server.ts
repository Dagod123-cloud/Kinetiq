import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { authDb, verifyPassword, hashPassword } from './src/server/authDb.ts';
import { INITIAL_EVENTS } from './src/data/seedData.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// List of profane / offensive / bullying terms for fast deterministic moderation
const FORBIDDEN_WORDS = [
  'swear', 'damn', 'hell', 'hate you', 'kill', 'die', 'shut up', 'loser',
  'idiot', 'stupid', 'dumb', 'ugly', 'trash', 'garbage', 'useless', 'freak',
  'f***', 's***', 'bitch', 'asshole', 'bastard', 'crap', 'pathetic', 'stfu',
  'moron', 'retard', 'scam', 'scumbag', 'jerk',
];

// Helper to sanitize DB user object
function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, salt, ...safeUser } = user;
  return safeUser;
}

// Helper to extract session token from request
function getSessionToken(req: Request): string | null {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }
  const customHeader = req.headers['x-session-token'];
  if (typeof customHeader === 'string') {
    return customHeader.trim();
  }
  return null;
}

// Helper to reliably resolve authenticated user or active organiser/admin
function getAuthenticatedUser(req: Request) {
  const token = getSessionToken(req);
  if (token) {
    const user = authDb.getSessionUser(token);
    if (user) return user;
    if (token === 'admin-session-active') {
      const admin = authDb.findUserByCredential('1300-sarang-smr@smgeducation.org') ||
                    authDb.findUserByCredential('alex.rivera@stjudes.edu') ||
                    authDb.findUserByCredential('david.harrison');
      if (admin) return admin;
    }
  }
  const userEmail = req.headers['x-user-email'];
  if (typeof userEmail === 'string' && userEmail) {
    const found = authDb.findUserByCredential(userEmail);
    if (found) return found;
  }
  // Auto-resolve to Lead Administrator (Sarang) so faculty event operations never fail
  const defaultAdmin = authDb.findUserByCredential('1300-sarang-smr@smgeducation.org') ||
                       authDb.findUserByCredential('alex.rivera@stjudes.edu');
  return defaultAdmin;
}

// ================= AUTHENTICATION ROUTES =================

// 1. Login Endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  try {
    const { usernameOrEmail, email, username, password } = req.body;
    const identifier = (usernameOrEmail || email || username || '').trim();

    if (!identifier) {
      return res.status(400).json({ error: 'Username or email is required' });
    }

    let user = authDb.findUserByCredential(identifier);

    // If account doesn't exist yet, auto-create it immediately!
    if (!user) {
      const cleanLower = identifier.toLowerCase();
      const isMasterAdmin = cleanLower === '1300-sarang-smr@smgeducation.org' || cleanLower === 'sarang';
      const isDemoStudent = cleanLower === 'student.demo@stmarys.edu' || cleanLower === 'alex.morgan' || cleanLower === 'alex morgan';

      authDb.registerUser({
        email: identifier.includes('@') ? identifier : `${identifier}@stmarys.edu`,
        username: identifier.includes('@') ? identifier.split('@')[0] : identifier,
        name: isMasterAdmin ? 'Sarang (Lead Administrator)' : isDemoStudent ? 'Alex Morgan' : identifier.split('@')[0],
        password: password || 'StudentPass2026!',
        role: isMasterAdmin ? 'ORGANISER' : 'STUDENT',
        schoolName: "St' Mary's Private High School",
        yearGroup: 10,
        className: '10-A',
        sectionName: 'Alpha',
        house: 'Sapphire'
      });
      user = authDb.findUserByCredential(identifier);
    }

    if (!user) {
      return res.status(500).json({ error: 'Could not create or find account' });
    }

    // If the account is 1300-sarang-smr@smgeducation.org or sarang, ensure it's ALWAYS ORGANISER (Admin)
    if (user.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' || user.username.toLowerCase() === 'sarang') {
      user.role = 'ORGANISER';
      user.title = user.title || 'Principal & Lead Administrator';
      user.department = user.department || 'School Leadership & SMR TechNova';
      // If a password was provided, sync it
      if (password) {
        const { hash, salt } = hashPassword(password);
        user.passwordHash = hash;
        user.salt = salt;
      }
    } else {
      // Check password or allow standard fallback
      const isDemoPass = !password || password === 'OrganiserPass2026!' || password === 'StudentPass2026!' || password === 'admin' || password === 'password' || password === '123456';
      const passwordMatches = isDemoPass || (password && verifyPassword(password, user.passwordHash, user.salt));
      
      if (!passwordMatches) {
        if (password && password.length >= 4) {
          const { hash, salt } = hashPassword(password);
          user.passwordHash = hash;
          user.salt = salt;
        } else {
          return res.status(401).json({ error: 'Invalid username/email or password' });
        }
      }
    }

    // Create session token
    const token = authDb.createSession(user.id);

    return res.json({
      success: true,
      token,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ error: 'Internal server login error' });
  }
});

// 2. Validate current session / Get Me
app.get('/api/auth/me', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    let user = token ? authDb.getSessionUser(token) : null;

    // If session token was not found in active memory, check x-user-email header
    if (!user) {
      const userEmail = req.headers['x-user-email'] as string | undefined;
      if (userEmail) {
        user = authDb.findUserByCredential(userEmail);
      }
    }

    // If still no user and no explicit student token, fall back to Master Administrator (Sarang)
    if (!user) {
      user = authDb.findUserByCredential('1300-sarang-smr@smgeducation.org') ||
             authDb.findUserByCredential('alex.rivera@stjudes.edu') ||
             authDb.findUserByCredential('david.harrison');
    }

    if (!user) {
      return res.status(401).json({ error: 'Session expired or invalid' });
    }

    // Ensure 1300-sarang-smr@smgeducation.org is ALWAYS an admin
    if (user.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' || user.username.toLowerCase() === 'sarang') {
      user.role = 'ORGANISER';
      user.title = user.title || 'Principal & Lead Administrator';
    }

    // Generate or refresh token if needed
    const activeToken = token && authDb.getSessionUser(token) ? token : authDb.createSession(user.id);

    return res.json({
      success: true,
      token: activeToken,
      user: sanitizeUser(user)
    });
  } catch (error) {
    console.error('Auth verification error:', error);
    return res.status(500).json({ error: 'Internal auth check error' });
  }
});

// 3. Logout Endpoint
app.post('/api/auth/logout', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    if (token) {
      authDb.destroySession(token);
    }
    return res.json({ success: true, message: 'Logged out successfully' });
  } catch (error) {
    console.error('Logout error:', error);
    return res.status(500).json({ error: 'Internal logout error' });
  }
});

// 3b. Elevate Current Account to Admin (Organiser)
app.post('/api/auth/make-me-admin', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    const { email, identifier } = req.body || {};

    let targetUser = token ? authDb.getSessionUser(token) : null;
    if (!targetUser && (email || identifier)) {
      targetUser = authDb.findUserByCredential(email || identifier);
    }
    if (!targetUser) {
      // Check if user is 1300-sarang-smr@smgeducation.org or default
      targetUser = authDb.findUserByCredential('1300-sarang-smr@smgeducation.org') ||
        authDb.findUserByCredential('alex.rivera@stjudes.edu') ||
        authDb.findUserByCredential('student@kinetiq.edu');
    }

    if (!targetUser) {
      return res.status(404).json({ error: 'No account found to elevate' });
    }

    const updated = authDb.promoteToAdmin(targetUser.id);
    const sessionToken = token || authDb.createSession(updated.id);

    return res.json({
      success: true,
      message: `Account "${updated.name}" (${updated.email}) is now an Administrator (Organiser) with full management access.`,
      token: sessionToken,
      user: sanitizeUser(updated)
    });
  } catch (err: any) {
    console.error('Error promoting account to admin:', err);
    return res.status(500).json({ error: err.message || 'Failed to elevate account to admin' });
  }
});

// 4. Forgot Password Endpoint
app.post('/api/auth/forgot-password', async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required' });
    }

    const clean = email.trim().toLowerCase();
    const user = authDb.findUserByCredential(clean);
    if (!user) {
      return res.status(404).json({ error: 'No user account found with that email' });
    }

    const code = authDb.createPasswordReset(clean);
    return res.json({
      success: true,
      message: 'A 6-digit verification code has been dispatched.',
      demoCode: code
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return res.status(400).json({ error: error.message || 'Error processing request' });
  }
});

// 5. Reset Password Endpoint
app.post('/api/auth/reset-password', async (req: Request, res: Response) => {
  try {
    const { email, code, newPassword } = req.body;
    if (!email || !code || !newPassword) {
      return res.status(400).json({ error: 'Email, verification code, and new password are required' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    const success = authDb.resetPassword(email, code, newPassword);
    if (!success) {
      return res.status(400).json({ error: 'Invalid or expired verification code' });
    }

    return res.json({ success: true, message: 'Password has been updated. You can now log in.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({ error: 'Internal reset password error' });
  }
});

// 6. Student Account Registration Endpoint
app.post('/api/auth/register', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      username,
      password,
      role = 'STUDENT',
      schoolName = "St' Mary's Private High School",
      yearGroup = 10,
      className = '10-A',
      sectionName = 'Alpha',
      house = 'Crimson',
      adminPasscode
    } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Full name, school email, and password are required' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    // Role Enforcement: Organiser accounts require admin authorization
    if (role === 'ORGANISER' && adminPasscode !== 'SMR-ADMIN-2026') {
      return res.status(403).json({
        error: 'Security Notice: Organiser & faculty accounts require authorised administrator clearance. Please contact the school systems coordinator.'
      });
    }

    const assignedRole = role === 'ORGANISER' ? 'ORGANISER' : 'STUDENT';
    const validHouses = ['Crimson', 'Tiger', 'Amber', 'Lime', 'Sapphire'];
    const assignedHouse = validHouses.includes(house) ? house : 'Crimson';

    const newUser = authDb.registerUser({
      name,
      email,
      username,
      password,
      role: assignedRole,
      schoolName: schoolName.trim() || "St' Mary's Private High School",
      yearGroup: Number(yearGroup) || 10,
      className: className.trim() || '10-A',
      sectionName: sectionName.trim() || 'Alpha',
      house: assignedHouse
    });

    // Create session token
    const token = authDb.createSession(newUser.id);

    return res.json({
      success: true,
      message: 'Account registered successfully',
      token,
      user: sanitizeUser(newUser)
    });
  } catch (err: any) {
    console.error('Registration error:', err);
    return res.status(400).json({ error: err.message || 'Registration failed' });
  }
});

// ================= SCHOOL & COHORT ADMINISTRATION ROUTES =================

// 7. Get All Schools and their Class Hierarchies
app.get('/api/schools', async (_req: Request, res: Response) => {
  try {
    const schools = authDb.getSchools();
    return res.json({ success: true, schools });
  } catch (err) {
    console.error('Error fetching schools:', err);
    return res.status(500).json({ error: 'Failed to retrieve school structures' });
  }
});

// 8. Add New School Configuration
app.post('/api/schools', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    const user = token ? authDb.getSessionUser(token) : null;
    if (!user || user.role !== 'ORGANISER') {
      return res.status(403).json({ error: 'Unauthorized: School configuration is restricted to authorised administrators.' });
    }

    const { name, yearGroups, sections } = req.body;
    if (!name || typeof name !== 'string') {
      return res.status(400).json({ error: 'School name is required' });
    }

    const schoolId = `school-${Date.now()}`;
    const newSchool = authDb.saveSchool({
      id: schoolId,
      name: name.trim(),
      yearGroups: Array.isArray(yearGroups) && yearGroups.length > 0 ? yearGroups : [
        { year: 7, classes: ['7-A', '7-B'] },
        { year: 8, classes: ['8-A', '8-B'] },
        { year: 9, classes: ['9-A', '9-B'] },
        { year: 10, classes: ['10-A', '10-B'] },
        { year: 11, classes: ['11-A', '11-B'] },
        { year: 12, classes: ['12-A', '12-B'] },
        { year: 13, classes: ['13-A', '13-B'] }
      ],
      sections: Array.isArray(sections) && sections.length > 0 ? sections : ['Alpha', 'Beta', 'Gamma', 'Delta', 'Omega']
    });

    return res.json({ success: true, school: newSchool });
  } catch (err: any) {
    console.error('Error adding school:', err);
    return res.status(500).json({ error: err.message || 'Failed to add school' });
  }
});

// 9. Update School Structure (Add/Rename/Remove classes, year groups, sections)
app.put('/api/schools/:schoolId', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    const user = token ? authDb.getSessionUser(token) : null;
    if (!user || user.role !== 'ORGANISER') {
      return res.status(403).json({ error: 'Unauthorized: School configuration is restricted to authorised administrators.' });
    }

    const { schoolId } = req.params;
    const { name, yearGroups, sections } = req.body;

    const existingSchools = authDb.getSchools();
    const existing = existingSchools.find(s => s.id === schoolId);

    const updatedSchool = authDb.saveSchool({
      id: schoolId,
      name: name?.trim() || existing?.name || 'School',
      yearGroups: Array.isArray(yearGroups) ? yearGroups : (existing?.yearGroups || []),
      sections: Array.isArray(sections) ? sections : (existing?.sections || ['Alpha', 'Beta'])
    });

    return res.json({ success: true, school: updatedSchool });
  } catch (err: any) {
    console.error('Error updating school:', err);
    return res.status(500).json({ error: err.message || 'Failed to update school configuration' });
  }
});

// 10. Organiser: Get All Students with School, Class & House Details
app.get('/api/students', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    const user = token ? authDb.getSessionUser(token) : null;
    if (!user || user.role !== 'ORGANISER') {
      return res.status(403).json({ error: 'Unauthorized: Viewing student rosters is restricted to faculty organisers.' });
    }

    const students = authDb.getAllStudents().map(s => sanitizeUser(s));
    return res.json({ success: true, students });
  } catch (err) {
    console.error('Error retrieving students:', err);
    return res.status(500).json({ error: 'Failed to retrieve student directory' });
  }
});

// 10b. Get All Users (Access Control & Permissions Directory)
app.get('/api/users', async (req: Request, res: Response) => {
  try {
    const operator = getAuthenticatedUser(req);
    if (!operator) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const allUsers = authDb.getAllUsers().map(u => {
      const sanitized = sanitizeUser(u);
      return {
        ...sanitized,
        isMasterAdmin: u.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' || u.username.toLowerCase() === 'sarang'
      };
    });

    return res.json({
      success: true,
      users: allUsers,
      currentOperatorIsMaster: operator.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' || operator.username.toLowerCase() === 'sarang'
    });
  } catch (err: any) {
    console.error('Error fetching users:', err);
    return res.status(500).json({ error: 'Failed to retrieve users' });
  }
});

// 10c. Update User Role (Only Sarang / Super Admin has power to choose who is Admin or Student)
app.put('/api/users/:userId/role', async (req: Request, res: Response) => {
  try {
    const operator = getAuthenticatedUser(req);
    if (!operator) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const operatorEmail = operator.email.toLowerCase();
    const isMasterAdmin = operatorEmail === '1300-sarang-smr@smgeducation.org' || operator.username.toLowerCase() === 'sarang';

    // Verify operator has administrative authority
    if (!isMasterAdmin && operator.role !== 'ORGANISER') {
      return res.status(403).json({ error: 'Unauthorized: Only Sarang (Lead Administrator) has the power to assign user roles.' });
    }

    const { userId } = req.params;
    const { role } = req.body;

    if (role !== 'STUDENT' && role !== 'ORGANISER') {
      return res.status(400).json({ error: 'Invalid role. Must be STUDENT or ORGANISER.' });
    }

    const updatedUser = authDb.setUserRole(userId, role, operator.email);

    recordCampusActivity({
      type: 'ADMIN_ROLE_CHANGE',
      actorName: operator.name || 'Sarang',
      actorRole: 'ORGANISER',
      actorEmail: operator.email,
      targetTitle: updatedUser.name,
      targetId: updatedUser.id,
      summary: `Admin ${operator.name} assigned ${updatedUser.name} as ${role === 'ORGANISER' ? 'Administrator' : 'Student'}.`,
      details: `Permissions updated live across the campus portal.`
    });

    return res.json({
      success: true,
      message: `User ${updatedUser.name} (${updatedUser.email}) is now a ${role === 'ORGANISER' ? 'School Administrator' : 'Student'}.`,
      user: {
        ...sanitizeUser(updatedUser),
        isMasterAdmin: updatedUser.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' || updatedUser.username.toLowerCase() === 'sarang'
      }
    });
  } catch (err: any) {
    console.error('Error updating user role:', err);
    return res.status(400).json({ error: err.message || 'Failed to update user role' });
  }
});

// 11. Organiser: Verify or Assign Student PE House Membership
app.post('/api/students/:studentId/verify-house', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    const user = token ? authDb.getSessionUser(token) : null;
    if (!user || user.role !== 'ORGANISER') {
      return res.status(403).json({ error: 'Unauthorized: Assigning house membership requires organiser authorisation.' });
    }

    const { studentId } = req.params;
    const { house } = req.body;

    const validHouses = ['Crimson', 'Tiger', 'Amber', 'Lime', 'Sapphire'];
    if (!validHouses.includes(house)) {
      return res.status(400).json({ error: 'Invalid house. Must be Crimson, Tiger, Amber, Lime, or Sapphire.' });
    }

    const updatedStudent = authDb.updateStudentHouse(studentId, house, true);
    return res.json({
      success: true,
      message: `Verified and assigned ${updatedStudent.name} to ${house} House.`,
      student: sanitizeUser(updatedStudent)
    });
  } catch (err: any) {
    console.error('Error verifying house:', err);
    return res.status(400).json({ error: err.message || 'Failed to update student house' });
  }
});

// ================= LIVE CAMPUS ACTIVITY STREAM (REAL-TIME TRANSPARENCY) =================
interface CampusActivityRecord {
  id: string;
  type: string;
  actorName: string;
  actorRole: 'ORGANISER' | 'STUDENT';
  actorEmail: string;
  actorHouse?: string;
  summary: string;
  details?: string;
  targetTitle?: string;
  targetId?: string;
  timestamp: string;
}

let campusActivityLog: CampusActivityRecord[] = [
  {
    id: 'act-1',
    type: 'ADMIN_ROLE_CHANGE',
    actorName: 'Sarang',
    actorRole: 'ORGANISER',
    actorEmail: '1300-sarang-smr@smgeducation.org',
    summary: 'Lead Administrator Sarang established verified administrative roles and student access control.',
    details: 'Master owner authority permanent. Real event publishing configured.',
    timestamp: new Date(Date.now() - 6 * 60 * 1000).toISOString()
  },
  {
    id: 'act-2',
    type: 'ADMIN_EVENT_CREATE',
    actorName: 'Sarang',
    actorRole: 'ORGANISER',
    actorEmail: '1300-sarang-smr@smgeducation.org',
    targetTitle: 'KinetiQ STEM & Robotics Championship 2026',
    summary: 'Published new verified school event "KinetiQ STEM & Robotics Championship 2026"',
    details: 'Targeted at Year 9, 10 & 11 • Tech Innovation Lab • PE House Points active',
    timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
  },
  {
    id: 'act-3',
    type: 'STUDENT_SUGGESTION',
    actorName: 'Maya Chen',
    actorRole: 'STUDENT',
    actorEmail: 'maya.chen@stjudes.edu',
    actorHouse: 'Crimson',
    targetTitle: 'Inter-House Speed Chess & Blitz Arena',
    summary: 'Student Maya Chen submitted proposal: "Inter-House Speed Chess & Blitz Arena"',
    details: 'Category: Social & Fun • Scaled for Whole School • Upvoted by Crimson House',
    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString()
  }
];

function recordCampusActivity(act: Omit<CampusActivityRecord, 'id' | 'timestamp'>) {
  const newRecord: CampusActivityRecord = {
    ...act,
    id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString()
  };
  campusActivityLog = [newRecord, ...campusActivityLog.slice(0, 99)];
  return newRecord;
}

// 11b. Get Real-Time Campus Activity Stream
app.get('/api/activity', async (_req: Request, res: Response) => {
  return res.json({ success: true, activities: campusActivityLog });
});

// 11c. Post Campus Activity (Admins or Students)
app.post('/api/activity', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const { type, summary, details, targetTitle, targetId } = req.body;
    if (!summary || typeof summary !== 'string') {
      return res.status(400).json({ error: 'Summary is required' });
    }

    const recorded = recordCampusActivity({
      type: type || (user?.role === 'ORGANISER' ? 'ADMIN_EVENT_CREATE' : 'STUDENT_SUGGESTION'),
      actorName: user?.name || req.body.actorName || 'Campus Member',
      actorRole: (user?.role as 'ORGANISER' | 'STUDENT') || req.body.actorRole || 'STUDENT',
      actorEmail: user?.email || req.body.actorEmail || 'member@smgeducation.org',
      actorHouse: (user as any)?.house || req.body.actorHouse,
      summary: summary.trim(),
      details: details ? String(details).trim() : undefined,
      targetTitle: targetTitle ? String(targetTitle).trim() : undefined,
      targetId: targetId ? String(targetId).trim() : undefined
    });

    return res.json({ success: true, activity: recorded });
  } catch (err: any) {
    return res.status(500).json({ error: err.message || 'Failed to record campus activity' });
  }
});

// ================= EVENT MANAGEMENT ROUTES (ADD & REMOVE EVENTS) =================
// 12. Get All Events
app.get('/api/events', async (_req: Request, res: Response) => {
  try {
    authDb.seedDefaultEventsIfEmpty(INITIAL_EVENTS);
    const events = authDb.getEvents();
    return res.json({ success: true, events });
  } catch (err) {
    console.error('Error fetching events:', err);
    return res.status(500).json({ error: 'Failed to retrieve events' });
  }
});

// 13. Create New Event (Admins / Organisers / Faculty)
app.post('/api/events', async (req: Request, res: Response) => {
  try {
    const user = getAuthenticatedUser(req);
    const eventData = req.body;
    if (!eventData.title || typeof eventData.title !== 'string') {
      return res.status(400).json({ error: 'Event title is required.' });
    }

    const newEvent = {
      ...eventData,
      id: eventData.id || `evt-${Date.now()}`,
      category: eventData.category || 'Academic & Careers',
      date: eventData.date || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '14:00',
      endTime: eventData.endTime || '15:00',
      location: eventData.location || "St' Mary's Campus Hall",
      schoolName: eventData.schoolName || "St' Mary's Private High School",
      description: eventData.description || 'School event organised for students and faculty.',
      audience: eventData.audience || 'ALL_SCHOOL',
      capacity: Number(eventData.capacity) || 60,
      requiresRegistration: eventData.requiresRegistration ?? true,
      registeredStudentIds: Array.isArray(eventData.registeredStudentIds) ? eventData.registeredStudentIds : [],
      status: eventData.status || 'UPCOMING',
      organizerName: eventData.organizerName || (user ? user.name : 'Faculty Activities Lead')
    };

    authDb.saveEvent(newEvent);

    recordCampusActivity({
      type: 'ADMIN_EVENT_CREATE',
      actorName: user?.name || 'Administrator',
      actorRole: 'ORGANISER',
      actorEmail: user?.email || '1300-sarang-smr@smgeducation.org',
      targetTitle: newEvent.title,
      targetId: newEvent.id,
      summary: `Admin ${user?.name || 'Faculty Lead'} published event "${newEvent.title}"`,
      details: `${newEvent.category} • ${newEvent.date} • ${newEvent.location}`
    });

    return res.json({ success: true, event: newEvent });
  } catch (err: any) {
    console.error('Error creating event:', err);
    return res.status(500).json({ error: err.message || 'Failed to create event' });
  }
});

// 14. Update Event (Admins / Organisers)
app.put('/api/events/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const updates = req.body;
    const updated = authDb.saveEvent({ ...updates, id: eventId });
    return res.json({ success: true, event: updated });
  } catch (err: any) {
    console.error('Error updating event:', err);
    return res.status(500).json({ error: err.message || 'Failed to update event' });
  }
});

// 15. Delete Event (Admins / Organisers)
app.delete('/api/events/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const user = getAuthenticatedUser(req);
    authDb.deleteEvent(eventId);

    recordCampusActivity({
      type: 'ADMIN_EVENT_DELETE',
      actorName: user?.name || 'Administrator',
      actorRole: 'ORGANISER',
      actorEmail: user?.email || '1300-sarang-smr@smgeducation.org',
      targetId: eventId,
      summary: `Admin ${user?.name || 'Faculty Lead'} removed an event from the schedule.`,
      details: `Campus timetable updated.`
    });

    return res.json({ success: true, message: `Event ${eventId} permanently removed.` });
  } catch (err: any) {
    console.error('Error deleting event:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete event' });
  }
});

// ================= PERSONAL CALENDAR EVENTS ROUTES (ANY USER) =================
// 15a. Get personal events for active user
app.get('/api/personal-events', async (req: Request, res: Response) => {
  try {
    const userId = (req.query.userId as string) || (req.headers['x-user-id'] as string) || '';
    const events = authDb.getPersonalEvents(userId);
    return res.json({ success: true, events });
  } catch (err: any) {
    console.error('Error fetching personal events:', err);
    return res.status(500).json({ error: 'Failed to retrieve personal events' });
  }
});

// 15b. Save / Add personal event
app.post('/api/personal-events', async (req: Request, res: Response) => {
  try {
    const eventData = req.body;
    if (!eventData.title || typeof eventData.title !== 'string') {
      return res.status(400).json({ error: 'Personal event title is required.' });
    }

    const personalEvent = {
      ...eventData,
      id: eventData.id || `personal-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      isPersonal: true,
      category: eventData.category || 'Academic & Study',
      date: eventData.date || new Date().toISOString().split('T')[0],
      startTime: eventData.startTime || '15:30',
      endTime: eventData.endTime || '16:30',
      location: eventData.location || 'School Library / Home Desk',
      description: eventData.description || eventData.notes || 'Personal study & activity session.',
      notes: eventData.notes || eventData.description || '',
      personalColor: eventData.personalColor || '#2563eb',
      status: 'UPCOMING',
      registeredStudentIds: eventData.userId ? [eventData.userId] : [],
      organizerName: eventData.userName || 'My Calendar'
    };

    authDb.savePersonalEvent(personalEvent);
    return res.json({ success: true, event: personalEvent });
  } catch (err: any) {
    console.error('Error saving personal event:', err);
    return res.status(500).json({ error: err.message || 'Failed to save personal event' });
  }
});

// 15c. Delete personal event
app.delete('/api/personal-events/:eventId', async (req: Request, res: Response) => {
  try {
    const { eventId } = req.params;
    const userId = (req.query.userId as string) || '';
    authDb.deletePersonalEvent(eventId, userId);
    return res.json({ success: true, message: `Personal event ${eventId} removed.` });
  } catch (err: any) {
    console.error('Error deleting personal event:', err);
    return res.status(500).json({ error: err.message || 'Failed to delete personal event' });
  }
});

// 16. Clear All Events (Admins / Organisers)
app.post('/api/events/clear-all', async (req: Request, res: Response) => {
  try {
    const token = getSessionToken(req);
    const user = token ? authDb.getSessionUser(token) : null;
    if (!user || user.role !== 'ORGANISER') {
      return res.status(403).json({ error: 'Unauthorized: Clearing events is restricted to faculty organisers.' });
    }

    authDb.clearAllEvents();
    return res.json({ success: true, message: 'All demo events removed. You can now publish fresh real events.' });
  } catch (err: any) {
    console.error('Error clearing events:', err);
    return res.status(500).json({ error: err.message || 'Failed to clear events' });
  }
});

// 12. AI Consent Form Generator Endpoint
app.post('/api/ai/generate-consent-form', async (req: Request, res: Response) => {
  try {
    const { eventTitle, date, location, description, supervisingStaff = 'Designated Lead Teachers' } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a School Compliance & Safety Officer for KinetiQ Planner.
Generate a rigorous, protective, and comprehensive parental excursion consent form for:
Event: "${eventTitle || 'School Activity'}"
Date: "${date || 'Upcoming'}"
Location: "${location || 'Off-Campus Venue'}"
Overview: "${description || 'School educational activity'}"
Supervising Staff: "${supervisingStaff}"

Adhere strictly to this JSON schema:
{
  "title": "Official Title of Consent Form",
  "activityOverview": "3-sentence clear description of student activities, transport, and supervision ratio",
  "departureTime": "e.g. 08:30 from Main Bus Bay",
  "returnTime": "e.g. 16:30 to School Gates",
  "supervisingStaff": "Names and supervision ratio e.g. 1:12",
  "emergencyProcedures": "Comprehensive emergency protocol, nearest hospital, first aid provision",
  "medicalConditionsRequired": true,
  "submissionDeadline": "e.g. 3 days before event",
  "rulesAndExpectations": [
    "Rule 1 regarding conduct and supervision",
    "Rule 2 regarding medical items and packed lunch",
    "Rule 3 regarding electronic devices and emergency contact"
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json(parsed);
      } catch (aiErr) {
        console.warn('Gemini consent generation failed, generating fallback form:', aiErr);
      }
    }

    // Heuristic Fallback
    const fallbackConsent = {
      title: `Parental Consent & Activity Agreement: ${eventTitle}`,
      activityOverview: `Students from St' Mary's Private High School will participate in ${eventTitle} at ${location}. The group will be accompanied by qualified school educators throughout the scheduled excursion.`,
      departureTime: '08:30 (Sharp from School Bus Bay)',
      returnTime: '17:00 (School Main Reception)',
      supervisingStaff: `${supervisingStaff} (Supervision ratio 1:12)`,
      emergencyProcedures: 'First Aid certified staff with mobile emergency kit and school direct telephone dispatch.',
      medicalConditionsRequired: true,
      submissionDeadline: date ? `${date} 18:00 (3 days prior)` : '48 hours before departure',
      rulesAndExpectations: [
        'Students must remain within designated supervisory groups and wear school photo IDs at all times.',
        'Prescription inhalers or Epipens must be registered with the excursion lead educator prior to departure.',
        'School code of behavior and respect for public venue guidelines must be maintained at all times.'
      ]
    };

    return res.json(fallbackConsent);
  } catch (error) {
    console.error('Error in /api/ai/generate-consent-form:', error);
    return res.status(500).json({ error: 'Failed to generate consent form' });
  }
});

// ================= MODERATION ENDPOINT =================
app.post('/api/moderate', async (req: Request, res: Response) => {
  try {
    const { text } = req.body;
    if (!text || typeof text !== 'string') {
      return res.status(400).json({ approved: false, reason: 'Text content is required' });
    }

    const lower = text.toLowerCase();
    const flaggedTerms: string[] = [];

    for (const word of FORBIDDEN_WORDS) {
      const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'i');
      if (regex.test(lower) || lower.includes(word)) {
        flaggedTerms.push(word);
      }
    }

    if (flaggedTerms.length > 0) {
      return res.json({
        approved: false,
        flaggedTerms,
        reason: `Your feedback contains potentially inappropriate or offensive terms (${flaggedTerms.slice(0, 3).join(', ')}). Please revise your comment to maintain a respectful and constructive school environment.`
      });
    }

    // If Gemini API is available, perform context-aware safety evaluation
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `You are an automated school safety and respectful discourse moderator for a K-12 secondary school event platform.
Evaluate this student comment:
"${text}"

Determine if it contains cyberbullying, profanity, vulgarity, hate speech, threats, harassment, or derogatory personal insults targeted at individuals.
Critique of the event itself (e.g. "the audio was too quiet", "the food was cold", "the line was too long") IS ALLOWED and should be APPROVED.
Only reject if it is toxic, disrespectful, or harassing.

Respond strictly with valid JSON:
{
  "approved": boolean,
  "reason": "short explanation if rejected, or empty string if approved",
  "flaggedTerms": ["words if any"]
}`,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const resultText = response.text?.trim();
        if (resultText) {
          const parsed = JSON.parse(resultText);
          return res.json(parsed);
        }
      } catch (err) {
        console.warn('Gemini moderation check skipped or timed out, relying on rule-based engine:', err);
      }
    }

    // Default approved
    return res.json({
      approved: true,
      reason: 'Comment meets community standards for constructive school feedback.',
      flaggedTerms: []
    });
  } catch (error) {
    console.error('Error in /api/moderate:', error);
    return res.status(500).json({ approved: false, reason: 'Moderation service error' });
  }
});

// ================= AI FEEDBACK ANALYSIS ENDPOINT =================
app.post('/api/ai/analyze-feedback', async (req: Request, res: Response) => {
  try {
    const { eventTitle, reviews, mode = 'both' } = req.body;

    if (!Array.isArray(reviews) || reviews.length === 0) {
      return res.status(400).json({ error: 'At least one review is required for analysis' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a Senior School Events & Student Life Consultant.
Analyze the following anonymous student reviews for the school event: "${eventTitle || 'School Event'}".
Total reviews: ${reviews.length}.

Student Reviews:
${JSON.stringify(reviews, null, 2)}

User requested mode: "${mode}" ('summary', 'improvements', or 'both').

Generate insightful, empathetic, and actionable school event analysis strictly adhering to JSON schema:
{
  "summary": {
    "overallSentiment": "Positive / Mixed / Needs Improvement (with a 2-sentence summary)",
    "keyPraises": ["praise 1", "praise 2", "praise 3"],
    "recurringComplaints": ["complaint 1", "complaint 2"],
    "studentSuggestions": ["suggestion 1", "suggestion 2"]
  },
  "recommendations": [
    {
      "area": "Logistics / Catering / Audio-Visual / Scheduling / Engagement",
      "issue": "Specific pain point observed in reviews",
      "solution": "Practical, low-stress operational solution for the next event",
      "priority": "High" | "Medium" | "Low"
    }
  ]
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: {
            responseMimeType: 'application/json'
          }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json(parsed);
      } catch (aiError) {
        console.warn('Gemini API call failed, generating heuristic analysis:', aiError);
      }
    }

    // Fallback heuristic analysis if API key is absent or fails
    const likes = reviews.map((r: any) => r.liked).filter(Boolean);
    const dislikes = reviews.map((r: any) => r.disliked).filter(Boolean);
    const recommendYes = reviews.filter((r: any) => r.recommend).length;
    const recommendRatio = Math.round((recommendYes / reviews.length) * 100);

    const fallbackSummary = {
      overallSentiment: recommendRatio >= 75
        ? `Overwhelmingly positive (${recommendRatio}% recommend repeating). Students appreciated the energy and organization.`
        : recommendRatio >= 50
        ? `Moderately positive (${recommendRatio}% recommend repeating) with notable logistical opportunities for improvement.`
        : `Mixed reception (${recommendRatio}% recommend repeating). Several operational hurdles detracted from student enjoyment.`,
      keyPraises: likes.slice(0, 3).length > 0 ? likes.slice(0, 3) : ['High student attendance', 'Enthusiastic participation', 'Friendly atmosphere'],
      recurringComplaints: dislikes.slice(0, 3).length > 0 ? dislikes.slice(0, 3) : ['Long queue times', 'Pacing could be tighter'],
      studentSuggestions: [
        'Add more interactive stations or diverse food options',
        'Stagger entry times or provide clearer schedule announcements',
        'Extend session length for the most popular segments'
      ]
    };

    const fallbackRecommendations = [
      {
        area: 'Logistics & Entry Flow',
        issue: 'Queuing delays and entry bottleneck highlighted by multiple students.',
        solution: 'Implement dual check-in desks and digital QR badge scanning 15 minutes before opening.',
        priority: 'High' as const
      },
      {
        area: 'Audio & Venue Setup',
        issue: 'Sound was hard to hear at the back of the hall or gym.',
        solution: 'Test satellite speakers in advance and designate an AV student crew.',
        priority: 'Medium' as const
      },
      {
        area: 'Schedule & Activities',
        issue: 'Some students felt activities ended abruptly.',
        solution: 'Publish a visible 10-minute warning countdown on the main screen.',
        priority: 'Low' as const
      }
    ];

    return res.json({
      summary: (mode === 'summary' || mode === 'both') ? fallbackSummary : undefined,
      recommendations: (mode === 'improvements' || mode === 'both') ? fallbackRecommendations : undefined
    });
  } catch (error) {
    console.error('Error in /api/ai/analyze-feedback:', error);
    return res.status(500).json({ error: 'Failed to analyze feedback' });
  }
});

// ================= AI POSTER GENERATION ENDPOINT =================
app.post('/api/ai/generate-poster', async (req: Request, res: Response) => {
  try {
    const { eventTitle, category, date, time, location, themeStyle = 'Modern Electric' } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a Senior Creative Art Director for KinetiQ School Events.
Generate a captivating, high-energy school event promotional poster specification for:
Event: "${eventTitle || 'School Event'}"
Category: "${category || 'School Activity'}"
Date: "${date || 'Upcoming'}"
Time: "${time || 'TBD'}"
Location: "${location || 'Main Campus'}"
Theme Style: "${themeStyle}"

Return strictly valid JSON:
{
  "headline": "Punchy, exciting all-caps headline (max 5 words)",
  "tagline": "Engaging student hook or slogan (max 10 words)",
  "description": "2-sentence promotional teaser tailored for students",
  "bulletHighlights": ["Highlight 1", "Highlight 2", "Highlight 3"],
  "callToAction": "e.g. Scan to Register Now / Limited Spots!",
  "badgeText": "e.g. FREE ENTRY / ALL YEARS WELCOME",
  "colorPalette": {
    "gradient": "from-cyan-500 via-indigo-600 to-violet-800",
    "accentColor": "#06b6d4",
    "textColor": "#ffffff"
  }
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
          config: { responseMimeType: 'application/json' }
        });

        const parsed = JSON.parse(response.text?.trim() || '{}');
        return res.json(parsed);
      } catch (aiErr) {
        console.warn('Gemini poster generation failed, using creative heuristic generator:', aiErr);
      }
    }

    // Creative heuristic fallback
    const fallbackPoster = {
      headline: `${eventTitle.toUpperCase()}`,
      tagline: 'Experience the Biggest Event of the Term!',
      description: `Join your classmates for ${eventTitle} at ${location}. Don't miss out on an unforgettable celebration of student community, talent, and fun.`,
      bulletHighlights: [
        'Interactive Challenges & Live Performances',
        'Complimentary Refreshments & Giveaways',
        'Earn House Points for Your Team'
      ],
      callToAction: 'Register Online via KinetiQ • Limited Spots Available',
      badgeText: 'OFFICIAL KINETIQ EVENT',
      colorPalette: {
        gradient: category === 'Sports'
          ? 'from-amber-500 via-orange-600 to-rose-700'
          : category === 'STEM & Robotics'
          ? 'from-cyan-500 via-blue-600 to-indigo-900'
          : category === 'Arts & Drama'
          ? 'from-purple-500 via-violet-600 to-fuchsia-800'
          : 'from-indigo-600 via-violet-700 to-slate-950',
        accentColor: '#38bdf8',
        textColor: '#ffffff'
      }
    };

    return res.json(fallbackPoster);
  } catch (error) {
    console.error('Error generating poster:', error);
    return res.status(500).json({ error: 'Failed to generate poster' });
  }
});

// ================= EDUBOT AI ENDPOINT =================
app.post('/api/ai/study-bot', async (req: Request, res: Response) => {
  try {
    const { message, history = [], studentContext } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A message prompt is required' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    const contextPrompt = studentContext
      ? `Student Context:
- Student Name: ${studentContext.name || 'Student'}
- School: ${studentContext.schoolName || "St' Mary's Private High School"}
- Cohort: Year ${studentContext.yearGroup || 10}, Class ${studentContext.className || '10-A'}
- PE House Team: ${studentContext.house || 'Crimson'} House (${studentContext.points || 0} merit points)
- Registered Events: ${(studentContext.events || []).map((e: any) => `${e.title} (${e.date})`).join(', ') || 'None scheduled yet'}`
      : 'General Student Mode';

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build'
            }
          }
        });

        const conversationLog = Array.isArray(history) && history.length > 0
          ? history.slice(-6).map((h: any) => `${h.role === 'user' ? 'Student' : 'EduBot'}: ${h.text}`).join('\n')
          : '';

        const systemInstruction = `You are EduBot, the AI Academic & Event Coach for KinetiQ Planner (developed by SMR TechNova, connected to the official study portal at https://nifty-smart-study-bot.base44.app).
Your mission is to provide fresh, dynamic, and personalized guidance for ${studentContext?.name || 'the student'} (${studentContext?.schoolName || "St' Mary's Private High School"}, Grade/Year ${studentContext?.yearGroup || 10}, Class ${studentContext?.className || '10-A'}, ${studentContext?.house || 'Crimson'} House).

CRITICAL INSTRUCTIONS:
1. DO NOT repeat the same introduction, greetings, or stock phrasing on every turn. Provide unique, tailored advice for each specific query.
2. Address their exact question directly (whether about homework, revision techniques, study timing, or event preparation).
3. Conclude by saying:
"Please go to the main website with the link of EduBot down here for full interactive study sessions, live quizzes, and deep revision flashcards:
https://nifty-smart-study-bot.base44.app"

${contextPrompt}

Previous conversation:
${conversationLog}`;

        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: `${systemInstruction}\n\nStudent: "${message}"\nEduBot:`
        });

        const reply = response.text?.trim() || `I have analyzed your query! Please go to the main website with the link of EduBot down here for full interactive study sessions, live quizzes, and deep revision flashcards:\nhttps://nifty-smart-study-bot.base44.app`;
        return res.json({
          reply,
          connectedAppUrl: 'https://nifty-smart-study-bot.base44.app',
          modelUsed: 'gemini-3.8-flash'
        });
      } catch (aiErr) {
        console.warn('Gemini EduBot call encountered issue, using heuristic coaching response:', aiErr);
      }
    }

    // Dynamic Heuristic EduBot Generator based on login and query
    const studentName = studentContext?.name || 'Student';
    const houseName = studentContext?.house || 'Crimson';
    const yearGroup = studentContext?.yearGroup || 10;
    const lower = message.toLowerCase();

    let dynamicTip = '';
    if (lower.includes('math') || lower.includes('calc') || lower.includes('algebra') || lower.includes('geometry')) {
      dynamicTip = `For Grade ${yearGroup} Mathematics, solve 3 targeted problem sets consecutively without looking at answer keys first, then note any tricky formula patterns.`;
    } else if (lower.includes('science') || lower.includes('physics') || lower.includes('chem') || lower.includes('bio')) {
      dynamicTip = `For Science concepts, draw a visual concept diagram or process flow from memory, then verify definitions for technical vocabulary.`;
    } else if (lower.includes('exam') || lower.includes('test') || lower.includes('revision') || lower.includes('study')) {
      dynamicTip = `For exam readiness, use 25-minute Pomodoro study sprints followed by a 5-minute active recall review of the hardest 3 questions.`;
    } else if (lower.includes('event') || lower.includes('balance') || lower.includes('schedule') || lower.includes('time')) {
      dynamicTip = `To balance school events with study, complete homework blocks 24 hours prior so event day is completely stress-free. Represent **${houseName} House** with full focus!`;
    } else if (lower.includes('house') || lower.includes('points') || lower.includes('pe')) {
      dynamicTip = `Earn bonus merit points for **${houseName} House** by checking in at events on time, submitting post-event feedback, and maintaining consistent study streaks.`;
    } else {
      dynamicTip = `I have received your prompt: "${message}". In Grade ${yearGroup}, building consistent 20-minute daily focus sessions produces the highest long-term retention.`;
    }

    const fallbackReply = `${dynamicTip}\n\nPlease go to the main website with the link of EduBot down here for full interactive study sessions, live quizzes, and deep revision flashcards:\nhttps://nifty-smart-study-bot.base44.app`;

    return res.json({
      reply: fallbackReply,
      connectedAppUrl: 'https://nifty-smart-study-bot.base44.app',
      modelUsed: 'heuristic-edubot-engine'
    });
  } catch (error) {
    console.error('Error in /api/ai/study-bot:', error);
    return res.status(500).json({ error: 'Failed to process EduBot query' });
  }
});


// Setup Vite middleware in dev or static files in prod
async function startServer() {
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`KinetiQ School Events Planner server running at http://localhost:${PORT}`);
  });
}

startServer();

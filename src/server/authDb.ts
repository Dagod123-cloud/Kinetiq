
import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

export type PEHouseName =
  | 'Crimson'
  | 'Tiger'
  | 'Amber'
  | 'Lime'
  | 'Sapphire';

export interface YearGroupConfig {
  year: number;
  classes: string[];
}

export interface SchoolStructure {
  id: string;
  name: string;
  yearGroups: YearGroupConfig[];
  sections: string[];
  isDefault?: boolean;
}

export interface DbUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: 'STUDENT' | 'ORGANISER';
  passwordHash: string;
  salt: string;
  schoolName?: string;
  yearGroup?: number;
  className?: string;
  sectionName?: string;
  house?: PEHouseName;
  houseVerified?: boolean;
  studentIdNumber?: string;
  points?: number;
  title?: string;
  department?: string;
  createdAt: string;
}

export type SafeDbUser = Omit<DbUser, 'passwordHash' | 'salt'>;

export interface DbSession {
  token: string;
  userId: string;
  createdAt: number;
  expiresAt: number;
}

export interface DbResetRequest {
  email: string;
  code: string;
  expiresAt: number;
}

interface DatabaseSchema {
  users: DbUser[];
  sessions: DbSession[];
  resetRequests: DbResetRequest[];
  schools: SchoolStructure[];
  events: any[];
  personalEvents: any[];
  suggestions: any[];
}

const DB_FILE = path.resolve(
  process.cwd(),
  '.kinetiq_auth_db.json'
);

const SESSION_DURATION =
  7 * 24 * 60 * 60 * 1000;

const PASSWORD_MIN_LENGTH = 12;

function toSafeUser(user: DbUser): SafeDbUser {
  const {
    passwordHash: _passwordHash,
    salt: _salt,
    ...safeUser
  } = user;

  return safeUser;
}

export function hashPassword(
  password: string,
  salt?: string
): { hash: string; salt: string } {
  const actualSalt =
    salt || crypto.randomBytes(16).toString('hex');

  const hash = crypto
    .scryptSync(password, actualSalt, 64)
    .toString('hex');

  return { hash, salt: actualSalt };
}

export function verifyPassword(
  password: string,
  hash: string,
  salt: string
): boolean {
  try {
    if (!/^[a-f0-9]{128}$/i.test(hash)) {
      return false;
    }

    const computed = crypto.scryptSync(
      password,
      salt,
      64
    );

    const stored = Buffer.from(hash, 'hex');

    if (stored.length !== computed.length) {
      return false;
    }

    return crypto.timingSafeEqual(computed, stored);
  } catch {
    return false;
  }
}

class AuthDatabase {
  private data: DatabaseSchema;

  constructor() {
    this.data = this.load();
    this.configureDemoAccounts();
  }

  private emptyDatabase(): DatabaseSchema {
    return {
      users: [],
      sessions: [],
      resetRequests: [],
      schools: [],
      events: [],
      personalEvents: [],
      suggestions: []
    };
  }

  private load(): DatabaseSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        return this.emptyDatabase();
      }

      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      const parsed = JSON.parse(raw);

      return {
        users: Array.isArray(parsed.users)
          ? parsed.users
          : [],

        sessions: Array.isArray(parsed.sessions)
          ? parsed.sessions
          : [],

        resetRequests: Array.isArray(parsed.resetRequests)
          ? parsed.resetRequests
          : [],

        schools: Array.isArray(parsed.schools)
          ? parsed.schools
          : [],

        events: Array.isArray(parsed.events)
          ? parsed.events
          : [],

        personalEvents: Array.isArray(parsed.personalEvents)
          ? parsed.personalEvents
          : [],

        suggestions: Array.isArray(parsed.suggestions)
          ? parsed.suggestions
          : []
      };
    } catch (error) {
      console.error('KinetiQ database loading failed:', error);

      throw new Error(
        'Could not load the KinetiQ database. Check the database file before restarting.'
      );
    }
  }

  private save(): void {
    const tempFile = `${DB_FILE}.tmp`;

    try {
      fs.writeFileSync(
        tempFile,
        JSON.stringify(this.data, null, 2),
        'utf-8'
      );

      fs.renameSync(tempFile, DB_FILE);
    } catch (error) {
      console.error('KinetiQ database save failed:', error);

      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile);
        }
      } catch {
        // Ignore temporary-file cleanup errors.
      }

      throw new Error('Could not save the KinetiQ database.');
    }
  }

  private requireOrganiser(userId: string): DbUser {
    const user = this.data.users.find(
      item => item.id === userId
    );

    if (!user || user.role !== 'ORGANISER') {
      throw new Error(
        'You are not authorised to perform this action.'
      );
    }

    return user;
  }

  private createConfiguredAccount(config: {
    email?: string;
    username?: string;
    name?: string;
    password?: string;
    role: 'STUDENT' | 'ORGANISER';
    title?: string;
    department?: string;
  }): boolean {
    const email = config.email?.trim().toLowerCase();
    const username = config.username?.trim().toLowerCase();
    const name = config.name?.trim();
    const password = config.password;

    // Do not create a partially configured account.
    if (!email && !username && !name && !password) {
      return false;
    }

    if (!email || !username || !name || !password) {
      throw new Error(
        `The ${config.role} demo account is only partially configured. Set its email, username, name and password environment variables.`
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new Error(`Invalid ${config.role} demo email.`);
    }

    if (password.length < PASSWORD_MIN_LENGTH) {
      throw new Error(
        `${config.role} demo password must contain at least ${PASSWORD_MIN_LENGTH} characters.`
      );
    }

    const existing = this.data.users.find(
      user =>
        user.email.toLowerCase() === email ||
        user.username.toLowerCase() === username
    );

    // Never overwrite an existing account or reset its password.
    if (existing) {
      return false;
    }

    const { hash, salt } = hashPassword(password);

    const user: DbUser = {
      id: crypto.randomUUID(),
      username,
      email,
      name,
      role: config.role,
      passwordHash: hash,
      salt,
      title: config.title,
      department: config.department,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(user);
    return true;
  }

  /**
   * Configure exactly two optional demo accounts:
   *
   * Admin:
   * KINETIQ_DEMO_ADMIN_EMAIL
   * KINETIQ_DEMO_ADMIN_USERNAME
   * KINETIQ_DEMO_ADMIN_NAME
   * KINETIQ_DEMO_ADMIN_PASSWORD
   *
   * Student:
   * KINETIQ_DEMO_STUDENT_EMAIL
   * KINETIQ_DEMO_STUDENT_USERNAME
   * KINETIQ_DEMO_STUDENT_NAME
   * KINETIQ_DEMO_STUDENT_PASSWORD
   */
  private configureDemoAccounts(): void {
    let changed = false;

    changed = this.createConfiguredAccount({
      email: process.env.KINETIQ_DEMO_ADMIN_EMAIL,
      username: process.env.KINETIQ_DEMO_ADMIN_USERNAME,
      name: process.env.KINETIQ_DEMO_ADMIN_NAME,
      password: process.env.KINETIQ_DEMO_ADMIN_PASSWORD,
      role: 'ORGANISER',
      title: 'Lead Administrator',
      department: 'School Administration'
    }) || changed;

    changed = this.createConfiguredAccount({
      email: process.env.KINETIQ_DEMO_STUDENT_EMAIL,
      username: process.env.KINETIQ_DEMO_STUDENT_USERNAME,
      name: process.env.KINETIQ_DEMO_STUDENT_NAME,
      password: process.env.KINETIQ_DEMO_STUDENT_PASSWORD,
      role: 'STUDENT'
    }) || changed;

    if (changed) {
      this.save();
    }
  }

  // --------------------------------------------------
  // SCHOOLS
  // --------------------------------------------------

  public getSchools(): SchoolStructure[] {
    return this.data.schools.map(school => ({
      ...school,
      yearGroups: school.yearGroups.map(group => ({
        ...group,
        classes: [...group.classes]
      })),
      sections: [...school.sections]
    }));
  }

  public saveSchool(
    school: SchoolStructure
  ): SchoolStructure {
    if (!school?.id || !school.name?.trim()) {
      throw new Error('A school ID and name are required.');
    }

    const index = this.data.schools.findIndex(
      item => item.id === school.id
    );

    if (index >= 0) {
      this.data.schools[index] = school;
    } else {
      this.data.schools.push(school);
    }

    this.save();
    return school;
  }

  // --------------------------------------------------
  // SCHOOL EVENTS
  // --------------------------------------------------

  public getEvents(): any[] {
    return [...this.data.events];
  }

  public saveEvent(
    event: any,
    actorUserId?: string
  ): any {
    if (actorUserId) {
      this.requireOrganiser(actorUserId);
    }

    if (!event?.id) {
      throw new Error('Event ID is required.');
    }

    const index = this.data.events.findIndex(
      item => item.id === event.id
    );

    if (index >= 0) {
      this.data.events[index] = {
        ...this.data.events[index],
        ...event
      };
    } else {
      this.data.events.unshift(event);
    }

    this.save();
    return event;
  }

  /**
   * Only an authenticated organiser can delete an event.
   * Pass the logged-in user's ID from the server-side route.
   */
  public deleteEvent(
    eventId: string,
    actorUserId?: string
  ): boolean {
    if (actorUserId) {
      this.requireOrganiser(actorUserId);
    }

    if (!eventId?.trim()) {
      throw new Error('Event ID is required.');
    }

    const previousLength = this.data.events.length;

    this.data.events = this.data.events.filter(
      event => event.id !== eventId
    );

    if (this.data.events.length === previousLength) {
      return false;
    }

    this.save();
    return true;
  }

  public clearAllEvents(actorUserId?: string): void {
    if (actorUserId) {
      this.requireOrganiser(actorUserId);
    }

    this.data.events = [];
    this.save();
  }

  public setEvents(
    eventsList: any[],
    actorUserId?: string
  ): any[] {
    if (actorUserId) {
      this.requireOrganiser(actorUserId);
    }

    if (!Array.isArray(eventsList)) {
      throw new Error('Events must be provided as a list.');
    }

    this.data.events = eventsList;
    this.save();

    return [...this.data.events];
  }

  public seedDefaultEventsIfEmpty(eventsList: any[]): void {
    if (this.data.events.length === 0 && Array.isArray(eventsList) && eventsList.length > 0) {
      this.data.events = [...eventsList];
      this.save();
    }
  }

  // --------------------------------------------------
  // PERSONAL EVENTS
  // --------------------------------------------------

  public getPersonalEvents(userId?: string): any[] {
    if (!userId) {
      return [...this.data.personalEvents];
    }

    const clean = userId.trim().toLowerCase();

    return this.data.personalEvents.filter(
      event =>
        event.userId?.toLowerCase() === clean ||
        event.userEmail?.toLowerCase() === clean
    );
  }

  public savePersonalEvent(event: any): any {
    if (!event?.id || !event?.userId) {
      throw new Error(
        'Personal event ID and owner ID are required.'
      );
    }

    const index = this.data.personalEvents.findIndex(
      item => item.id === event.id
    );

    if (index >= 0) {
      const existing = this.data.personalEvents[index];

      if (existing.userId !== event.userId) {
        throw new Error(
          'You cannot edit another user’s personal event.'
        );
      }

      this.data.personalEvents[index] = {
        ...existing,
        ...event
      };
    } else {
      this.data.personalEvents.unshift(event);
    }

    this.save();
    return event;
  }

  public deletePersonalEvent(
    eventId: string,
    userId: string
  ): boolean {
    if (!eventId || !userId) {
      throw new Error('Event ID and user ID are required.');
    }

    const previousLength = this.data.personalEvents.length;

    this.data.personalEvents = this.data.personalEvents.filter(
      event =>
        !(
          event.id === eventId &&
          (
            event.userId === userId ||
            event.userEmail?.toLowerCase() === userId.toLowerCase()
          )
        )
    );

    if (previousLength === this.data.personalEvents.length) {
      return false;
    }

    this.save();
    return true;
  }

  // --------------------------------------------------
  // USERS
  // --------------------------------------------------

  public getAllUsers(): SafeDbUser[] {
    return this.data.users.map(toSafeUser);
  }

  public getAllStudents(): SafeDbUser[] {
    return this.data.users
      .filter(user => user.role === 'STUDENT')
      .map(toSafeUser);
  }

  public updateStudentHouse(
    studentId: string,
    house: PEHouseName,
    verified: boolean = true
  ): SafeDbUser {
    const validHouses: PEHouseName[] = [
      'Crimson',
      'Tiger',
      'Amber',
      'Lime',
      'Sapphire'
    ];

    if (!validHouses.includes(house)) {
      throw new Error('Invalid house name.');
    }

    const student = this.data.users.find(
      user => user.id === studentId
    );

    if (!student || student.role !== 'STUDENT') {
      throw new Error('Student account not found.');
    }

    student.house = house;
    student.houseVerified = verified;

    this.save();
    return toSafeUser(student);
  }

  public promoteToAdmin(userId: string): DbUser {
    const user = this.data.users.find(item => item.id === userId);
    if (!user) {
      throw new Error('User not found to promote');
    }
    user.role = 'ORGANISER';
    user.title = user.title || 'Faculty Lead & Event Administrator';
    user.department = user.department || 'School Activities & Leadership';
    this.save();
    return user;
  }

  public setUserRole(
    userId: string,
    role: 'STUDENT' | 'ORGANISER',
    _operatorEmail?: string
  ): DbUser {
    const user = this.data.users.find(item => item.id === userId);
    if (!user) {
      throw new Error('User not found');
    }
    if (
      user.email.toLowerCase() === '1300-sarang-smr@smgeducation.org' &&
      role !== 'ORGANISER'
    ) {
      throw new Error('The master owner Sarang cannot be demoted.');
    }
    user.role = role;
    if (role === 'ORGANISER') {
      user.title = user.title || 'School Administrator';
      user.department = user.department || 'School Leadership';
    }
    this.save();
    return user;
  }

  public findUserByCredential(
    identifier: string
  ): DbUser | null {
    if (!identifier?.trim()) {
      return null;
    }

    const clean = identifier.trim().toLowerCase();

    const user = this.data.users.find(
      item =>
        item.email.toLowerCase() === clean ||
        item.username.toLowerCase() === clean
    );

    return user ? { ...user } : null;
  }

  public findUserById(id: string): SafeDbUser | null {
    const user = this.data.users.find(
      item => item.id === id
    );

    return user ? toSafeUser(user) : null;
  }

  // --------------------------------------------------
  // SESSIONS
  // --------------------------------------------------

  public createSession(userId: string): string {
    const user = this.data.users.find(
      item => item.id === userId
    );

    if (!user) {
      throw new Error(
        'Cannot create a session for an unknown user.'
      );
    }

    const token = crypto.randomBytes(32).toString('hex');
    const now = Date.now();

    this.data.sessions = this.data.sessions.filter(
      session => session.expiresAt > now
    );

    this.data.sessions.push({
      token,
      userId,
      createdAt: now,
      expiresAt: now + SESSION_DURATION
    });

    this.save();
    return token;
  }

  public getSessionUser(
    token: string
  ): SafeDbUser | null {
    if (!token) {
      return null;
    }

    const now = Date.now();

    const session = this.data.sessions.find(
      item =>
        item.token === token &&
        item.expiresAt > now
    );

    if (!session) {
      return null;
    }

    const user = this.data.users.find(
      item => item.id === session.userId
    );

    return user ? toSafeUser(user) : null;
  }

  public destroySession(token: string): void {
    this.data.sessions = this.data.sessions.filter(
      session => session.token !== token
    );

    this.save();
  }

  // --------------------------------------------------
  // PASSWORD RESET
  // --------------------------------------------------

  public createPasswordReset(email: string): string {
    const clean = email.trim().toLowerCase();

    const user = this.data.users.find(
      item => item.email.toLowerCase() === clean
    );

    if (!user) {
      throw new Error(
        'No user found with that email address.'
      );
    }

    const code = crypto
      .randomInt(100000, 1000000)
      .toString();

    const expiresAt = Date.now() + 15 * 60 * 1000;

    this.data.resetRequests = this.data.resetRequests.filter(
      request => request.email !== clean
    );

    this.data.resetRequests.push({
      email: clean,
      code,
      expiresAt
    });

    this.save();

    // Send this code through your private email provider.
    // Never return it in a public API response.
    return code;
  }

  public resetPassword(
    email: string,
    code: string,
    newPassword: string
  ): boolean {
    if (
      !newPassword ||
      newPassword.length < PASSWORD_MIN_LENGTH
    ) {
      throw new Error(
        `Password must contain at least ${PASSWORD_MIN_LENGTH} characters.`
      );
    }

    const clean = email.trim().toLowerCase();
    const now = Date.now();

    const request = this.data.resetRequests.find(
      item =>
        item.email === clean &&
        item.code === code &&
        item.expiresAt > now
    );

    if (!request) {
      return false;
    }

    const user = this.data.users.find(
      item => item.email.toLowerCase() === clean
    );

    if (!user) {
      return false;
    }

    const { hash, salt } = hashPassword(newPassword);

    user.passwordHash = hash;
    user.salt = salt;

    // Invalidate all sessions after a password change.
    this.data.sessions = this.data.sessions.filter(
      session => session.userId !== user.id
    );

    // Reset codes can only be used once.
    this.data.resetRequests = this.data.resetRequests.filter(
      item => item.email !== clean
    );

    this.save();
    return true;
  }

  // --------------------------------------------------
  // REGISTRATION
  // --------------------------------------------------

  public registerUser(params: {
    username?: string;
    email: string;
    name: string;
    role?: 'STUDENT' | 'ORGANISER';
    password: string;
    schoolName?: string;
    yearGroup?: number;
    className?: string;
    sectionName?: string;
    house?: PEHouseName;
  }): SafeDbUser {
    const cleanEmail = params.email.trim().toLowerCase();

    const cleanUsername = (
      params.username ||
      params.email.split('@')[0]
    ).trim().toLowerCase();

    const cleanName = params.name.trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      throw new Error(
        'Please provide a valid email address.'
      );
    }

    if (!cleanUsername || !cleanName) {
      throw new Error(
        'Name and username are required.'
      );
    }

    if (
      !params.password ||
      params.password.length < PASSWORD_MIN_LENGTH
    ) {
      throw new Error(
        `Password must contain at least ${PASSWORD_MIN_LENGTH} characters.`
      );
    }

    if (
      this.data.users.some(
        user =>
          user.email.toLowerCase() === cleanEmail ||
          user.username.toLowerCase() === cleanUsername
      )
    ) {
      throw new Error(
        'An account with this email or username already exists.'
      );
    }

    // Public registration ALWAYS creates a student.
    // Admin accounts are created only through private server setup.
    const { hash, salt } = hashPassword(params.password);

    const newUser: DbUser = {
      id: crypto.randomUUID(),
      username: cleanUsername,
      email: cleanEmail,
      name: cleanName,
      role: 'STUDENT',
      passwordHash: hash,
      salt,
      schoolName: params.schoolName?.trim(),
      yearGroup: params.yearGroup,
      className: params.className?.trim(),
      sectionName: params.sectionName?.trim(),
      house: params.house,
      houseVerified: false,
      createdAt: new Date().toISOString()
    };

    this.data.users.push(newUser);
    this.save();

    return toSafeUser(newUser);
  }
}

export const authDb = new AuthDatabase();

import test from 'node:test';
import assert from 'node:assert/strict';
import { hashPassword, verifyPassword, authDb } from './authDb.ts';

test('hashPassword produces salt and verifiable hash', () => {
  const { hash, salt } = hashPassword('TestSecretPass123!');
  assert.ok(hash.length > 20);
  assert.ok(salt.length > 10);

  const isValid = verifyPassword('TestSecretPass123!', hash, salt);
  assert.equal(isValid, true);

  const isInvalid = verifyPassword('WrongPassword', hash, salt);
  assert.equal(isInvalid, false);
});

test('authDb finds default pre-seeded test accounts', () => {
  const student = authDb.findUserByCredential('student@kinetiq.edu');
  assert.ok(student !== null);
  assert.equal(student?.role, 'STUDENT');
  assert.equal(student?.name, 'Maya Chen');

  const organiser = authDb.findUserByCredential('david.harrison');
  assert.ok(organiser !== null);
  assert.equal(organiser?.role, 'ORGANISER');
  assert.equal(organiser?.name, 'Mr. David Harrison');
});

test('authDb session creation, validation and revocation', () => {
  const student = authDb.findUserByCredential('student@kinetiq.edu');
  assert.ok(student);

  const token = authDb.createSession(student.id);
  assert.ok(token);

  const sessionUser = authDb.getSessionUser(token);
  assert.ok(sessionUser);
  assert.equal(sessionUser?.id, student.id);

  // Revoke session
  authDb.destroySession(token);
  const revokedUser = authDb.getSessionUser(token);
  assert.equal(revokedUser, null);
});

test('authDb password reset generation and verification', () => {
  const code = authDb.createPasswordReset('student@kinetiq.edu');
  assert.ok(code.length === 6);

  const success = authDb.resetPassword('student@kinetiq.edu', code, 'NewSecurePass2026!');
  assert.equal(success, true);

  // Test with new password
  const updatedUser = authDb.findUserByCredential('student@kinetiq.edu');
  assert.ok(updatedUser);
  const verifyNew = verifyPassword('NewSecurePass2026!', updatedUser.passwordHash, updatedUser.salt);
  assert.equal(verifyNew, true);

  // Reset back to default
  authDb.resetPassword('student@kinetiq.edu', authDb.createPasswordReset('student@kinetiq.edu'), 'StudentPass2026!');
});

test('authDb registerUser creates new student and organiser accounts', () => {
  const testEmail = `newstudent_${Date.now()}@kinetiq.edu`;
  const newUser = authDb.registerUser({
    name: 'Chloe Zhang',
    email: testEmail,
    role: 'STUDENT',
    password: 'ChloePassword2026!',
    yearGroup: 11,
    house: 'Sapphire'
  });

  assert.ok(newUser.id.startsWith('stu-'));
  assert.equal(newUser.name, 'Chloe Zhang');
  assert.equal(newUser.role, 'STUDENT');
  assert.equal(newUser.yearGroup, 11);
  assert.equal(newUser.house, 'Sapphire');
  assert.equal(newUser.points, 50);

  // Check login verification works for new user
  const found = authDb.findUserByCredential(testEmail);
  assert.ok(found);
  assert.equal(verifyPassword('ChloePassword2026!', found.passwordHash, found.salt), true);

  // Duplicate email registration should fail
  assert.throws(() => {
    authDb.registerUser({
      name: 'Duplicate',
      email: testEmail,
      role: 'STUDENT',
      password: 'Pass'
    });
  }, /already exists/);
});


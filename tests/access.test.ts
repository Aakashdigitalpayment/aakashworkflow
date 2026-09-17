import test from 'node:test';
import assert from 'node:assert/strict';
import {
  ALL_ROLES,
  AUDIT_ROLES,
  MANAGEMENT_ROLES,
  canAccessRoute,
  accessRequiredFor,
  isManagement,
  isAuditor,
  normalizeRole,
  hasRole,
} from '../src/lib/access';

test('unknown roles normalize to null rather than being trusted', () => {
  assert.equal(normalizeRole('super_admin'), 'super_admin');
  assert.equal(normalizeRole('root'), null);
  assert.equal(normalizeRole(''), null);
  assert.equal(normalizeRole(null), null);
  assert.equal(normalizeRole(undefined), null);
});

test('role comparison is exact — no case or whitespace leniency', () => {
  assert.equal(hasRole('SUPER_ADMIN', MANAGEMENT_ROLES), false);
  assert.equal(hasRole(' super_admin', MANAGEMENT_ROLES), false);
});

test('only super_admin, ceo and manager count as management', () => {
  for (const role of ALL_ROLES) {
    assert.equal(isManagement(role), MANAGEMENT_ROLES.includes(role), `wrong for ${role}`);
  }
  assert.equal(isManagement('department_head'), false);
  assert.equal(isManagement('officer'), false);
  assert.equal(isManagement(null), false);
});

test('auditors can read audit surfaces but are not management', () => {
  assert.equal(isAuditor('auditor'), true);
  assert.equal(isManagement('auditor'), false);
  assert.deepEqual(AUDIT_ROLES, [...MANAGEMENT_ROLES, 'auditor']);
});

test('unguarded routes are open to any authenticated user', () => {
  assert.equal(accessRequiredFor('/dashboard'), null);
  assert.equal(canAccessRoute('/dashboard', 'employee'), true);
  assert.equal(canAccessRoute('/task-management', 'employee'), true);
});

test('admin routes are gated to management', () => {
  for (const route of [
    '/roles',
    '/user-admin',
    '/admin',
    '/users',
    '/cooperative-settings',
    '/automation',
    '/executive-reports',
  ]) {
    assert.equal(canAccessRoute(route, 'employee'), false, route);
    assert.equal(canAccessRoute(route, 'officer'), false, route);
    assert.equal(canAccessRoute(route, 'manager'), true, route);
    assert.equal(canAccessRoute(route, 'ceo'), true, route);
    assert.equal(canAccessRoute(route, 'super_admin'), true, route);
  }
});

test('nested paths inherit the guard from their parent route', () => {
  assert.equal(canAccessRoute('/user-admin/42', 'employee'), false);
  assert.equal(canAccessRoute('/user-admin/42', 'super_admin'), true);
  assert.equal(canAccessRoute('/roles/new', 'officer'), false);
});

test('a prefix that merely starts with a guarded name is not guarded', () => {
  // '/users-guide' must not be caught by the '/users' rule.
  assert.equal(accessRequiredFor('/users-guide'), null);
  assert.equal(canAccessRoute('/users-guide', 'employee'), true);
});

test('audit routes allow management and auditors, nobody else', () => {
  assert.equal(canAccessRoute('/compliance', 'auditor'), true);
  assert.equal(canAccessRoute('/activity-log', 'auditor'), true);
  assert.equal(canAccessRoute('/compliance', 'manager'), true);
  assert.equal(canAccessRoute('/compliance', 'employee'), false);
  assert.equal(canAccessRoute('/activity-log', 'department_head'), false);
});

test('a null role cannot reach a guarded route', () => {
  assert.equal(canAccessRoute('/roles', null), false);
  assert.equal(canAccessRoute('/roles', undefined), false);
});

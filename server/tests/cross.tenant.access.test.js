import './setup-env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import prisma from '../src/lib/prisma.js';
import { verifyToken } from '../src/middleware/verifyToken.js';
import { generateAccessToken } from '../src/lib/jwt.js';

function mockReqRes(authHeader) {
  const req = { headers: { authorization: authHeader } };
  const res = {
    statusCode: null,
    body: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(payload) {
      this.body = payload;
      return this;
    },
  };
  let nextCalled = false;
  return {
    req,
    res,
    next: () => {
      nextCalled = true;
    },
    wasNextCalled: () => nextCalled,
  };
}

test('verifyToken returns 401 when Authorization header is missing', async () => {
  const { req, res, next, wasNextCalled } = mockReqRes(undefined);

  await verifyToken(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Missing Authorization Header');
  assert.equal(wasNextCalled(), false);
});

test('verifyToken returns 401 when Authorization header is malformed', async () => {
  const { req, res, next, wasNextCalled } = mockReqRes('NotBearerToken');

  await verifyToken(req, res, next);

  assert.equal(res.statusCode, 401);
  assert.equal(res.body.error, 'Malformed Authorization Header');
  assert.equal(wasNextCalled(), false);
});

test('verifyToken sets req.schoolId from a valid token', async () => {
  const token = generateAccessToken({ userId: 1, schoolId: 'SchoolA', role: 'Teacher' });
  const { req, res, next } = mockReqRes(`Bearer ${token}`);
  await verifyToken(req, res, next);
  assert.equal(req.schoolId, 'SchoolA');
});

test('cross-tenant access: School A JWT cannot read School B data', async () => {
  const schoolA = await prisma.school.findFirst({
    where: { id: 'f2a79af0-cb22-4a19-b956-0d64add9cd14' },
  });
  const schoolB = await prisma.school.findFirst({
    where: { id: 'b47afb35-4402-4ab8-be7e-270cd451d0da' },
  });

  assert.ok(schoolA, 'Seed School A before running this test');
  assert.ok(schoolB, 'Seed School B before running this test');

  const schoolBUser = await prisma.user.findFirst({ where: { schoolId: schoolB.id } });
  assert.ok(schoolBUser, 'Seed a user for School B before running this test');

  const token = generateAccessToken({ userId: 1, schoolId: schoolA.id, role: 'teacher' });
  const { req, res, next } = mockReqRes(`Bearer ${token}`);
  await verifyToken(req, res, next);

  const result = await prisma.user.findFirst({
    where: { id: schoolBUser.id, schoolId: req.schoolId },
  });
  assert.equal(result, null, 'School A user should not be able to access School B user data');
});
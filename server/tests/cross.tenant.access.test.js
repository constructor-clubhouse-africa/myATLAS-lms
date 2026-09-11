import test from 'node:test';
import assert from 'node:assert/strict';
import {requireAuth} from '../src/middleware/verifyToken.js';
import {generateAccessToken} from '../src/lib/jwt.js';
import prisma from '../src/lib/prisma.js';

function mockReqRes(authHeader) {
    const req = {headers: {authorization: authHeader}};
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
        }
    };
    let nextCalled = false;
    return {req, res, next: () => {nextCalled = true;}, wasNextCalled: () => nextCalled};
}

test('requireAuth returns 401 when Authorization header is missing', async () => {
    const {req, res, next, wasNextCalled} = mockReqRes(undefined);

    await requireAuth(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, 'Authorization header is missing');
    assert.strictEqual(wasNextCalled(), false);
});

test('requireAuth returns 401 when Authorization header is malformed', async () => {
    const {req, res, next, wasNextCalled} = mockReqRes('NotBearerToken');

    await requireAuth(req, res, next);

    assert.strictEqual(res.statusCode, 401);
    assert.strictEqual(res.body.message, 'Authorization header is malformed');
    assert.strictEqual(wasNextCalled(), false);
});

test('requireAuth sets req.schoolId from a valid token', async () => {
    const token = generateAccessToken({userId: 1, schoolId: 'SchoolA', role: 'Teacher'});
    const {req, res, next} = mockReqRes(`Bearer ${token}`);
    requireAuth(req, res, next);
    assert.strictEqual(req.schoolId, 'SchoolA');
});

test('cross-tenant access: School A JWT cannot read School B data', async () => {
    const schoolA = await prisma.school.findFirst({where:{id: 'f2a79af0-cb22-4a19-b956-0d64add9cd14'}});
    const schoolB = await prisma.school.findFirst({where:{id: 'b47afb35-4402-4ab8-be7e-270cd451d0da'}});

    assert.ok(schoolA, 'Seed School A before running this test');
    assert.ok(schoolB, 'Seed School B before running this test');

    const token = generateAccessToken({userId: 1, schoolId: schoolA.id, role: 'teacher'});
    const {req, res, next} = mockReqRes(`Bearer ${token}`);
    requireAuth(req, res, next);

    const userVisibleToSchoolA = await prisma.user.findFirst({ where: { schoolId: schoolA.id } });
    const leaked = userVisibleToSchoolA.some((u) => u.schoolId === schoolB.id);
    assert.strictEqual(leaked, false, 'School A JWT should not be able to access School B data');
});
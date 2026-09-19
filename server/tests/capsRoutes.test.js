import './setup-env.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import capsRouter from '../src/routes/caps.js';

test('caps router module loads and exports a router', () => {
  assert.equal(typeof capsRouter, 'function');
});

test('caps router requires authentication on every route', () => {
  const hasAuthLayer = capsRouter.stack.some((layer) => layer.name === 'verifyToken');
  assert.equal(hasAuthLayer, true, 'verifyToken should be mounted on the caps router');
});

test('caps router registers the documented read endpoints', () => {
  const paths = capsRouter.stack.filter((l) => l.route).map((l) => l.route.path);

  assert.ok(paths.includes('/subjects'), 'expected GET /caps/subjects');
  assert.ok(paths.includes('/grade-terms'), 'expected GET /caps/grade-terms');
  assert.ok(
    paths.includes('/assessment-requirements'),
    'expected GET /caps/assessment-requirements'
  );
});

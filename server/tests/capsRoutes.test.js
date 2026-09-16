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

import { test } from 'node:test';
import assert from 'node:assert/strict';

test('health router module loads and exports a router', async () => {
  const mod = await import('../src/routes/health.js');
  assert.ok(mod.default, 'health router should be exported');
});

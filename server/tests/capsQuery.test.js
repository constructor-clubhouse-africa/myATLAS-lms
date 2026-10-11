import test from 'node:test';
import assert from 'node:assert/strict';
import { parseGrade, parseTerm, parseSubjectId, QueryParamError } from '../src/lib/capsQuery.js';

test('parseGrade returns undefined when the param is absent', () => {
  assert.equal(parseGrade(undefined), undefined);
  assert.equal(parseGrade(''), undefined);
});

test('parseGrade accepts valid grades', () => {
  assert.equal(parseGrade('10'), 10);
  assert.equal(parseGrade('1'), 1);
  assert.equal(parseGrade('12'), 12);
});

test('parseGrade rejects out-of-range, non-integer and non-numeric values', () => {
  for (const bad of ['0', '13', '10.5', 'ten', ['10', '11']]) {
    assert.throws(() => parseGrade(bad), QueryParamError, `expected "${bad}" to be rejected`);
  }
});

test('parseTerm accepts 1 to 4 and rejects anything else', () => {
  assert.equal(parseTerm('3'), 3);
  for (const bad of ['0', '5', '2.5', 'one']) {
    assert.throws(() => parseTerm(bad), QueryParamError, `expected "${bad}" to be rejected`);
  }
});

test('parseSubjectId passes a single string through and rejects repeats', () => {
  assert.equal(parseSubjectId('a1b2c3'), 'a1b2c3');
  assert.equal(parseSubjectId(undefined), undefined);
  assert.throws(() => parseSubjectId(['a', 'b']), QueryParamError);
});

import test from 'node:test';
import assert from 'node:assert/strict';
import { webcrypto } from 'node:crypto';
import {
  calculateSubnet, transformJson, encodeBase64, decodeBase64,
  compareLines, generateUuids, generatePassword, parseTimestamp, describeTimestamp
} from '../assets/js/tools-core.mjs';

// Browser APIs needed by Base64 code are available in Node 20+.
test('IPv4 subnet calculator /24 and /31 and /32', () => {
  const s24 = calculateSubnet('192.168.1.42/24');
  assert.equal(s24.cidr, '192.168.1.0/24');
  assert.equal(s24.mask, '255.255.255.0');
  assert.equal(s24.wildcard, '0.0.0.255');
  assert.equal(s24.broadcast, '192.168.1.255');
  assert.equal(s24.first, '192.168.1.1');
  assert.equal(s24.last, '192.168.1.254');
  assert.equal(s24.total, 256);
  assert.equal(s24.usable, 254);
  const s31 = calculateSubnet('10.10.3.5/31');
  assert.equal(s31.cidr, '10.10.3.4/31');
  assert.equal(s31.first, '10.10.3.4');
  assert.equal(s31.last, '10.10.3.5');
  assert.equal(s31.usable, 2);
  const s32 = calculateSubnet('10.10.3.5/32');
  assert.equal(s32.cidr, '10.10.3.5/32');
  assert.equal(s32.usable, 1);
  const s0 = calculateSubnet('255.255.255.255/0');
  assert.equal(s0.cidr, '0.0.0.0/0');
  assert.equal(s0.total, 4294967296);
  assert.equal(s0.usable, 4294967294);
});

test('IPv4 rejects malformed input', () => {
  for (const ip of ['256.0.0.1/24', '192.168.1.01/24', '1.2.3.4/33', '1.2.3.4', '1.2.3.4/24.5', '10.10.10/24']) {
    assert.throws(() => calculateSubnet(ip), Error, ip);
  }
});

test('JSON parsing formatting minification and errors', () => {
  assert.equal(transformJson('{"a":1,"b":[true,false]}', 'format'), '{\n  "a": 1,\n  "b": [\n    true,\n    false\n  ]\n}');
  assert.equal(transformJson(' { "x": 2 } ', 'minify'), '{"x":2}');
  assert.throws(() => transformJson('{invalid'), /Ogiltig JSON/);
  assert.throws(() => transformJson(''), /Klistra in JSON/);
  assert.throws(() => transformJson('[]', 'erase'), /Okänd JSON/);
  assert.throws(() => transformJson('a'.repeat(1024*1024+1)), /1 MiB/);
});

test('Base64 handles Swedish characters and rejects invalid UTF-8', () => {
  const text = 'Hej! åäö ÄÖÅ 😊';
  assert.equal(decodeBase64(encodeBase64(text)), text);
  assert.equal(decodeBase64(' aGVsbG8= \n'), 'hello');
  assert.throws(() => decodeBase64('abc_!'), /Ogiltig Base64/);
  assert.throws(() => decodeBase64('/w=='), /UTF-8/);
});

test('Diff marks changes without modifying text or HTML', () => {
  const diff = compareLines('one\ntwo\n<script>', 'one\nthree\n<script>');
  assert.equal(diff.added, 1);
  assert.equal(diff.removed, 1);
  assert.equal(diff.unchanged, 2);
  assert.ok(diff.changes.some(item => item.value === '<script>' && item.type === 'same'));
  assert.throws(() => compareLines('a\n'.repeat(251), ''), /250 rader/);
});

test('UUID v4 version/variant bits and uniqueness', () => {
  const results = generateUuids(20, webcrypto);
  assert.equal(new Set(results).size, 20);
  results.forEach(id => assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/));
  assert.throws(() => generateUuids(21, webcrypto), /mellan 1 och 20/);
});

test('Passwords include each selected character type and enforce constraints', () => {
  const p = generatePassword({length: 64, lower: true, upper: true, digits: true, symbols: true, avoidSimilar: true}, webcrypto);
  assert.equal(p.length, 64);
  assert.match(p, /[a-z]/); assert.match(p, /[A-Z]/); assert.match(p, /[0-9]/); assert.match(p, /[!@#$%^&*()\-_=+?]/);
  assert.doesNotMatch(p, /[0O1lI]/);
  assert.throws(() => generatePassword({length: 4}, webcrypto), /mellan 12 och 64/);
  assert.throws(() => generatePassword({lower: false, upper: false, digits: false, symbols: false}, webcrypto), /Välj minst en/);
});

test('Timestamp ISO validates leap year and timezone and negative epoch', () => {
  assert.equal(parseTimestamp('2026-11-17T14:00:00+01:00', 'iso').toISOString(), '2026-11-17T13:00:00.000Z');
  assert.equal(parseTimestamp('1763384400', 'seconds').toISOString(), '2025-11-17T13:00:00.000Z');
  assert.equal(parseTimestamp('-1', 'seconds').toISOString(), '1969-12-31T23:59:59.000Z');
  assert.equal(parseTimestamp('2000-02-29T00:00:00Z', 'iso').toISOString(), '2000-02-29T00:00:00.000Z');
  assert.equal(parseTimestamp('0004-02-29T00:00:00Z', 'iso').toISOString(), '0004-02-29T00:00:00.000Z');
  for (const bad of ['2026-02-29T00:00:00Z', '1900-02-29T00:00:00Z', '0001-02-29T00:00:00Z', '2026-11-17T25:00:00Z', '2026-11-17T14:00:00', '2026-11-17T14:00:00+15:00']) {
    assert.throws(() => parseTimestamp(bad, 'iso'), Error, bad);
  }
  const desc = describeTimestamp(parseTimestamp('2026-11-17T13:00:00Z', 'iso'));
  assert.equal(desc.iso, '2026-11-17T13:00:00.000Z');
  assert.match(desc.stockholm, /14:00:00/);
});

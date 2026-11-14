import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderContact } from '../dist/scripts/prepare-public-assets.js';
test('public policy contact rendering escapes HTML and rejects credentials or missing identity', () => {
  const contact = { name: '<Test & Operator>', email: 'demo@example.test', site: 'https://example.test' };
  assert.equal(renderContact('{{OPERATOR_NAME}} / {{OPERATOR_EMAIL}}', contact, true), '&lt;Test &amp; Operator&gt; / demo@example.test');
  assert.equal(renderContact('{{OPERATOR_SITE}}', contact, false), 'https://example.test');
  assert.throws(() => renderContact('x', { ...contact, site: 'https://user:secret@example.test' }, true));
  assert.throws(() => renderContact('x', { ...contact, name: '' }, true));
});

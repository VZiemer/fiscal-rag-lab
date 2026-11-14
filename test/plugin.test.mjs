import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { validatePublicEndpoint, preparePlugin } from '../dist/scripts/prepare-plugin.js';
test('plugin public packaging refuses local/insecure/credential endpoints and copies only intended files', async () => {
  for (const url of ['http://remote.test/mcp', 'https://localhost/mcp', 'https://example.com/mcp', 'https://user:secret@remote.test/mcp', 'https://remote.test/mcp?token=secret']) assert.throws(() => validatePublicEndpoint(url));
  const directory = await mkdtemp(join(tmpdir(), 'fiscal-plugin-'));
  try {
    await preparePlugin('https://fiscal.unit-test.test/mcp', directory);
    const config = JSON.parse(await readFile(join(directory, 'mcp.json'), 'utf8'));
    assert.equal(config.mcpServers.fiscal.type, 'streamable-http');
    assert.equal(config.mcpServers.fiscal.url, 'https://fiscal.unit-test.test/mcp');
    assert.equal(config.mcpServers.fiscal.extensions['com.openai'].auth.type, 'none');
    assert.match(await readFile(join(directory, 'skills/fiscal-research/SKILL.md'), 'utf8'), /SYNTHETIC/);
    assert.match(await readFile(join(directory, 'assets/icon.svg'), 'utf8'), /viewBox="0 0 128 128"/);
    const manifest = JSON.parse(await readFile(join(directory, 'plugin.json'), 'utf8'));
    assert.equal(manifest.extensions['com.openai'].review.test_cases.positive.length, 5);
    assert.equal(manifest.extensions['com.openai'].review.test_cases.negative.length, 3);
    assert.equal(manifest.extensions['com.openai'].interface.privacyPolicyURL, 'https://fiscal.unit-test.test/privacy');
  } finally { await rm(directory, { recursive: true, force: true }); }
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { validateBehaviorDataset, toConversation } from '../dist/packages/evaluation/src/behavior.js';
import { loadEvaluationDataset } from '../dist/packages/evaluation/src/dataset.js';
test('behavior supervision separates train/development/heldout, validates tools and grounds synthetic citations', async () => {
  const data = JSON.parse(await readFile('experiments/behavior-examples.json', 'utf8'));
  const { dataset } = await loadEvaluationDataset();
  assert.equal(data.train.length, 24); assert.equal(data.development.length, 6);
  validateBehaviorDataset([...data.train, ...data.development], dataset.cases.map(c => c.query));
  const chat = toConversation(data.train[0]);
  assert.equal(chat.messages[0].role, 'system');
  assert.equal(JSON.parse(chat.messages[2].content).action, 'lookup_cfop');
  assert.throws(() => validateBehaviorDataset([data.train[0], data.train[0]]), /Duplicate/);
  assert.throws(() => validateBehaviorDataset([{ ...data.train[0], query: dataset.cases[0].query }], dataset.cases.map(c => c.query)), /leaked/);
  assert.throws(() => validateBehaviorDataset([{ id: 'bad', query: 'bad', action: 'answer', answer: 'x', citations: ['nonexistent'] }]), /citation/);
});

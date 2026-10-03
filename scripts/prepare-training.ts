import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { createHash } from 'node:crypto';
import { validateBehaviorDataset, toConversation, type BehaviorExample } from '../packages/evaluation/src/behavior.js';
import { loadEvaluationDataset } from '../packages/evaluation/src/dataset.js';

const examples: { version: number; train: BehaviorExample[]; development: BehaviorExample[] } = JSON.parse(await readFile('experiments/behavior-examples.json', 'utf8'));
if (examples.version !== 1) throw new Error('Unsupported behavior dataset');
const { dataset } = await loadEvaluationDataset();
validateBehaviorDataset([...examples.train, ...examples.development], dataset.cases.map(c => c.query));
const output = process.argv[2] ?? '.data/training';
await mkdir(output, { recursive: true });
const files = [];
for (const split of ['train', 'development'] as const) {
  const jsonl = examples[split].map(e => JSON.stringify(toConversation(e))).join('\n') + '\n';
  await writeFile(join(output, `${split}.jsonl`), jsonl);
  files.push({ split, count: examples[split].length, sha256: createHash('sha256').update(jsonl).digest('hex') });
}
const manifest = { status: 'prepared-not-trained', seed: 42, files,
  heldoutSha256: createHash('sha256').update(await readFile('eval/heldout.json')).digest('hex'),
  baseModel: null, modelRevision: null, licenseReview: null,
  proposedLora: { r: 8, lora_alpha: 16, lora_dropout: 0.05, bias: 'none', target_modules: ['q_proj', 'v_proj'], task_type: 'CAUSAL_LM' },
  proposedTraining: { epochs: 3, learningRate: 0.0002, perDeviceBatchSize: 1, gradientAccumulationSteps: 8, maxLength: 1024, assistantOnlyLoss: true },
  pending: ['Select open-weight model, immutable revision and license', 'Verify target module names and assistant loss mask for model chat template',
    'Provision compatible Python/PyTorch/PEFT/TRL runtime and pin tested versions', 'Train and retain actual loss curves, hardware, duration and adapter checksum',
    'Evaluate untouched heldout with same prompt, decoding and retrieval corpus'] };
await writeFile(join(output, 'manifest.json'), JSON.stringify(manifest, null, 2) + '\n');
console.log(JSON.stringify(manifest, null, 2));

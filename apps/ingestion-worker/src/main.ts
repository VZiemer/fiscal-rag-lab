import { readFile } from 'node:fs/promises';
import { downloadSnapshot, FileSnapshotStore, type SourceInput } from './snapshots.js';

const [manifest, directory = '.data/sources'] = process.argv.slice(2);
if (!manifest) throw new Error('Usage: npm run ingest -- source.json [directory]');
const source: SourceInput = JSON.parse(await readFile(manifest, 'utf8'));
const snapshot = await downloadSnapshot(source, new FileSnapshotStore(directory));
console.log(JSON.stringify(snapshot, null, 2));

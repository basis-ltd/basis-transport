import { readFile } from 'fs/promises';
import { randomUUID } from 'crypto';
import db from './data-source';
import { importGtfs } from '../modules/network/gtfs-importer';
import { NetworkService } from '../modules/network/network.service';
import { WalkingService } from '../modules/network/walking.service';

export const GTFS_URL =
  'https://gitlab.com/digitaltransport/data/africa/kigali/-/raw/main/GTFS%20Datasets/Kigali_GTFS.zip';
async function main() {
  const args = process.argv.slice(2);
  const source =
    args.find((a) => a.startsWith('--source='))?.slice(9) || 'dt4a-2019';
  const sourceUrl =
    args.find((a) => a.startsWith('--url='))?.slice(6) || GTFS_URL;
  if (!/^[a-z0-9-]{3,40}$/.test(source) || !sourceUrl.startsWith('https://'))
    throw new Error('Provide a safe source identifier and HTTPS source URL.');
  const path = args.find((a) => !a.startsWith('--'));
  if (source !== 'dt4a-2019' && !path)
    throw new Error('A reviewed source requires a local GTFS archive path.');
  let bytes: Buffer;
  if (path) bytes = await readFile(path);
  else {
    const response = await fetch(GTFS_URL, {
      signal: AbortSignal.timeout(30000),
    });
    if (!response.ok)
      throw new Error('Unable to download the public GTFS archive');
    bytes = Buffer.from(await response.arrayBuffer());
  }
  const imported = await importGtfs(bytes, source);
  await db.initialize();
  const service = new NetworkService(db, new WalkingService());
  try {
    const draft = await service.createDraft({
      ...imported,
      version: `${source}-${imported.checksum.slice(0, 10)}-${randomUUID().slice(0, 8)}`,
      source,
      sourceUrl,
      verification:
        source === 'dt4a-2019' ||
        imported.validTo < new Date().toISOString().slice(0, 10)
          ? 'historic'
          : 'unverified',
      rightsStatus: 'unclear',
      rightsEvidence: '',
      verificationEvidence: '',
    });
    console.log(
      JSON.stringify({
        id: draft.id,
        version: draft.version,
        patterns: draft.snapshot.patterns.length,
        issues: draft.issues.length,
        status: draft.status,
      })
    );
    if (args.includes('--publish-internal')) {
      if (
        process.env.NETWORK_ACCESS !== 'internal' ||
        process.env.NODE_ENV === 'production'
      )
        throw new Error(
          'Internal publication requires NETWORK_ACCESS=internal outside production.'
        );
      console.log(await service.publish(draft.id));
    }
  } finally {
    await db.destroy();
  }
}
void main().catch((e) => {
  console.error(e instanceof Error ? e.message : 'Network import failed');
  process.exitCode = 1;
});

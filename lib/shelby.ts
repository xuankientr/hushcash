import { exec } from "child_process";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";

const execAsync = promisify(exec);

const SHELBY_ACCOUNT = "0xcf6849fed0aa744a01067e6cc3f677103958f86159a05d7d75b631d70c6378b6";
const SHELBY_BASE = "https://api.testnet.shelby.xyz/shelby/v1/blobs";

export function shelbyBlobUrl(blobPath: string): string {
  return `${SHELBY_BASE}/${SHELBY_ACCOUNT}/${blobPath}`;
}

export async function uploadToShelby(blobPath: string, data: object): Promise<string | null> {
  const safe = blobPath.replace(/\//g, "_");
  const tmpFile = join(tmpdir(), `shelby_${safe}`);
  try {
    await writeFile(tmpFile, JSON.stringify(data, null, 2), "utf8");
    await execAsync(
      `shelby upload "${tmpFile}" "${blobPath}" --expiration "in 365 days" --assume-yes`,
      { timeout: 60_000 }
    );
    return shelbyBlobUrl(blobPath);
  } catch {
    return null;
  } finally {
    await unlink(tmpFile).catch(() => {});
  }
}

import { inflate, ungzip } from "pako";

/** GZIP magic (RFC 1952) — e.g. `gzip -k file.json` → `file.json.gz` */
const GZIP_ID1 = 0x1f;
const GZIP_ID2 = 0x8b;

/**
 * Decompress HTS revision blobs from storage.
 *
 * - **GZIP** (1f 8b): GNU `gzip`, typical `.json.gz` from shell `gzip`.
 * - **Zlib** (often `78 …`): legacy zlib-wrapped deflate; older `pako.deflate` pipelines.
 */
export function decompressHtsRevisionPayload(bytes: Uint8Array): string {
  // Already JSON: a fetch that undid the gzip itself (a Content-Encoding: gzip response)
  const first = bytes.find((b) => b !== 0x20 && b !== 0x0a && b !== 0x0d && b !== 0x09);
  if (first === 0x5b || first === 0x7b) {
    return new TextDecoder().decode(bytes);
  }
  if (
    bytes.length >= 2 &&
    bytes[0] === GZIP_ID1 &&
    bytes[1] === GZIP_ID2
  ) {
    return ungzip(bytes, { toText: true });
  }
  return inflate(bytes, { toText: true });
}

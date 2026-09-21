/**
 * ZIP local file header: PK\x03\x04
 * Empty archive: PK\x05\x06
 * Spanned archive: PK\x07\x08
 */
export function hasZipSignature(bytes: Uint8Array): boolean {
  if (bytes.length < 2) return false;
  if (bytes[0] !== 0x50 || bytes[1] !== 0x4b) return false;

  if (bytes.length < 4) return true;

  const third = bytes[2];
  const fourth = bytes[3];
  return (
    (third === 0x03 && fourth === 0x04) ||
    (third === 0x05 && fourth === 0x06) ||
    (third === 0x07 && fourth === 0x08)
  );
}

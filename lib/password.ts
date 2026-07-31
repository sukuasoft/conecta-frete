import bcrypt from 'bcryptjs';
import * as Crypto from 'expo-crypto';

bcrypt.setRandomFallback((len: number) => Array.from(Crypto.getRandomBytes(len)));

const SHA_PREFIX = 'sha256';

function bytesToHex(bytes: Uint8Array) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Hash leve via expo-crypto (evita freeze/crash do bcrypt sync no RN). */
export async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(await Crypto.getRandomBytesAsync(16));
  const digest = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    `${salt}:${password}`,
  );
  return `${SHA_PREFIX}$${salt}$${digest}`;
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  if (hash.startsWith(`${SHA_PREFIX}$`)) {
    const parts = hash.split('$');
    const salt = parts[1];
    const expected = parts[2];
    if (!salt || !expected) return false;
    const digest = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      `${salt}:${password}`,
    );
    return digest === expected;
  }

  // Contas antigas com bcrypt
  return bcrypt.compareSync(password, hash);
}

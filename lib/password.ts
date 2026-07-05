import bcrypt from 'bcryptjs';
import { getRandomBytes } from 'expo-crypto';

bcrypt.setRandomFallback((len: number) => Array.from(getRandomBytes(len)));

const ROUNDS = 10;

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, ROUNDS);
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash);
}

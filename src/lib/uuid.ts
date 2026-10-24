import { randomUUID } from 'expo-crypto';

export function uuid(): string {
  return randomUUID();
}

import { count, desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { smokeChecks } from '@/db/schema';

export function useSmokeChecks() {
  return useLiveQuery(db.select().from(smokeChecks).orderBy(desc(smokeChecks.createdAt)).limit(5));
}

export function useSmokeCheckCount() {
  const { data, error } = useLiveQuery(db.select({ value: count() }).from(smokeChecks));
  return { count: data[0]?.value ?? 0, error };
}

export async function addSmokeCheck(label: string) {
  await db.insert(smokeChecks).values({ label });
}

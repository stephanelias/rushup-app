import { desc } from 'drizzle-orm';
import { useLiveQuery } from 'drizzle-orm/expo-sqlite';

import { db } from '@/db/client';
import { smokeChecks } from '@/db/schema';

export function useSmokeChecks() {
  return useLiveQuery(db.select().from(smokeChecks).orderBy(desc(smokeChecks.createdAt)).limit(5));
}

export async function addSmokeCheck(label: string) {
  await db.insert(smokeChecks).values({ label });
}

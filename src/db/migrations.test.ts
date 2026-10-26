/**
 * Applies the `drizzle/` migrations to an in-memory SQLite database (like `pnpm db:check`),
 * then checks the exercise seed and the `exercises` table constraints.
 */
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { MUSCLE_GROUP_CODES } from '@/features/exercises/model';
import { normalizeName } from '@/features/exercises/normalize';

const MIGRATIONS_FOLDER = join(__dirname, '../../drizzle');

function migratedDatabase(): DatabaseSync {
  const db = new DatabaseSync(':memory:');
  db.exec('PRAGMA foreign_keys = ON;');
  const folders = readdirSync(MIGRATIONS_FOLDER, { withFileTypes: true })
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort();
  for (const name of folders) {
    db.exec(readFileSync(join(MIGRATIONS_FOLDER, name, 'migration.sql'), 'utf8'));
  }
  return db;
}

type ExerciseRow = {
  id: string;
  name: string;
  name_normalized: string;
  type: string;
  muscle_group: string | null;
  origin: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('base exercise seed', () => {
  const rows = migratedDatabase()
    .prepare('SELECT * FROM exercises')
    .all() as unknown as ExerciseRow[];

  it('inserts the 57 exercises, all with base origin', () => {
    expect(rows).toHaveLength(57);
    expect(rows.every((row) => row.origin === 'base')).toBe(true);
  });

  it('uses fixed, unique UUIDs', () => {
    expect(rows.every((row) => UUID.test(row.id))).toBe(true);
    expect(new Set(rows.map((row) => row.id)).size).toBe(57);
  });

  it('splits exercises by group as in the spec', () => {
    const counts: Record<string, number> = {};
    for (const row of rows) {
      const key = row.type === 'cardio' ? 'cardio' : row.muscle_group!;
      counts[key] = (counts[key] ?? 0) + 1;
    }
    expect(counts).toEqual({
      chest: 6,
      back: 6,
      shoulders: 6,
      biceps: 6,
      triceps: 6,
      legs: 15,
      abs: 6,
      cardio: 6,
    });
  });

  it('stores the name normalized by normalizeName', () => {
    for (const row of rows) {
      expect(row.name_normalized).toBe(normalizeName(row.name));
    }
  });
});

describe('exercises table constraints', () => {
  const db = migratedDatabase();
  const insert = db.prepare(
    `INSERT INTO exercises (id, name, name_normalized, type, muscle_group, origin, archived_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, 'custom', ?, 0, 0)`,
  );
  let nextId = 0;
  const add = (
    name: string,
    type: string,
    muscleGroup: string | null,
    archivedAt: number | null = null,
  ) => insert.run(`test-${nextId++}`, name, normalizeName(name), type, muscleGroup, archivedAt);

  it('accepts a strength exercise with a group and a cardio one without', () => {
    for (const group of MUSCLE_GROUP_CODES) {
      expect(() => add(`Muscu ${group}`, 'strength', group)).not.toThrow();
    }
    expect(() => add('Corde à sauter', 'cardio', null)).not.toThrow();
  });

  it('rejects a strength exercise without a group or with an unknown group', () => {
    expect(() => add('Sans groupe', 'strength', null)).toThrow(/CHECK/);
    expect(() => add('Groupe inconnu', 'strength', 'neck')).toThrow(/CHECK/);
  });

  it('rejects a cardio exercise with a group', () => {
    expect(() => add('Cardio avec groupe', 'cardio', 'legs')).toThrow(/CHECK/);
  });

  it('rejects an unknown type', () => {
    expect(() => add('Gainage', 'isometric', null)).toThrow(/CHECK/);
  });

  it('rejects a non-archived duplicate regardless of case and accents', () => {
    expect(() => add('developpe couche barre', 'strength', 'chest')).toThrow(/UNIQUE/);
  });

  it('allows reusing the name of an archived exercise', () => {
    add('Curl araignée', 'strength', 'biceps', Date.now());
    expect(() => add('Curl araignée', 'strength', 'biceps')).not.toThrow();
    expect(() => add('Curl Araignee', 'strength', 'biceps')).toThrow(/UNIQUE/);
  });
});

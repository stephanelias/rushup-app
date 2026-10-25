/**
 * Applique les migrations de `drizzle/` sur une base SQLite en mémoire (comme `pnpm db:check`),
 * puis vérifie le seed des exercices et les contraintes de la table `exercises`.
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

describe('seed des exercices de la base', () => {
  const rows = migratedDatabase()
    .prepare('SELECT * FROM exercises')
    .all() as unknown as ExerciseRow[];

  it('insère les 57 exercices, tous d’origine base', () => {
    expect(rows).toHaveLength(57);
    expect(rows.every((row) => row.origin === 'base')).toBe(true);
  });

  it('utilise des UUID fixes et uniques', () => {
    expect(rows.every((row) => UUID.test(row.id))).toBe(true);
    expect(new Set(rows.map((row) => row.id)).size).toBe(57);
  });

  it('répartit les exercices par groupe comme la spec', () => {
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

  it('stocke le nom normalisé calculé par normalizeName', () => {
    for (const row of rows) {
      expect(row.name_normalized).toBe(normalizeName(row.name));
    }
  });
});

describe('contraintes de la table exercises', () => {
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

  it('accepte un exercice muscu avec groupe et un cardio sans groupe', () => {
    for (const group of MUSCLE_GROUP_CODES) {
      expect(() => add(`Muscu ${group}`, 'strength', group)).not.toThrow();
    }
    expect(() => add('Corde à sauter', 'cardio', null)).not.toThrow();
  });

  it('refuse un exercice muscu sans groupe ou avec un groupe inconnu', () => {
    expect(() => add('Sans groupe', 'strength', null)).toThrow(/CHECK/);
    expect(() => add('Groupe inconnu', 'strength', 'neck')).toThrow(/CHECK/);
  });

  it('refuse un exercice cardio avec un groupe', () => {
    expect(() => add('Cardio avec groupe', 'cardio', 'legs')).toThrow(/CHECK/);
  });

  it('refuse un type inconnu', () => {
    expect(() => add('Gainage', 'isometric', null)).toThrow(/CHECK/);
  });

  it('refuse un doublon non archivé, sans tenir compte des majuscules ni des accents', () => {
    expect(() => add('developpe couche barre', 'strength', 'chest')).toThrow(/UNIQUE/);
  });

  it('autorise à recréer le nom d’un exercice archivé', () => {
    add('Curl araignée', 'strength', 'biceps', Date.now());
    expect(() => add('Curl araignée', 'strength', 'biceps')).not.toThrow();
    expect(() => add('Curl Araignee', 'strength', 'biceps')).toThrow(/UNIQUE/);
  });
});

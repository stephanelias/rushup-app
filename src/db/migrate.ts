import { migrate } from 'drizzle-orm/expo-sqlite/migrator';
import { useEffect, useState } from 'react';

import migrations from '../../drizzle/migrations';
import { db } from './client';

type MigrationState =
  { status: 'pending' } | { status: 'done' } | { status: 'error'; error: Error };

/**
 * Applique les migrations en attente au démarrage de l'app.
 * (Le `useMigrations` de Drizzle v1 RC a un type désaligné avec le fichier généré par drizzle-kit.)
 */
export function useDatabaseMigrations(): MigrationState {
  const [state, setState] = useState<MigrationState>({ status: 'pending' });

  useEffect(() => {
    migrate(db, migrations)
      .then(() => setState({ status: 'done' }))
      .catch((error: unknown) =>
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        }),
      );
  }, []);

  return state;
}

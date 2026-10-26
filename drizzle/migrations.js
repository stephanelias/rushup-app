import m0000 from './20261024143833_init/migration.sql';
import m0001 from './20261025195718_exercises/migration.sql';
import m0002 from './20261025195719_seed_base_exercises/migration.sql';

export default {
  migrations: {
    '20261024143833_init': m0000,
    '20261025195718_exercises': m0001,
    '20261025195719_seed_base_exercises': m0002,
  },
};

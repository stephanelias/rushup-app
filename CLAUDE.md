# Rushupp — Guidelines pour Claude

Application mobile de suivi d'entraînement (muscu + cardio), offline-first.
Référence produit : Notion › RushUP › « MVP — Périmètre produit », et une spec par parcours (Bibliothèque, Programmes, Aujourd'hui, Séance en cours, Progrès), chacune avec sa sous-page « Conception technique ». Tickets : Linear, projet RushUP.
En cas de doute sur une règle métier, **demander** plutôt qu'inventer.

## Stack (versions figées — ne pas monter sans accord)

- Expo SDK 57 · React Native 0.86 · TypeScript `strict`
- Expo Router (template `default@sdk-57`)
- expo-sqlite + **Drizzle ORM v1 (RC)** + drizzle-kit
- **NativeWind v5 (RC)** + Tailwind CSS v4 — paire `nativewind` / `react-native-css` épinglée en version exacte
- react-native-svg, Reanimated, lucide-react-native, expo-font, expo-crypto
- pnpm 10, en mode `nodeLinker: hoisted` (`pnpm-workspace.yaml`) · **dev build uniquement** (Expo Go n'est pas utilisable en SDK 57)
- **Ne pas migrer vers la SDK 58** (sortie le 16/10) : NativeWind v5 RC est testé sur la SDK 57, et `react-native-reorderable` ne supporte pas React Native 0.88. La migration fera l'objet d'un ticket dédié.

## Commandes

Node ≥ 22.13 (`.nvmrc`), pnpm 10.

- `pnpm ios` / `pnpm android` — (re)compiler et lancer le dev build (après ajout d'une dépendance native)
- `pnpm start` — lancer Metro
- `pnpm db:generate` — générer une migration après modification du schéma
- `pnpm format` — formater tout le projet avec Prettier

Équivalents locaux des jobs de la CI (`.github/workflows/ci.yml`), à lancer avant de pousser :

| Job CI                | Commande locale                                    |
| --------------------- | -------------------------------------------------- |
| Lint et format        | `pnpm lint` (ESLint + `prettier --check`)          |
| Vérification de types | `pnpm typecheck`                                   |
| Tests unitaires       | `pnpm test`                                        |
| expo-doctor           | `pnpm doctor`                                      |
| Migrations Drizzle    | `pnpm db:generate` (aucun fichier ne doit changer) |
| Base vierge           | `pnpm db:check` (applique toutes les migrations)   |

Le pre-commit (husky + lint-staged) lance ESLint et Prettier sur les fichiers indexés uniquement.

## Glossaire (à respecter dans le code)

| Terme code        | Sens métier                                                                                                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Exercise`        | Exercice de la bibliothèque (fourni ou personnalisé), type `strength` (muscu) ou `cardio`                                                                                                            |
| `Program`         | Programme créé par l'utilisateur                                                                                                                                                                     |
| `Workout`         | Séance **type** d'un programme (le prévu)                                                                                                                                                            |
| `WorkoutExercise` | Exercice d'une séance type, avec ses objectifs                                                                                                                                                       |
| `Session`         | Séance **réalisée** (le fait), statut `in_progress` / `completed`. Une séance abandonnée est **supprimée** avec ses séries                                                                           |
| `SessionExercise` | Exercice d'une séance réalisée (objectifs copiés au démarrage)                                                                                                                                       |
| `SessionSet`      | Performance réalisée, une ligne par série validée : reps × charge (avec son mode de charge) en muscu, durée + distance en cardio. Côté TypeScript : union discriminée `StrengthSet` / `CardioResult` |

Ne jamais utiliser « séance » seul dans un nom de code : c'est `Workout` **ou** `Session`.

## Architecture

```
src/
  app/                  routes Expo Router uniquement
    (tabs)/             Aujourd'hui, Programmes, Progrès, Exercices
    session/[id]        séance en cours, plein écran, hors (tabs)
  features/<feature>/   composants, hooks, requêtes, logique de la feature
  db/                   client, schéma Drizzle, colonnes communes, migrateur, seed des exercices
  ui/                   composants partagés
  lib/                  utilitaires transverses (uuid, dates, unités)
  types/                déclarations de modules (.css, .sql)
  global.css            tokens de design (NativeWind / Tailwind v4)
drizzle/                migrations générées par drizzle-kit (ne pas éditer à la main)
scripts/                outils Node (contrôle des migrations)
```

Imports : alias `@/` → `src/`. Tests : `*.test.ts` à côté du fichier testé.

Règles :

- **Aucun SQL ni règle métier dans `src/app/`.** Un fichier de route assemble un écran à partir des features.
- L'accès à la base passe par les fichiers de requêtes des features, jamais directement depuis un composant.
- La logique métier (déroulé de séance, perfs précédentes, conversions) est écrite en **fonctions pures**, sans dépendance à React ni à la base, et testée.
- Pas de couches Clean Architecture, pas de store global. État local : `useState`. Données : SQLite est la source de vérité.

## Données

- Clés primaires en **UUID** (`randomUUID()` d'expo-crypto), `created_at` / `updated_at` sur les tables principales : le modèle doit rester compatible avec une synchronisation future. Toute table principale utilise les helpers de `src/db/columns.ts` : `id: id()` et `...timestamps`. L'UUID et les dates sont remplis par Drizzle à l'insertion, `updated_at` à chaque mise à jour.
- Conventions de schéma : tables et colonnes en `snake_case` côté SQL (`smoke_checks.created_at`), en `camelCase` côté TypeScript (`createdAt`). Dates stockées en millisecondes (`integer`, mode `timestamp_ms`). Clés étrangères avec `onDelete: 'cascade'` quand l'enfant n'a pas de sens sans le parent (`PRAGMA foreign_keys = ON` est activé à l'ouverture).
- `src/db/schema.ts` ne doit importer aucun module natif (expo-\*, react-native) : drizzle-kit le lit dans Node.
- Unités de stockage : kg, mètres, secondes. Conversion uniquement à l'affichage.
- Au démarrage d'une `Session`, les exercices et objectifs du `Workout` sont **copiés**, y compris le mode de charge (`none` / `kg` / `bodyweight`), ainsi que les noms du programme et de la séance. Modifier, renommer ou supprimer un programme ne modifie jamais l'historique. Les noms d'exercices, eux, sont lus en direct.
- Historique, « la dernière fois » et rotation ne lisent que les sessions `completed`. Une session interrompue puis reprise (`interrupted_at` renseigné) n'a pas de durée.
- Supprimer une séance de l'historique ou abandonner une séance : une transaction supprime la session, et ses exercices et séries partent en cascade. Tout ce qui est dérivé se met à jour seul.
- Chaque série est **enregistrée dès sa validation**, pas en fin de séance.
- Un exercice qui a de l'historique est archivé, jamais supprimé.
- Minuteurs : stocker l'**heure de fin** (ex. `rest_ends_at`), jamais un compteur décrémenté. Le repos appartient à la `Session`, pas à l'exercice : il continue quand on passe à l'exercice suivant. À 0:00, une notification locale prévient si l'app est en arrière-plan ; elle est annulée si on revient avant.
- Un `SessionExercise` a un statut : `pending` / `completed` / `skipped`. Pendant une séance, on peut ajouter une série ou retirer la dernière série non faite. Remplacer un exercice ne modifie jamais le programme.
- Cardio : une seule validation par exercice, sans séries et sans repos après.
- Les données dérivées (perfs de la dernière fois, etc.) sont calculées par requête, pas stockées.

Migrations : modifier `src/db/schema.ts` → `pnpm db:generate` → `pnpm db:check` → committer le dossier de migration **et** `drizzle/migrations.js`. Les migrations s'appliquent au démarrage de l'app (`src/db/migrate.ts`), avant le premier écran. **Ne jamais modifier une migration déjà committée.**

## UI

Référence design : Notion › RushUP › « Questions pour le design — avant développement » (tokens, règles d'usage, comportements). Les maquettes font foi pour le rendu.

- Style via NativeWind (`className`). Couleurs, espacements, rayons et styles de texte sont des **tokens** définis dans `src/global.css`, repris tels quels de l'export du designer. Aucune valeur en dur dans les composants. La palette et les rayons par défaut de Tailwind sont désactivés : seuls les tokens existent (`bg-background`, `text-accent`, `rounded-card`, `text-body`, `px-screen`…). Espacements : 1 rem = 16 px (`:root { font-size }`), donc `p-1` = 4 et `p-5` = 20.
- Pièges NativeWind v5 RC : un interligne de token s'écrit en **ratio** (`1.2`), jamais en px (il serait multiplié par la taille de police). `className` ne s'applique pas aux composants tiers (ex. `SafeAreaView` de react-native-safe-area-context) : utiliser une `View` avec les utilitaires `pt-safe`, `pb-safe`…
- Couleurs nommées par **rôle** (`background`, `surface`, `surfaceRaised`, `border`, `text`, `textSecondary`, `disabled`, `accent`, `onAccent`, `error`) pour permettre un thème clair plus tard. Thème sombre uniquement au MVP.
- Usage des couleurs : l'accent est réservé à l'action principale, à la progression et au repère « en cours », jamais décoratif. `error` sert uniquement aux erreurs et aux suppressions. `disabled` ne sert jamais pour du texte à lire.
- Polices : **Geist** (400, 500, 600) pour le texte, **Geist Mono** (400, 500) pour tous les chiffres. Une famille par graisse, avec un utilitaire dédié par graisse : `font-sans`, `font-sans-medium`, `font-sans-semibold`, `font-mono`, `font-mono-medium`. Elles sont chargées au démarrage (`src/ui/fonts.ts`, splash maintenu jusque-là). Pas d'utilitaire de graisse (`font-medium`…) : chaque `Text` porte une police et un style de texte, ex. `font-sans-semibold text-screen-title`. Correspondances dans `src/global.css`.
- Icônes : lucide-react-native, taille 24, `strokeWidth` 1.75 (2 si actif).
- Cibles tactiles de 44 minimum. Padding d'écran de 20.
- Barre de navigation : composant `tabBar` personnalisé qui préserve l'événement `tabPress` (re-toucher l'onglet actif = retour à la racine). Écrans à liste : `useScrollToTop`.
- Anneau du minuteur : react-native-svg + Reanimated.
- Feuilles en bas d'écran (modifier une série, remplacer, menu « ··· ») : feuilles natives d'Expo Router (`presentation: 'formSheet'`), déclarées comme des routes. Pas de bibliothèque de bottom sheet.
- **Accessibilité** : le texte suit la taille système, et les lignes passent à la ligne au lieu d'être tronquées. Les chiffres des lignes de série sont plafonnés (`maxFontSizeMultiplier` ≈ 1.3) via un composant de texte dédié. Chaque bouton qui n'affiche qu'une icône porte un `accessibilityLabel`.
- **Animations** : courtes et sobres (fondu 150 ms, glissement 250 ms). Toutes désactivées quand la réduction des animations est activée sur le téléphone.
- **Haptique** (expo-haptics) : impact léger à la validation d'une série, notification « succès » à la fin du repos et à la fin de la séance. Rien d'autre.
- **Erreurs** : jamais d'échec silencieux. Une série n'est marquée faite qu'après la confirmation de l'écriture en base. En cas d'échec, les valeurs saisies restent à l'écran et un bandeau propose « Réessayer ».

## Qualité

- TypeScript `strict`, pas de `any` sans justification en commentaire.
- ESLint + Prettier, lancés au pre-commit (husky + lint-staged) sur les fichiers modifiés.
- Tests Jest (jest-expo) pour la logique pure. Pas de tests UI ni E2E au MVP.
- CI GitHub Actions sur chaque PR et sur `main` : lint et format, typecheck, tests, `expo-doctor`, contrôle des migrations Drizzle (schéma modifié sans migration, migration existante modifiée) et application de toutes les migrations sur une base vierge. Avant de pousser, lancer localement `pnpm lint`, `pnpm typecheck` et `pnpm test`.

## Limites pour l'agent

- **Ne pas ajouter de dépendance** ni monter une version (SDK, Drizzle, NativeWind) sans accord explicite.
- Rester dans le périmètre du ticket en cours.
- Hors MVP, ne pas implémenter : sync backend, compte ou authentification, programmes préremplis, onboarding, statistiques et graphiques, streaks ou calendrier, street workout, fractionné cardio.
- Si une spec est ambiguë ou contredit ce fichier, s'arrêter et poser la question.

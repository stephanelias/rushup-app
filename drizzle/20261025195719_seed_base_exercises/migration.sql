-- Les 57 exercices de la base (spec « Bibliothèque d'exercices », section 5).
-- IDs fixes, identiques sur toutes les installations : ne jamais les modifier.
-- Ajouter des exercices = nouvelle migration, sans toucher à celle-ci ni au masquage choisi par l'utilisateur.
INSERT INTO `exercises` (`id`, `name`, `name_normalized`, `type`, `muscle_group`, `origin`, `created_at`, `updated_at`) VALUES
	-- Pectoraux
	('e1a38dae-0b59-4183-8c2b-780f34a93ccf', 'Développé couché barre', 'developpe couche barre', 'strength', 'chest', 'base', 1792886400000, 1792886400000),
	('09301881-cd28-490b-9e71-bb5e57799979', 'Développé couché haltères', 'developpe couche halteres', 'strength', 'chest', 'base', 1792886400000, 1792886400000),
	('73978da0-124d-4cc7-a929-8066ce98e7e8', 'Développé incliné haltères', 'developpe incline halteres', 'strength', 'chest', 'base', 1792886400000, 1792886400000),
	('eb9eae59-0caf-4358-bba0-0e1f1c90f396', 'Écarté poulie', 'ecarte poulie', 'strength', 'chest', 'base', 1792886400000, 1792886400000),
	('8f83f7bd-5b98-46fc-ae76-8da575c7fa8a', 'Dips', 'dips', 'strength', 'chest', 'base', 1792886400000, 1792886400000),
	('5d208bc6-2d5a-4385-b863-8549469787dd', 'Pompes', 'pompes', 'strength', 'chest', 'base', 1792886400000, 1792886400000),
	-- Dos
	('3047414d-e3f4-4249-ab42-c22f230bad61', 'Tractions', 'tractions', 'strength', 'back', 'base', 1792886400000, 1792886400000),
	('bc6f49bd-6bed-42f1-9991-d2e00497d0df', 'Tirage vertical poulie', 'tirage vertical poulie', 'strength', 'back', 'base', 1792886400000, 1792886400000),
	('6600435d-b1bc-467b-b02d-d0b1526340b3', 'Tirage horizontal poulie', 'tirage horizontal poulie', 'strength', 'back', 'base', 1792886400000, 1792886400000),
	('5a1c774e-e939-4b29-be3f-8c6ea84ccd4c', 'Rowing barre', 'rowing barre', 'strength', 'back', 'base', 1792886400000, 1792886400000),
	('00fef3fd-e208-4707-ba4d-ef63eb8dd5fe', 'Rowing haltère un bras', 'rowing haltere un bras', 'strength', 'back', 'base', 1792886400000, 1792886400000),
	('a3bddcd3-ba3c-4e23-bc83-e9900f2a9e36', 'Soulevé de terre', 'souleve de terre', 'strength', 'back', 'base', 1792886400000, 1792886400000),
	-- Épaules
	('abfd1782-65b2-4392-a054-d2d7a411db8d', 'Développé militaire barre', 'developpe militaire barre', 'strength', 'shoulders', 'base', 1792886400000, 1792886400000),
	('b417d835-6add-47eb-935e-b980097ae2da', 'Développé épaules haltères', 'developpe epaules halteres', 'strength', 'shoulders', 'base', 1792886400000, 1792886400000),
	('c5b3e29f-22b5-4fba-b389-23d5f5c8ccf8', 'Élévations latérales', 'elevations laterales', 'strength', 'shoulders', 'base', 1792886400000, 1792886400000),
	('3ba2368d-7f95-4318-83b6-e829bd2a9f46', 'Élévations frontales', 'elevations frontales', 'strength', 'shoulders', 'base', 1792886400000, 1792886400000),
	('d6bf0f99-a865-4b79-85b3-a888e2ac84e0', 'Oiseau', 'oiseau', 'strength', 'shoulders', 'base', 1792886400000, 1792886400000),
	('9b33b284-39bf-4798-bc48-2133a40a2c66', 'Face pull', 'face pull', 'strength', 'shoulders', 'base', 1792886400000, 1792886400000),
	-- Biceps
	('70459c66-57bf-4695-855e-ca0f81dd339e', 'Curl barre', 'curl barre', 'strength', 'biceps', 'base', 1792886400000, 1792886400000),
	('216a1a64-f940-4924-b780-0d5c4a6d9574', 'Curl haltères', 'curl halteres', 'strength', 'biceps', 'base', 1792886400000, 1792886400000),
	('554aaa21-68c7-4038-9a5b-51d4e3127b72', 'Curl marteau', 'curl marteau', 'strength', 'biceps', 'base', 1792886400000, 1792886400000),
	('3797df04-e8bf-41f1-a16c-9561abef5cc1', 'Curl incliné haltères', 'curl incline halteres', 'strength', 'biceps', 'base', 1792886400000, 1792886400000),
	('abb9b7a7-be71-4290-8e9f-832d6769b401', 'Curl pupitre', 'curl pupitre', 'strength', 'biceps', 'base', 1792886400000, 1792886400000),
	('7ba963d3-f01a-49c9-8f2d-055faf248c5c', 'Curl poulie', 'curl poulie', 'strength', 'biceps', 'base', 1792886400000, 1792886400000),
	-- Triceps
	('c49f3eae-242b-4003-9298-866af83cb381', 'Barre au front', 'barre au front', 'strength', 'triceps', 'base', 1792886400000, 1792886400000),
	('8ef0f31d-6933-4a22-bfd9-fb88550c35a1', 'Extension triceps poulie', 'extension triceps poulie', 'strength', 'triceps', 'base', 1792886400000, 1792886400000),
	('a0872ff1-233f-48dd-a946-31fd26f67f48', 'Extension nuque haltère', 'extension nuque haltere', 'strength', 'triceps', 'base', 1792886400000, 1792886400000),
	('d1af4de3-2125-4128-828b-7342e05ad9c8', 'Développé couché prise serrée', 'developpe couche prise serree', 'strength', 'triceps', 'base', 1792886400000, 1792886400000),
	('9dd242d5-a902-4f60-b100-50aca6367fd6', 'Kickback haltère', 'kickback haltere', 'strength', 'triceps', 'base', 1792886400000, 1792886400000),
	('f7303d11-dded-406d-b9cc-1deb368663c3', 'Dips banc', 'dips banc', 'strength', 'triceps', 'base', 1792886400000, 1792886400000),
	-- Jambes
	('33e8cc8f-456a-45da-82d7-b210c758ec35', 'Squat barre', 'squat barre', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('96d770c7-a933-4148-9188-744092c20384', 'Presse à cuisses', 'presse a cuisses', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('0ef555d5-a4fb-419b-9dcb-88d219b7cb5b', 'Hack squat', 'hack squat', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('4d0dc5d5-0fcc-4760-b98a-e61b8115312e', 'Leg extension', 'leg extension', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('4284e8e5-2e17-46c5-8dfb-c7339d339406', 'Fentes haltères', 'fentes halteres', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('e52ee814-3734-43db-b1d2-b7bec4647201', 'Squat bulgare', 'squat bulgare', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('5b809d72-e89e-43cc-8693-844758c690c7', 'Soulevé de terre roumain', 'souleve de terre roumain', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('f09d2988-21e6-476c-9720-920ab735db64', 'Leg curl allongé', 'leg curl allonge', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('3458db58-63e6-4994-b730-ee3993c10646', 'Leg curl assis', 'leg curl assis', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('a4c78d34-d0bd-456b-a761-591cea5d7d91', 'Hip thrust', 'hip thrust', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('c9812a1a-c650-4122-ac34-5e5aec1822ac', 'Good morning', 'good morning', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('addc67ad-a2aa-4636-8bc3-86918896d1a0', 'Abduction machine', 'abduction machine', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('56f2a2a1-7b42-481e-9479-9adaa303a86c', 'Mollets debout', 'mollets debout', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('fa6dbf2d-a527-423a-b107-6e7a7b075126', 'Mollets assis', 'mollets assis', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	('29475d1e-4e3a-4edd-bd08-7d391e471662', 'Mollets à la presse', 'mollets a la presse', 'strength', 'legs', 'base', 1792886400000, 1792886400000),
	-- Abdominaux
	('b8f1301f-dc0a-4f50-ba62-70d62ba361ea', 'Crunch', 'crunch', 'strength', 'abs', 'base', 1792886400000, 1792886400000),
	('29f96518-5b98-4983-b23e-20099ea06eb5', 'Crunch poulie', 'crunch poulie', 'strength', 'abs', 'base', 1792886400000, 1792886400000),
	('8f3a7adb-83ca-493b-b359-63a8bf3ea007', 'Relevé de jambes suspendu', 'releve de jambes suspendu', 'strength', 'abs', 'base', 1792886400000, 1792886400000),
	('57597317-0765-4089-806e-bc0b2eb6eb66', 'Relevé de jambes au sol', 'releve de jambes au sol', 'strength', 'abs', 'base', 1792886400000, 1792886400000),
	('6d61b123-77e6-4dfd-9240-05db7e043d7f', 'Roue abdominale', 'roue abdominale', 'strength', 'abs', 'base', 1792886400000, 1792886400000),
	('ce1b4afc-6240-4db5-8100-4953ca26ea8e', 'Russian twist', 'russian twist', 'strength', 'abs', 'base', 1792886400000, 1792886400000),
	-- Cardio
	('69a3b317-1cfe-4410-b025-73745a053c58', 'Course à pied', 'course a pied', 'cardio', NULL, 'base', 1792886400000, 1792886400000),
	('92ca4a19-625c-421a-89c8-f1edabd5f9b8', 'Tapis de course', 'tapis de course', 'cardio', NULL, 'base', 1792886400000, 1792886400000),
	('f67663a7-81a1-4f9e-b73e-354be883e971', 'Vélo', 'velo', 'cardio', NULL, 'base', 1792886400000, 1792886400000),
	('ad49dc28-c150-480d-b08c-85be9d55f258', 'Vélo d''appartement', 'velo d''appartement', 'cardio', NULL, 'base', 1792886400000, 1792886400000),
	('53bdf6cb-ccdf-4ebd-9223-f07b883a93bf', 'Elliptique', 'elliptique', 'cardio', NULL, 'base', 1792886400000, 1792886400000),
	('0e4713ff-5981-46ac-b850-9f3fae1284b0', 'Rameur', 'rameur', 'cardio', NULL, 'base', 1792886400000, 1792886400000);

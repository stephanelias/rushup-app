CREATE TABLE `exercises` (
	`id` text PRIMARY KEY,
	`name` text NOT NULL,
	`name_normalized` text NOT NULL,
	`type` text NOT NULL,
	`muscle_group` text,
	`origin` text NOT NULL,
	`hidden_at` integer,
	`archived_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	CONSTRAINT "exercises_type_check" CHECK("type" IN ('strength', 'cardio')),
	CONSTRAINT "exercises_origin_check" CHECK("origin" IN ('base', 'custom')),
	CONSTRAINT "exercises_muscle_group_check" CHECK(("type" = 'strength' AND "muscle_group" IS NOT NULL AND "muscle_group" IN ('chest', 'back', 'shoulders', 'biceps', 'triceps', 'legs', 'abs')) OR ("type" = 'cardio' AND "muscle_group" IS NULL))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `exercises_name_normalized_unique` ON `exercises` (`name_normalized`) WHERE "exercises"."archived_at" IS NULL;
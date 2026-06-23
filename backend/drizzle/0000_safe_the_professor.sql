CREATE TABLE "exercise_library" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" varchar(255),
	"name" varchar(255) NOT NULL,
	"force" varchar(50),
	"level" varchar(50),
	"mechanic" varchar(50),
	"equipment" varchar(100),
	"primary_muscles" jsonb,
	"secondary_muscles" jsonb,
	"instructions" jsonb,
	"category" varchar(100),
	"images" jsonb,
	"is_custom" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "exercise_library_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "sets" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_exercise_id" integer NOT NULL,
	"set_number" integer NOT NULL,
	"reps" integer,
	"weight" numeric(6, 2),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workout_exercises" (
	"id" serial PRIMARY KEY NOT NULL,
	"workout_id" integer NOT NULL,
	"exercise_id" integer NOT NULL,
	"order_index" integer NOT NULL,
	"rest_seconds" integer,
	"tempo" varchar(20),
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "workouts" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" varchar(255),
	"name" varchar(255) NOT NULL,
	"started_at" timestamp DEFAULT now(),
	"finished_at" timestamp,
	"duration_seconds" integer,
	"notes" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "sets" ADD CONSTRAINT "sets_workout_exercise_id_workout_exercises_id_fk" FOREIGN KEY ("workout_exercise_id") REFERENCES "public"."workout_exercises"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_workout_id_workouts_id_fk" FOREIGN KEY ("workout_id") REFERENCES "public"."workouts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "workout_exercises" ADD CONSTRAINT "workout_exercises_exercise_id_exercise_library_id_fk" FOREIGN KEY ("exercise_id") REFERENCES "public"."exercise_library"("id") ON DELETE no action ON UPDATE no action;
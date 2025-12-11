CREATE SCHEMA "compass";
--> statement-breakpoint
CREATE TABLE "compass"."posts" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" text NOT NULL,
	"content" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"created_by" integer
);
--> statement-breakpoint
CREATE TABLE "compass"."recommendations" (
	"id" serial PRIMARY KEY NOT NULL,
	"destination" text NOT NULL,
	"number_of_travellers" integer NOT NULL,
	"budget" numeric(10, 2) NOT NULL,
	"number_of_days" integer NOT NULL,
	"rating" numeric NOT NULL
);
--> statement-breakpoint
CREATE TABLE "compass"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"is_native" boolean DEFAULT false NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "compass"."votes" (
	"id" serial PRIMARY KEY NOT NULL,
	"post_id" integer NOT NULL,
	"voted_by" integer NOT NULL,
	"vote_type" text NOT NULL,
	"voted_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "unique_vote_constraint" UNIQUE("post_id","voted_by")
);
--> statement-breakpoint
ALTER TABLE "compass"."posts" ADD CONSTRAINT "posts_created_by_users_id_fk" FOREIGN KEY ("created_by") REFERENCES "compass"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compass"."votes" ADD CONSTRAINT "votes_post_id_posts_id_fk" FOREIGN KEY ("post_id") REFERENCES "compass"."posts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "compass"."votes" ADD CONSTRAINT "votes_voted_by_users_id_fk" FOREIGN KEY ("voted_by") REFERENCES "compass"."users"("id") ON DELETE no action ON UPDATE no action;
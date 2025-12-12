ALTER TABLE "compass"."users" ADD COLUMN "clerk_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "compass"."users" ADD CONSTRAINT "users_clerk_id_unique" UNIQUE("clerk_id");
DROP INDEX "email_indx";--> statement-breakpoint
CREATE UNIQUE INDEX "users_non_deleted_email_unique" ON "users" USING btree ("email") WHERE "users"."deleted_at" IS NULL;
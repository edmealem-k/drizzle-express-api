ALTER TABLE "users" ADD COLUMN "password_hash" varchar(255) NOT NULL;--> statement-breakpoint
CREATE INDEX "email_indx" ON "users" USING btree ("email");
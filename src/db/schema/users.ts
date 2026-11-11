import { sql } from "drizzle-orm";
import { pgTable, serial, varchar, timestamp, boolean, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 150 }).notNull(),
    passwordHash: varchar("password_hash", { length: 255 }).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueNonDeletedEmail: uniqueIndex("users_non_deleted_email_unique")
      .on(table.email)
      .where(sql`${table.deletedAt} IS NULL`),
  }),
);

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./users";

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
}).omit({ id: true, createdAt: true });

export const selectUserSchema = createSelectSchema(users);

import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { users } from "./users";

export const insertUserSchema = createInsertSchema(users, {
  email: (schema) => schema.email(),
}).omit({ id: true, createdAt: true });

export const selectUserSchema = createSelectSchema(users);

export const createUserRequestSchema = z.object({
  name: z.string().trim().min(1).max(100),
  email: z.string().trim().email().max(150),
  password: z.string().min(8),
});

export const loginRequestSchema = z.object({
  email: z.string().trim().email().max(150),
  password: z.string().min(1),
});

export const updateUserRequestSchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    email: z.string().trim().email().max(150).optional(),
  })
  .refine((value) => value.name !== undefined || value.email !== undefined, {
    message: "At least one of name or email must be provided",
  });

export const userIdParamSchema = z.object({
  id: z.coerce.number().int().positive(),
});

import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import {
  createUserRequestSchema,
  updateUserRequestSchema,
  userIdParamSchema,
} from "../db/schema/validators";

const isUniqueViolation = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  error.code === "23505";

const publicUserFields = {
  id: users.id,
  name: users.name,
  email: users.email,
  isActive: users.isActive,
  createdAt: users.createdAt,
};

export const createUser = async (req: Request, res: Response) => {
  const parsed = createUserRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  try {
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const [newUser] = await db
      .insert(users)
      .values({
        name: parsed.data.name,
        email: parsed.data.email,
        passwordHash,
      })
      .onConflictDoNothing()
      .returning(publicUserFields);

    if (!newUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    return res.status(201).json(newUser);
  } catch {
    return res.status(500).json({ message: "Error creating user" });
  }
};

export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const allUsers = await db
      .select(publicUserFields)
      .from(users)
      .where(and(eq(users.isActive, true), isNull(users.deletedAt)))
      .orderBy(users.id);

    return res.status(200).json(allUsers);
  } catch {
    return res.status(500).json({ message: "Error getting users" });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  const parsedId = userIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const [user] = await db
      .select(publicUserFields)
      .from(users)
      .where(
        and(
          eq(users.id, parsedId.data.id),
          eq(users.isActive, true),
          isNull(users.deletedAt),
        ),
      )
      .limit(1);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(user);
  } catch {
    return res.status(500).json({ message: "Error getting user" });
  }
};

export const updateUser = async (req: Request, res: Response) => {
  const parsedId = userIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  const parsedBody = updateUserRequestSchema.safeParse(req.body);
  if (!parsedBody.success) {
    return res.status(400).json({ errors: parsedBody.error.flatten() });
  }

  const updateValues: { name?: string; email?: string } = {};
  if (parsedBody.data.name !== undefined) updateValues.name = parsedBody.data.name;
  if (parsedBody.data.email !== undefined) updateValues.email = parsedBody.data.email;

  try {
    const [updatedUser] = await db
      .update(users)
      .set(updateValues)
      .where(and(eq(users.id, parsedId.data.id), isNull(users.deletedAt)))
      .returning(publicUserFields);

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    if (isUniqueViolation(error)) {
      return res.status(409).json({ message: "Email already registered" });
    }

    return res.status(500).json({ message: "Error updating user" });
  }
};

export const deleteUser = async (req: Request, res: Response) => {
  const parsedId = userIdParamSchema.safeParse(req.params);
  if (!parsedId.success) {
    return res.status(400).json({ message: "Invalid user ID" });
  }

  try {
    const [deletedUser] = await db
      .update(users)
      .set({ deletedAt: new Date(), isActive: false })
      .where(
        and(
          eq(users.id, parsedId.data.id),
          isNull(users.deletedAt),
        ),
      )
      .returning({ id: users.id });

    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(204).end();
  } catch {
    return res.status(500).json({ message: "Error deleting user" });
  }
};

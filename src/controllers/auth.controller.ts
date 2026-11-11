import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "../db";
import { users } from "../db/schema";
import {
  createUserRequestSchema,
  loginRequestSchema,
} from "../db/schema/validators";

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error("JWT_SECRET must be configured before the API starts");
}

export const register = async (req: Request, res: Response) => {
  const parsed = createUserRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { name, email, password } = parsed.data;
  const passwordHash = await bcrypt.hash(password, 10);

  const [newUser] = await db
    .insert(users)
    .values({ name, email, passwordHash })
    .onConflictDoNothing()
    .returning({ id: users.id, name: users.name, email: users.email });

  if (!newUser) {
    return res.status(409).json({ message: "Email already registered" });
  }

  return res.status(201).json(newUser);
};

export const login = async (req: Request, res: Response) => {
  const parsed = loginRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.flatten() });
  }

  const { email, password } = parsed.data;
  const [user] = await db
    .select()
    .from(users)
    .where(
      and(
        eq(users.email, email),
        eq(users.isActive, true),
        isNull(users.deletedAt),
      ),
    )
    .limit(1);

  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "7d" });
  return res.status(200).json({ token });
};

import { Request, Response } from "express";
import { db } from "../db";
import { users } from "../db/schema";
import { eq } from "drizzle-orm";
import { insertUserSchema } from "../db/schema/validators";

export const createUser = async (req: Request, res: Response) => {
  try {
    const parsed = insertUserSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({
        errors: parsed.error.flatten(),
      });
      return;
    }
    const { email, name } = parsed.data;

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
      })
      .returning();

    res.status(201).json(newUser);
  } catch (error) {
    res.status(500).json({
      message: "Error creating user",
      error,
    });
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const allUsers = await db.select().from(users);

    // await db.query.users.findMany({
    //   with: {
    //     posts: true,
    //   },
    // });

    res.status(200).json(allUsers);
  } catch (error) {
    res.status(500).json({
      message: "Error getting all users",
      error,
    });
  }
};

export const getUserById = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const user = await db.select().from(users).where(eq(users.id, id));

    // await db.query.users.findFirst({
    //   where: (users, ({ eq }) => eq(users.id, id)),
    //   with: {
    //     posts: {
    //       orderBy: (posts, { desc }) => [desc(posts.createdAt)],
    //     },
    //   },
    // });

    if (!user)
      return res.status(404).json({
        message: "user not found",
      });

    return res.status(200).json(user);
  } catch (error) {
    res.status(500).json({
      message: "Error getting user",
      error,
    });
  }
};
export const updateUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    const { name, email } = req.body;

    const [updatedUser] = await db
      .update(users)
      .set({ name, email })
      .where(eq(users.id, id))
      .returning();

    if (!updatedUser)
      return res.status(404).json({
        message: "user not found",
      });

    return res.status(200).json(updatedUser);
  } catch (error) {
    res.status(500).json({
      message: "Error updating user",
      error,
    });
  }
};
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);

    const [deletedUser] = await db.delete(users).where(eq(users.id, id)).returning();

    if (!deletedUser)
      return res.status(404).json({
        message: "user not found",
      });

    return res.status(204).json({
      message: "user deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error deleting user",
      error,
    });
  }
};

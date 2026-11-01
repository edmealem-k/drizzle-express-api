import express from "express";
import * as userController from "../controllers/user.controller";
import { requireAuth } from "../middleware/auth";

const routes = express.Router();

routes.get("/", requireAuth, userController.getAllUsers);
routes.get("/:id", requireAuth, userController.getUserById);
routes.post("/", requireAuth, userController.createUser);
routes.patch("/:id", requireAuth, userController.updateUser);
routes.delete("/:id", requireAuth, userController.deleteUser);

export const userRoutes = routes;

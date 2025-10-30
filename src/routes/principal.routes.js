import { Router } from "express";
import rolesRoutes from "./roles.routes.js";
import userRoutes from "./users.routes.js";

const router = Router();

router.use("/roles", rolesRoutes);

router.use("/users", userRoutes);

export default router;

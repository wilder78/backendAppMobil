import express from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole
} from "../controller/roles.controller.js";

const router = express.Router();

// =======================================================
// RUTAS PRINCIPALES: /api/roles
// =======================================================

// router.post('/', createRole);
router.post("/", createRole);
router.get("/", getAllRoles);
router.get("/:idRol", getRoleById);

// ✅ SOLUCIÓN: Cambiar a PUT o agregar ambos métodos
router.put("/:idRol", updateRole); // Para PUT
router.patch("/:idRol", updateRole); // Para PATCH (opcional)

//Eliminar roles DELETE.
router.delete('/:idRol', deleteRole);

export default router;

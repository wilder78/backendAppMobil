import * as RolModel from "../models/rol.model.js"; // Asegúrate de que la ruta sea correcta

// --------------------------------------------------------
// 1. OBTENER TODOS LOS ROLES (GET /roles)
// --------------------------------------------------------
export const getAllRoles = async (req, res) => {
  try {
    const roles = await RolModel.getAllRoles();
    res.status(200).json(roles);
  } catch (error) {
    console.error("Error al obtener roles:", error);
    res
      .status(500)
      .json({
        error:
          error.message || "Error interno del servidor al obtener los roles.",
      });
  }
};

// --------------------------------------------------------
// 2. OBTENER ROL POR ID (GET /roles/:idRol)
// --------------------------------------------------------
export const getRoleById = async (req, res) => {
  try {
    const { idRol } = req.params;
    const role = await RolModel.getRoleById(idRol);

    if (role) {
      res.status(200).json(role);
    } else {
      res.status(404).json({ error: `Rol con ID ${idRol} no encontrado.` });
    }
  } catch (error) {
    console.error(`Error al obtener rol ${req.params.idRol}:`, error);
    res
      .status(500)
      .json({
        error: error.message || "Error interno del servidor al buscar el rol.",
      });
  }
};

// --------------------------------------------------------
// 3. CREAR ROL (POST /roles)
// --------------------------------------------------------
export const createRole = async (req, res) => {
  try {
    const { nombreRol, descripcionRol } = req.body;

    // Validación básica de entrada
    if (!nombreRol || !descripcionRol) {
      return res.status(400).json({
        error: "Datos incompletos.",
        details: "Se requieren 'nombreRol' y 'descripcion'.",
      });
    }

    const newRoleId = await RolModel.createRole(nombreRol, descripcionRol);

    res.status(201).json({
      message: "Rol creado exitosamente.",
      idRol: newRoleId,
      nombreRol,
      descripcionRol,
    });
  } catch (error) {
    console.error("Error al crear rol:", error);
    // El modelo lanza un error genérico, aquí manejamos el 500
    res
      .status(500)
      .json({
        error: error.message || "Error interno del servidor al crear el rol.",
      });
  }
};

// --------------------------------------------------------
// 4. ACTUALIZAR ROL (PATCH /roles/:idRol)
// --------------------------------------------------------
export const updateRole = async (req, res) => {
  try {
    const { idRol } = req.params;
    const data = req.body;

    // Usamos la validación simple de ID y datos, similar a la del usuario
    const roleIdNumber = parseInt(idRol);
    if (
      isNaN(roleIdNumber) ||
      roleIdNumber <= 0 ||
      Object.keys(data).length === 0
    ) {
      return res.status(400).json({
        error: "Petición inválida.",
        details: "Se requiere un ID de rol numérico y datos para actualizar.",
      });
    }

    const success = await RolModel.updateRole(roleIdNumber, data);

    if (success) {
      res
        .status(200)
        .json({
          message: "Rol actualizado correctamente.",
          idRol: roleIdNumber,
        });
    } else {
      // 404 si el ID no existe o 304 Not Modified si los datos son iguales,
      // pero 404 es más claro aquí.
      res
        .status(404)
        .json({ error: "Rol no encontrado o no se realizaron cambios." });
    }
  } catch (error) {
    console.error(`Error al actualizar rol ${req.params.idRol}:`, error);
    // Manejo de errores de unicidad/FK (si los hay)
    if (error.code === "ER_DUP_ENTRY") {
      return res
        .status(409)
        .json({ error: "Conflicto de datos. El nombre del rol ya existe." });
    }
    res
      .status(500)
      .json({
        error:
          error.message || "Error interno del servidor al actualizar el rol.",
      });
  }
};

// --------------------------------------------------------
// 5. ELIMINAR ROL (DELETE /roles/:idRol)
// --------------------------------------------------------
export const deleteRole = async (req, res) => {
  try {
    const { idRol } = req.params;
    const roleIdNumber = parseInt(idRol);

    if (isNaN(roleIdNumber) || roleIdNumber <= 0) {
      return res.status(400).json({ error: "ID de rol inválido." });
    }

    const success = await RolModel.deleteRole(roleIdNumber);

    if (success) {
      res.status(204).send(); // 204 No Content para eliminación exitosa
    } else {
      res.status(404).json({ error: `Rol con ID ${idRol} no encontrado.` });
    }
  } catch (error) {
    console.error(`Error al eliminar rol ${req.params.idRol}:`, error);

    // Manejo de error de clave foránea (si está en uso)
    if (error.message.includes("asignado a uno o más usuarios")) {
      return res.status(409).json({ error: error.message });
    }

    res
      .status(500)
      .json({
        error:
          error.message || "Error interno del servidor al eliminar el rol.",
      });
  }
};

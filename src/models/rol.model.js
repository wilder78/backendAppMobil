import { connectMySQL } from "../config/mysql.config.js";

// --------------------------------------------------------
// C: CREAR ROL (Create)
// --------------------------------------------------------
/**
 * Crea un nuevo rol en la base de datos.
 * @param {string} nombreRol - El nombre del nuevo rol (ej: 'Gerente').
 * @param {string} descripcion - La descripción del rol.
 * @returns {Promise<number>} El ID del rol recién creado (insertId).
 */
export const createRole = async (nombreRol, descripcionRol) => {
  const connection = await connectMySQL();
  try {
    const [result] = await connection.execute(
      "INSERT INTO roles (nombreRol, descripcionRol) VALUES (?, ?)",
      [nombreRol, descripcionRol]
    );
    return result.insertId;
  } catch (error) {
    console.error("Error en createRole:", error);
    throw new Error(
      "No se pudo crear el rol. Verifique la unicidad del nombre."
    );
  } finally {
    await connection.end();
  }
};

// --------------------------------------------------------
// R: LEER ROLES (Read - Todos y por ID)
// --------------------------------------------------------
/**
 * Obtiene todos los roles disponibles en la base de datos.
 */
export const getAllRoles = async () => {
  const connection = await connectMySQL();
  try {
    const [rows] = await connection.execute(
      "SELECT idRol, nombreRol, descripcionRol FROM roles"
    );
    return rows;
  } catch (error) {
    console.error("Error en getAllRoles:", error);
    throw new Error("No se pudo obtener la lista de roles.");
  } finally {
    await connection.end();
  }
};

/**
 * Obtiene un rol específico por su ID.
 * @param {number} idRol - El ID del rol a buscar.
 * @returns {Promise<Object|null>} El objeto rol o null si no se encuentra.
 */
export const getRoleById = async (idRol) => {
  const connection = await connectMySQL();
  try {
    const [rows] = await connection.execute(
      "SELECT idRol, nombreRol, descripcionRol FROM roles WHERE idRol = ?",
      [idRol]
    );
    return rows[0] || null;
  } catch (error) {
    console.error(`Error en getRoleById para ID ${idRol}:`, error);
    throw new Error(`No se pudo obtener el rol con ID ${idRol}.`);
  } finally {
    await connection.end();
  }
};

// --------------------------------------------------------
// U: ACTUALIZAR ROL (Update - Actualización dinámica)
// --------------------------------------------------------
/**
 * Actualiza parcialmente un rol por su ID.
 * Solo actualiza los campos presentes en el objeto 'data'.
 * @param {number} idRol - El ID del rol a actualizar.
 * @param {Object} data - Objeto con los campos a modificar (ej: {nombreRol: 'Nuevo', descripcion: 'D'}).
 * @returns {Promise<boolean>} True si se actualizó al menos una fila, False si no se encontró el rol.
 */
export const updateRole = async (idRol, data) => {
  const connection = await connectMySQL();
  try {
    const fields = Object.keys(data);
    const values = Object.values(data);

    // Si no hay datos, retorna false inmediatamente
    if (fields.length === 0) {
      return false;
    }

    // Construye la cláusula SET dinámicamente: "nombreRol = ?, descripcion = ?"
    const setClauses = fields.map((field) => `${field} = ?`).join(", ");

    // Los valores de la consulta son los valores de los campos + el idRol
    const queryValues = [...values, idRol];

    const [result] = await connection.execute(
      `UPDATE roles SET ${setClauses} WHERE idRol = ?`,
      queryValues
    );

    // Retorna true si se afectó al menos una fila
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en updateRole para ID ${idRol}:`, error);
    throw new Error(
      "No se pudo actualizar el rol. Verifique los datos o si existe el ID."
    );
  } finally {
    await connection.end();
  }
};


// --------------------------------------------------------
// D: ELIMINAR ROL (Delete)
// --------------------------------------------------------
/**
 * Elimina un rol específico por su ID.
 * @param {number} idRol - El ID del rol a eliminar.
 * @returns {Promise<boolean>} True si se eliminó el rol, False si no se encontró.
 */
export const deleteRole = async (idRol) => {
  const connection = await connectMySQL();
  try {
    const [result] = await connection.execute(
      "DELETE FROM roles WHERE idRol = ?",
      [idRol]
    );
    // Retorna true si se afectó al menos una fila (es decir, si se eliminó)
    return result.affectedRows > 0;
  } catch (error) {
    console.error(`Error en deleteRole para ID ${idRol}:`, error);
    // Manejo específico si el rol está siendo usado (Foreign Key Constraint)
    if (error.code === "ER_ROW_IS_REFERENCED_2") {
      throw new Error(
        "No se puede eliminar este rol porque está asignado a uno o más usuarios."
      );
    }
    throw new Error("No se pudo eliminar el rol.");
  } finally {
    await connection.end();
  }
};




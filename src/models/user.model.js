// src/models/user.model.js
import { connectMySQL } from "../config/mysql.config.js"; // Asegúrate de la ruta correcta

/**
 * Obtiene todos los usuarios con su información de rol.
 * @returns {Promise<Array>} Lista de usuarios.
 */
// ✅ Obtener todos los usuarios
export const getAllUsers = async () => {
  // ⚠️ ATENCIÓN: Esta función asume que connectMySQL() devuelve una conexión Promise-based
  // y que es seguro llamar a connection.end() después de cada consulta.
  const connection = await connectMySQL();

  try {
    const [rows] = await connection.execute(
      `SELECT 
                u.idUsuario, 
                u.nombre, 
                u.email, 
                u.password,      -- ✅ Corregido: Usar 'password'
                u.estado,        -- ✅ Corregido: Obtener 'estado' directamente (es ENUM)
                r.nombreRol AS rol 
            FROM usuario u
            JOIN roles r ON u.idRol = r.idRol -- ✅ Corregido: Usar tabla 'roles'
            `
    );
    return rows;
  } catch (error) {
    console.error("❌ Error al obtener todos los usuarios:", error);
    // Puedes relanzar el error o manejarlo de otra manera
    throw new Error("No se pudo obtener la lista de usuarios.");
  } finally {
    // Asegura que la conexión se cierre después de la operación
    await connection.end();
  }
};

/**
 * Obtiene un usuario específico por su ID y la información de su rol.
 * @param {number} idUsuario - El ID único del usuario a buscar.
 * @returns {Promise<Object|null>} El objeto del usuario o null si no se encuentra.
 */
// ✅ Obtener usuario por id
export const getUserById = async (idUsuario) => {
    // ⚠️ Asume que connectMySQL() devuelve una conexión promise-based (mysql2/promise)
    const connection = await connectMySQL();
    
    try {
        const [rows] = await connection.execute(
            `SELECT 
                u.idUsuario, 
                u.nombre, 
                u.email, 
                -- u.password,     -- ⚠️ NOTA: Se recomienda NO retornar el hash de la contraseña por seguridad.
                u.estado,       -- ✅ Corregido: Obtener 'estado' directamente (es ENUM)
                r.nombreRol AS rol
            FROM usuario u
            -- ❌ Eliminado: JOIN estado e ON u.idEstado = e.idEstado (Tu tabla 'usuario' usa ENUM)
            JOIN roles r ON u.idRol = r.idRol -- ✅ Corregido: Usar tabla 'roles'
            WHERE u.idUsuario = ?`,
            [idUsuario]
        );
        
        // Retorna el primer resultado o null si la lista está vacía
        return rows[0] || null;
        
    } catch (error) {
        console.error(`❌ Error al obtener usuario con ID ${idUsuario}:`, error);
        // Lanza un error genérico para que el controlador lo maneje
        throw new Error(`Error al buscar usuario en la base de datos.`);
    } finally {
        // Asegura que la conexión se cierre después de la operación
        await connection.end();
    }
};


/**
 * Obtiene un usuario específico por su email para propósitos de autenticación.
 * Incluye la contraseña hasheada para verificación.
 * @param {string} email - El email del usuario a buscar.
 * @returns {Promise<Object|null>} El objeto del usuario con datos de rol, o null si no se encuentra.
 */
export const getUserByEmail = async (email) => {
    // ⚠️ Asume que connectMySQL() devuelve una conexión promise-based (mysql2/promise)
    const connection = await connectMySQL();
    
    try {
        const [rows] = await connection.execute(
            `SELECT 
                u.idUsuario, 
                u.nombre, 
                u.email, 
                u.password,       -- ✅ IMPORTANTE: Incluir el hash de la contraseña para autenticación
                u.estado,         -- ✅ Corregido: Obtener 'estado' directamente (es ENUM)
                r.nombreRol AS rol,
                r.idRol           -- Añadir idRol es útil para verificar permisos en la sesión
            FROM usuario u
            -- ❌ Eliminado: JOIN estado e ON u.idEstado = e.idEstado (Tu tabla 'usuario' usa ENUM)
            JOIN roles r ON u.idRol = r.idRol -- ✅ Corregido: Usar tabla 'roles'
            WHERE u.email = ?`,
            [email.toLowerCase()] // Es buena práctica buscar el email en minúsculas
        );
        
        // Retorna el primer resultado o null si la lista está vacía
        return rows[0] || null;
        
    } catch (error) {
        console.error(`❌ Error al buscar usuario por email ${email}:`, error);
        // Lanza un error genérico para que el controlador lo maneje
        throw new Error(`Error al buscar usuario en la base de datos por email.`);
    } finally {
        // Asegura que la conexión se cierre después de la operación
        await connection.end();
    }
};

/* Crea un usuario */
export const createUser = async (
    nombre,
    email,
    password, // ✅ Corregido el nombre del parámetro
    estado,   // ✅ Corregido el nombre del parámetro
    idRol
) => {
    // ⚠️ Asegúrate de que 'password' ya es un hash seguro aquí
    const connection = await connectMySQL();

    try {
        // 🔹 Consulta SQL segura y parametrizada (columnas ajustadas a tu diseño)
        const query = `
            INSERT INTO usuario (nombre, email, password, estado, idRol)
            VALUES (?, ?, ?, ?, ?)
        `;

        const [result] = await connection.execute(query, [
            nombre,
            email,
            password, // ✅ Usando 'password'
            estado,   // ✅ Usando 'estado' (ENUM)
            idRol,
        ]);

        // 🔹 Retorna datos clave del nuevo usuario
        return {
            idUsuario: result.insertId,
            nombre,
            email,
            estado, // ✅ Retornando 'estado'
            idRol,
        };
    } catch (error) {
        console.error("❌ Error al crear usuario:", error);
        // Puedes agregar manejo específico para duplicidad de email (código 1062) aquí
        throw new Error("Error al insertar usuario en la base de datos.");
    } finally {
        // ✅ Garantiza cierre de conexión siempre
        await connection.end();
    }
};


/**
 * Actualiza dinámicamente los campos de un usuario.
 * @param {number} idUsuario - El ID del usuario a actualizar.
 * @param {Object} data - Objeto con los campos a actualizar (nombre, email, password, estado, idRol).
 * @returns {Promise<boolean>} True si se actualizó una fila, false si no.
 */
export const updateUser = async (idUsuario, data) => {
    // ⚠️ Asume que connectMySQL() devuelve una conexión promise-based (mysql2/promise)
    const connection = await connectMySQL(); 

    try {
        const fields = [];
        const values = [];

        // 1. Nombre
        if (data.nombre) {
            fields.push("nombre = ?");
            values.push(data.nombre);
        }

        // 2. Email
        if (data.email) {
            fields.push("email = ?");
            values.push(data.email.toLowerCase()); // 💡 Sugerencia: Normalizar email
        }

        // 3. Contraseña (Password)
        // ✅ CORREGIDO: Usar 'password' en la consulta SQL. 
        // Se asume que data.password ya es el hash ENCRIPTADO.
        if (data.password) { 
            fields.push("password = ?"); 
            values.push(data.password);
        }

        // 4. Estado (ENUM)
        // ✅ CORREGIDO: Usar 'estado' en la consulta SQL, NO 'idEstado'.
        if (data.estado) { 
            fields.push("estado = ?");
            values.push(data.estado);
        }

        // 5. Rol
        if (data.idRol) {
            fields.push("idRol = ?");
            values.push(data.idRol);
        }

        // Si no hay campos para actualizar, sale
        if (fields.length === 0) {
            return false;
        }

        // Construye la consulta SQL final
        const query = `
            UPDATE usuario
            SET ${fields.join(", ")}
            WHERE idUsuario = ?;
        `;

        // Añade el idUsuario al final del array de valores para el WHERE
        values.push(idUsuario);

        const [result] = await connection.execute(query, values);
        
        return result.affectedRows > 0;
        
    } catch (error) {
        console.error("❌ Error al actualizar usuario:", error);
        // Lanzar un error más descriptivo puede ayudar al controlador a manejarlo (ej. ER_DUP_ENTRY)
        throw error; 
    } finally {
        await connection.end(); // ✅ Cierra la conexión
    }
};

/**
 * Elimina un usuario de la base de datos por su ID.
 * @param {number} idUsuario - El ID del usuario a eliminar.
 * @returns {Promise<boolean>} True si se eliminó una fila, false si no se encontró.
 */
export const deleteUser = async (idUsuario) => {
    // ⚠️ Asume que connectMySQL() devuelve una conexión promise-based (mysql2/promise)
    const connection = await connectMySQL(); 
    
    try {
        // Consulta SQL segura y parametrizada
        const [result] = await connection.execute(
            "DELETE FROM usuario WHERE idUsuario = ?",
            [idUsuario]
        );
        
        // Retorna true si se afectó al menos una fila (usuario encontrado y eliminado)
        return result.affectedRows > 0;
        
    } catch (error) {
        // ✅ MEJORA: Manejo de errores de la BD, como violación de clave foránea
        console.error(`❌ Error al eliminar usuario ${idUsuario}:`, error);
        
        // Relanza el error para que el controlador pueda manejar códigos específicos de MySQL (ej. 1451 - ER_ROW_IS_REFERENCED)
        throw error; 
        
    } finally {
        // Garantiza que la conexión se cierre siempre
        await connection.end(); 
    }
};
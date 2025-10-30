// En tu controlador (ej. /src/controller/usuario.controller.js)
// Asegúrate de importar tu modelo y bcrypt
// Asegúrate de importar tu modelo (ajusta la ruta según la estructura de tu proyecto)
import bcrypt from "bcrypt";
import * as UserModel from "../models/user.model.js";

// ✅ Obtener todos los usuarios
export const getAllUsers = async (req, res) => {
  try {
    // 1. Llama a la función del modelo para obtener los datos.
    const users = await UserModel.getAllUsers();

    // 2. Responde con los datos obtenidos.
    return res.status(200).json({
      message: "Usuarios obtenidos con éxito.", // Se agrega un mensaje de éxito
      data: users,
    });
  } catch (error) {
    // 3. Manejo de errores: imprime el error para depuración y envía una respuesta 500.
    console.error("❌ Error al obtener usuarios:", error.message);
    return res.status(500).json({
      error: "Error interno del servidor al obtener usuarios.",
      details: error.message, // Opcional: enviar el detalle del error para facilitar la depuración
    });
  }
};


// ✅ Obtener usuario por ID
export const getUserById = async (req, res) => {
    try {
        const { id } = req.params;

        // 1. Validación de ID
        // Usar parseInt() y verificar si el resultado es un número válido
        const idUsuario = parseInt(id, 10);
        
        if (isNaN(idUsuario)) { 
            return res.status(400).json({ error: "El ID de usuario proporcionado es inválido." });
        }

        // 2. Llamada al modelo
        // Pasar el ID como número entero
        const user = await UserModel.getUserById(idUsuario); 
        
        // 3. Manejo de 'No Encontrado'
        if (!user) {
            return res.status(404).json({ error: `Usuario con ID ${idUsuario} no encontrado.` });
        }

        // 4. Respuesta exitosa
        return res.status(200).json({ 
            message: "Usuario obtenido con éxito.",
            data: user 
        });
        
    } catch (error) {
        // 5. Manejo de Errores (Servidor / Base de Datos)
        console.error("❌ Error al obtener usuario:", error);
        return res.status(500).json({ 
            error: "Error interno del servidor al obtener el usuario.",
            details: error.message // Útil para la depuración
        });
    }
};


// ✅ Buscar usuario por email
export const getUserByEmail = async (req, res) => {
    try {
        const { email } = req.params;

        // 1. Validación de Email
        if (!email || typeof email !== "string" || email.trim() === "") {
            return res.status(400).json({ error: "Email inválido o vacío." });
        }

        // 2. Llamada al modelo
        // Se llama al modelo con el email limpio y en minúsculas
        const user = await UserModel.getUserByEmail(email.trim().toLowerCase());
        
        // 3. Manejo de 'No Encontrado'
        if (!user) {
            return res.status(404).json({ error: "Usuario no encontrado." });
        }

        // 4. Limpieza de datos sensibles (Crucial si no es login)
        // Eliminamos el hash de la contraseña antes de enviar la respuesta al cliente
        delete user.password; 

        // 5. Respuesta exitosa
        return res.status(200).json({ 
            message: "Usuario obtenido con éxito.",
            data: user 
        });
        
    } catch (error) {
        // 6. Manejo de Errores (Servidor / Base de Datos)
        console.error("❌ Error al buscar usuario por email:", error);
        return res.status(500).json({ 
            error: "Error interno del servidor al buscar el usuario.",
            details: error.message 
        });
    }
};


// ✅ Crear usuario con contraseña encriptada
export const createUser = async (req, res) => {
  try {
    // 1. Desestructuración de datos (Leyendo 'password' de req.body y renombrando a 'contrasena' para el código interno)
    const {
      nombre,
      email,
      password: contrasena, // 👈 CORRECCIÓN CLAVE: Lee 'password' y lo asigna a 'contrasena'
      estado,
      idRol,
    } = req.body;

    // 2. Validaciones obligatorias (usando 'contrasena')
    if (!nombre || !email || !contrasena || !idRol) {
      return res.status(400).json({
        error: "Faltan campos obligatorios: nombre, email, contraseña y idRol.",
      });
    }

    // 3. Hashing de Contraseña
    // Aquí se usa 'contrasena' (el valor leído de 'password' en el paso 1)
    const hashedPassword = await bcrypt.hash(contrasena, 10);

    // 4. Llamada al modelo con parámetros corregidos
    const newUser = await UserModel.createUser(
      nombre,
      email.toLowerCase(),
      hashedPassword,
      estado || "Activo",
      idRol
    );

    // 5. Respuesta exitosa
    return res.status(201).json({
      message: "Usuario creado exitosamente.",
      data: newUser,
    });
  } catch (error) {
    // 6. Manejo de Errores
    console.error("❌ Error al crear usuario:", error);

    // El código de error 1062 (ER_DUP_ENTRY) es para unicidad (email, etc.)
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        error: "El email ya está registrado o el ID de Rol no existe.",
      });
    }

    // Error general del servidor
    return res.status(500).json({
      error: "Error interno del servidor al crear el usuario.",
      details: error.message,
    });
  }
};


// ✅ Actualizar usuario (encripta contraseña si se envía)
export const updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const data = req.body;

        // 1. Validación de ID
        const parsedId = parseInt(id, 10);
        if (isNaN(parsedId)) { // Usar la variable parseada para la validación
            return res.status(400).json({ error: "ID de usuario inválido." });
        }

        if (!data || typeof data !== "object") {
            return res.status(400).json({ error: "Datos de actualización inválidos." });
        }

        // 2. Filtrado de datos (Limpia valores nulos/vacíos)
        let filteredData = Object.fromEntries(
            Object.entries(data).filter(
                // Filtra valores que no sean undefined, null o una cadena vacía
                ([, value]) => value !== undefined && value !== null && value !== ""
            )
        );

        // 3. Ajuste de Contraseña (Hashing)
        // ✅ CORRECCIÓN CLAVE: Buscar 'password' en los datos filtrados
        if (filteredData.password) {
            // El campo se llama 'password' en el frontend y en la BD.
            filteredData.password = await bcrypt.hash(filteredData.password, 10);
        } 
        
        // ❌ Eliminado: La lógica de 'contrasena' ya no es necesaria si el frontend envía 'password'.
        /*
        if (filteredData.contrasena) {
            // Si el frontend envía 'contrasena', se debe renombrar a 'password'
            filteredData.password = await bcrypt.hash(filteredData.contrasena, 10);
            delete filteredData.contrasena; 
        }
        */

        if (Object.keys(filteredData).length === 0) {
            return res
                .status(400)
                .json({ error: "Datos insuficientes para actualizar." });
        }
        
        // 4. Llamada al Modelo
        // Usar la ID parseada
        const success = await UserModel.updateUser(parsedId, filteredData); 

        // 5. Manejo de 'No Actualizado'
        if (!success) {
            // Puede ser 404 si el usuario no existe, o 400 si la actualización fue a 0 filas (datos iguales)
            return res
                .status(404)
                .json({ error: "Usuario no encontrado o no se realizó ningún cambio." });
        }

        // 6. Respuesta Exitosa
        return res.status(200).json({
            message: "Usuario actualizado correctamente.",
            userId: parsedId,
            updatedFields: Object.keys(filteredData),
        });
        
    } catch (error) {
        // 7. Manejo de Errores
        console.error(
            `❌ Error al actualizar usuario ${req.params.idUsuario}:`,
            error
        );

        // Mapeo de errores SQL
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({ error: "Violación de unicidad (email ya registrado, etc.)." });
        }

        if (error.code === "ER_NO_REFERENCED_ROW" || error.code === "ER_NO_REFERENCED_ROW_2") {
            return res.status(400).json({ error: "El ID de Rol proporcionado no existe." });
        }

        return res
            .status(500)
            .json({ 
                error: "Error interno del servidor al actualizar usuario.",
                details: error.message
            });
    }
};


// ✅ Eliminar usuario
export const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const idUsuario = parseInt(id, 10); // Parsear el ID una vez
        
        // 1. Validación de ID
        if (isNaN(idUsuario)) { // Usar la variable parseada para la validación
            return res.status(400).json({ error: "El ID de usuario proporcionado es inválido." });
        }

        // 2. Llamada al modelo
        const deleted = await UserModel.deleteUser(idUsuario);

        // 3. Manejo de 'No Encontrado'
        if (!deleted) {
            return res.status(404).json({ error: `Usuario con ID ${idUsuario} no encontrado.` });
        }

        // 4. Respuesta exitosa
        return res
            .status(200)
            // ✅ Estandarización de la respuesta
            .json({ message: `Usuario con ID ${idUsuario} eliminado correctamente.` }); 
            
    } catch (error) {
        // 5. Manejo de Errores Específicos de MySQL
        console.error("❌ Error al eliminar usuario:", error);
        
        // Error 1451 (ER_ROW_IS_REFERENCED): El usuario es referenciado por otra tabla
        if (error.code === 'ER_ROW_IS_REFERENCED_2' || error.code === 'ER_ROW_IS_REFERENCED') {
            return res.status(409).json({ 
                error: "El usuario no puede eliminarse porque está asociado a otros registros del sistema." 
            });
        }
        
        // 6. Error interno del servidor
        return res
            .status(500)
            .json({ 
                error: "Error interno del servidor al eliminar usuario.",
                details: error.message // Incluir detalles para depuración
            });
    }
};
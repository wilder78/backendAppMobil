import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config(); // 👈 Cargar variables del archivo .env

// 🔗 Conexión a MySQL
export const connectMySQL = async () => {
  try {
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,       // Servidor desde .env
      port: process.env.DB_PORT,       // Puerto desde .env
      user: process.env.DB_USER,       // Usuario desde .env
      password: process.env.DB_PASSWORD, // Contraseña desde .env
      database: process.env.DB_NAME,   // Nombre de la BD desde .env
    });

    console.log("✅ Conectado a MySQL correctamente");
    return connection;
  } catch (error) {
    console.error("❌ Error conectando a MySQL:", error.message);
    throw error;
  }
};

// import mysql from "mysql2";
// import dotenv from "dotenv";

// dotenv.config();

// // Crear la conexión
// const connection = mysql.createConnection({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT || 3306,
// });

// // Probar la conexión
// connection.connect((err) => {
//   if (err) {
//     console.error("❌ Error al conectar con MySQL:", err.message);
//   } else {
//     console.log("✅ Conectado correctamente a la base de datos MySQL");
//   }
// });

// export default connection;

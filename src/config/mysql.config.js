import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

// Crear la conexión
const connection = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT || 3306,
});

// Probar la conexión
connection.connect((err) => {
  if (err) {
    console.error("❌ Error al conectar con MySQL:", err.message);
  } else {
    console.log("✅ Conectado correctamente a la base de datos MySQL");
  }
});

export default connection;

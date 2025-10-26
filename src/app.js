// 1. Importaciones necesarias
import express from "express";
import dotenv from "dotenv";
import connection from "./config/mysql.config.js"; // 👈 Import default (sin llaves)

// 2. Cargar variables de entorno
dotenv.config();

// 3. Crear instancia de Express
const app = express();

// 4. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Ruta para probar la conexión a MySQL
app.get("/test-db", (req, res) => {
  connection.query("SELECT NOW() AS fecha_actual", (err, results) => {
    if (err) {
      console.error("❌ Error al realizar la consulta:", err.message);
      return res.status(500).json({
        error: "Error al conectar con la base de datos",
        details: err.message,
      });
    }

    res.status(200).json({
      message: "✅ Conexión exitosa a MySQL",
      results,
    });
  });
});

// 6. Iniciar el servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`);
});

// // 1. Importaciones necesarias
// import express from "express";

// // 2. Cargar variables de entorno
// const app = express();

// // 3. Middlewares
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// app.listen(8080, () => {
//     console.log("Server on port 8080");
// })

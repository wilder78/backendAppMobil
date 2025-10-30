// 1. Importaciones necesarias
import express from "express";
import dotenv from "dotenv";
import { connectMySQL } from "./config/mysql.config.js"; // Asegúrate de que esta función devuelve la conexión/pool
import principalRoutes from "./routes/principal.routes.js";

// 2. Cargar variables de entorno
dotenv.config();

// 🚨 2.1. LLAMAR A LA FUNCIÓN DE CONEXIÓN Y ALMACENAR EL OBJETO DE CONEXIÓN
const connection = connectMySQL();

// 3. Crear instancia de Express
const app = express();

// 4. Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 5. Ruta para probar la conexión a MySQL
app.get("/test-db", (req, res) => {
  // Aquí usamos la variable 'connection' que acabamos de definir
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

// 6. Rutas principales
app.use("/", principalRoutes);

// 7. Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

// 8. Iniciar el servidor
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

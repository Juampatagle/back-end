const express = require("express");
const { Server } = require("socket.io");
const http = require("http");
const handlebars = require("express-handlebars");
const path = require("path");

// Importamos las rutas
const productsRouter = require("./routes/products.routes");

// Inicializamos la app
const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Configurar Handlebars
app.engine("handlebars", handlebars.engine());
app.set("view engine", "handlebars");
app.set("views", path.join(__dirname, "views"));

// Usar rutas y pasar io a productos
app.use("/api/products", productsRouter(io));

// Vista principal
app.get("/", async (req, res) => {
    res.render("home");
});

// Vista en tiempo real con WebSockets
app.get("/realtimeproducts", async (req, res) => {
    res.render("realTimeProducts");
});

// Configurar WebSockets
io.on("connection", async (socket) => {
    console.log("Nuevo cliente conectado");
    socket.emit("updateProducts", []);
});

// Iniciar servidor
server.listen(8080, () => console.log("🚀 Servidor corriendo en http://localhost:8080"));

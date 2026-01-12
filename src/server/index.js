import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketServer } from "ws";
import { createServer } from "http";

// Servicios
import { createUserService } from "./services/userService.js";
import { createMessageService } from "./services/messageService.js";
import { createConnectionService } from "./services/connectionService.js";
import { createGameRoomService } from "./services/gameRoomService.js";
import { createMatchmakingService } from "./services/matchmakingService.js";

// Controladores
import { createUserController } from "./controllers/userController.js";
import { createMessageController } from "./controllers/messageController.js";
import { createConnectionController } from "./controllers/connectionController.js";

// Rutas
import { createUserRoutes } from "./routes/users.js";
import { createMessageRoutes } from "./routes/messages.js";
import { createConnectionRoutes } from "./routes/connections.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Servicios
const userService = createUserService();
const messageService = createMessageService(userService);
const connectionService = createConnectionService();
const gameRoomService = createGameRoomService();
const matchmakingService = createMatchmakingService(gameRoomService);

// Controladores
const userController = createUserController(userService);
const messageController = createMessageController(messageService);
const connectionController = createConnectionController(connectionService);

// Rutas
const userRoutes = createUserRoutes(userController);
const messageRoutes = createMessageRoutes(messageController);
const connectionRoutes = createConnectionRoutes(connectionController);

const app = express();
const PORT = 3000;

app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// sirve el build (dist)
app.use(express.static(path.join(__dirname, "../../dist")));

app.use("/api/users", userRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/connected", connectionRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "Endpoint no encontrado" });
  }
  res.sendFile(path.join(__dirname, "../../dist/index.html"));
});

app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(err.status || 500).json({ error: err.message || "Error interno del servidor" });
});

const server = createServer(app);
const wss = new WebSocketServer({ server });

wss.on("connection", (ws) => {
  console.log("✅ Cliente WebSocket conectado");

  ws.on("message", (message) => {
    try {
      const data = JSON.parse(message);

      switch (data.type) {
        case "joinQueue":
          matchmakingService.joinQueue(ws);
          break;

        case "leaveQueue":
          matchmakingService.leaveQueue(ws);
          break;

        case "paddleMove":
          gameRoomService.handlePaddleMove(ws, data.x, data.y);
          break;

        case "playerFell":
          gameRoomService.handlePlayerFell(ws, data.player);
          break;

        case "push":
          gameRoomService.handlePush(ws, data);
          break;

        case "powerUpPickup":
          gameRoomService.handlePowerUpPickup(ws);
          break;

        case "requestPowerUpState":
          gameRoomService.handleRequestPowerUpState(ws);
          break;

        case "playerReady":
          gameRoomService.handlePlayerReady(ws);
          break;

        case 'leaveRoom':
           matchmakingService.leaveQueue(ws);
           gameRoomService.handleDisconnect(ws);
          break;

        default:
          console.log("Mensaje desconocido:", data.type);
      }
    } catch (error) {
      console.error("Error procesando mensaje:", error);
    }
  });

  ws.on('close', () => {
  console.log('Cliente WebSocket desconectado');
  matchmakingService.leaveQueue(ws);
  gameRoomService.handleDisconnect(ws);
});


  ws.on("error", (error) => {
    console.error("Error en WebSocket:", error);
  });
});

// ✅ CLAVE LAN: 0.0.0.0
server.listen(PORT, "0.0.0.0", () => {
  console.log("========================================");
  console.log("  SERVIDOR DE CYBERSTRIKE");
  console.log("========================================");
  console.log(`  Servidor corriendo en http://localhost:${PORT}`);
  console.log(`  WebSocket disponible en ws://localhost:${PORT}`);
  console.log("========================================\n");
});

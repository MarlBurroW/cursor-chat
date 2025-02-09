import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";
import path from "path";
import { createProxyMiddleware } from "http-proxy-middleware";
import { connectDB } from "./config/database";
import { Message } from "./models/Message";

interface ChatMessage {
  text: string;
  author: string;
  authorId: string;
  authorColor: string;
  timestamp: number;
}

interface User {
  id: string; // Socket ID
  username: string;
  ip: string;
  connectedAt: number;
  color: string;
}

const HISTORY_SIZE = 10;
const messageHistory: ChatMessage[] = [];
const connectedUsers = new Map<string, User>();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.CORS_ORIGIN || "http://localhost:3001",
    methods: ["GET", "POST"],
  },
});

// Fonction pour générer une couleur aléatoire
const getRandomColor = () => {
  const colors = [
    "#FF6B6B",
    "#4ECDC4",
    "#45B7D1",
    "#96CEB4",
    "#FFEEAD",
    "#D4A5A5",
    "#9B59B6",
    "#3498DB",
    "#E67E22",
    "#1ABC9C",
    "#F1C40F",
    "#E74C3C",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

// Connexion à MongoDB
connectDB();

// Gestion des connexions Socket.IO d'abord
io.on("connection", (socket: Socket) => {
  console.log("Un client s'est connecté");
  const clientIp = socket.handshake.address;

  socket.on("user-login", (username: string) => {
    const user: User = {
      id: socket.id,
      username,
      ip: clientIp,
      connectedAt: Date.now(),
      color: getRandomColor(),
    };
    connectedUsers.set(socket.id, user);

    // Envoyer l'ID à l'utilisateur
    socket.emit("login-success", socket.id);

    // Informer tous les clients de la nouvelle liste d'utilisateurs
    io.emit(
      "users-update",
      Array.from(connectedUsers.values()).map((user) => ({
        id: user.id,
        username: user.username,
        color: user.color,
      }))
    );

    // Envoyer l'historique au nouveau client
    socket.emit("message-history", messageHistory);
  });

  socket.on("message", async (data: { text: string; author: string }) => {
    const user = connectedUsers.get(socket.id);
    if (!user) return;

    const messageWithMetadata = {
      text: data.text,
      author: data.author,
      authorId: user.id,
      authorColor: user.color,
      timestamp: Date.now(),
    };

    try {
      // Sauvegarder dans MongoDB
      const savedMessage = await Message.create(messageWithMetadata);
      console.log("Message sauvegardé dans MongoDB:", savedMessage);
      io.emit("message", savedMessage);
    } catch (error) {
      console.error("Erreur lors de la sauvegarde du message:", error);
    }
  });

  socket.on("request-history", async () => {
    try {
      const messages = await Message.find()
        .sort({ timestamp: -1 })
        .limit(50)
        .lean();
      console.log("Historique récupéré:", messages.length, "messages");
      socket.emit("message-history", messages.reverse());
    } catch (error) {
      console.error("Erreur lors de la récupération de l'historique:", error);
    }
  });

  socket.on("load-more-messages", async (before: number) => {
    try {
      const messages = await Message.find({ timestamp: { $lt: before } })
        .sort({ timestamp: -1 })
        .limit(20)
        .lean();
      socket.emit("more-messages", messages.reverse());
    } catch (error) {
      console.error("Erreur lors du chargement des messages:", error);
    }
  });

  socket.on("disconnect", () => {
    // Supprimer l'utilisateur de la liste
    connectedUsers.delete(socket.id);
    // Informer tous les clients de la nouvelle liste d'utilisateurs
    io.emit(
      "users-update",
      Array.from(connectedUsers.values()).map((user) => ({
        id: user.id,
        username: user.username,
        color: user.color,
      }))
    );
    console.log("Un client s'est déconnecté");
  });
});

// En production, on sert les fichiers statiques
if (process.env.NODE_ENV === "production") {
  app.use(express.static("public"));
} else {
  // En développement, on proxy tout ce qui n'est pas /socket.io vers le frontend
  app.use(
    createProxyMiddleware(
      (pathname: string) => !pathname.startsWith("/socket.io"),
      {
        target: "http://frontend:3001",
        changeOrigin: true,
        ws: true,
      }
    )
  );
}

const PORT = process.env.PORT || 3000;

httpServer.listen(PORT, () => {
  console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
